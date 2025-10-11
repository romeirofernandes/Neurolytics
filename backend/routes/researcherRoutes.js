const express = require('express');
const router = express.Router();
const {
  createOrUpdateProfile,
  getProfileByUserId,
  getAllResearchers,
  verifyOrcIdEndpoint,
  deleteProfile
} = require('../controllers/ResearcherController');

// Create or update researcher profile
router.post('/profile', createOrUpdateProfile);

// Get researcher profile by userId
router.get('/profile/:userId', getProfileByUserId);

// Get all researchers (with optional filters)
router.get('/', getAllResearchers);

// Verify ORCID
router.post('/verify-orcid', verifyOrcIdEndpoint);

// Delete researcher profile
router.delete('/profile/:userId', deleteProfile);

module.exports = router;
