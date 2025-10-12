/**
 * RAG Helper for Template-Based Experiment Generation
 * Retrieves and modifies existing templates instead of generating from scratch
 */

const templatesData = require('./templatesKnowledgeBase.json');

/**
 * Calculate similarity score between query and template
 * Uses keyword matching and category matching
 */
function calculateSimilarity(query, template) {
  const queryLower = query.toLowerCase();
  let score = 0;
  
  // Check template name and keywords
  const allKeywords = [
    template.name.toLowerCase(),
    template.fullName.toLowerCase(),
    ...template.keywords.map(k => k.toLowerCase()),
    ...template.measures.map(m => m.toLowerCase()),
    template.category.toLowerCase()
  ];
  
  // Keyword matching (weighted)
  allKeywords.forEach(keyword => {
    if (queryLower.includes(keyword) || keyword.includes(queryLower.split(' ')[0])) {
      score += 10;
    }
  });
  
  // Exact name match bonus
  if (queryLower.includes(template.name.toLowerCase())) {
    score += 50;
  }
  
  // Category match
  const categories = ['cognitive control', 'attention', 'memory', 'decision making', 'problem solving', 'executive function'];
  categories.forEach(cat => {
    if (queryLower.includes(cat) && template.category.toLowerCase().includes(cat)) {
      score += 20;
    }
  });
  
  // Task type keywords
  const taskKeywords = {
    'stroop': ['color', 'word', 'interference', 'conflict'],
    'flanker': ['arrows', 'letters', 'distractor', 'compatible'],
    'posner': ['cue', 'spatial', 'orienting', 'attention'],
    'bart': ['risk', 'balloon', 'gambling', 'reward'],
    'gonogo': ['inhibit', 'response', 'stop', 'impulse'],
    'nback': ['working memory', 'updating', 'sequence'],
    'simon': ['compatibility', 'location', 'spatial'],
    'digitspan': ['memory span', 'recall', 'digits', 'numbers'],
    'visualsearch': ['search', 'find', 'target', 'distractor'],
    'hanoi': ['tower', 'planning', 'puzzle', 'problem'],
    'abba': ['action', 'motor', 'planning'],
    'emotion': ['facial', 'camera', 'affect', 'emotion']
  };
  
  Object.entries(taskKeywords).forEach(([task, keywords]) => {
    if (template.id.includes(task)) {
      keywords.forEach(kw => {
        if (queryLower.includes(kw)) {
          score += 15;
        }
      });
    }
  });
  
  return score;
}

/**
 * Retrieve the most relevant templates based on query
 */
function retrieveRelevantTemplates(query, topK = 3) {
  const templatesWithScores = templatesData.map(template => ({
    ...template,
    similarityScore: calculateSimilarity(query, template)
  }));
  
  // Sort by similarity score
  templatesWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
  
  // Return top K templates
  return templatesWithScores.slice(0, topK);
}

/**
 * Extract modification instructions from user query
 */
function extractModifications(query) {
  const queryLower = query.toLowerCase();
  const modifications = [];
  
  // Trial count modifications
  const trialMatch = queryLower.match(/(\d+)\s*(trial|trials)/);
  if (trialMatch) {
    modifications.push({
      type: 'trials',
      value: parseInt(trialMatch[1]),
      description: `Change number of trials to ${trialMatch[1]}`
    });
  }
  
  // Duration modifications
  const durationMatch = queryLower.match(/(\d+)\s*(minute|minutes|min|second|seconds|sec|ms)/);
  if (durationMatch) {
    modifications.push({
      type: 'duration',
      value: durationMatch[0],
      description: `Adjust timing to ${durationMatch[0]}`
    });
  }
  
  // Color modifications
  if (queryLower.includes('color') || queryLower.includes('colour')) {
    modifications.push({
      type: 'colors',
      description: 'Modify color scheme'
    });
  }
  
  // Stimulus modifications
  if (queryLower.includes('stimulus') || queryLower.includes('stimuli')) {
    modifications.push({
      type: 'stimuli',
      description: 'Change stimuli'
    });
  }
  
  // Difficulty modifications
  if (queryLower.includes('easier') || queryLower.includes('harder') || queryLower.includes('difficult')) {
    modifications.push({
      type: 'difficulty',
      description: 'Adjust difficulty level'
    });
  }
  
  // Randomization
  if (queryLower.includes('random') || queryLower.includes('shuffle')) {
    modifications.push({
      type: 'randomization',
      description: 'Add/modify randomization'
    });
  }
  
  return modifications;
}

