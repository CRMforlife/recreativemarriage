const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Allow all origins during development
app.use(express.static(path.join(__dirname, './')));

// Database file path
const dbPath = path.join(__dirname, 'data', 'interests.json');
console.log('Database path:', dbPath);

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory at:', dataDir);
    try {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Data directory created successfully');
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}

// Ensure database file exists
if (!fs.existsSync(dbPath)) {
    console.log('Creating interests.json file...');
    try {
        fs.writeFileSync(dbPath, JSON.stringify({ interests: [] }, null, 2));
        console.log('interests.json file created successfully');
    } catch (error) {
        console.error('Error creating interests.json file:', error);
    }
}

// API endpoint to save interests
app.post('/api/save-interests', async (req, res) => {
    console.log('Received request to save interests:', req.body);
    
    try {
        const { interests } = req.body;
        
        // Validate input
        if (!interests || !Array.isArray(interests) || interests.length === 0) {
            console.error('Invalid interests data:', interests);
            return res.status(400).json({ error: 'Please select at least one interest' });
        }
        
        // Read current data
        let data;
        try {
            const fileContent = await fs.promises.readFile(dbPath, 'utf8');
            data = JSON.parse(fileContent);
            console.log('Successfully read existing data:', data);
        } catch (readError) {
            console.error('Error reading data file:', readError);
            if (readError.code === 'ENOENT') {
                data = { interests: [] };
                console.log('Created new data structure');
            } else {
                throw readError;
            }
        }
        
        // Add new entry
        const newEntry = {
            id: Date.now(),
            submitted_at: new Date().toISOString(),
            interests: interests
        };
        
        if (!Array.isArray(data.interests)) {
            data.interests = [];
        }
        
        data.interests.push(newEntry);
        console.log('Added new entry:', newEntry);
        
        // Write back to file
        try {
            await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
            console.log('Successfully wrote data to file');
            
            // Send success response with the saved data
            res.status(200).json({
                message: 'Interests saved successfully',
                data: newEntry
            });
        } catch (writeError) {
            console.error('Error writing to data file:', writeError);
            throw writeError;
        }
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            error: 'An error occurred while saving your interests. Please try again.',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Data file path: ${dbPath}`);
}); 