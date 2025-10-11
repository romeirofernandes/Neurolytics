const Researcher = require('../models/Researcher');
const User = require('../models/User');
const axios = require('axios');

/**
 * Verify ORCID using ORCID's Public API
 * @param {string} orcId - The ORCID to verify
 * @returns {Promise<Object>} - Verification result with researcher data
 */
const verifyOrcId = async (orcId) => {
  try {
    // Validate ORCID format
    const orcIdRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/;
    if (!orcIdRegex.test(orcId)) {
      return {
        isValid: false,
        error: 'Invalid ORCID format. Expected format: 0000-0000-0000-0000'
      };
    }

    // ORCID Public API endpoint
    const orcIdApiUrl = `https://pub.orcid.org/v3.0/${orcId}`;
    
    // Make request to ORCID API
    const response = await axios.get(orcIdApiUrl, {
      headers: {
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.status === 200 && response.data) {
      // Extract researcher information from ORCID response
      const orcIdData = response.data;
      const person = orcIdData.person || {};
      const name = person.name || {};
      
      return {
        isValid: true,
        orcIdData: {
          orcId: orcId,
          givenName: name['given-names']?.value || '',
          familyName: name['family-name']?.value || '',
          creditName: name['credit-name']?.value || '',
          biography: person.biography?.content || '',
          // You can extract more data as needed
        }
      };
    }

    return {
      isValid: false,
      error: 'ORCID not found or invalid'
    };

  } catch (error) {
    if (error.response) {
      // ORCID API returned an error
      if (error.response.status === 404) {
        return {
          isValid: false,
          error: 'ORCID not found in ORCID registry'
        };
      }
      return {
        isValid: false,
        error: `ORCID verification failed: ${error.response.statusText}`
      };
    } else if (error.request) {
      return {
        isValid: false,
        error: 'Unable to reach ORCID verification service'
      };
    }
    return {
      isValid: false,
      error: `Verification error: ${error.message}`
    };
  }
};

/**
 * Create or update researcher profile
 * POST /api/researchers/profile
 */
const createOrUpdateProfile = async (req, res) => {
  try {
    const { userId, institution, designation, fieldOfStudy, bio, orcId } = req.body;

    // Validate required fields
    if (!userId || !institution || !designation || !fieldOfStudy) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, institution, designation, and fieldOfStudy are required'
      });
    }

    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify ORCID if provided
    let orcIdVerification = null;
    if (orcId) {
      orcIdVerification = await verifyOrcId(orcId);
      
      if (!orcIdVerification.isValid) {
        return res.status(400).json({
          success: false,
          message: 'ORCID verification failed',
          error: orcIdVerification.error
        });
      }
    }

    // Check if researcher profile already exists
    let researcher = await Researcher.findOne({ userId });

    if (researcher) {
      // Update existing profile
      researcher.institution = institution;
      researcher.designation = designation;
      researcher.fieldOfStudy = fieldOfStudy;
      researcher.bio = bio || researcher.bio;
      if (orcId) researcher.orcId = orcId;

      await researcher.save();

      return res.status(200).json({
        success: true,
        message: 'Researcher profile updated successfully',
        data: researcher,
        orcIdVerification: orcIdVerification?.orcIdData || null
      });
    } else {
      // Create new profile
      researcher = new Researcher({
        userId,
        institution,
        designation,
        fieldOfStudy,
        bio: bio || '',
        orcId: orcId || undefined
      });

      await researcher.save();

      return res.status(201).json({
        success: true,
        message: 'Researcher profile created successfully',
        data: researcher,
        orcIdVerification: orcIdVerification?.orcIdData || null
      });
    }

  } catch (error) {
    console.error('Error creating/updating researcher profile:', error);
    
    // Handle duplicate ORCID error
    if (error.code === 11000 && error.keyPattern?.orcId) {
      return res.status(400).json({
        success: false,
        message: 'This ORCID is already associated with another researcher profile'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create/update researcher profile',
      error: error.message
    });
  }
};

/**
 * Get researcher profile by userId
 * GET /api/researchers/profile/:userId
 */
const getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const researcher = await Researcher.findOne({ userId }).populate('userId', 'name email');

    if (!researcher) {
      return res.status(404).json({
        success: false,
        message: 'Researcher profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: researcher
    });

  } catch (error) {
    console.error('Error fetching researcher profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch researcher profile',
      error: error.message
    });
  }
};

/**
 * Get all researchers
 * GET /api/researchers
 */
const getAllResearchers = async (req, res) => {
  try {
    const { institution, fieldOfStudy, page = 1, limit = 10 } = req.query;

    // Build filter query
    const filter = {};
    if (institution) filter.institution = new RegExp(institution, 'i');
    if (fieldOfStudy) filter.fieldOfStudy = new RegExp(fieldOfStudy, 'i');

    // Pagination
    const skip = (page - 1) * limit;

    const researchers = await Researcher.find(filter)
      .populate('userId', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Researcher.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: researchers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching researchers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch researchers',
      error: error.message
    });
  }
};

/**
 * Verify ORCID endpoint
 * POST /api/researchers/verify-orcid
 */
const verifyOrcIdEndpoint = async (req, res) => {
  try {
    const { orcId } = req.body;

    if (!orcId) {
      return res.status(400).json({
        success: false,
        message: 'ORCID is required'
      });
    }

    const verification = await verifyOrcId(orcId);

    if (verification.isValid) {
      return res.status(200).json({
        success: true,
        message: 'ORCID verified successfully',
        data: verification.orcIdData
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'ORCID verification failed',
        error: verification.error
      });
    }

  } catch (error) {
    console.error('Error verifying ORCID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify ORCID',
      error: error.message
    });
  }
};

/**
 * Delete researcher profile
 * DELETE /api/researchers/profile/:userId
 */
const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const researcher = await Researcher.findOneAndDelete({ userId });

    if (!researcher) {
      return res.status(404).json({
        success: false,
        message: 'Researcher profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Researcher profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting researcher profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete researcher profile',
      error: error.message
    });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfileByUserId,
  getAllResearchers,
  verifyOrcIdEndpoint,
  deleteProfile,
  verifyOrcId // Export for potential reuse
};
