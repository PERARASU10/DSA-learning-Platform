const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, '../')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Endpoint for fetching concept code
app.get('/concepts/:concept/:language', (req, res) => {
    const { concept, language } = req.params;
    const filePath = path.join(__dirname, '../concepts', concept, `${language}.txt`);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Code not available');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