/**
 * Generate a RAG-enhanced prompt for the AI
 */
function generateRAGPrompt(userQuery, relevantTemplates, modifications) {
  let prompt = `You are helping a researcher create a psychological experiment. Instead of creating from scratch, you should MODIFY an existing validated template.

USER REQUEST: "${userQuery}"

RELEVANT TEMPLATE(S) FOUND:
`;

  relevantTemplates.forEach((template, index) => {
    prompt += `
${index + 1}. ${template.fullName} (${template.name})
   - Category: ${template.category}
   - Measures: ${template.measures.join(', ')}
   - Duration: ${template.duration}
   - Trials: ${template.trials}
   - Difficulty: ${template.difficulty}
   - Description: ${template.shortDescription}
   - Similarity Score: ${template.similarityScore}
`;
  });

  if (modifications.length > 0) {
    prompt += `\nDETECTED MODIFICATIONS:
`;
    modifications.forEach(mod => {
      prompt += `- ${mod.description}\n`;
    });
  }

  prompt += `
BEST MATCHING TEMPLATE CODE:
\`\`\`jsx
${relevantTemplates[0].code}
\`\`\`

INSTRUCTIONS:
1. **START WITH THE ABOVE TEMPLATE CODE** - Do not generate from scratch!
2. Make ONLY the modifications requested by the user
3. If no specific modifications mentioned, return the template AS-IS with minimal adjustments
4. Preserve the original structure, component names, and proven patterns
5. Ensure all imports and dependencies are included
6. Keep the experiment scientifically valid
7. Add helpful comments explaining any changes

**React Component Best Practices:**
1. Use React hooks (useState, useEffect, useCallback, useRef)
2. **CRITICAL: Always validate state before accessing properties**
3. **Use optional chaining (?.) for nested property access**
4. **Add null/undefined checks before using state variables**
5. Initialize all state with safe default values
6. Clean up timers/listeners in useEffect return
7. Prevent memory leaks with cleanup functions
8. Use useRef for values that don't trigger re-renders (timeouts, intervals)
9. Implement proper error boundaries
10. Handle edge cases (empty arrays, null values, loading states)

**Error-Prone Patterns to AVOID:**
❌ \`currentTrial.block\` - Can fail if currentTrial is null
✅ \`currentTrial?.block\` - Safe with optional chaining
✅ \`if (currentTrial) { currentTrial.block }\` - Explicit null check

❌ \`results[0].value\` - Can fail if results is empty
✅ \`results[0]?.value\` - Safe access
✅ \`if (results.length > 0) { results[0].value }\` - Length check first

❌ Direct state access in callbacks without checks
✅ Always validate state exists before using
`;

  return prompt;
}

/**
 * Get template by ID
 */
function getTemplateById(templateId) {
  return templatesData.find(t => t.id === templateId);
}

/**
 * Get all templates
 */
function getAllTemplates() {
  return templatesData;
}

/**
 * Search templates by keyword
 */
function searchTemplates(keyword) {
  const keywordLower = keyword.toLowerCase();
  return templatesData.filter(template => 
    template.name.toLowerCase().includes(keywordLower) ||
    template.fullName.toLowerCase().includes(keywordLower) ||
    template.keywords.some(k => k.toLowerCase().includes(keywordLower)) ||
    template.shortDescription.toLowerCase().includes(keywordLower)
  );
}

module.exports = {
  retrieveRelevantTemplates,
  extractModifications,
  generateRAGPrompt,
  getTemplateById,
  getAllTemplates,
  searchTemplates,
  calculateSimilarity
};
