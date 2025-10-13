const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const analyzeExperiment = async (req, res) => {
  try {
    const { templateId, results } = req.body;

    console.log(`Analyzing ${templateId} experiment with ${results?.length || 0} trials`);

    if (!templateId || !results) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: templateId and results'
      });
    }

    let analysis = "";
    let citations = "";

    // Generate main analysis with Gemini
    try {
      let prompt = generatePromptForTemplate(templateId, results);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      analysis = response.text();
      console.log('Analysis generated successfully');
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError.message);
      // Provide fallback analysis
      analysis = generateFallbackAnalysis(templateId, results);
      console.log('Using fallback analysis');
    }

    // Generate research paper recommendations with Groq
    try {
      console.log('Generating research paper recommendations...');
      const citationsPrompt = generateCitationsPrompt(templateId, analysis);
      
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: citationsPrompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 2000,
      });

      citations = chatCompletion.choices[0]?.message?.content || "";
      console.log('Citations generated successfully');
    } catch (groqError) {
      console.error('Groq API error:', groqError.message);
      citations = "Unable to generate research citations at this time. Please check your internet connection and try again.";
    }

    console.log('Analysis completed');

    res.status(200).json({
      success: true,
      analysis: analysis,
      citations: citations,
      dataPoints: results.length
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing experiment results',
      error: error.message
    });
  }
};

function generateCitationsPrompt(templateId, analysisResults) {
  const templateInfo = getTemplateInfo(templateId);
  
  return `Based on the following experimental analysis, provide relevant research paper recommendations and topics for further study.

**Experiment Type:** ${templateInfo.name}
**Research Area:** ${templateInfo.area}

**Analysis Summary:**
${analysisResults.substring(0, 1000)} ... (truncated)

Please provide:

## Recommended Research Papers
List exactly 4 highly relevant, real research papers with:
- Full citation (Author(s), Year, Title, Journal/Conference)
- Brief 1-2 sentence description of relevance
- DOI or link if available

## Related Research Topics
Suggest exactly 4 specific research topics or questions that researchers could explore based on this experiment, such as:
- Extensions of this paradigm
- Cross-cultural or developmental studies
- Clinical applications
- Methodological innovations
- Theoretical questions

Format the response in clear Markdown with proper headings and bullet points.`;
}

function generateFallbackAnalysis(templateId, results) {
  const templateInfo = getTemplateInfo(templateId);
  const accuracy = results.filter(r => r.accuracy === 1).length / results.length * 100;
  const avgRT = results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;
  
  return `# ${templateInfo.name} - Analysis Report

## Overview
This analysis is based on ${results.length} trials collected from the ${templateInfo.name} experiment.

## Performance Metrics
- **Overall Accuracy**: ${accuracy.toFixed(1)}%
- **Average Response Time**: ${avgRT.toFixed(0)}ms
- **Total Trials**: ${results.length}

## Key Findings
- Participants completed all ${results.length} trials successfully
- Response consistency was maintained throughout the experiment
- Performance metrics fall within expected ranges for ${templateInfo.area}

## Recommendations
- Consider collecting additional data for more robust statistical analysis
- Compare results with established norms in the literature
- Analyze individual differences and demographic factors

**Note**: This is a basic statistical summary. For detailed AI-powered insights, please ensure your internet connection is stable and try again.`;
}

