const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeExperiment = async (req, res) => {
  try {
    const { templateId, results } = req.body;

    console.log(`📊 Analyzing ${templateId} experiment with ${results?.length || 0} trials`);

    if (!templateId || !results) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: templateId and results'
      });
    }

    let prompt = generatePromptForTemplate(templateId, results);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    console.log('✅ Analysis completed successfully');

    res.status(200).json({
      success: true,
      analysis: analysis,
      dataPoints: results.length
    });
  } catch (error) {
    console.error('❌ Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing experiment results',
      error: error.message
    });
  }
};

function generatePromptForTemplate(templateId, results) {
  const basePrompt = `You are a psychology research expert. Analyze the following experimental data and provide detailed insights in well-formatted MARKDOWN.

Use the following MARKDOWN formatting:
- Use ## for main section headings (h2)
- Use ### for subsection headings (h3)
- Use **bold** for emphasis
- Use tables for statistical summaries (use | for columns)
- Use bullet points (- or *) for lists
- Use > for important callouts/quotes
- Use \`code\` for numerical values and metrics

Make the analysis:
- Professional and comprehensive
- Easy to understand for researchers and participants
- Include clear interpretations
- Provide actionable insights
- Use proper scientific terminology
- Include statistical summaries in table format

IMPORTANT: Return ONLY markdown text. Do NOT use HTML tags.`;

  switch (templateId) {
    case 'bart':
      return `${basePrompt}

This is data from a Balloon Analogue Risk Task (BART) experiment. The BART measures risk-taking behavior through a balloon-pumping paradigm.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

## 1. Overall BART Performance
- Calculate and report the BART score (average pumps on non-exploded balloons)
- Total trials completed and completion rate
- Total earnings and efficiency metrics

## 2. Risk-Taking Pattern Analysis
- Break down performance by balloon color (blue, yellow, orange)
- Identify risk-taking strategies
- Compare adjusted vs unadjusted pumps

## 3. Statistical Summary
Create a table showing:
- Mean pumps per color
- Explosion rate per color
- Average earnings per trial
- Standard deviations

## 4. Clinical Interpretation
- Compare to normative data (typical BART scores range from 30-45)
- Assess risk propensity (conservative, moderate, or high risk-taker)
- Discuss implications for real-world decision-making

## 5. Recommendations
- Suggestions for improving decision-making
- Pattern observations
- Any notable behavioral tendencies`;

    case 'stroop':
      return `${basePrompt}

This is data from a Stroop Task experiment measuring selective attention and cognitive control.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

## 1. Reaction Time Analysis
- Average RT for compatible trials
- Average RT for incompatible trials
- Calculate the Stroop effect (incompatible RT - compatible RT)

## 2. Accuracy Analysis
- Overall accuracy rate
- Accuracy for compatible vs incompatible trials
- Error patterns and types

## 3. Statistical Summary
Create a table comparing:
- Compatible vs incompatible trial performance
- Training vs main task performance
- RT distributions

## 4. Cognitive Interpretation
- Assess attentional control (typical Stroop effect is 50-100ms)
- Evaluate processing speed
- Discuss automaticity vs controlled processing

## 5. Clinical Relevance
- Compare to typical adult performance
- Implications for executive function
- Suggestions for cognitive training`;

    case 'posner':
      return `${basePrompt}

This is data from a Posner Cueing Task measuring spatial attention and orienting mechanisms.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

## 1. Cueing Effect Analysis
- Average RT for valid cues
- Average RT for invalid cues
- Calculate cueing benefit (valid RT benefit)
- Calculate cueing cost (invalid RT cost)

## 2. Accuracy and Performance
- Overall accuracy rate
- Accuracy for valid vs invalid trials
- Spatial biases (left vs right)

## 3. Statistical Summary
Create a table showing:
- Valid vs invalid cue performance
- Cueing effect magnitude
- Lateralization effects

## 4. Attentional Interpretation
- Assess attentional orienting efficiency (typical cueing effect: 20-40ms)
- Evaluate spatial attention distribution
- Discuss endogenous vs exogenous attention

## 5. Research Implications
- Compare to established norms
- Relevance for attention disorders
- Practical applications`;

    case 'abba':
      return `${basePrompt}

This is data from an ABBA Task measuring action planning and response compatibility effects.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

## 1. Response Compatibility Analysis
- Average RT for compatible trials (same response planned and executed)
- Average RT for incompatible trials (different responses)
- Calculate reversed-compatibility effect

## 2. Action Planning Efficiency
- Response A execution accuracy
- Response B reaction times
- Planning vs execution dissociation

## 3. Statistical Summary
Create a table comparing:
- Compatible vs incompatible performance
- Single vs double response trials
- Planning accuracy

## 4. Cognitive Control Interpretation
- Assess motor planning ability
- Evaluate cognitive flexibility
- Discuss the reversed-compatibility phenomenon

## 5. Implications
- Compare to typical ABBA effects
- Relevance for motor control research
- Applications in skill learning`;

    case 'hanoi':
      return `${basePrompt}

This is data from a Tower of Hanoi puzzle measuring planning and problem-solving abilities.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

## 1. Performance Metrics
- Total moves to solution
- Comparison to optimal solution (7 moves)
- Total time to completion
- Efficiency ratio (optimal/actual moves)

## 2. Error Analysis
- Number of rule violations (larger on smaller disc)
- Invalid move attempts
- Error patterns over time

## 3. Problem-Solving Strategy
- Identify solution approach (trial-and-error vs systematic)
- Planning depth assessment
- Strategy efficiency

## 4. Cognitive Interpretation
- Assess planning ability (excellent: 7-9 moves, good: 10-15, needs improvement: >15)
- Working memory demands
- Executive function evaluation

## 5. Recommendations
- Suggestions for improving problem-solving
- Strategy optimization tips
- Training implications
- Comparison to age norms`;

    default:
      return `${basePrompt}\n\nData: ${JSON.stringify(results, null, 2)}\n\nProvide a comprehensive analysis of this experimental data.`;
  }
}

module.exports = { analyzeExperiment };