import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  uploadFile,
  getFiles,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();


// 👉 Upload file (Cloudinary + Multer)
router.post("/upload", authMiddleware, upload.single("file"), uploadFile);


// 👉 Get all files (Gallery)
router.get("/", getFiles);


// 👉 Delete file
router.delete("/:id", authMiddleware, deleteFile);


export default router;
