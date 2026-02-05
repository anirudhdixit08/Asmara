import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import otpGenerator from "otp-generator";
import { mailSender } from "../utils/mailSender.js";
import { otpTemplate } from "../mail_templates/emailVerificationTemplate.js";
import { registrationTemplate } from "../mail_templates/registrationConfirmationTemplate.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

export const sendOTP = async (req, res) => {
  try {
    const { emailId, organisationName } = req.body;
    if (!emailId || !organisationName) {
      return res.status(400).json({
        success: false,
        message: "Email and Organisation Name are required to generate OTP.",
      });
    }
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "User is already registered with this email.",
      });
    }
    const existingOrg = await User.findOne({ organisationName });
    if (existingOrg) {
      return res.status(401).json({
        success: false,
        message: "Organisation Name is already registered.",
      });
    }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let otpExists = await OTP.findOne({ otp: otp });
    while (otpExists) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      otpExists = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { emailId, otp };
    await OTP.create(otpPayload);
    const emailTemplate = otpTemplate(otp);
    await mailSender(
      emailId,
      "Verification Code - Portal Registration",
      emailTemplate
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
      otp,
    });
  } catch (error) {
    console.error("Error in sendOTP:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send OTP. Please try again later.",
    });
  }
};

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      emailId,
      password,
      phoneNumber,
      organisationName,
      role, // 'asmara' or 'factory'
      otp,
    } = req.body;
    if (
      !firstName ||
      !emailId ||
      !password ||
      !organisationName ||
      !role ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const recentOtp = await OTP.findOne({ emailId }).sort({ createdAt: -1 });
    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP Not Found or Expired.",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }
    const existingOrg = await User.findOne({ organisationName });
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        message: "Organisation Name is already registered.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      firstName,
      lastName,
      emailId,
      phoneNumber,
      password: hashedPassword,
      organisationName,
      role: role.toLowerCase(), // 'asmara' or 'factory'
    };

    const user = await User.create(userData);

    const token = jwt.sign(
      { emailId: user.emailId, id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "168h" }
    );
    const reply = {
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      organisationName: user.organisationName,
      role: user.role,
      _id: user._id,
    };

    res.cookie("token", token, {
      maxAge: 168 * 60 * 60 * 1000,
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
    });

    try {
      const subject = `Welcome to the Portal, ${user.firstName}!`;
      const body = registrationTemplate(user.firstName, user.role);
      await mailSender(user.emailId, subject, body);
    } catch (emailError) {
      console.error("Welcome email failed to send:", emailError);
    }

    await OTP.deleteOne({ _id: recentOtp._id });

    res.status(201).json({
      success: true,
      user: reply,
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error during registration",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }
    const user = await User.findOne({ emailId }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials: User not found.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid Credentials: Password mismatch.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        emailId: user.emailId,
        role: user.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "24h" }
    );

    const reply = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailId: user.emailId,
      role: user.role,
      organisationName: user.organisationName,
      isActive: user.isActive,
    };

    res.cookie("token", token, {
      maxAge: 168 * 60 * 60 * 1000, // 24 hours
      sameSite: "Strict",
      //   httpOnly: true,
    });

    res.status(200).json({
      success: true,
      user: reply,
      message: `Welcome back, ${user.firstName}! Login successful.`,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res
        .status(200)
        .json({ success: true, message: "Already logged out." });
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (redisClient.isOpen) {
        // Check if redis is actually connected
        await redisClient.set(`token:${token}`, "blocked", {
          EX: payload.exp - Math.floor(Date.now() / 1000),
        });
      }
    } catch (jwtErr) {
      console.log("Token already invalid, just clearing cookie.");
    }
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
    });
    return res.status(200).json({
      success: true,
      message: "User logged out successfully!",
    });
  } catch (error) {
    console.error("Logout Controller Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect current password." });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found with this email." });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp });
    }

    await OTP.create({ emailId, otp });

    const emailBody = otpTemplate(otp);
    await mailSender(emailId, "Password Reset Code - GP-Asmara", emailBody);

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { emailId, otp, newPassword, confirmPassword } = req.body;
    if (!emailId || !otp || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match." });
    }
    const recentOtp = await OTP.findOne({ emailId }).sort({ createdAt: -1 });
    if (!recentOtp || otp !== recentOtp.otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    await OTP.deleteOne({ _id: recentOtp._id });
    res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reset password." });
  }
};
