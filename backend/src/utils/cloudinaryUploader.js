import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

/**
 * Uploads a local file to Cloudinary and deletes the local copy.
 * Optimized for GP-Asmara Techpacks (PDF/ZIP) and Fabric Sketches.
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "gp_asmara_portal", // Organizes files in your Cloudinary dashboard
    });

    // File has been uploaded successfully
    console.log("File uploaded to Cloudinary:", response.url);

    // Safely remove the local file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);

    // Clean up: Remove the local file even if the upload failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null; // Return null so the controller can handle the failure
  }
};

export default uploadOnCloudinary;
