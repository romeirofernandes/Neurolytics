const { GoogleGenerativeAI } = require("@google/generative-ai");
const Experiment = require('../models/Experiment');
const ConsentForm = require('../models/ConsentForm');
const { get } = require("mongoose");
const fs = require('fs').promises;
const path = require('path');
const { 
  retrieveRelevantTemplates, 
  extractModifications, 
  generateRAGPrompt,
  getAllTemplates,
  searchTemplates
} = require('../utils/ragHelper');
const {
  buildAndSaveExperiment,
  rebuildExperiment
} = require('../utils/experimentBuilder');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sanitize title for safe file operations
 */
function sanitizeTitle(title) {
  return title.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
}

/**
 * Validate component name is safe
 */
function isValidComponentName(name) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

/**
 * Validate filename doesn't contain path traversal
 */
function isSafeFilename(filename) {
  return !filename.includes('..') && !filename.includes('/') && !filename.includes('\\');
}

/**
 * Chat with AI to build/edit experiments
 * @route POST /api/ai-experiments/chat
 */
const chatWithAI = async (req, res) => {
  try {
    const { message, conversationHistory, currentExperiment, researcherId } = req.body;

    if (!message || !researcherId) {
      return res.status(400).json({
        success: false,
        message: 'Message and researcher ID are required'
      });
    }

    console.log(`🤖 AI Experiment Builder - Processing message from researcher ${researcherId}`);

    // RAG: Retrieve relevant templates
    const relevantTemplates = retrieveRelevantTemplates(message, 3);
    const modifications = extractModifications(message);
    
    console.log(`📚 RAG: Found ${relevantTemplates.length} relevant templates`);
    console.log(`   - Best match: ${relevantTemplates[0]?.name} (score: ${relevantTemplates[0]?.similarityScore})`);
    console.log(`🔧 Detected ${modifications.length} modifications:`, modifications.map(m => m.description));

    // Build RAG-enhanced prompt
    const systemPrompt = generateRAGPrompt(message, relevantTemplates, modifications);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiMessage = response.text();

    console.log('✅ AI response generated');

    // Try to extract code if present
    const codeBlockRegex = /```jsx\n([\s\S]*?)\n```/g;
    const codeMatches = [...aiMessage.matchAll(codeBlockRegex)];
    const extractedCode = codeMatches.length > 0 ? codeMatches[0][1] : null;

    res.status(200).json({
      success: true,
      message: aiMessage,
      code: extractedCode,
      suggestions: extractSuggestions(aiMessage),
      usedTemplate: relevantTemplates[0]?.name || null,
      templateSimilarityScore: relevantTemplates[0]?.similarityScore || 0,
      modifications: modifications
    });

  } catch (error) {
    console.error('❌ AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI request',
      error: error.message
    });
  }
};

/**
 * Generate experiment template from description
 * @route POST /api/ai-experiments/generate
 */
