const { nanoid } = require('nanoid');
const BuiltExperiment = require('../models/BuiltExperiment');

/**
 * Convert React component code to standalone HTML/CSS/JS
 * This creates a self-contained experiment that can run without React build tools
 */
function buildStandaloneExperiment(componentCode, title, description) {
  // Extract the component logic and convert to vanilla JS
  const jsContent = convertReactToVanilla(componentCode);
  
  // Generate complete HTML
  const htmlContent = generateHTML(title, description);
  
  // Generate Tailwind-based CSS (inline critical styles)
  const cssContent = generateCSS();
  
  return {
    htmlContent,
    cssContent,
    jsContent
  };
}

/**
 * Convert React component to vanilla JavaScript
 */
function convertReactToVanilla(componentCode) {
  // This is a simplified converter - for production, you'd want a more robust solution
  // For now, we'll wrap the component code and provide a runtime
  
  const vanillaJS = `
// Experiment Runtime
(function() {
  'use strict';
  
  // Simple React-like hooks implementation
  let currentComponent = null;
  let hookIndex = 0;
  let hooks = [];
  
  function useState(initialValue) {
    const hookId = hookIndex++;
    if (hooks[hookId] === undefined) {
      hooks[hookId] = initialValue;
    }
    
    const setState = (newValue) => {
      hooks[hookId] = typeof newValue === 'function' ? newValue(hooks[hookId]) : newValue;
      render();
    };
    
    return [hooks[hookId], setState];
  }
  
  function useEffect(callback, deps) {
    // Simplified useEffect - runs on mount and when deps change
    const hookId = hookIndex++;
    const oldDeps = hooks[hookId];
    
    let hasChanged = true;
    if (oldDeps) {
      hasChanged = deps ? deps.some((dep, i) => dep !== oldDeps[i]) : true;
    }
    
    if (hasChanged) {
      hooks[hookId] = deps;
      setTimeout(callback, 0);
    }
  }
  
  // Simple component rendering
  function render() {
    hookIndex = 0;
    const app = document.getElementById('experiment-root');
    if (app && currentComponent) {
      app.innerHTML = currentComponent();
    }
  }
  
  // Helper functions for creating elements
  function createElement(tag, props = {}, ...children) {
    const element = document.createElement(tag);
    
    Object.keys(props).forEach(key => {
      if (key.startsWith('on') && typeof props[key] === 'function') {
        const eventName = key.substring(2).toLowerCase();
        element.addEventListener(eventName, props[key]);
      } else if (key === 'className') {
        element.className = props[key];
      } else if (key === 'style' && typeof props[key] === 'object') {
        Object.assign(element.style, props[key]);
      } else {
        element.setAttribute(key, props[key]);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
    
    return element;
  }
  
  // UI Component helpers
  const Button = (props) => {
    const btn = document.createElement('button');
    btn.className = 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition ' + (props.className || '');
    btn.textContent = props.children || props.label || 'Button';
    if (props.onClick) btn.onclick = props.onClick;
    if (props.disabled) btn.disabled = true;
    return btn.outerHTML;
  };
  
  const Card = (props) => {
    return '<div class="bg-white shadow-lg rounded-lg overflow-hidden ' + (props.className || '') + '">' + (props.children || '') + '</div>';
  };
  
  const CardHeader = (props) => {
    return '<div class="px-6 py-4 border-b ' + (props.className || '') + '">' + (props.children || '') + '</div>';
  };
  
  const CardTitle = (props) => {
    return '<h2 class="text-2xl font-bold ' + (props.className || '') + '">' + (props.children || '') + '</h2>';
  };
  
  const CardDescription = (props) => {
    return '<p class="text-gray-600 mt-2 ' + (props.className || '') + '">' + (props.children || '') + '</p>';
  };
  
  const CardContent = (props) => {
    return '<div class="px-6 py-4 ' + (props.className || '') + '">' + (props.children || '') + '</div>';
  };
  
  // Make available globally
  window.React = {
    useState,
    useEffect,
    createElement
  };
  
  window.UI = {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
  };
  
  // Original component code (converted)
  ${componentCode.replace(/import.*from.*;?/g, '')
    .replace(/export const /g, 'const ')
    .replace(/export default /g, 'const ExperimentComponent = ')}
  
  // Start the experiment
  window.startExperiment = function() {
    const onComplete = (results) => {
      console.log('Experiment completed:', results);
      
      // Display results
      const root = document.getElementById('experiment-root');
      root.innerHTML = Card({
        className: 'max-w-2xl mx-auto mt-8',
        children: CardHeader({
          children: CardTitle({
            children: '✅ Experiment Complete!'
          }) + CardDescription({
            children: 'Your results have been recorded. Thank you for participating!'
          })
        }) + CardContent({
          children: '<pre class="bg-gray-100 p-4 rounded overflow-auto">' + 
                    JSON.stringify(results, null, 2) + 
                    '</pre>' +
                    '<button onclick="window.downloadResults()" class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Download Results</button>'
        })
      });
      
      // Store results
      window.experimentResults = results;
    };
    
    // Initialize experiment component
    currentComponent = () => ExperimentComponent({ onComplete });
    render();
  };
  
  window.downloadResults = function() {
    if (!window.experimentResults) return;
    
    const dataStr = JSON.stringify(window.experimentResults, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'experiment_results_' + new Date().toISOString() + '.json');
    linkElement.click();
  };
  
  // Auto-start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.startExperiment);
  } else {
    window.startExperiment();
  }
  
})();
`;
  
  return vanillaJS;
}

