# AI Experiment Builder - Standalone Build System

## 🚀 Overview

The AI Experiment Builder now features a complete **standalone build system** that converts React-based experiments into self-contained HTML files that can be shared publicly without any build tools or React runtime.

## ✨ Features

### 1. **Automatic Building**
- When you save an AI-generated experiment, it's automatically built into a standalone HTML file
- No manual build step required
- Stored directly in MongoDB for instant serving

### 2. **Public Sharing**
- Each build gets a unique public ID (e.g., `a1b2c3d4e5`)
- Toggle public/private access with one click
- Share experiments via simple URL

### 3. **Sandboxed Preview**
- Preview experiments in a secure iframe
- Safe testing environment before publishing
- Real-time preview of changes

### 4. **Zero Dependencies**
- Built experiments run with just:
  - Tailwind CSS (via CDN)
  - Vanilla JavaScript
  - No React, no build tools, no npm

## 📋 How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│ 1. AI Generates React Component Code                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 2. Builder Converts to Vanilla JS                   │
│    - Removes import statements                       │
│    - Implements lightweight React-like hooks         │
│    - Converts JSX to template literals               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 3. Generate Complete HTML Document                   │
│    - Inject Tailwind CSS                             │
│    - Embed converted JavaScript                      │
│    - Add custom styles                               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 4. Save to MongoDB                                   │
│    - Store HTML, CSS, JS separately                  │
│    - Generate unique public ID                       │
│    - Track access and versions                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│ 5. Serve Publicly                                    │
│    - No authentication required for public access    │
│    - Direct URL serving                              │
│    - CORS-enabled for embedding                      │
└─────────────────────────────────────────────────────┘
```

## 🛠️ API Endpoints

### Build & Management

#### Build/Rebuild Experiment
```http
POST /api/ai-experiments/:experimentId/build
```
Builds or rebuilds an experiment to standalone HTML.

**Response:**
```json
{
  "success": true,
  "publicId": "a1b2c3d4e5",
  "previewUrl": "/public/preview/a1b2c3d4e5",
  "publicUrl": "/public/experiment/a1b2c3d4e5",
  "buildVersion": "1.0.1"
}
```

#### Get Build Status
```http
GET /api/ai-experiments/:experimentId/build-status
```
Retrieves build information and URLs.

**Response:**
```json
{
  "success": true,
  "built": true,
  "publicId": "a1b2c3d4e5",
  "buildStatus": "success",
  "buildVersion": "1.0.0",
  "isPublic": true,
  "accessCount": 42,
  "urls": {
    "preview": "http://localhost:5173/public/preview/a1b2c3d4e5",
    "public": "http://localhost:5173/public/experiment/a1b2c3d4e5",
    "info": "http://localhost:5173/public/info/a1b2c3d4e5"
  },
  "lastBuildAt": "2025-10-12T10:30:00.000Z"
}
```

#### Toggle Public Access
```http
POST /api/ai-experiments/:experimentId/toggle-public
```
Makes experiment public or private.

**Response:**
```json
{
  "success": true,
  "isPublic": true,
  "publicId": "a1b2c3d4e5",
  "publicUrl": "/public/experiment/a1b2c3d4e5",
  "message": "Public access enabled"
}
```

### Public Access

#### Serve Public Experiment
```http
GET /public/experiment/:publicId
```
Serves the complete standalone HTML (requires `isPublic: true`).

#### Preview Experiment
```http
GET /public/preview/:publicId
```
Serves experiment for preview (authentication recommended but not enforced for development).

#### Get Experiment Info
```http
GET /public/info/:publicId
```
Returns metadata about public experiment.

**Response:**
```json
{
  "success": true,
  "experiment": {
    "publicId": "a1b2c3d4e5",
    "title": "Custom Stroop Task",
    "buildVersion": "1.0.0",
    "accessCount": 42,
    "createdAt": "2025-10-12T10:00:00.000Z"
  }
}
```

## 💻 Frontend Integration

### Build Panel Component

The `ExperimentBuildPanel` component provides:

- ✅ Build status visualization
- 🔄 One-click rebuild
- 🌐 Public/Private toggle
- 📋 Copy URLs to clipboard
- 👁️ Embedded preview iframe
- 📊 Access statistics

### Usage in AI Experiment Builder

```jsx
import { ExperimentBuildPanel } from '../../components/experiment/ExperimentBuildPanel';

