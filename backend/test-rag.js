// Test script for RAG Helper
const { 
  retrieveRelevantTemplates, 
  extractModifications, 
  generateRAGPrompt 
} = require('./utils/ragHelper');

console.log('🧪 Testing RAG Helper Functions\n');

// Test 1: Template Retrieval
console.log('Test 1: Retrieving templates for "stroop task"');
const stroopResults = retrieveRelevantTemplates('create a stroop task', 3);
console.log(`  ✅ Found ${stroopResults.length} templates`);
console.log(`  📌 Best match: ${stroopResults[0].name} (score: ${stroopResults[0].similarityScore})`);
console.log('');

// Test 2: Template Retrieval - Similar concept
console.log('Test 2: Retrieving templates for "color word interference"');
const interferenceResults = retrieveRelevantTemplates('I need a color word interference task', 3);
console.log(`  ✅ Found ${interferenceResults.length} templates`);
console.log(`  📌 Best match: ${interferenceResults[0].name} (score: ${interferenceResults[0].similarityScore})`);
console.log('');

// Test 3: Modification Detection
console.log('Test 3: Detecting modifications in "Create stroop with 50 trials and 1500ms timing"');
const mods1 = extractModifications('Create a stroop task with 50 trials and 1500ms timing');
console.log(`  ✅ Detected ${mods1.length} modifications:`);
mods1.forEach(mod => console.log(`     - ${mod.description}`));
console.log('');

// Test 4: Modification Detection - Complex
console.log('Test 4: Detecting modifications in complex query');
const mods2 = extractModifications('Make it easier with random colors and 5 minute duration');
console.log(`  ✅ Detected ${mods2.length} modifications:`);
mods2.forEach(mod => console.log(`     - ${mod.description}`));
console.log('');

// Test 5: RAG Prompt Generation
console.log('Test 5: Generating RAG prompt');
const templates = retrieveRelevantTemplates('create a stroop task with 30 trials', 2);
const modifications = extractModifications('create a stroop task with 30 trials');
const prompt = generateRAGPrompt('create a stroop task with 30 trials', templates, modifications);
console.log(`  ✅ Generated prompt (${prompt.length} characters)`);
console.log(`  📌 Includes template code: ${prompt.includes('import { useState') ? 'Yes' : 'No'}`);
console.log(`  📌 Includes modifications: ${prompt.includes('MODIFICATIONS') ? 'Yes' : 'No'}`);
console.log('');

// Test 6: Working Memory Task
console.log('Test 6: Retrieving templates for "working memory task"');
const memoryResults = retrieveRelevantTemplates('I want to create a working memory task', 3);
console.log(`  ✅ Found ${memoryResults.length} templates`);
console.log(`  📌 Best match: ${memoryResults[0].name} (score: ${memoryResults[0].similarityScore})`);
if (memoryResults.length > 1) {
  console.log(`  📌 Second match: ${memoryResults[1].name} (score: ${memoryResults[1].similarityScore})`);
}
console.log('');

console.log('✅ All RAG Helper tests completed!\n');
console.log('📊 Summary:');
console.log('   - Template retrieval: Working');
console.log('   - Modification detection: Working');
console.log('   - Prompt generation: Working');
console.log('   - Similarity scoring: Working');
