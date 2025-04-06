const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, './')));

// Database file path
const dbPath = path.join(__dirname, 'data', 'interests.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Ensure database file exists
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ interests: [] }));
}

// API endpoint to save interests
app.post('/api/save-interests', (req, res) => {
    try {
        const { interests } = req.body;
        
        // Validate input
        if (!interests || !Array.isArray(interests) || interests.length === 0) {
            return res.status(400).json({ error: 'Invalid interests data' });
        }
        
        // Read current data
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        
        // Add new entry
        data.interests.push({
            id: Date.now(),
            submitted_at: new Date().toISOString(),
            interests: interests
        });
        
        // Write back to file
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        
        res.status(200).json({ message: 'Interests saved successfully' });
    } catch (error) {
        console.error('Error saving interests:', error);
        res.status(500).json({ error: 'Failed to save interests' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 