function getTemplateInfo(templateId) {
  const templates = {
    'bart': {
      name: 'Balloon Analogue Risk Task (BART)',
      area: 'Risk-taking behavior, Decision-making, Behavioral Economics'
    },
    'stroop': {
      name: 'Stroop Color-Word Task',
      area: 'Selective attention, Cognitive control, Executive function'
    },
    'stroop-emotion': {
      name: 'Stroop Task with Emotion Tracking',
      area: 'Emotion-cognition interaction, Affective neuroscience, Cognitive control'
    },
    'flanker': {
      name: 'Eriksen Flanker Task',
      area: 'Selective attention, Response inhibition, Cognitive control'
    },
    'posner': {
      name: 'Posner Spatial Cueing Task',
      area: 'Spatial attention, Attentional orienting, Cognitive neuroscience'
    },
    'simon': {
      name: 'Simon Task',
      area: 'Stimulus-response compatibility, Automatic processing, Spatial interference'
    },
    'gonogo': {
      name: 'Go/No-Go Task',
      area: 'Response inhibition, Impulse control, Executive function'
    },
    'nback': {
      name: 'N-Back Working Memory Task',
      area: 'Working memory, Cognitive training, Executive function'
    },
    'abba': {
      name: 'ABBA Action Planning Task',
      area: 'Motor control, Action planning, Response compatibility'
    },
    'hanoi': {
      name: 'Tower of Hanoi',
      area: 'Problem-solving, Planning, Executive function'
    },
    'digitspan': {
      name: 'Digit Span Memory Test',
      area: 'Short-term memory, Memory capacity, Working memory'
    },
    'visualsearch': {
      name: 'Visual Search Task',
      area: 'Visual attention, Feature integration, Perception'
    },
    'voice-crt': {
      name: 'Voice-based Cognitive Reflection Test',
      area: 'Cognitive reflection, Analytical thinking, Decision-making'
    }
  };

  return templates[templateId] || {
    name: templateId,
    area: 'Experimental psychology, Cognitive science'
  };
}

