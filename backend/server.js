const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors());

// Endpoint to save JSON file and generate ZKP
app.post("/save-json", (req, res) => {
  const jsonData = req.body;
  const filePath = path.join(__dirname, "formattedResult.json");

  // Save the JSON file
  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error("Error saving JSON file:", err);
      return res.status(500).send("Error saving JSON file");
    }

    // If JSON is saved successfully, proceed to generate ZKP
    generateZKP(filePath, res);
  });
});

// Function to generate ZKP
function generateZKP(jsonFilePath, res) {
  const repoPath = "./risc0-backend/examples/json"; // Update this to the actual path of your Risc0 repo

  // Run cargo build
  exec("cargo build", { cwd: repoPath }, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error during cargo build: ${stderr}`);
      return res.status(500).send("Failed to build the project.");
    }
    console.log(`cargo build output: ${stdout}`);

    // Run cargo run --release
    exec("cargo run --release", { cwd: repoPath }, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error during cargo run: ${stderr}`);
        return res.status(500).send("Failed to run the project.");
      }
      console.log(`cargo run output: ${stdout}`);

      // Extract the digest and fields from the output
      const outputLines = stdout.split("\n");
      const digestLine = outputLines.find((line) =>
        line.trim().startsWith("Digest")
      );
      const fieldsLine = outputLines.find((line) => line.includes("fields:"));

      const digest = digestLine
        ? (digestLine.match(/Digest\((.*)\)/) || [])[1]
        : null;
      let fields = fieldsLine
        ? (fieldsLine.match(/fields: \[(.*)\]/) || [])[1]
        : null;

      // Convert fields to an array if it's a string
      if (fields) {
        fields = fields
          .split(",")
          .map((field) => field.trim().replace(/^"|"$/g, ""));
      }

      // Send the result back to the client
      res.json({ digest, fields });

      fs.unlink(jsonFilePath, (err) => {
        if (err) {
          console.error("Error deleting JSON file:", err);
        } else {
          console.log("JSON file deleted successfully");
        }
      });
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
