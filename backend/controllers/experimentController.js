const Experiment = require('../models/Experiment');
const ConsentForm = require('../models/ConsentForm');
const fs = require('fs').promises;
const path = require('path');

/**
 * Create a new experiment
 * @route POST /api/experiments
 */
const createExperiment = async (req, res) => {
  try {
    const {
      experimentId,
      researcherId,
      consentFormId,
      title,
      topic,
      description,
      bio,
      templateId,
      configuration,
      ...otherFields
    } = req.body;

    // Validate required fields
    if (!experimentId || !researcherId || !consentFormId || !title || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: experimentId, researcherId, consentFormId, title, topic',
      });
    }

    // Check if experiment ID already exists
    const existingExperiment = await Experiment.findOne({ experimentId });
    if (existingExperiment) {
      return res.status(409).json({
        success: false,
        message: 'Experiment ID already exists',
      });
    }

    // Verify consent form exists
    const consentForm = await ConsentForm.findById(consentFormId);
    if (!consentForm) {
      return res.status(404).json({
        success: false,
        message: 'Consent form not found',
      });
    }

    // Create file paths
    const htmlFilePath = `/public/experiments/${experimentId}.html`;
    const jsonContextPath = `/public/experiments/${experimentId}.json`;

    // Create new experiment
    const experiment = new Experiment({
      experimentId,
      researcherId,
      consentFormId,
      title,
      topic,
      description,
      bio,
      templateId,
      configuration,
      htmlFilePath,
      jsonContextPath,
      lastModifiedBy: researcherId,
      ...otherFields,
    });

    await experiment.save();

    res.status(201).json({
      success: true,
      message: 'Experiment created successfully',
      experiment,
    });
  } catch (error) {
    console.error('Error creating experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating experiment',
      error: error.message,
    });
  }
};

/**
 * Get experiment by ID
 * @route GET /api/experiments/:experimentId
 */
const getExperimentById = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findOne({ experimentId })
      .populate('researcherId', 'name email')
      .populate('consentFormId')
      .populate('collaborators.userId', 'name email');

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found',
      });
    }

    res.status(200).json({
      success: true,
      experiment,
    });
  } catch (error) {
    console.error('Error fetching experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching experiment',
      error: error.message,
    });
  }
};

/**
 * Get all experiments for a researcher
 * @route GET /api/experiments/researcher/:researcherId
 */
const getExperimentsByResearcher = async (req, res) => {
  try {
    const { researcherId } = req.params;
    const { status, topic } = req.query;

    // Build filter
    const filter = { researcherId };
    if (status) filter.status = status;
    if (topic) filter.topic = topic;

    const experiments = await Experiment.find(filter)
      .sort({ createdAt: -1 })
      .populate('consentFormId', 'title version status')
      .populate('researcherId', 'name email');

    res.status(200).json({
      success: true,
      count: experiments.length,
      experiments,
    });
  } catch (error) {
    console.error('Error fetching experiments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching experiments',
      error: error.message,
    });
  }
};

/**
 * Update experiment
 * @route PUT /api/experiments/:experimentId
 */
const updateExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;
    const updates = req.body;

    // Don't allow changing experimentId or researcherId
    delete updates.experimentId;
    delete updates.researcherId;

    const experiment = await Experiment.findOneAndUpdate(
      { experimentId },
      { 
        ...updates, 
        updatedAt: Date.now(),
        lastModifiedBy: updates.lastModifiedBy || experiment.researcherId,
      },
      { new: true, runValidators: true }
    ).populate('consentFormId');

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Experiment updated successfully',
      experiment,
    });
  } catch (error) {
    console.error('Error updating experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating experiment',
      error: error.message,
    });
  }
};

/**
 * Publish experiment
 * @route POST /api/experiments/:experimentId/publish
 */
const publishExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findOne({ experimentId })
      .populate('consentFormId');

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found',
      });
    }

    // Verify consent form is active
    if (experiment.consentFormId.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Consent form must be active before publishing experiment',
      });
    }

    // Generate HTML file (you'll implement this based on your template system)
    // await generateExperimentHTML(experiment);

    await experiment.publish();

    res.status(200).json({
      success: true,
      message: 'Experiment published successfully',
      experiment,
      publicUrl: experiment.fullPublishedUrl,
    });
  } catch (error) {
    console.error('Error publishing experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing experiment',
      error: error.message,
    });
  }
};

