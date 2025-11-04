import express from "express";
import cors from "cors";
import multer from "multer";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// 📁 Make sure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ⚙️ Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 📤 Upload and analyze route
app.post("/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  console.log(`📂 Received file: ${filePath}`);

const pythonProcess = spawn("python3", ["analyze.py", filePath], { shell: true });

  let output = "";
  let error = "";

  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    error += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error("Python script error:", error);
      return res.status(500).json({ error: "Error analyzing file", details: error });
    }

    try {
      const result = JSON.parse(output);
      res.json(result);
    } catch (e) {
      console.error("Invalid JSON from Python:", e);
      res.status(500).json({ error: "Invalid JSON returned from Python" });
    }

    // Cleanup (optional)
    fs.unlink(filePath, (err) => {
      if (err) console.warn("⚠️ Failed to delete uploaded file:", err);
    });
  });
});

// ✅ Health check route (Render needs this)
app.get("/", (req, res) => {
  res.send("✅ Backend is running fine!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
