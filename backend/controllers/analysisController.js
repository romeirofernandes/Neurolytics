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
  const basePrompt = `You are a psychology research expert. Analyze the following experimental data and provide detailed insights in well-formatted HTML.

Use the following structure:
- Use <h2> for main sections
- Use <h3> for subsections
- Use <p> for paragraphs
- Use <ul> and <li> for lists
- Use <strong> for emphasis
- Use <table> for statistical summaries
- Include clear interpretations and clinical/research relevance

Make the analysis professional, comprehensive, and actionable.`;

  switch (templateId) {
    case 'bart':
      return `${basePrompt}

This is data from a Balloon Analogue Risk Task (BART) experiment. The BART measures risk-taking behavior through a balloon-pumping paradigm.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Overall BART Performance</h2>
- Calculate and report the BART score (average pumps on non-exploded balloons)
- Total trials completed and completion rate
- Total earnings and efficiency metrics

<h2>2. Risk-Taking Pattern Analysis</h2>
- Break down performance by balloon color (blue, yellow, orange)
- Identify risk-taking strategies
- Compare adjusted vs unadjusted pumps

<h2>3. Statistical Summary</h2>
Create a table showing:
- Mean pumps per color
- Explosion rate per color
- Average earnings per trial
- Standard deviations

<h2>4. Clinical Interpretation</h2>
- Compare to normative data (typical BART scores range from 30-45)
- Assess risk propensity (conservative, moderate, or high risk-taker)
- Discuss implications for real-world decision-making

<h2>5. Recommendations</h2>
- Suggestions for improving decision-making
- Pattern observations
- Any notable behavioral tendencies`;

    case 'stroop':
      return `${basePrompt}

This is data from a Stroop Task experiment measuring selective attention and cognitive control.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Reaction Time Analysis</h2>
- Average RT for compatible trials
- Average RT for incompatible trials
- Calculate the Stroop effect (incompatible RT - compatible RT)

<h2>2. Accuracy Analysis</h2>
- Overall accuracy rate
- Accuracy for compatible vs incompatible trials
- Error patterns and types

<h2>3. Statistical Summary</h2>
Create a table comparing:
- Compatible vs incompatible trial performance
- Training vs main task performance
- RT distributions

<h2>4. Cognitive Interpretation</h2>
- Assess attentional control (typical Stroop effect is 50-100ms)
- Evaluate processing speed
- Discuss automaticity vs controlled processing

<h2>5. Clinical Relevance</h2>
- Compare to typical adult performance
- Implications for executive function
- Suggestions for cognitive training`;

    case 'posner':
      return `${basePrompt}

This is data from a Posner Cueing Task measuring spatial attention and orienting mechanisms.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Cueing Effect Analysis</h2>
- Average RT for valid cues
- Average RT for invalid cues
- Calculate cueing benefit (valid RT benefit)
- Calculate cueing cost (invalid RT cost)

<h2>2. Accuracy and Performance</h2>
- Overall accuracy rate
- Accuracy for valid vs invalid trials
- Spatial biases (left vs right)

<h2>3. Statistical Summary</h2>
Create a table showing:
- Valid vs invalid cue performance
- Cueing effect magnitude
- Lateralization effects

<h2>4. Attentional Interpretation</h2>
- Assess attentional orienting efficiency (typical cueing effect: 20-40ms)
- Evaluate spatial attention distribution
- Discuss endogenous vs exogenous attention

<h2>5. Research Implications</h2>
- Compare to established norms
- Relevance for attention disorders
- Practical applications`;

    case 'abba':
      return `${basePrompt}

This is data from an ABBA Task measuring action planning and response compatibility effects.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Response Compatibility Analysis</h2>
- Average RT for compatible trials (same response planned and executed)
- Average RT for incompatible trials (different responses)
- Calculate reversed-compatibility effect

<h2>2. Action Planning Efficiency</h2>
- Response A execution accuracy
- Response B reaction times
- Planning vs execution dissociation

<h2>3. Statistical Summary</h2>
Create a table comparing:
- Compatible vs incompatible performance
- Single vs double response trials
- Planning accuracy

<h2>4. Cognitive Control Interpretation</h2>
- Assess motor planning ability
- Evaluate cognitive flexibility
- Discuss the reversed-compatibility phenomenon

<h2>5. Implications</h2>
- Compare to typical ABBA effects
- Relevance for motor control research
- Applications in skill learning`;

    case 'hanoi':
      return `${basePrompt}

This is data from a Tower of Hanoi puzzle measuring planning and problem-solving abilities.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Performance Metrics</h2>
- Total moves to solution
- Comparison to optimal solution (7 moves)
- Total time to completion
- Efficiency ratio (optimal/actual moves)

<h2>2. Error Analysis</h2>
- Number of rule violations (larger on smaller disc)
- Invalid move attempts
- Error patterns over time

<h2>3. Problem-Solving Strategy</h2>
- Identify solution approach (trial-and-error vs systematic)
- Planning depth assessment
- Strategy efficiency

<h2>4. Cognitive Interpretation</h2>
- Assess planning ability (excellent: 7-9 moves, good: 10-15, needs improvement: >15)
- Working memory demands
- Executive function evaluation

<h2>5. Recommendations</h2>
- Suggestions for improving problem-solving
- Strategy optimization tips
- Training implications
- Comparison to age norms`;

    default:
      return `${basePrompt}\n\nData: ${JSON.stringify(results, null, 2)}\n\nProvide a comprehensive analysis of this experimental data.`;
  }
}

module.exports = { analyzeExperiment };