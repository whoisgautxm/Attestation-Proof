const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors package
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Endpoint to save JSON file
app.post('/save-json', (req, res) => {
  const jsonData = req.body;
  const filePath = path.join(__dirname, 'formattedResult.json');

  fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (err) => {
    if (err) {
      console.error('Error saving JSON file:', err);
      res.status(500).send('Error saving JSON file');
    } else {
      res.send('JSON file saved successfully');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