// In your component
<ExperimentBuildPanel experimentId={currentExperiment?._id} />
```

The panel is now available as the **"Build & Share"** tab in the AI Experiment Builder.

## 🗄️ Database Schema

### BuiltExperiment Model

```javascript
{
  experimentId: ObjectId,     // Reference to Experiment
  publicId: String,            // Unique public ID (nanoid)
  title: String,
  htmlContent: String,         // Complete standalone HTML
  cssContent: String,          // Custom CSS
  jsContent: String,           // Converted vanilla JS
  buildVersion: String,        // Semantic version
  buildStatus: String,         // 'building' | 'success' | 'failed'
  buildError: String,          // Error message if failed
  isPublic: Boolean,           // Public access enabled
  accessCount: Number,         // View counter
  lastAccessedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

1. **Sandboxed iframe** for preview (prevents XSS)
2. **Public ID** instead of database ID (prevents enumeration)
3. **Access tracking** for monitoring
4. **Version control** for experiments
5. **Input sanitization** in builder
6. **No eval()** or dangerous dynamic execution

## 🎯 Use Cases

### For Researchers
- Share experiments with participants via simple URL
- No technical knowledge required for participants
- Embed experiments in external platforms
- Track participation without complex setup

### For Participants
- Access experiments with just a link
- No account required
- Works on any device with browser
- Instant loading, no build time

### For Administrators
- Monitor experiment access
- Version control for iterations
- Quick preview without deployment
- Easy rollback to previous versions

## 🚦 Workflow Example

1. **Create experiment** using AI Builder
   ```
   "Create a Stroop task with 30 trials and 2-second stimulus duration"
   ```

2. **Review generated code** in Code tab
   - Verify logic
   - Test functionality

3. **Save experiment**
   - Automatic build triggered
   - Public ID generated
   - URLs created

4. **Switch to Build & Share tab**
   - View build status
   - Preview in iframe
   - Copy preview URL

5. **Make public when ready**
   - Toggle "Make Public" button
   - Share public URL with participants
   - Monitor access count

6. **Rebuild if needed**
   - Click "Rebuild" to update
   - Version automatically increments
   - Old URLs still work

## 📊 Benefits

### vs Traditional React Apps
- ✅ No build process for participants
- ✅ No npm install required
- ✅ No Node.js needed
- ✅ Instant loading
- ✅ Works on any hosting

### vs Static Generators
- ✅ Dynamic generation from templates
- ✅ AI-powered customization
- ✅ Database-backed versioning
- ✅ Built-in access control

### vs Survey Platforms
- ✅ Full programmatic control
- ✅ Precise timing measurement
- ✅ Custom UI components
- ✅ Complex experimental logic
- ✅ Research-grade data collection

## 🔧 Configuration

### Environment Variables

```env
# API URL for generating public URLs
API_URL=http://localhost:5000

# MongoDB connection (stores built experiments)
MONGODB_URI=mongodb://...
```

### Customization

To modify the build template, edit:
```
backend/utils/experimentBuilder.js
```

Key functions:
- `buildStandaloneExperiment()` - Main build logic
- `convertReactToVanilla()` - React to vanilla JS conversion
- `generateHTML()` - HTML template
- `generateCSS()` - Custom styles

## 🐛 Troubleshooting

### Build fails
- Check component code syntax
- Verify all React hooks are supported
- Review build error in Build Status

### Preview doesn't load
- Check browser console for errors
- Verify Tailwind CSS CDN loads
- Check iframe sandbox settings

### Public URL 404
- Ensure experiment is marked public
- Check publicId is correct
- Verify server is running

## 📚 Future Enhancements

- [ ] Progressive Web App (PWA) support
- [ ] Offline experiment capability
- [ ] Custom domain mapping
- [ ] Embedded analytics
- [ ] A/B testing support
- [ ] Multi-language builds
- [ ] CDN deployment integration
- [ ] QR code generation for mobile
- [ ] Email distribution system
- [ ] Results webhook integration

## 🤝 Contributing

To add new build features:

1. Modify `experimentBuilder.js` for new functionality
2. Update `BuiltExperiment` model if schema changes needed
3. Add routes to `publicExperimentRoutes.js`
4. Update frontend `ExperimentBuildPanel` component
5. Test with various experiment types
6. Update this documentation

## 📝 License

Same as main project

---

**Created with ❤️ for the Cognitive Science Research Platform**
