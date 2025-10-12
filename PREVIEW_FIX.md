# FIXED: AI Experiment Preview & Build System

## 🎯 The Problem

You were absolutely right! The URLs were pointing to the backend (http://localhost:5000) when they should use the frontend (http://localhost:5173) for previewing React experiments.

## ✅ The Solution

### Two-Tier System:

#### 1. **Frontend Preview (Primary)**
- **URL**: `http://localhost:5173/participant/template/{templateId}`
- **Purpose**: Live React-based preview
- **Works**: Immediately after saving
- **Benefits**: Full React functionality, real-time, no build needed

#### 2. **Standalone Build (Secondary)**
- **URL**: `http://localhost:5000/public/experiment/{publicId}`
- **Purpose**: Standalone HTML for sharing
- **Works**: After clicking "Build Standalone HTML Version"
- **Benefits**: No React needed, works anywhere

## 🔧 What Was Fixed

### 1. ExperimentBuildPanel Component
```jsx
// NOW SHOWS:
✅ Frontend preview URL: http://localhost:5173/participant/template/{templateId}
✅ Preview works in iframe immediately
✅ Standalone build is optional
✅ Both URLs clearly labeled
```

### 2. Preview Iframe
```jsx
// FIXED: Uses frontend URL
<iframe 
  src={`http://localhost:5173/participant/template/${templateId}`}
  sandbox="allow-scripts allow-same-origin allow-forms"
/>
```

### 3. Smart Preview Display
- Shows preview **even before building** standalone version
- Uses the templateId from saved experiment
- Iframe loads the actual React component from frontend

## 📋 How To Use

### Step 1: Create Experiment with AI
```
User: "Create a Stroop task with 30 trials"
AI: Generates React component code
```

### Step 2: Save Experiment
1. Click "Save" button
2. System automatically:
   - Saves to database
   - Creates template file
   - Adds to templates.json
   - Generates templateId (e.g., `custom-stroop-task`)
3. Auto-switches to "Build & Share" tab

### Step 3: Preview Immediately
- Click "Show Preview"
- Iframe loads: `http://localhost:5173/participant/template/custom-stroop-task`
- **No build needed!**

### Step 4: Build Standalone (Optional)
- Click "Build Standalone HTML Version"
- Creates self-contained HTML file
- Stores in MongoDB
- Generates public URL
- Can toggle public/private

## 🌐 URL Structure

### Frontend URLs (React-based)
```
Preview: http://localhost:5173/participant/template/{templateId}
Run:     http://localhost:5173/participant/run/{templateId}
```

### Backend URLs (Standalone HTML)
```
Preview: http://localhost:5000/public/preview/{publicId}
Public:  http://localhost:5000/public/experiment/{publicId}
Info:    http://localhost:5000/public/info/{publicId}
```

## 🎨 UI Flow

### Before Building
```
┌─────────────────────────────────────────┐
│ Preview Your Experiment                  │
├─────────────────────────────────────────┤
│ Template ID: custom-stroop-task         │
│ Access via: http://localhost:5173/...  │
│                                          │
│ [Show Preview] [Build Standalone HTML]  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Live Preview (iframe)                    │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Actual experiment running here      │ │
│ │ Full React functionality            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### After Building
```
┌─────────────────────────────────────────┐
│ Standalone Build                         │
├─────────────────────────────────────────┤
│ Status: ✅ Success                       │
│ Public ID: a1b2c3d4e5                   │
│ Build Version: 1.0.0                    │
│ Access Count: 0 views                   │
│ Public Access: 🔒 Private               │
├─────────────────────────────────────────┤
│ Share Links:                            │
│ Frontend: http://localhost:5173/...    │
│ Standalone: http://localhost:5000/...  │
│                                          │
│ [Rebuild] [Make Public]                 │
└─────────────────────────────────────────┘
```

## 🚀 Benefits

### For You (Researcher)
- ✅ Instant preview - no waiting
- ✅ Real React components - full functionality
- ✅ Easy to test and iterate
- ✅ Optional standalone build for sharing

### For Participants
- ✅ Frontend URL: Full React experience
- ✅ Standalone URL: Works without React
- ✅ Both URLs work correctly
- ✅ No confusion about which to use

## 🔍 Technical Details

### Template ID Generation
```javascript
// From title: "Custom Stroop Task"
templateId = "custom-stroop-task"

// Saved in templates.json
{
  "id": "custom-stroop-task",
  "name": "Custom Stroop Task",
  ...
}

// Component file
CustomStroopTaskTemplate.jsx
```

### URL Routing
```javascript
// Frontend (Vite)
Route: /participant/template/:templateId
Loads: From templates.json → Imports component

// Backend (Express)
Route: /public/experiment/:publicId
Serves: From MongoDB → Standalone HTML
```

## 🎯 Key Fixes Summary

1. ✅ **Changed iframe src** from backend to frontend URL
2. ✅ **Show preview immediately** without building
3. ✅ **Pass templateId** to ExperimentBuildPanel
4. ✅ **Store templateId** in experiment state
5. ✅ **Clear labeling** of frontend vs standalone URLs
6. ✅ **Both URLs work** correctly for their purposes

## 📝 Testing Checklist

- [x] Save experiment → Gets templateId
- [x] Preview shows immediately
- [x] Iframe loads frontend URL correctly
- [x] Build standalone works
- [x] Standalone URL serves HTML
- [x] Copy buttons work for both URLs
- [x] Toggle public/private works

## 🎉 Result

**EVERYTHING WORKS NOW!**

- Frontend preview: ✅ Working
- Iframe sandbox: ✅ Working
- URLs: ✅ Correct
- Both systems: ✅ Functional

No more backend confusion - frontend URLs for frontend previews! 🚀
