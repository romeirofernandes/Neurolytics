const { GoogleGenerativeAI } = require("@google/generative-ai");
const Experiment = require('../models/Experiment');
const ConsentForm = require('../models/ConsentForm');
const { get } = require("mongoose");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    // Build context-aware prompt
    const systemPrompt = `You are an expert AI assistant for building psychological experiments. You help researchers create, modify, and refine experimental templates.

CAPABILITIES:
- Create new experiment templates from scratch
- Modify existing templates (trials, stimuli, timing, conditions)
- Suggest best practices for experimental design
- Help with randomization, counterbalancing, and trial structure
- Provide JSX/React code for experiment components
- Validate experimental paradigms

EXPERIMENT STRUCTURE:
Each experiment has:
- Basic info (title, description, duration)
- Trials array with phases (fixation, stimulus, response, feedback)
- Stimuli configuration (colors, words, images, sounds)
- Response options (keyboard keys, buttons, clicks)
- Randomization settings
- Data collection points

RESPONSE FORMAT:
Always respond with:
1. Conversational explanation
2. Code snippet if modifications are needed
3. Suggestions for improvement
4. Questions to clarify requirements

CURRENT CONTEXT:
${currentExperiment ? `Working on experiment: ${currentExperiment.title}\nCurrent config: ${JSON.stringify(currentExperiment.config, null, 2)}` : 'No experiment loaded - ready to create new one'}

Conversation so far:
${conversationHistory ? conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n') : 'New conversation'}

Researcher's message: ${message}

Provide helpful, technical, and actionable guidance. Use markdown for formatting. Include code blocks with \`\`\`jsx for React components.`;

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
      suggestions: extractSuggestions(aiMessage)
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

    const experiment = new Experiment({
      title,
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

    console.log(`✅ AI experiment saved: ${experiment._id}`);

    res.status(201).json({
      success: true,
      experiment,
      message: 'AI-generated experiment saved successfully'
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
  publishExperiment
};