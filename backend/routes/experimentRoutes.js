const express = require('express');
const router = express.Router();
const {
  createExperiment,
  getExperimentById,
  getExperimentsByResearcher,
  updateExperiment,
  publishExperiment,
  unpublishExperiment,
  recordParticipantCompletion,
  getExperimentStats,
  deleteExperiment,
  getPublicExperiment,
} = require('../controllers/experimentController');

// Public routes (no authentication required)
router.get('/public/:experimentId', getPublicExperiment);
router.post('/:experimentId/complete', recordParticipantCompletion);

// Protected routes (add authentication middleware as needed)
router.post('/', createExperiment);
router.get('/:experimentId', getExperimentById);
router.get('/researcher/:researcherId', getExperimentsByResearcher);
router.put('/:experimentId', updateExperiment);
router.post('/:experimentId/publish', publishExperiment);
router.post('/:experimentId/unpublish', unpublishExperiment);
router.get('/:experimentId/stats', getExperimentStats);
router.delete('/:experimentId', deleteExperiment);

// Add this route to serve templates from templatesKnowledgeBase.json
router.get('/templates', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const templatesPath = path.join(__dirname, '../utils/templatesKnowledgeBase.json');
    const data = await fs.readFile(templatesPath, 'utf-8');
    const templates = JSON.parse(data);
    
    res.json({
      success: true,
      templates: templates,
      count: templates.length
    });
  } catch (error) {
    console.error('Error loading templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load templates'
    });
  }
});

module.exports = router;