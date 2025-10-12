const ConsentForm = require('../models/ConsentForm');
const Experiment = require('../models/Experiment');

/**
 * Create a new consent form
 * @route POST /api/consent-forms
 */
const createConsentForm = async (req, res) => {
  try {
    const {
      experimentId, // This is the template ID from templates.json
      researcherId,
      title,
      studyPurpose,
      procedures,
      estimatedDuration,
      risks,
      benefits,
      compensation,
      contactInfo,
      eligibility,
      ...otherFields
    } = req.body;

    // Validate required fields
    if (!experimentId || !researcherId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Experiment ID (template ID), researcher ID, and title are required',
      });
    }

    // Check if consent form already exists for this template
    const existingConsent = await ConsentForm.findOne({ experimentId });
    if (existingConsent) {
      return res.status(409).json({
        success: false,
        message: 'Consent form already exists for this experiment template',
        consentFormId: existingConsent._id,
      });
    }

    // Create new consent form with template ID
    const consentForm = new ConsentForm({
      experimentId, // Store template ID
      researcherId,
      title,
      studyPurpose,
      procedures,
      estimatedDuration,
      risks,
      benefits,
      compensation,
      contactInfo,
      eligibility,
      ...otherFields,
    });

    await consentForm.save();

    console.log(`✅ Consent form created for template: ${experimentId}`);

    res.status(201).json({
      success: true,
      message: 'Consent form created successfully',
      consentForm,
    });
  } catch (error) {
    console.error('Error creating consent form:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating consent form',
      error: error.message,
    });
  }
};

/**
 * Get consent form by experiment ID (template ID)
 * @route GET /api/consent-forms/experiment/:experimentId
 */
const getConsentFormByExperimentId = async (req, res) => {
  try {
    const { experimentId } = req.params;

    // experimentId is actually the template ID from templates.json
    const consentForm = await ConsentForm.findOne({ experimentId })
      .populate('researcherId', 'name email');

    if (!consentForm) {
      return res.status(404).json({
        success: false,
        message: 'Consent form not found for this experiment',
      });
    }

    res.status(200).json({
      success: true,
      consentForm,
    });
  } catch (error) {
    console.error('Error fetching consent form:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consent form',
      error: error.message,
    });
  }
};

/**
 * Get consent form by ID
 * @route GET /api/consent-forms/:id
 */
const getConsentFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const consentForm = await ConsentForm.findById(id)
      .populate('researcherId', 'name email');

    if (!consentForm) {
      return res.status(404).json({
        success: false,
        message: 'Consent form not found',
      });
    }

    res.status(200).json({
      success: true,
      consentForm,
    });
  } catch (error) {
    console.error('Error fetching consent form:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consent form',
      error: error.message,
    });
  }
};

/**
 * Update consent form
 * @route PUT /api/consent-forms/:id
 */
const updateConsentForm = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const consentForm = await ConsentForm.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!consentForm) {
      return res.status(404).json({
        success: false,
        message: 'Consent form not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consent form updated successfully',
      consentForm,
    });
  } catch (error) {
    console.error('Error updating consent form:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating consent form',
      error: error.message,
    });
  }
};

/**
 * Get all consent forms for a researcher
 * @route GET /api/consent-forms/researcher/:researcherId
 */
const getConsentFormsByResearcher = async (req, res) => {
  try {
    const { researcherId } = req.params;

    const consentForms = await ConsentForm.find({ researcherId })
      .sort({ createdAt: -1 })
      .populate('researcherId', 'name email');

    res.status(200).json({
      success: true,
      count: consentForms.length,
      consentForms,
    });
  } catch (error) {
    console.error('Error fetching consent forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consent forms',
      error: error.message,
    });
  }
};

/**
 * Activate consent form
 * @route PATCH /api/consent-forms/:id/activate
 */
const activateConsentForm = async (req, res) => {
  try {
    const { id } = req.params;

    const consentForm = await ConsentForm.findById(id);
    if (!consentForm) {
      return res.status(404).json({
        success: false,
        message: 'Consent form not found',
      });
    }

    await consentForm.activate();

    res.status(200).json({
      success: true,
      message: 'Consent form activated successfully',
      consentForm,
    });
  } catch (error) {
    console.error('Error activating consent form:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating consent form',
      error: error.message,
    });
  }
};

/**
 * Record participant consent
 * @route POST /api/consent-forms/:id/consent
 */
const recordConsent = async (req, res) => {
  try {
    const { id } = req.params;
    const { participantId, consentGiven, ipAddress } = req.body;

    const consentForm = await ConsentForm.findById(id);
    if (!consentForm) {
      return res.status(404).json({
        success: false,
        message: 'Consent form not found',
      });
    }

    // Increment consent count
    await consentForm.incrementConsentCount();

    // You can also log this to a separate ConsentLog collection if needed
    res.status(200).json({
      success: true,
      message: 'Consent recorded successfully',
      consentFormId: consentForm._id,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error recording consent:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording consent',
      error: error.message,
    });
  }
};

/**
 * Delete consent form
 * @route DELETE /api/consent-forms/:id
 */
const deleteConsentForm = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any experiments are using this consent form
    const experiments = await Experiment.find({ consentFormId: id });
    if (experiments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete consent form that is linked to experiments',
        linkedExperiments: experiments.length,
      });
    }

    const consentForm = await ConsentForm.findByIdAndDelete(id);
    if (!consentForm) {
      return res.status(404).json({
        success: false,
        message: 'Consent form not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Consent form deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting consent form:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting consent form',
      error: error.message,
    });
  }
};

module.exports = {
  createConsentForm,
  getConsentFormByExperimentId,
  getConsentFormById,
  updateConsentForm,
  getConsentFormsByResearcher,
  activateConsentForm,
  recordConsent,
  deleteConsentForm,
};