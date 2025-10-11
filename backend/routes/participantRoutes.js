const express = require('express');
const router = express.Router();
const { 
  registerParticipant, 
  loginParticipant, 
  getParticipantById 
} = require('../controllers/participantController');

// Logging middleware
router.use((req, res, next) => {
  console.log(`\n📍 Participant Route Hit: ${req.method} ${req.path}`);
  console.log('Time:', new Date().toISOString());
  next();
});

// Register route
router.post('/register', registerParticipant);

// Login route
router.post('/login', loginParticipant);

// Get participant by ID
router.get('/:id', getParticipantById);

module.exports = router;
