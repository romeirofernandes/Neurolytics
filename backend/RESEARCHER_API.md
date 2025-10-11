# Researcher API Documentation

## Overview
This API provides endpoints for managing researcher profiles with ORCID verification functionality.

## Base URL
```
/api/researchers
```

## Endpoints

### 1. Create or Update Researcher Profile
**POST** `/api/researchers/profile`

Creates a new researcher profile or updates an existing one. If ORCID is provided, it will be verified using ORCID's Public API.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "institution": "MIT",
  "designation": "PhD Student",
  "fieldOfStudy": "Cognitive Psychology",
  "bio": "Researching human memory and cognition",
  "orcId": "0000-0002-1825-0097"
}
```

**Response (Success - 201 Created):**
```json
{
  "success": true,
  "message": "Researcher profile created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "institution": "MIT",
    "designation": "PhD Student",
    "fieldOfStudy": "Cognitive Psychology",
    "bio": "Researching human memory and cognition",
    "orcId": "0000-0002-1825-0097",
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  },
  "orcIdVerification": {
    "orcId": "0000-0002-1825-0097",
    "givenName": "John",
    "familyName": "Doe",
    "creditName": "Dr. John Doe",
    "biography": "Researcher in cognitive psychology"
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "message": "ORCID verification failed",
  "error": "ORCID not found in ORCID registry"
}
```

---

### 2. Verify ORCID
**POST** `/api/researchers/verify-orcid`

Verifies an ORCID using ORCID's Public API without creating a profile.

**Request Body:**
```json
{
  "orcId": "0000-0002-1825-0097"
}
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "ORCID verified successfully",
  "data": {
    "orcId": "0000-0002-1825-0097",
    "givenName": "John",
    "familyName": "Doe",
    "creditName": "Dr. John Doe",
    "biography": "Researcher in cognitive psychology"
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "success": false,
  "message": "ORCID verification failed",
  "error": "Invalid ORCID format. Expected format: 0000-0000-0000-0000"
}
```

---

### 3. Get Researcher Profile by User ID
**GET** `/api/researchers/profile/:userId`

Retrieves a researcher profile by user ID.

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "institution": "MIT",
    "designation": "PhD Student",
    "fieldOfStudy": "Cognitive Psychology",
    "bio": "Researching human memory and cognition",
    "orcId": "0000-0002-1825-0097",
    "createdAt": "2025-10-11T10:30:00.000Z",
    "updatedAt": "2025-10-11T10:30:00.000Z"
  }
}
```

---

### 4. Get All Researchers
**GET** `/api/researchers`

Retrieves all researcher profiles with optional filtering and pagination.

**Query Parameters:**
- `institution` (optional): Filter by institution name (case-insensitive partial match)
- `fieldOfStudy` (optional): Filter by field of study (case-insensitive partial match)
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 10): Number of items per page

**Example Request:**
```
GET /api/researchers?institution=MIT&fieldOfStudy=Psychology&page=1&limit=10
```

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "institution": "MIT",
      "designation": "PhD Student",
      "fieldOfStudy": "Cognitive Psychology",
      "bio": "Researching human memory and cognition",
      "orcId": "0000-0002-1825-0097",
      "createdAt": "2025-10-11T10:30:00.000Z",
      "updatedAt": "2025-10-11T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

---

### 5. Delete Researcher Profile
**DELETE** `/api/researchers/profile/:userId`

Deletes a researcher profile by user ID.

**Response (Success - 200 OK):**
```json
{
  "success": true,
  "message": "Researcher profile deleted successfully"
}
```

**Response (Error - 404 Not Found):**
```json
{
  "success": false,
  "message": "Researcher profile not found"
}
```

---

## ORCID Verification Details

### How It Works
1. The system validates the ORCID format (0000-0000-0000-0000)
2. Makes a request to ORCID's Public API: `https://pub.orcid.org/v3.0/{orcid}`
3. Retrieves and verifies the researcher's information
4. Returns verification status and researcher data

### ORCID Format
- Valid format: `0000-0002-1825-0097`
- 16 digits separated by hyphens
- Last digit can be 0-9 or X

### Extracted Data from ORCID
- Given Name
- Family Name
- Credit Name
- Biography

---

## Error Responses

### 400 Bad Request
- Missing required fields
- Invalid ORCID format
- ORCID verification failed
- Duplicate ORCID

### 404 Not Found
- User not found
- Researcher profile not found

### 500 Internal Server Error
- Database errors
- ORCID API unavailable

---

## Installation

To use the ORCID verification feature, install axios:

```bash
npm install axios
```

---

## Environment Variables

No special environment variables required for ORCID verification as it uses the public API.

---

## Notes

- ORCID is optional when creating a profile
- ORCID must be unique across all researcher profiles
- Profile uses timestamps (createdAt, updatedAt)
- The system uses ORCID's Public API (no authentication required)
- ORCID verification has a 10-second timeout
