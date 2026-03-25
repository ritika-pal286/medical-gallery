import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fileRoutes from "./routes/fileRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ✅ middlewares
app.use(cors());
app.use(express.json());

// ✅ DEBUG middleware (IMPORTANT - upar hona chahiye)
app.use((req, res, next) => {
  console.log("👉 Request aayi:", req.method, req.url);
  next();
});

// ✅ test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// ✅ routes
app.use("/api/auth/", authRoutes);
app.use("/api/files/", fileRoutes);

app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err);

  if (err?.name === "MulterError") {
    return res.status(400).json({
      message: "File upload validation failed",
      error: err.message,
    });
  }

  
  return res.status(500).json({
    message: "Internal Server Error",
    error: err?.message || "Unknown error",
  });
});

// ✅ MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

// ✅ server start
app.listen(8000, () => {
  console.log("Server running on port 8000 🚀");
});
