const express = require('express');
const cors = require('cors');

const incidentRoutes = require('./routes/incidents');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/incidents', incidentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export app for testing (without starting server)
module.exports = app;

