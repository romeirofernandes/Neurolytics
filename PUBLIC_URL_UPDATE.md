# Public URL Structure Update

## Summary
Updated the public experiment URL structure to use clean frontend routes instead of backend API routes.

## Changes Made

### Frontend (`frontend/src/App.jsx`)

1. **Updated Route Parameter Name**
   - Changed from `/experiment/:experimentId` to `/experiment/:publicId`
   - This now uses the `publicId` from BuiltExperiment instead of MongoDB ObjectId

2. **Updated PublicExperimentPage Component**
   - Uses `publicId` from URL params
   - Fetches experiment metadata from `/public/info/:publicId` endpoint
   - Shows consent form first (if exists)
   - After consent, loads experiment via iframe from backend: `/public/experiment/:publicId`
   - Improved error handling for consent recording

3. **URL Structure**
   - **Old**: `http://localhost:5000/public/experiment/UYkrNB9bLc`
   - **New**: `http://localhost:5173/experiment/UYkrNB9bLc`

### Backend

#### `backend/routes/publicExperimentRoutes.js`

1. **Enhanced `/public/info/:publicId` endpoint**
   - Now returns complete experiment metadata including consent form
   - Fetches from both BuiltExperiment and Experiment collections
   - Populates consent form data

#### `backend/controllers/aiExperimentController.js`

1. **Updated all public URL responses**
   - `previewUrl`: Changed from `/public/preview/:publicId` to `/preview/:publicId`
   - `publicUrl`: Changed from `/public/experiment/:publicId` to `/experiment/:publicId`
   - Updated in:
     - `generateExperiment` response
     - `buildExperiment` response
     - `getBuildStatus` response
     - `togglePublicAccess` response

## URL Flow

### Preview Flow
1. User clicks preview in dashboard
2. Opens: `http://localhost:5173/preview/:publicId`
3. Frontend loads experiment component directly

### Public Experiment Flow
1. User visits: `http://localhost:5173/experiment/:publicId`
2. Frontend fetches metadata: `GET /public/info/:publicId`
3. If consent form exists, show ConsentDisplay component
4. User accepts consent
5. Frontend records consent (if applicable)
6. Experiment loads via iframe: `http://localhost:5000/public/experiment/:publicId`

## Benefits

1. **Cleaner URLs**: `localhost:5173/experiment/ABC123` instead of `localhost:5000/public/experiment/ABC123`
2. **Consistent with Preview**: Both preview and public use frontend routes
3. **Better UX**: Users see the main app domain, not the API domain
4. **Consent Integration**: Can show consent form before experiment
5. **Future-proof**: Easy to add analytics, tracking, or custom landing pages

## Testing

1. Generate an AI experiment
2. Build the experiment
3. Enable public access
4. Copy the public URL (should be `/experiment/:publicId`)
5. Visit the URL - should show:
   - Consent form (if configured)
   - Then experiment iframe

## Notes

- Backend routes at `/public/experiment/:publicId` still serve the HTML content (used in iframe)
- Frontend routes at `/experiment/:publicId` handle the user-facing page with consent
- This maintains backward compatibility with existing experiments