/**
 * Generate complete HTML document
 */
function generateHTML(title, description) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description || '')}">
  <title>${escapeHtml(title)}</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style id="experiment-styles">
    /* Custom styles will be injected here */
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
  <div class="container mx-auto px-4 py-8">
    <div id="experiment-root" class="max-w-4xl mx-auto">
      <!-- Experiment will be rendered here -->
      <div class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading experiment...</p>
        </div>
      </div>
    </div>
  </div>
  
  <script id="experiment-script">
    /* Experiment code will be injected here */
  </script>
</body>
</html>`;
}

/**
 * Generate CSS content
 */
function generateCSS() {
  return `
/* Experiment Custom Styles */
.experiment-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.trial-display {
  font-size: 48px;
  font-weight: bold;
  text-align: center;
  padding: 60px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Ensure buttons are styled */
button {
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;
}

/**
 * Build and save experiment to database
 */
async function buildAndSaveExperiment(experimentId, componentCode, title, description, templateId = null) {
  try {
    console.log(`🔨 Building standalone experiment: ${title}`);
    
    // Build the standalone files
    const { htmlContent, cssContent, jsContent } = buildStandaloneExperiment(
      componentCode,
      title,
      description
    );
    
    // Generate public ID
    const publicId = nanoid(10);
    
    // Inject CSS and JS into HTML
    const finalHTML = htmlContent
      .replace('/* Custom styles will be injected here */', cssContent)
      .replace('/* Experiment code will be injected here */', jsContent);
    
    // Save to database
    const builtExperiment = new BuiltExperiment({
      experimentId,
      publicId,
      templateId,
      title,
      htmlContent: finalHTML,
      cssContent,
      jsContent,
      buildStatus: 'success',
      isPublic: false
    });
    
    await builtExperiment.save();
    
    console.log(`✅ Experiment built successfully! Public ID: ${publicId}, Template ID: ${templateId || 'N/A'}`);
    
    return {
      success: true,
      publicId,
      templateId,
      builtExperiment
    };
    
  } catch (error) {
    console.error('❌ Build error:', error);
    
    // Save failed build
    const builtExperiment = new BuiltExperiment({
      experimentId,
      publicId: nanoid(10),
      templateId,
      title,
      htmlContent: '',
      jsContent: '',
      buildStatus: 'failed',
      buildError: error.message
    });
    
    await builtExperiment.save();
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Rebuild an existing experiment
 */
async function rebuildExperiment(experimentId, componentCode, title, description, templateId = null) {
  try {
    // Find existing built experiment
    const existing = await BuiltExperiment.findOne({ experimentId });
    
    if (!existing) {
      // Create new if doesn't exist
      return buildAndSaveExperiment(experimentId, componentCode, title, description, templateId);
    }
    
    console.log(`🔨 Rebuilding experiment: ${title}`);
    
    // Build new version
    const { htmlContent, cssContent, jsContent } = buildStandaloneExperiment(
      componentCode,
      title,
      description
    );
    
    // Inject CSS and JS into HTML
    const finalHTML = htmlContent
      .replace('/* Custom styles will be injected here */', cssContent)
      .replace('/* Experiment code will be injected here */', jsContent);
    
    // Update existing
    existing.title = title;
    existing.templateId = templateId || existing.templateId; // Preserve or update templateId
    existing.htmlContent = finalHTML;
    existing.cssContent = cssContent;
    existing.jsContent = jsContent;
    existing.buildStatus = 'success';
    existing.buildError = null;
    existing.buildVersion = incrementVersion(existing.buildVersion);
    existing.updatedAt = new Date();
    
    await existing.save();
    
    console.log(`✅ Experiment rebuilt successfully! Version: ${existing.buildVersion}`);
    
    return {
      success: true,
      publicId: existing.publicId,
      builtExperiment: existing
    };
    
  } catch (error) {
    console.error('❌ Rebuild error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Publish experiment (make it publicly accessible)
 */
async function publishBuiltExperiment(experimentId) {
  const builtExp = await BuiltExperiment.findOne({ experimentId });
  
  if (!builtExp) {
    throw new Error('Built experiment not found. Build it first.');
  }
  
  builtExp.isPublic = true;
  await builtExp.save();
  
  return builtExp;
}

/**
 * Get public experiment by ID
 */
async function getPublicExperiment(publicId) {
  const experiment = await BuiltExperiment.findOne({ publicId, isPublic: true });
  
  if (!experiment) {
    return null;
  }
  
  // Update access tracking
  experiment.accessCount += 1;
  experiment.lastAccessedAt = new Date();
  await experiment.save();
  
  return experiment;
}

// Helper functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function incrementVersion(version) {
  const parts = version.split('.');
  parts[2] = parseInt(parts[2]) + 1;
  return parts.join('.');
}

module.exports = {
  buildStandaloneExperiment,
  buildAndSaveExperiment,
  rebuildExperiment,
  publishBuiltExperiment,
  getPublicExperiment
};
