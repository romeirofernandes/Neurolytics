const Researcher = require('../models/Researcher');
const User = require('../models/User');
const axios = require('axios');

/**
 * Calculate similarity between two strings using Levenshtein distance
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity percentage (0-100)
 */
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;
  
  // Normalize strings: lowercase and remove extra spaces
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 100;
  
  // Calculate Levenshtein distance
  const matrix = [];
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s2.length][s1.length];
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.round(similarity);
};

/**
 * Check if two names are similar (at least 70% match)
 * @param {string} userName - User's name from profile
 * @param {string} orcIdGivenName - Given name from ORCID
 * @param {string} orcIdFamilyName - Family name from ORCID
 * @param {string} orcIdCreditName - Credit name from ORCID
 * @returns {Object} - Match result
 */
const checkNameMatch = (userName, orcIdGivenName, orcIdFamilyName, orcIdCreditName) => {
  console.log('[checkNameMatch] Comparing names:');
  console.log('[checkNameMatch] User name:', userName);
  console.log('[checkNameMatch] ORCID given name:', orcIdGivenName);
  console.log('[checkNameMatch] ORCID family name:', orcIdFamilyName);
  console.log('[checkNameMatch] ORCID credit name:', orcIdCreditName);
  
  if (!userName) {
    return { isMatch: false, similarity: 0, message: 'User name not found' };
  }
  
  // Construct full name from ORCID
  const orcIdFullName = `${orcIdGivenName} ${orcIdFamilyName}`.trim();
  
  // Calculate similarity with different name combinations
  const similarities = [];
  
  // Compare with full name (given + family)
  if (orcIdFullName) {
    const sim1 = calculateSimilarity(userName, orcIdFullName);
    similarities.push({ name: orcIdFullName, similarity: sim1 });
    console.log('[checkNameMatch] Similarity with full name:', sim1 + '%');
  }
  
  // Compare with credit name
  if (orcIdCreditName) {
    const sim2 = calculateSimilarity(userName, orcIdCreditName);
    similarities.push({ name: orcIdCreditName, similarity: sim2 });
    console.log('[checkNameMatch] Similarity with credit name:', sim2 + '%');
  }
  
  // Compare with reversed name (family + given)
  const reversedName = `${orcIdFamilyName} ${orcIdGivenName}`.trim();
  if (reversedName && reversedName !== orcIdFullName) {
    const sim3 = calculateSimilarity(userName, reversedName);
    similarities.push({ name: reversedName, similarity: sim3 });
    console.log('[checkNameMatch] Similarity with reversed name:', sim3 + '%');
  }
  
  // Find the best match
  const bestMatch = similarities.reduce((prev, current) => 
    (current.similarity > prev.similarity) ? current : prev
  , { similarity: 0, name: '' });
  
  console.log('[checkNameMatch] Best match:', bestMatch);
  
  const SIMILARITY_THRESHOLD = 70; // 70% similarity required
  
  if (bestMatch.similarity >= SIMILARITY_THRESHOLD) {
    return {
      isMatch: true,
      similarity: bestMatch.similarity,
      matchedName: bestMatch.name,
      message: `Name matched with ${bestMatch.similarity}% similarity`
    };
  } else {
    return {
      isMatch: false,
      similarity: bestMatch.similarity,
      matchedName: bestMatch.name,
      message: `Name does not match. Your name "${userName}" does not match ORCID name "${bestMatch.name}" (${bestMatch.similarity}% similarity). Minimum 70% similarity required.`
    };
  }
};

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

    console.log('[createOrUpdateProfile] User found:', userExists);

    // Verify ORCID if provided
    let orcIdVerification = null;
    if (orcId) {
      console.log('[createOrUpdateProfile] Verifying ORCID:', orcId);
      orcIdVerification = await verifyOrcId(orcId);
      
      if (!orcIdVerification.isValid) {
        console.log('[createOrUpdateProfile] ORCID verification failed');
        return res.status(400).json({
          success: false,
          message: 'ORCID verification failed',
          error: orcIdVerification.error
        });
      }

      console.log('[createOrUpdateProfile] ORCID verified, checking name match');
      
      // Check if the user's name matches the ORCID name
      const nameMatchResult = checkNameMatch(
        userExists.name,
        orcIdVerification.orcIdData.givenName,
        orcIdVerification.orcIdData.familyName,
        orcIdVerification.orcIdData.creditName
      );

      console.log('[createOrUpdateProfile] Name match result:', nameMatchResult);

      if (!nameMatchResult.isMatch) {
        console.log('[createOrUpdateProfile] Name does not match');
        return res.status(400).json({
          success: false,
          message: 'Name verification failed',
          error: nameMatchResult.message,
          details: {
            userName: userExists.name,
            orcIdName: nameMatchResult.matchedName,
            similarity: nameMatchResult.similarity
          }
        });
      }

      console.log('[createOrUpdateProfile] Name matched successfully with ' + nameMatchResult.similarity + '% similarity');
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
    const { orcId, userName } = req.body;

    console.log('[verifyOrcIdEndpoint] Request body:', { orcId, userName });

    if (!orcId) {
      return res.status(400).json({
        success: false,
        message: 'ORCID is required'
      });
    }

    const verification = await verifyOrcId(orcId);

    if (verification.isValid) {
      // If userName is provided, check name match
      let nameMatchResult = null;
      if (userName) {
        console.log('[verifyOrcIdEndpoint] Checking name match for:', userName);
        nameMatchResult = checkNameMatch(
          userName,
          verification.orcIdData.givenName,
          verification.orcIdData.familyName,
          verification.orcIdData.creditName
        );

        console.log('[verifyOrcIdEndpoint] Name match result:', nameMatchResult);

        if (!nameMatchResult.isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Name verification failed',
            error: nameMatchResult.message,
            details: {
              userName: userName,
              orcIdName: nameMatchResult.matchedName,
              similarity: nameMatchResult.similarity
            },
            orcIdData: verification.orcIdData
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: nameMatchResult 
          ? `ORCID verified successfully! Name matched with ${nameMatchResult.similarity}% similarity.` 
          : 'ORCID verified successfully',
        data: verification.orcIdData,
        nameMatch: nameMatchResult
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