const generateExperiment = async (req, res) => {
  try {
    const { description, baseTemplate, researcherId } = req.body;

    if (!description || !researcherId) {
      return res.status(400).json({
        success: false,
        message: 'Description and researcher ID are required'
      });
    }

    console.log(`🎨 Generating experiment from: "${description}"`);

    const prompt = `Create a complete React component for a psychological experiment based on this description:

"${description}"

${baseTemplate ? `Base it on this existing template: ${baseTemplate}` : ''}

REQUIREMENTS:
1. Use React hooks (useState, useEffect)
2. Include proper trial sequencing
3. Implement randomization where appropriate
4. Record response times and accuracy
5. Export data in structured format
6. Include training trials
7. Provide clear instructions
8. Use Shadcn UI components (Card, Button, etc.)

Generate a complete, runnable component following this structure:

\`\`\`jsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const CustomExperimentTemplate = ({ onComplete }) => {
  // State management
  const [currentTrial, setCurrentTrial] = useState(0);
  const [results, setResults] = useState([]);
  
  // Experiment logic here
  
  return (
    <Card>
      {/* UI here */}
    </Card>
  );
};
\`\`\`

Make it professional, well-documented, and following experimental psychology best practices.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedCode = response.text();

    // Extract the component code
    const codeMatch = generatedCode.match(/```jsx\n([\s\S]*?)\n```/);
    const componentCode = codeMatch ? codeMatch[1] : generatedCode;

    console.log('✅ Experiment template generated');

    res.status(200).json({
      success: true,
      code: componentCode,
      fullResponse: generatedCode,
      metadata: {
        generatedAt: new Date().toISOString(),
        description: description
      }
    });

  } catch (error) {
    console.error('❌ Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating experiment',
      error: error.message
    });
  }
};

/**
 * Save AI-generated experiment
 * @route POST /api/ai-experiments/save
 */
const saveAIExperiment = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      componentCode, 
      researcherId,
      templateType,
      estimatedDuration 
    } = req.body;

    if (!title || !componentCode || !researcherId) {
      return res.status(400).json({
        success: false,
        message: 'Title, component code, and researcher ID are required'
      });
    }

    // Sanitize title to prevent path traversal and injection
    const sanitizedTitle = sanitizeTitle(title);
    if (!sanitizedTitle) {
      return res.status(400).json({
        success: false,
        message: 'Invalid title - must contain alphanumeric characters'
      });
    }

    // Create the experiment in database
    const experiment = new Experiment({
      title: sanitizedTitle,
      description,
      researcherId,
      templateType: templateType || 'custom-ai-generated',
      status: 'draft',
      config: {
        componentCode,
        generatedByAI: true,
        estimatedDuration: estimatedDuration || 15
      },
      createdAt: new Date()
    });

    await experiment.save();

    console.log(`✅ AI experiment saved to DB: ${experiment._id}`);

    // Generate template ID and component name from sanitized title
    const templateId = sanitizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Generate component name - ensure it starts with a letter
    let componentName = sanitizedTitle
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '');
    
    // If component name starts with a number, prefix with 'Custom'
    if (/^\d/.test(componentName)) {
      componentName = 'Custom' + componentName;
    }
    
    // Add Template suffix
    componentName = componentName + 'Template';

    // Validate component name for security
    if (!isValidComponentName(componentName)) {
      console.error('❌ Invalid component name generated:', componentName);
      return res.status(400).json({
        success: false,
        message: 'Generated component name is invalid. Please use a title that starts with a letter.'
      });
    }

    // 🔨 BUILD STANDALONE VERSION
    console.log(`🔨 Building standalone experiment for public access...`);
    const buildResult = await buildAndSaveExperiment(
      experiment._id,
      componentCode,
      sanitizedTitle,
      description,
      templateId // Pass the templateId
    );
    
    if (!buildResult.success) {
      console.error(`❌ Build failed: ${buildResult.error}`);
    } else {
      console.log(`✅ Standalone build successful! Template ID: ${templateId}, Public ID: ${buildResult.publicId}`);
    }

    // Prepare the component code with proper export
    let finalComponentCode = componentCode;
    
    // Check if component already has export, if not add it
    if (!componentCode.includes('export const') && !componentCode.includes('export default')) {
      // Extract component name from code or use generated name - safe regex with length limit
      const componentMatch = componentCode.match(/const\s+(\w{1,50})\s*=\s*\(/);
      const existingComponentName = componentMatch ? componentMatch[1] : componentName;
      
      // Validate and safely replace
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(existingComponentName)) {
        const escapedName = existingComponentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        finalComponentCode = componentCode.replace(
          new RegExp(`const\\s+${escapedName}\\s*=`),
          `export const ${componentName} =`
        );
      }
    }

    // Add necessary imports if not present
    if (!finalComponentCode.includes('import')) {
      const imports = `import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

`;
      finalComponentCode = imports + finalComponentCode;
    }

    // Save as JSX file in templates folder - with path validation
    const templatesDir = path.join(__dirname, '../../frontend/src/components/experiment/templates');
    const safeFileName = `${componentName}.jsx`;
    
    // Validate filename doesn't contain path traversal
    if (!isSafeFilename(safeFileName)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename generated'
      });
    }
    
    const templateFilePath = path.join(templatesDir, safeFileName);
    
    // Verify the resolved path is within the templates directory
    const resolvedPath = path.resolve(templateFilePath);
    const resolvedTemplatesDir = path.resolve(templatesDir);
    if (!resolvedPath.startsWith(resolvedTemplatesDir)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file path - security violation'
      });
    }
    
    try {
      await fs.writeFile(templateFilePath, finalComponentCode, 'utf-8');
      console.log(`✅ Template file created: ${templateFilePath}`);
    } catch (fileError) {
      console.error('❌ Error writing template file:', fileError);
      // Continue even if file write fails - experiment is already saved in DB
    }

    // Update templates.json
    const templatesJsonPath = path.join(__dirname, '../../frontend/templates.json');
    
    try {
      const templatesData = await fs.readFile(templatesJsonPath, 'utf-8');
      const templates = JSON.parse(templatesData);
      
      // Check if template already exists
      const existingIndex = templates.findIndex(t => t.id === templateId);
      
      const newTemplate = {
        id: templateId,
        name: sanitizedTitle,
        fullName: sanitizedTitle,
        shortDescription: description || `AI-generated experiment: ${sanitizedTitle}`,
        detailedDescription: description || `This is a custom experiment created using the AI Experiment Builder. ${sanitizedTitle}`,
        duration: `~${estimatedDuration || 15} minutes`,
        trials: "Variable",
        difficulty: "Custom",
        category: "AI Generated",
        measures: ["Custom measures"],
        icon: "Sparkles",
        color: "from-purple-500 to-pink-500",
        requiresCamera: false,
        keywords: [templateId, "ai-generated", "custom"],
        researchAreas: ["Custom Research"],
        publications: []
      };
      
      if (existingIndex !== -1) {
        // Update existing template
        templates[existingIndex] = newTemplate;
        console.log(`✅ Updated existing template in templates.json: ${templateId}`);
      } else {
        // Add new template
        templates.push(newTemplate);
        console.log(`✅ Added new template to templates.json: ${templateId}`);
      }
      
      await fs.writeFile(templatesJsonPath, JSON.stringify(templates, null, 2), 'utf-8');
      console.log(`✅ templates.json updated successfully`);
    } catch (jsonError) {
      console.error('❌ Error updating templates.json:', jsonError);
      // Continue even if JSON update fails - experiment and file are already saved
    }

    res.status(201).json({
      success: true,
      experiment,
      templateId,
      build: buildResult.success ? {
        publicId: buildResult.publicId,
        templateId: templateId,
        previewUrl: `/preview/${templateId}`,
        publicUrl: `/run-experiment/${templateId}`,
        backendPreviewUrl: `/public/preview/${buildResult.publicId}`,
        status: 'built'
      } : {
        status: 'failed',
        error: buildResult.error
      },
      templateInfo: {
        templateId,
        componentName,
        filePath: `src/components/experiment/templates/${componentName}.jsx`
      },
      message: 'AI-generated experiment saved successfully and added to templates'
    });

  } catch (error) {
    console.error('❌ Save error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving experiment',
      error: error.message
    });
  }
};

/**
 * Check if experiment can be published
 * @route GET /api/ai-experiments/:experimentId/can-publish
 */
const canPublishExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    // Check for consent form
    const consentForm = await ConsentForm.findOne({ experimentId });
    
    const canPublish = !!consentForm && consentForm.isActive;
    const issues = [];

    if (!consentForm) {
      issues.push('No consent form created');
    } else if (!consentForm.isActive) {
      issues.push('Consent form is not activated');
    }

    if (!experiment.title || experiment.title.trim() === '') {
      issues.push('Experiment title is missing');
    }

    if (!experiment.description) {
      issues.push('Experiment description is missing');
    }

    res.status(200).json({
      success: true,
      canPublish,
      issues,
      consentForm: consentForm ? {
        id: consentForm._id,
        title: consentForm.title,
        isActive: consentForm.isActive
      } : null
    });

  } catch (error) {
    console.error('❌ Publish check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking publish status',
      error: error.message
    });
  }
};

/**
 * Publish AI experiment
 * @route POST /api/ai-experiments/:experimentId/publish
 */
const publishExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;

    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }

    const consentForm = await ConsentForm.findOne({ experimentId });
    if (!consentForm || !consentForm.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot publish: Active consent form required'
      });
    }

    experiment.status = 'published';
    experiment.publishedAt = new Date();
    await experiment.save();

    console.log(`🚀 Experiment published: ${experimentId}`);

    res.status(200).json({
      success: true,
      experiment,
      message: 'Experiment published successfully'
    });

  } catch (error) {
    console.error('❌ Publish error:', error);
    res.status(500).json({
      success: false,
      message: 'Error publishing experiment',
      error: error.message
    });
  }
};

/**
 * Build/rebuild experiment to standalone HTML
 * @route POST /api/ai-experiments/:experimentId/build
 */
const buildExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }
    
    if (!experiment.config || !experiment.config.componentCode) {
      return res.status(400).json({
        success: false,
        message: 'No component code found in experiment'
      });
    }
    
    console.log(`🔨 Building experiment: ${experiment.title}`);
    
    // Generate templateId from title if not stored
    const templateId = experiment.config.templateId || 
      experiment.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    const buildResult = await rebuildExperiment(
      experiment._id,
      experiment.config.componentCode,
      experiment.title,
      experiment.description,
      templateId
    );
    
    if (!buildResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Build failed',
        error: buildResult.error
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Experiment built successfully',
      publicId: buildResult.publicId,
      templateId: templateId,
      previewUrl: `/preview/${templateId}`,
      publicUrl: `/run-experiment/${templateId}`,
      buildVersion: buildResult.builtExperiment.buildVersion
    });
    
  } catch (error) {
    console.error('❌ Build error:', error);
    res.status(500).json({
      success: false,
      message: 'Error building experiment',
      error: error.message
    });
  }
};

/**
 * Get build status and public URLs
 * @route GET /api/ai-experiments/:experimentId/build-status
 */
const getBuildStatus = async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    const BuiltExperiment = require('../models/BuiltExperiment');
    const builtExp = await BuiltExperiment.findOne({ experimentId });
    
    if (!builtExp) {
      return res.status(404).json({
        success: false,
        message: 'No build found for this experiment',
        built: false
      });
    }
    
    res.status(200).json({
      success: true,
      built: true,
      publicId: builtExp.publicId,
      templateId: builtExp.templateId,
      buildStatus: builtExp.buildStatus,
      buildVersion: builtExp.buildVersion,
      isPublic: builtExp.isPublic,
      accessCount: builtExp.accessCount,
      previewUrl: `/preview/${builtExp.templateId || builtExp.publicId}`,
      publicUrl: `/run-experiment/${builtExp.templateId || builtExp.publicId}`,
      urls: {
        preview: `${process.env.API_URL || 'http://localhost:5000'}/public/preview/${builtExp.publicId}`,
        public: `${process.env.API_URL || 'http://localhost:5000'}/public/experiment/${builtExp.publicId}`,
        info: `${process.env.API_URL || 'http://localhost:5000'}/public/info/${builtExp.publicId}`
      },
      lastBuildAt: builtExp.updatedAt,
      buildError: builtExp.buildError
    });
    
  } catch (error) {
    console.error('❌ Error fetching build status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching build status',
      error: error.message
    });
  }
};

/**
 * Toggle public access
 * @route POST /api/ai-experiments/:experimentId/toggle-public
 */
const togglePublicAccess = async (req, res) => {
  try {
    const { experimentId } = req.params;
    
    const BuiltExperiment = require('../models/BuiltExperiment');
    const builtExp = await BuiltExperiment.findOne({ experimentId });
    
    if (!builtExp) {
      return res.status(404).json({
        success: false,
        message: 'No build found. Build the experiment first.'
      });
    }
    
    builtExp.isPublic = !builtExp.isPublic;
    await builtExp.save();
    
    console.log(`🔓 Public access ${builtExp.isPublic ? 'enabled' : 'disabled'} for: ${builtExp.title}`);
    
    res.status(200).json({
      success: true,
      isPublic: builtExp.isPublic,
      publicId: builtExp.publicId,
      templateId: builtExp.templateId,
      publicUrl: builtExp.isPublic ? `/run-experiment/${builtExp.templateId || builtExp.publicId}` : null,
      message: `Public access ${builtExp.isPublic ? 'enabled' : 'disabled'}`
    });
    
  } catch (error) {
    console.error('❌ Error toggling public access:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling public access',
      error: error.message
    });
  }
};

const getAIExperiment = async (req, res) => {
  try {
    const { experimentId } = req.params;
    const experiment = await Experiment.findById(experimentId);
    if (!experiment) {
      return res.status(404).json({
        success: false,
        message: 'Experiment not found'
      });
    }
    res.status(200).json({
      success: true,
      experiment
    });
  } catch (error) {
    console.error('❌ Get experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching experiment',
      error: error.message
    });
  }
};

// Helper function
function extractSuggestions(text) {
  const suggestions = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.trim().match(/^[-•*]\s/)) {
      suggestions.push(line.trim().replace(/^[-•*]\s/, ''));
    }
  }
  
  return suggestions.slice(0, 5);
}

module.exports = {
  chatWithAI,
  generateExperiment,
  saveAIExperiment,
  getAIExperiment,
  canPublishExperiment,
  publishExperiment,
  buildExperiment,
  getBuildStatus,
  togglePublicAccess
};