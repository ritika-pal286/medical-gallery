import File from "../models/File.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const extractPublicIdFromUrl = (url) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match?.[1] || null;
  } catch {
    const uploadSegment = "/upload/";
    const uploadIndex = url.indexOf(uploadSegment);

    if (uploadIndex === -1) return null;

    const afterUpload = url.slice(uploadIndex + uploadSegment.length);
    const versionTrimmed = afterUpload.replace(/^v\d+\//, "");
    const withoutExtension = versionTrimmed.replace(/\.[^/.]+$/, "");

    return withoutExtension || null;
  }
};

export const uploadFile = async (req, res) => {
  let localFilePath = "";

  try {
    console.log("Upload request received:", {
      hasFile: Boolean(req.file),
      body: req.body,
    });

    if (!req.file) {
      console.error("Upload failed: req.file is undefined.");
      return res.status(400).json({ message: "No file uploaded" });
    }

    localFilePath = req.file.path;
    console.log("Local file saved by multer:", localFilePath);

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "medical-gallery",
      resource_type: "auto",
    });

    console.log("Cloudinary upload success:", {
      public_id: result.public_id,
      secure_url: result.secure_url,
    });

    const newFile = new File({
      title: req.body.title,
      category: req.body.category,
      fileUrl: result.secure_url,
      publicId: result.public_id,
    });

    await newFile.save();
    console.log("File metadata saved to DB:", newFile._id);

    return res.status(201).json(newFile);
  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  } finally {
    if (localFilePath && fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
        console.log("Local file deleted:", localFilePath);
      } catch (unlinkError) {
        console.error("Failed to delete local file:", unlinkError.message);
      }
    }
  }
};


export const getFiles = async (req, res) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const publicId = file.publicId || extractPublicIdFromUrl(file.fileUrl);

    if (!publicId) {
      console.warn("Missing publicId. Deleting DB record only for legacy file:", file._id);
      await File.findByIdAndDelete(req.params.id);
      return res.json({
        message: "File deleted from database (legacy record without Cloudinary publicId)",
      });
    }

    const cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    console.log("Cloudinary destroy result:", cloudinaryResult);

    if (!["ok", "not found"].includes(cloudinaryResult.result)) {
      return res.status(500).json({
        message: "Failed to delete image from Cloudinary",
        error: `Cloudinary response: ${cloudinaryResult.result}`,
      });
    }

    await File.findByIdAndDelete(req.params.id);

    return res.json({
      message: "File deleted successfully from Cloudinary and database",
    });
  } catch (error) {
    console.error("Delete failed:", error);
    return res.status(500).json({
      message: "Delete failed",
      error: error.message,
    });
  }
};
