const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.static(path.join(__dirname, './')));

// Database file path
const dbPath = path.join(__dirname, 'data', 'interests.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    console.log('Creating data directory...');
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Ensure database file exists
if (!fs.existsSync(dbPath)) {
    console.log('Creating interests.json file...');
    fs.writeFileSync(dbPath, JSON.stringify({ interests: [] }));
}

// API endpoint to save interests
app.post('/api/save-interests', (req, res) => {
    console.log('Received request to save interests:', req.body);
    
    try {
        const { interests } = req.body;
        
        // Validate input
        if (!interests || !Array.isArray(interests) || interests.length === 0) {
            console.error('Invalid interests data:', interests);
            return res.status(400).json({ error: 'Invalid interests data' });
        }
        
        // Read current data
        let data;
        try {
            const fileContent = fs.readFileSync(dbPath, 'utf8');
            data = JSON.parse(fileContent);
            console.log('Successfully read existing data');
        } catch (readError) {
            console.error('Error reading data file:', readError);
            data = { interests: [] };
        }
        
        // Add new entry
        const newEntry = {
            id: Date.now(),
            submitted_at: new Date().toISOString(),
            interests: interests
        };
        
        data.interests.push(newEntry);
        console.log('Added new entry:', newEntry);
        
        // Write back to file
        try {
            fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
            console.log('Successfully wrote data to file');
        } catch (writeError) {
            console.error('Error writing to data file:', writeError);
            return res.status(500).json({ error: 'Failed to write data to file' });
        }
        
        res.status(200).json({ message: 'Interests saved successfully' });
    } catch (error) {
        console.error('Error saving interests:', error);
        res.status(500).json({ error: 'Failed to save interests' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Data file path: ${dbPath}`);
}); 