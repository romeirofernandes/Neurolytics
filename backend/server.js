require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const participantRoutes = require('./routes/participantRoutes');
const consentFormRoutes = require('./routes/consentFormRoutes');
const experimentRoutes = require('./routes/experimentRoutes');
const researcherRoutes = require('./routes/researcherRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const emotionsRoutes = require('./routes/emotionsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/researchers', researcherRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/consent-forms', consentFormRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/emotions', emotionsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cognitive Science Research Platform API',
    version: '1.0.0',
    status: 'active',
  });
});

// MongoDB connection
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔧 Configuration:');
console.log('PORT:', PORT);
console.log('MONGODB_URI:', MONGODB_URI ? 'Configured ✓' : 'Missing ✗');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`\nServer running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
