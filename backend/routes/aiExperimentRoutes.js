const express = require('express');
const router = express.Router();
const {
  chatWithAI,
  saveAIExperiment,
  getAIExperiment,
  canPublishExperiment,
  publishExperiment
} = require('../controllers/aiExperimentController');

// Chat with AI
router.post('/chat', chatWithAI);

// Save AI-generated experiment
router.post('/save', saveAIExperiment);

// Get AI experiment by ID
router.get('/:experimentId', getAIExperiment);

// Check if can publish
router.get('/:experimentId/can-publish', canPublishExperiment);

// Publish experiment
router.post('/:experimentId/publish', publishExperiment);

module.exports = router;