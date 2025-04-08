import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Response Schema
const responseSchema = new mongoose.Schema({
    interests: [String],
    submittedAt: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String
});

const Response = mongoose.model('Response', responseSchema);

// Admin User Schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('Admin', adminSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
app.post('/api/responses', async (req, res) => {
    try {
        const response = new Response({
            interests: req.body.interests,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        });
        await response.save();
        res.status(201).json({ message: 'Response saved successfully' });
    } catch (error) {
        console.error('Error saving response:', error);
        res.status(500).json({ error: 'Error saving response' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Error during login' });
    }
});

// Get all responses (protected route)
app.get('/api/responses', authenticateToken, async (req, res) => {
    try {
        const responses = await Response.find().sort({ submittedAt: -1 });
        res.json(responses);
    } catch (error) {
        console.error('Error fetching responses:', error);
        res.status(500).json({ error: 'Error fetching responses' });
    }
});

// Export responses as CSV (protected route)
app.get('/api/responses/export', authenticateToken, async (req, res) => {
    try {
        const responses = await Response.find().sort({ submittedAt: -1 });
        const csv = responses.map(response => {
            return `${response.interests.join(',')},${response.submittedAt},${response.userAgent},${response.ipAddress}`;
        }).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=responses.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting responses:', error);
        res.status(500).json({ error: 'Error exporting responses' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 