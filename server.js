const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Your actual Google Vision API key
const GOOGLE_API_KEY = 'AIzaSyCa5LlC0agXExNvA4796hU5aZrqaecvWts';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname))); // Serve static files

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for image analysis
app.post('/analyze-image', async (req, res) => {
    try {
        console.log('Received image analysis request');
        
        // Import fetch dynamically for Node.js
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        console.log('Google Vision API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Google Vision API Error:', errorText);
            throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Successfully analyzed image');
        
        res.json(data);
    } catch (error) {
        console.error('Server error:', error.message);
        res.status(500).json({ 
            error: 'Analysis failed', 
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`🔑 Using Google Vision API key: ${GOOGLE_API_KEY.substring(0, 20)}...`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Server shutting down...');
    process.exit(0);
});