const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Save experiment to templates.json
router.post('/save', async (req, res) => {
  try {
    const { experiment } = req.body;
    
    if (!experiment || !experiment.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid experiment data'
      });
    }

    // Read existing templates
    const templatesPath = path.join(__dirname, '../../frontend/templates.json');
    let templates = [];
    
    try {
      const data = await fs.readFile(templatesPath, 'utf8');
      templates = JSON.parse(data);
    } catch (error) {
      console.log('No existing templates file, creating new one');
    }

    // Check if experiment already exists
    const existingIndex = templates.findIndex(t => t.id === experiment.id);
    
    if (existingIndex !== -1) {
      // Update existing
      templates[existingIndex] = experiment;
    } else {
      // Add new
      templates.push(experiment);
    }

    // Write back to file
    await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2));

    res.json({
      success: true,
      message: 'Experiment saved successfully',
      data: experiment
    });
  } catch (error) {
    console.error('Save experiment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save experiment'
    });
  }
});

// Get all visual builder experiments
router.get('/experiments', async (req, res) => {
  try {
    const templatesPath = path.join(__dirname, '../../frontend/templates.json');
    const data = await fs.readFile(templatesPath, 'utf8');
    const templates = JSON.parse(data);
    
    // Filter only visual builder experiments
    const visualExperiments = templates.filter(t => t.source === 'visual-builder');
    
    res.json({
      success: true,
      data: visualExperiments
    });
  } catch (error) {
    console.error('Get experiments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load experiments'
    });
  }
});

module.exports = router;