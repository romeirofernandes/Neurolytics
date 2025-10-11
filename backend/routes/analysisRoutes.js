const express = require('express');
const { analyzeExperiment } = require('../controllers/analysisController');
const router = express.Router();

router.post('/analyze', analyzeExperiment);

module.exports = router;