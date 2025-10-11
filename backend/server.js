require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const participantRoutes = require('./routes/participantRoutes');
const consentFormRoutes = require('./routes/consentFormRoutes');
const experimentRoutes = require('./routes/experimentRoutes');

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
app.use('/api/participants', participantRoutes);
app.use('/api/consent-forms', consentFormRoutes);
app.use('/api/experiments', experimentRoutes);

console.log('✅ Routes registered:');
console.log('  - /api/users');
console.log('  - /api/participants');
console.log('  - /api/consent-forms');
console.log('  - /api/experiments');

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Cognitive Science Research Platform API',
    version: '1.0.0',
    status: 'active',
  });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔧 Configuration:');
console.log('PORT:', PORT);
console.log('MONGODB_URI:', MONGODB_URI ? 'Configured ✓' : 'Missing ✗');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Routes available:`);
      console.log(`   - Users: http://localhost:${PORT}/api/users`);
      console.log(`   - Participants: http://localhost:${PORT}/api/participants`);
      console.log(`   - Consent Forms: http://localhost:${PORT}/api/consent-forms`);
      console.log(`   - Experiments: http://localhost:${PORT}/api/experiments`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
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