/**
 * Unpublish experiment
 * @route POST /api/experiments/:experimentId/unpublish
 */
const unpublishExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findOne({ experimentId });
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found',
      });
    }

    await experiment.unpublish();

    res.status(200).json({
      success: true,
      message: 'Experiment unpublished successfully',
      experiment,
    });
  } catch (error) {
    console.error('Error unpublishing experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Error unpublishing experiment',
      error: error.message,
    });
  }
};

/**
 * Record participant completion
 * @route POST /api/experiments/:experimentId/complete
 */
const recordParticipantCompletion = async (req, res) => {
  try {
    const { experimentId } = req.params;
    const { participantId, completed, duration, data } = req.body;

    const experiment = await Experiment.findOne({ experimentId });
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found',
      });
    }

    // Check if accepting participants
    if (!experiment.isAcceptingParticipants()) {
      return res.status(400).json({
        success: false,
        message: 'Experiment is not currently accepting participants',
      });
    }

    // Increment participant counts
    await experiment.incrementParticipants(completed);

    // Update average duration
    if (completed && duration) {
      const totalDuration = experiment.results.averageDuration * (experiment.results.completedParticipants - 1) + duration;
      experiment.results.averageDuration = Math.round(totalDuration / experiment.results.completedParticipants);
      await experiment.save();
    }

    // Save participant data (implement separate data storage)
    // await saveParticipantData(experimentId, participantId, data);

    res.status(200).json({
      success: true,
      message: 'Participant completion recorded successfully',
      experimentId: experiment.experimentId,
    });
  } catch (error) {
    console.error('Error recording completion:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording completion',
      error: error.message,
    });
  }
};

/**
 * Get experiment statistics
 * @route GET /api/experiments/:experimentId/stats
 */
const getExperimentStats = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findOne({ experimentId });
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found',
      });
    }

    const stats = {
      experimentId: experiment.experimentId,
      title: experiment.title,
      status: experiment.status,
      results: experiment.results,
      recruitment: experiment.recruitment,
      completionRate: experiment.completionRate,
      publishedAt: experiment.publishedAt,
      createdAt: experiment.createdAt,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

/**
 * Delete experiment
 * @route DELETE /api/experiments/:experimentId
 */
const deleteExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findOne({ experimentId });
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found',
      });
    }

    // Don't allow deletion if published and has participants
    if (experiment.status === 'published' && experiment.results.totalParticipants > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete published experiment with participant data',
      });
    }

    // Delete associated files
    try {
      await fs.unlink(path.join(__dirname, '..', experiment.htmlFilePath));
      await fs.unlink(path.join(__dirname, '..', experiment.jsonContextPath));
    } catch (fileError) {
      console.log('Error deleting files:', fileError.message);
    }

    await Experiment.deleteOne({ experimentId });

    res.status(200).json({
      success: true,
      message: 'Experiment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting experiment',
      error: error.message,
    });
  }
};

/**
 * Get public experiment data (for participants)
 * @route GET /api/experiments/public/:experimentId
 */
const getPublicExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findOne({ 
      experimentId,
      status: 'published',
    })
      .populate('consentFormId')
      .select('-results -versionHistory -notes -collaborators');

    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found or not published',
      });
    }

    // Check if accepting participants
    if (!experiment.isAcceptingParticipants()) {
      return res.status(400).json({
        success: false,
        message: 'This experiment is not currently accepting participants',
        experiment: {
          title: experiment.title,
          status: 'closed',
        },
      });
    }

    res.status(200).json({
      success: true,
      experiment: {
        experimentId: experiment.experimentId,
        title: experiment.title,
        description: experiment.description,
        topic: experiment.topic,
        configuration: experiment.configuration,
        consentForm: experiment.consentFormId,
        estimatedDuration: experiment.consentFormId.estimatedDuration,
      },
    });
  } catch (error) {
    console.error('Error fetching public experiment:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching experiment',
      error: error.message,
    });
  }
};

module.exports = {
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
};