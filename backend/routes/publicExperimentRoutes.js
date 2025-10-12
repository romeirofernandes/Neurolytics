const express = require('express');
const router = express.Router();
const { 
  getPublicExperiment 
} = require('../utils/experimentBuilder');

/**
 * Serve public experiment by public ID
 * @route GET /public/experiment/:publicId
 */
router.get('/experiment/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const experiment = await getPublicExperiment(publicId);
    
    if (!experiment) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Experiment Not Found</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center min-h-screen">
          <div class="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
            <h1 class="text-3xl font-bold text-red-600 mb-4">404</h1>
            <p class="text-gray-700 mb-4">Experiment not found or not published</p>
            <p class="text-sm text-gray-500">Public ID: ${publicId}</p>
          </div>
        </body>
        </html>
      `);
    }
    
    // Serve the complete HTML
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Experiment-ID', experiment.publicId);
    res.setHeader('X-Experiment-Title', experiment.title);
    res.send(experiment.htmlContent);
    
  } catch (error) {
    console.error('❌ Error serving public experiment:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
          <h1 class="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p class="text-gray-700">Failed to load experiment</p>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * Get experiment preview (for authenticated users)
 * @route GET /public/preview/:publicId
 */
router.get('/preview/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const BuiltExperiment = require('../models/BuiltExperiment');
    const experiment = await BuiltExperiment.findOne({ publicId });
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }
    
    // Return HTML for preview (even if not public)
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow iframe from same origin
    res.send(experiment.htmlContent);
    
  } catch (error) {
    console.error('❌ Error serving preview:', error);
    res.status(500).send('Error loading preview');
  }
});

/**
 * Get experiment metadata (including consent form)
 * @route GET /public/info/:publicId
 */
router.get('/info/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    const BuiltExperiment = require('../models/BuiltExperiment');
    const Experiment = require('../models/Experiment');
    
    // Find the built experiment
    const builtExperiment = await BuiltExperiment.findOne({ publicId, isPublic: true });
    
    if (!builtExperiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found or not published'
      });
    }
    
    // Get the original experiment with consent form
    const experiment = await Experiment.findById(builtExperiment.experimentId)
      .populate('consentFormId');
    
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment configuration not found'
      });
    }
    
    res.json({
      success: true,
      experiment: {
        publicId: builtExperiment.publicId,
        title: builtExperiment.title,
        description: experiment.description,
        buildVersion: builtExperiment.buildVersion,
        accessCount: builtExperiment.accessCount,
        consentForm: experiment.consentFormId || null,
        createdAt: builtExperiment.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching experiment info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching experiment information',
      error: error.message
    });
  }
});

module.exports = router;
