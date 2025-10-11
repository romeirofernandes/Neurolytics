require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const participantRoutes = require('./routes/participantRoutes');

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

console.log('✅ Routes registered:');
console.log('  - /api/users');
console.log('  - /api/participants');

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
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
      console.log(`🔗 Participant routes available at: http://localhost:${PORT}/api/participants`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });
