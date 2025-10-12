const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { 
  retrieveRelevantTemplates, 
  extractModifications, 
  generateRAGPrompt 
} = require('../utils/ragHelper');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Save experiment to templates.json (original route)
router.post('/save', async (req, res) => {
  try {
    const { experiment } = req.body;
    
    if (!experiment || !experiment.id) {
      return res.status(400).json({
        success: false,
        error: 'Invalid experiment data'
      });
    }

    const templatesPath = path.join(__dirname, '../../frontend/public/templates.json');
    let templates = [];
    
    try {
      const data = await fs.readFile(templatesPath, 'utf8');
      templates = JSON.parse(data);
    } catch (error) {
      console.log('No existing templates file, creating new one');
    }

    const existingIndex = templates.findIndex(t => t.id === experiment.id);
    
    if (existingIndex !== -1) {
      templates[existingIndex] = experiment;
    } else {
      templates.push(experiment);
    }

    await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2));

    res.json({
      success: true,
      message: 'Experiment saved successfully',
      data: experiment
    });
  } catch (error) {
    console.error('Save experiment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save experiment'
    });
  }
});

// Get all visual builder experiments
router.get('/experiments', async (req, res) => {
  try {
    const templatesPath = path.join(__dirname, '../../frontend/public/templates.json');
    const data = await fs.readFile(templatesPath, 'utf8');
    const templates = JSON.parse(data);
    
    const visualExperiments = templates.filter(t => t.source === 'visual-builder');
    
    res.json({
      success: true,
      data: visualExperiments
    });
  } catch (error) {
    console.error('Get experiments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load experiments'
    });
  }
});

// 🎯 UPDATED: Generate AI experiment from visual flow WITH RAG
router.post('/generate-ai', async (req, res) => {
  try {
    const { description, researcherId } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    console.log('🎨 Generating AI experiment from visual flow WITH RAG...');

    // 🔥 RAG: Retrieve relevant templates from knowledge base
    const relevantTemplates = retrieveRelevantTemplates(description, 3);
    const modifications = extractModifications(description);
    
    console.log(`📚 RAG: Found ${relevantTemplates.length} relevant templates for visual builder`);
    if (relevantTemplates.length > 0) {
      console.log(`   - Best match: ${relevantTemplates[0]?.name} (score: ${relevantTemplates[0]?.similarityScore?.toFixed(2)})`);
    }
    console.log(`🔧 Detected ${modifications.length} modifications:`, modifications.map(m => m.description));

    // 🔥 Build RAG-enhanced prompt (same as AI Experiment Builder)
    const systemPrompt = generateRAGPrompt(description, relevantTemplates, modifications);

    console.log('📝 Sending RAG-enhanced prompt to Gemini...');

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const generatedCode = response.text();

    const codeMatch = generatedCode.match(/```jsx\n([\s\S]*?)\n```/);
    const componentCode = codeMatch ? codeMatch[1] : generatedCode;

    console.log('✅ AI code generated with RAG context');

    res.status(200).json({
      success: true,
      code: componentCode,
      fullResponse: generatedCode,
      metadata: {
        generatedAt: new Date().toISOString(),
        description: description,
        usedTemplate: relevantTemplates[0]?.name || null,
        templateSimilarityScore: relevantTemplates[0]?.similarityScore || 0,
        modifications: modifications,
        ragContext: {
          templatesUsed: relevantTemplates.length,
          modificationsDetected: modifications.length
        }
      }
    });

  } catch (error) {
    console.error('❌ AI Generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI experiment',
      error: error.message
    });
  }
});

// Save AI-generated experiment directly to templates.json
router.post('/save-ai', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      componentCode, 
      researcherId,
      estimatedDuration,
      metadata 
    } = req.body;

    if (!title || !componentCode) {
      return res.status(400).json({
        success: false,
        message: 'Title and component code are required'
      });
    }

    console.log('💾 Saving AI-generated visual builder experiment to templates.json...');

    // Generate template ID from title
    const templateId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    // Generate component name
    let componentName = title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '');
    
    if (/^\d/.test(componentName)) {
      componentName = 'Custom' + componentName;
    }
    componentName = componentName + 'Template';

    // Prepare the component code with proper export
    let finalComponentCode = componentCode;
    
    if (!componentCode.includes('export const') && !componentCode.includes('export default')) {
      const componentMatch = componentCode.match(/const\s+(\w+)\s*=\s*\(/);
      const existingComponentName = componentMatch ? componentMatch[1] : componentName;
      
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(existingComponentName)) {
        finalComponentCode = componentCode.replace(
          new RegExp(`const\\s+${existingComponentName}\\s*=`),
          `export const ${componentName} =`
        );
      }
    }

    // Add imports if not present
    if (!finalComponentCode.includes('import')) {
      const imports = `import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

`;
      finalComponentCode = imports + finalComponentCode;
    }

    // Save component file
    const templatesDir = path.join(__dirname, '../../frontend/src/components/experiment/templates');
    const templateFilePath = path.join(templatesDir, `${componentName}.jsx`);
    
    try {
      await fs.writeFile(templateFilePath, finalComponentCode, 'utf-8');
      console.log(`✅ Component file created: ${componentName}.jsx`);
    } catch (fileError) {
      console.error('❌ Error writing component file:', fileError);
    }

    // Update templates.json
    const templatesJsonPath = path.join(__dirname, '../../frontend/public/templates.json');
    let templates = [];
    
    try {
      const templatesData = await fs.readFile(templatesJsonPath, 'utf-8');
      templates = JSON.parse(templatesData);
    } catch (error) {
      console.log('Creating new templates.json file');
      templates = [];
    }

    // Check if template already exists
    const existingIndex = templates.findIndex(t => t.id === templateId);
    
    const newTemplate = {
      id: templateId,
      name: title,
      fullName: title,
      shortDescription: description || `Visual builder experiment: ${title}`,
      detailedDescription: description || `This experiment was created using the Visual Flow Builder with AI-powered code generation. ${title}`,
      duration: `~${estimatedDuration || 15} minutes`,
      trials: metadata?.nodeCount ? `${metadata.nodeCount * (metadata.repetitions || 1)} trials` : "Variable",
      difficulty: "Custom",
      category: "Visual Builder",
      measures: ["Custom measures"],
      icon: "Sparkles",
      color: "from-purple-500 to-pink-500",
      requiresCamera: false,
      keywords: [templateId, "visual-builder", "ai-generated", "custom"],
      researchAreas: ["Custom Research"],
      publications: [],
      source: "visual-builder-ai",
      visualFlow: metadata?.visualFlow || null,
      ragMetadata: metadata?.ragContext || null, // 🔥 Store RAG context
      createdAt: new Date().toISOString()
    };
    
    if (existingIndex !== -1) {
      templates[existingIndex] = {
        ...newTemplate,
        createdAt: templates[existingIndex].createdAt || newTemplate.createdAt
      };
      console.log(`✅ Updated template in templates.json: ${templateId}`);
    } else {
      templates.push(newTemplate);
      console.log(`✅ Added new template to templates.json: ${templateId}`);
    }
    
    await fs.writeFile(templatesJsonPath, JSON.stringify(templates, null, 2), 'utf-8');
    console.log('✅ templates.json updated successfully');

    res.status(201).json({
      success: true,
      message: 'Visual builder experiment saved with RAG context',
      templateInfo: {
        templateId,
        componentName,
        filePath: `src/components/experiment/templates/${componentName}.jsx`,
        ragContext: metadata?.ragContext || null
      },
      experiment: {
        _id: templateId,
        title,
        description
      }
    });

  } catch (error) {
    console.error('❌ Save error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving experiment to templates.json',
      error: error.message
    });
  }
});

module.exports = router;