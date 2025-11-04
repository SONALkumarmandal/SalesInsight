import express from "express";
import multer from "multer";
import cors from "cors";
import { spawn } from "child_process";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

//  Multer setup for uploads
const upload = multer({ dest: "uploads/" });

// Temporary variable to store last uploaded analysis
let lastInsights = null;

//  Handle CSV upload and run Python analysis
app.post("/upload", upload.single("file"), (req, res) => {
  const filePath = req.file.path;
  console.log(`📂 Received file: ${filePath}`);

  const pythonProcess = spawn("python", ["analyze.py", filePath], { shell: true });

  let dataToSend = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (data) => {
    dataToSend += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorData += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(" Python script error:", errorData);
      return res.status(500).json({ error: "Error analyzing file" });
    }

    try {
      const result = JSON.parse(dataToSend);
      lastInsights = result; //  store for later retrieval
      res.json(result);
    } catch (err) {
      console.error(" Invalid JSON:", err);
      res.status(500).json({ error: "Invalid JSON returned from Python" });
    }

    fs.unlinkSync(filePath); // clean up temp file
  });
});

//Endpoint for frontend to fetch latest insights
app.get("/api/insights", (req, res) => {
  if (!lastInsights) {
    return res.status(404).json({ error: "No insights available yet." });
  }
  res.json(lastInsights);
});

app.listen(5000, () => console.log(" Server running on port 5000"));
