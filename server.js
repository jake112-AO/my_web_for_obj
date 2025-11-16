const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const uploadsDir = path.join(__dirname, 'uploads');

// Serve static files
app.use(express.static(__dirname));

// Route to get the list of files
app.get('/files', (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading files');
            return;
        }
        res.json(files.filter(file => file.endsWith('.obj')));
    });
});

// Route to download a file
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    res.download(filePath);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});