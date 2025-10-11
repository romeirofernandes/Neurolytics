/**
 * Example usage of Researcher API endpoints
 * These are sample requests you can make to test the API
 */

// Example 1: Verify an ORCID before creating profile
const verifyOrcIdExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/researchers/verify-orcid',
  body: {
    orcId: '0000-0002-1825-0097'
  }
};

// Example 2: Create a new researcher profile with ORCID
const createProfileExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/researchers/profile',
  body: {
    userId: '507f1f77bcf86cd799439011', // Replace with actual user ID
    institution: 'Massachusetts Institute of Technology',
    designation: 'PhD Student',
    fieldOfStudy: 'Cognitive Psychology',
    bio: 'I am researching human memory, attention, and decision-making processes.',
    orcId: '0000-0002-1825-0097' // Optional
  }
};

// Example 3: Create researcher profile without ORCID
const createProfileWithoutOrcIdExample = {
  method: 'POST',
  url: 'http://localhost:3000/api/researchers/profile',
  body: {
    userId: '507f1f77bcf86cd799439011',
    institution: 'Stanford University',
    designation: 'Research Assistant',
    fieldOfStudy: 'Neuroscience',
    bio: 'Studying neural mechanisms of learning and memory.'
    // orcId is optional, so we can omit it
  }
};

// Example 4: Update existing researcher profile
const updateProfileExample = {
  method: 'POST', // Same endpoint, it will update if profile exists
  url: 'http://localhost:3000/api/researchers/profile',
  body: {
    userId: '507f1f77bcf86cd799439011', // Same userId as before
    institution: 'Harvard University', // Updated
    designation: 'PhD Candidate', // Updated
    fieldOfStudy: 'Cognitive Neuroscience', // Updated
    bio: 'Updated research interests...',
    orcId: '0000-0002-1825-0097'
  }
};

// Example 5: Get a researcher profile by userId
const getProfileExample = {
  method: 'GET',
  url: 'http://localhost:3000/api/researchers/profile/507f1f77bcf86cd799439011'
};

// Example 6: Get all researchers with filters
const getAllResearchersExample = {
  method: 'GET',
  url: 'http://localhost:3000/api/researchers?institution=MIT&fieldOfStudy=Psychology&page=1&limit=10'
};

// Example 7: Get all researchers without filters
const getAllResearchersNoFilterExample = {
  method: 'GET',
  url: 'http://localhost:3000/api/researchers?page=1&limit=20'
};

// Example 8: Delete a researcher profile
const deleteProfileExample = {
  method: 'DELETE',
  url: 'http://localhost:3000/api/researchers/profile/507f1f77bcf86cd799439011'
};

// CURL Examples for testing from command line:

/*
// 1. Verify ORCID
curl -X POST http://localhost:3000/api/researchers/verify-orcid \
  -H "Content-Type: application/json" \
  -d '{"orcId": "0000-0002-1825-0097"}'

// 2. Create researcher profile
curl -X POST http://localhost:3000/api/researchers/profile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "institution": "MIT",
    "designation": "PhD Student",
    "fieldOfStudy": "Cognitive Psychology",
    "bio": "Research in human cognition",
    "orcId": "0000-0002-1825-0097"
  }'

// 3. Get researcher profile
curl http://localhost:3000/api/researchers/profile/507f1f77bcf86cd799439011

// 4. Get all researchers with filters
curl "http://localhost:3000/api/researchers?institution=MIT&page=1&limit=10"

// 5. Delete researcher profile
curl -X DELETE http://localhost:3000/api/researchers/profile/507f1f77bcf86cd799439011
*/

// Example ORCID values for testing (real ORCIDs from ORCID public registry):
const testOrcIds = [
  '0000-0002-1825-0097', // Valid ORCID
  '0000-0001-5109-3700', // Valid ORCID
  '0000-0002-1694-233X', // Valid ORCID (with X)
];

// Common error responses you might encounter:

const errorExamples = {
  invalidOrcIdFormat: {
    success: false,
    message: 'ORCID verification failed',
    error: 'Invalid ORCID format. Expected format: 0000-0000-0000-0000'
  },
  
  orcIdNotFound: {
    success: false,
    message: 'ORCID verification failed',
    error: 'ORCID not found in ORCID registry'
  },
  
  missingRequiredFields: {
    success: false,
    message: 'Missing required fields: userId, institution, designation, and fieldOfStudy are required'
  },
  
  userNotFound: {
    success: false,
    message: 'User not found'
  },
  
  duplicateOrcId: {
    success: false,
    message: 'This ORCID is already associated with another researcher profile'
  },
  
  profileNotFound: {
    success: false,
    message: 'Researcher profile not found'
  }
};

module.exports = {
  verifyOrcIdExample,
  createProfileExample,
  createProfileWithoutOrcIdExample,
  updateProfileExample,
  getProfileExample,
  getAllResearchersExample,
  getAllResearchersNoFilterExample,
  deleteProfileExample,
  testOrcIds,
  errorExamples
};