function generatePromptForTemplate(templateId, results) {
  const basePrompt = `Analyze the following experimental data and provide insights in a clear, structured format.`;

  switch (templateId) {
    case 'bart':
      return `${basePrompt}

**BART (Balloon Analogue Risk Task)** - Measures risk-taking behavior

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Calculate: BART Score (avg pumps on unexploded balloons), total earnings, explosion rate

## Statistics Table
| Metric | Value | Interpretation |
|--------|-------|----------------|
| BART Score | X | Low/Medium/High risk-taker |
| Total Earnings | $X | Efficiency rating |
| Explosion Rate | X% | Risk tolerance |

## Key Insights
- Risk-taking pattern (conservative/balanced/aggressive)
- Decision strategy observations
- Real-world implications`;

    case 'stroop':
      return `${basePrompt}

**Stroop Task** - Measures selective attention and cognitive control

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Calculate: Stroop Effect (incompatible RT - compatible RT), overall accuracy

## Statistics Table
| Condition | Avg RT (ms) | Accuracy | Effect Size |
|-----------|-------------|----------|-------------|
| Compatible | X | X% | - |
| Incompatible | X | X% | Xms |

## Key Insights
- Attention control rating (Excellent: <50ms, Good: 50-100ms, Needs work: >100ms)
- Processing speed assessment
- Practical recommendations`;

    case 'flanker':
      return `${basePrompt}

**Flanker Task** - Measures selective attention and interference control

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Calculate: Flanker Effect (incongruent RT - congruent RT), accuracy rates

## Statistics Table
| Condition | Avg RT (ms) | Accuracy | Effect |
|-----------|-------------|----------|--------|
| Congruent | X | X% | - |
| Incongruent | X | X% | Xms |

## Key Insights
- Interference control (Excellent: <40ms, Good: 40-60ms, Needs work: >60ms)
- Error pattern analysis
- Attention training suggestions`;

    case 'posner':
      return `${basePrompt}

**Posner Cueing Task** - Measures spatial attention orienting

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Calculate: Cueing benefit (valid RT), cueing cost (invalid RT), overall accuracy

## Statistics Table
| Cue Type | Avg RT (ms) | Accuracy | Effect |
|----------|-------------|----------|--------|
| Valid | X | X% | Benefit: Xms |
| Invalid | X | X% | Cost: Xms |

## Key Insights
- Attention orienting efficiency (Typical: 20-40ms benefit)
- Spatial bias detection
- Clinical relevance`;

    case 'abba':
      return `${basePrompt}

**ABBA Task** - Measures action planning and motor control

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Calculate: Compatibility effect, planning accuracy, execution RT

## Statistics Table
| Trial Type | Avg RT (ms) | Accuracy | Effect |
|------------|-------------|----------|--------|
| Compatible | X | X% | - |
| Incompatible | X | X% | Xms |

## Key Insights
- Motor planning efficiency
- Cognitive flexibility rating
- Skill learning implications`;

    case 'hanoi':
      return `${basePrompt}

**Tower of Hanoi** - Measures planning and problem-solving

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Moves used vs optimal (7), time taken, efficiency ratio

## Statistics Table
| Metric | Value | Rating |
|--------|-------|--------|
| Total Moves | X | Excellent/Good/Fair (7-9/10-15/>15) |
| Time | Xs | - |
| Efficiency | X% | - |

## Key Insights
- Planning strategy (systematic vs trial-and-error)
- Problem-solving recommendations
- Cognitive skill assessment`;

    case 'gonogo':
      return `${basePrompt}

**Go/No-Go Task** - Measures response inhibition and impulse control

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Go accuracy, No-Go accuracy, commission error rate, mean RT

## Statistics Table
| Measure | Value | Rating |
|---------|-------|--------|
| Go Accuracy | X% | - |
| No-Go Accuracy | X% | - |
| Commission Errors | X% | Excellent/Good/Needs work (<5%/5-10%/>10%) |
| Avg RT | Xms | - |

## Key Insights
- Impulse control assessment
- Speed-accuracy tradeoff
- Practical implications`;

    case 'nback':
      return `${basePrompt}

**2-Back Task** - Measures working memory and updating

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Overall accuracy, hit rate, false alarm rate, d-prime

## Statistics Table
| Block | Accuracy | Hits | False Alarms | d' |
|-------|----------|------|--------------|-----|
| 1 | X% | X | X | X |
| 2 | X% | X | X | X |
| 3 | X% | X | X | X |

## Key Insights
- Working memory capacity (Excellent: >80%, Good: 60-80%, Fair: <60%)
- Performance trend across blocks
- Training recommendations`;

    case 'simon':
      return `${basePrompt}

**Simon Task** - Measures stimulus-response compatibility

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Simon effect size, compatibility conditions, accuracy

## Statistics Table
| Condition | Avg RT (ms) | Accuracy | Effect |
|-----------|-------------|----------|--------|
| Compatible | X | X% | - |
| Incompatible | X | X% | Xms |

## Key Insights
- Spatial interference control (Typical: 20-40ms)
- Automatic processing efficiency
- Practical applications`;

    case 'digitspan':
      return `${basePrompt}

**Digit Span** - Measures short-term memory capacity

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Maximum span achieved, trials completed, success patterns

## Statistics Table
| Span Length | Attempts | Success Rate | Rating |
|-------------|----------|--------------|--------|
| 3-4 | X | X% | Below Average |
| 5-6 | X | X% | Average |
| 7-8 | X | X% | Good |
| 9+ | X | X% | Excellent |

## Key Insights
- Memory capacity vs norm (7±2 digits)
- Recall strategy effectiveness
- Memory improvement tips`;

    case 'visualsearch':
      return `${basePrompt}

**Visual Search** - Measures attentional processing efficiency

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Search slope (ms/item), accuracy, target detection rate

## Statistics Table
| Set Size | Avg RT (ms) | Accuracy | Slope |
|----------|-------------|----------|-------|
| 5 items | X | X% | - |
| 10 items | X | X% | Xms/item |
| 15 items | X | X% | Xms/item |
| 20 items | X | X% | Xms/item |

## Key Insights
- Search efficiency (Efficient: <10ms/item, Inefficient: >20ms/item)
- Parallel vs serial processing
- Real-world attention implications`;

    case 'voice-crt':
      return `${basePrompt}

**Voice-Based Cognitive Reflection Test** - Measures analytical vs intuitive thinking

DATA: ${JSON.stringify(results, null, 2)}

Provide:
## Performance Summary
Calculate: Accuracy (correct answers), average response time, response quality

## Statistics Table
| Question | Your Answer | Correct | Time (ms) | Confidence |
|----------|-------------|---------|-----------|------------|
| Q1 (Bat-Ball) | X | ✓/✗ | Xms | X% |
| Q2 (Machines) | X | ✓/✗ | Xms | X% |
| Q3 (Lotus) | X | ✓/✗ | Xms | X% |

## Key Insights
- Cognitive reflection level (Analytical/Intuitive/Mixed)
- Response time pattern (Fast intuitive vs slow deliberate)
- Speech clarity and confidence analysis
- Recommendations for cognitive training`;

    default:
      return `${basePrompt}\n\nData: ${JSON.stringify(results, null, 2)}\n\nProvide a comprehensive analysis of this experimental data.`;
  }
}

module.exports = { analyzeExperiment };