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
const aiExperimentRoutes = require('./routes/aiExperimentRoutes');
const publicExperimentRoutes = require('./routes/publicExperimentRoutes');
const voiceResponsesRoutes = require('./routes/voiceResponses'); // Changed from import to require
const uploadRoutes = require("./routes/uploadRoutes");
const visualBuilderRoutes = require("./routes/visualBuilderRoutes");
const cryptoRoutes = require('./routes/cryptoRoutes');
const emailRoutes = require('./routes/emailRoutes');
const twilioRoutes = require('./routes/twilioRoutes');
// const { initializeAutoEmailScheduler } = require('./controllers/nodeMailerController'); // DISABLED
const { initializeAutoWhatsAppScheduler } = require('./controllers/twilioControllers');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
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
app.use('/api/ai-experiments', aiExperimentRoutes);
app.use('/public', publicExperimentRoutes); // Public experiment serving
app.use('/api/voice-responses', voiceResponsesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/visual-builder", visualBuilderRoutes);
app.use('/api/crypto', cryptoRoutes);
// app.use('/api/email', emailRoutes);
app.use('/api/twilio', twilioRoutes);

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
    
    // Initialize WhatsApp scheduler after MongoDB connection
    console.log('\n� Initializing WhatsApp scheduler...');
    initializeAutoWhatsAppScheduler();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log('📊 BART Analytics WhatsApp will be sent every 10 minutes');
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
