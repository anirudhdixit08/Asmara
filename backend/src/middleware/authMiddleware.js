import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { redisClient } from "../config/redis.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login again.",
      });
    }
    if (redisClient.isOpen) {
      const isBlacklisted = await redisClient.get(`token:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: "Session expired or logged out. Please login again.",
        });
      }
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated.",
      });
    }
    req.result = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired. Please login again."
        : "Invalid authentication token.";
    return res.status(401).json({
      success: false,
      message,
    });
  }
};

export const isAuthorised = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login again.",
      });
    }
    if (redisClient.isOpen) {
      const isBlacklisted = await redisClient.get(`token:${token}`);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: "Session expired or logged out. Please login again.",
        });
      }
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated.",
      });
    }
    req.result = user;
    if (decoded.role != "asmara") {
      throw new Error("Not Authorised!");
    }
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    const message =
      error.name === "TokenExpiredError"
        ? "Session expired. Please login again."
        : "Invalid authentication token.";
    return res.status(401).json({
      success: false,
      message,
    });
  }
};
