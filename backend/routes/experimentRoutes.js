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

module.exports = router;