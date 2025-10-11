const express = require('express');
const router = express.Router();
const {
  createConsentForm,
  getConsentFormByExperimentId,
  getConsentFormById,
  updateConsentForm,
  getConsentFormsByResearcher,
  activateConsentForm,
  recordConsent,
  deleteConsentForm,
} = require('../controllers/consentFormController');

// Create new consent form
router.post('/', createConsentForm);

// Get consent form by experiment ID
router.get('/experiment/:experimentId', getConsentFormByExperimentId);

// Get consent form by ID
router.get('/:id', getConsentFormById);

// Update consent form
router.put('/:id', updateConsentForm);

// Get all consent forms for a researcher
router.get('/researcher/:researcherId', getConsentFormsByResearcher);

// Activate consent form
router.patch('/:id/activate', activateConsentForm);

// Record participant consent
router.post('/:id/consent', recordConsent);

// Delete consent form
router.delete('/:id', deleteConsentForm);

module.exports = router;