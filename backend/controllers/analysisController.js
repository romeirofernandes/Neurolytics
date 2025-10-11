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

    case 'flanker':
      return `${basePrompt}

This is data from an Eriksen Flanker Task measuring selective attention and cognitive control.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Reaction Time Analysis</h2>
- Average RT for congruent trials (flankers match target)
- Average RT for incongruent trials (flankers mismatch target)
- Calculate the Flanker effect (incongruent RT - congruent RT)

<h2>2. Accuracy Analysis</h2>
- Overall accuracy rate
- Accuracy for congruent vs incongruent trials
- Error patterns and response mapping

<h2>3. Statistical Summary</h2>
Create a table comparing:
- Congruent vs incongruent trial performance
- Training vs main task performance
- Response-specific errors (A vs L key)

<h2>4. Cognitive Interpretation</h2>
- Assess selective attention capacity (typical Flanker effect: 30-60ms)
- Evaluate interference suppression ability
- Discuss cognitive control efficiency

<h2>5. Clinical Relevance</h2>
- Compare to normative data
- Implications for ADHD or executive dysfunction
- Suggestions for attention training`;

    case 'gonogo':
      return `${basePrompt}

This is data from a Go/No-Go Task measuring response inhibition and impulse control.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Performance Metrics</h2>
- Go trial accuracy and mean RT
- No-Go trial accuracy (correct withholds)
- Commission errors (false alarms on No-Go)
- Omission errors (misses on Go trials)

<h2>2. Inhibitory Control Analysis</h2>
- Commission error rate (typical: <10%)
- RT variability on Go trials
- Speed-accuracy tradeoff patterns

<h2>3. Statistical Summary</h2>
Create a table showing:
- Go vs No-Go performance
- Error types and frequencies
- RT distribution and variability

<h2>4. Clinical Interpretation</h2>
- Assess impulse control (excellent: <5% errors, good: 5-10%, needs work: >10%)
- Compare to ADHD and control populations
- Evaluate sustained attention

<h2>5. Implications and Recommendations</h2>
- Suggestions for improving inhibitory control
- Relevance for real-world impulsivity
- Training recommendations`;

    case 'nback':
      return `${basePrompt}

This is data from a 2-Back Working Memory Task.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Performance Metrics</h2>
- Overall accuracy across all blocks
- Hit rate (correctly identified matches)
- False alarm rate (incorrectly identified non-matches)
- Calculate d-prime sensitivity index

<h2>2. Block-by-Block Analysis</h2>
- Performance across 3 blocks (learning/fatigue effects)
- Consistency of performance
- Best vs worst block comparison

<h2>3. Response Pattern Analysis</h2>
Create a table showing:
- Hits, Misses, False Alarms, Correct Rejections per block
- Response times for each category
- Accuracy trends over time

<h2>4. Working Memory Interpretation</h2>
- Assess WM capacity (excellent: >80% accuracy, good: 60-80%, needs work: <60%)
- Evaluate updating efficiency
- Compare to normative 2-back data

<h2>5. Cognitive Training Implications</h2>
- Suggestions for WM improvement
- Pattern of errors (conservative vs liberal responding)
- Relevance for academic/occupational performance`;

    case 'simon':
      return `${basePrompt}

This is data from a Simon Task measuring stimulus-response compatibility effects.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Compatibility Effect Analysis</h2>
- Average RT for compatible trials (word position matches word meaning)
- Average RT for incompatible trials (word position mismatches meaning)
- Calculate the Simon effect (incompatible RT - compatible RT)

<h2>2. Accuracy Analysis</h2>
- Overall accuracy rate
- Accuracy for compatible vs incompatible trials
- Spatial bias (left vs right errors)

<h2>3. Statistical Summary</h2>
Create a table comparing:
- Compatible vs incompatible performance
- Training vs main task differences
- Left vs right stimulus/response patterns

<h2>4. Cognitive Interpretation</h2>
- Assess automatic spatial processing (typical Simon effect: 20-40ms)
- Evaluate spatial attention control
- Discuss stimulus-response compatibility mechanisms

<h2>5. Research and Clinical Relevance</h2>
- Compare to established norms
- Implications for aging and neurological conditions
- Practical applications in interface design`;

    case 'digitspan':
      return `${basePrompt}

This is data from a Digit Span Task measuring short-term memory capacity.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Memory Span Results</h2>
- Maximum digit span achieved
- Number of trials completed
- Progression through span lengths
- Final vs best performance

<h2>2. Performance Pattern Analysis</h2>
- Success rate at each span length
- Learning effects across trials
- Consistency of recall

<h2>3. Detailed Breakdown</h2>
Create a table showing:
- Span length attempted
- Trials at each length
- Success rate per length
- Common error patterns

<h2>4. Cognitive Interpretation</h2>
- Assess memory capacity (excellent: 8-9 digits, good: 7 digits, average: 5-6, below average: <5)
- Compare to Miller's "magical number 7±2"
- Evaluate sequential processing ability

<h2>5. Clinical and Practical Implications</h2>
- Compare to age-appropriate norms
- Relevance for learning and cognitive function
- Strategies for memory improvement
- Implications for daily functioning`;

    case 'visualsearch':
      return `${basePrompt}

This is data from a Visual Search Task measuring attentional processing.

Data: ${JSON.stringify(results, null, 2)}

Please provide a comprehensive analysis including:

<h2>1. Search Efficiency Analysis</h2>
- Average RT by set size (5, 10, 15, 20 items)
- Calculate search slope (ms per item)
- Target present vs absent RT comparison

<h2>2. Accuracy Analysis</h2>
- Overall detection accuracy
- False alarm rate (responding when target absent)
- Miss rate (not responding when target present)
- Performance by set size

<h2>3. Statistical Summary</h2>
Create a table showing:
- RT and accuracy for each set size
- Search slope calculation
- Target detection sensitivity (d-prime)

<h2>4. Attentional Interpretation</h2>
- Assess search efficiency (efficient: <10ms/item, inefficient: >20ms/item)
- Evaluate parallel vs serial processing
- Discuss feature integration theory implications

<h2>5. Research Applications</h2>
- Compare to conjunction search norms
- Relevance for real-world visual tasks
- Training implications for attention
- Age and expertise effects`;

    default:
      return `${basePrompt}\n\nData: ${JSON.stringify(results, null, 2)}\n\nProvide a comprehensive analysis of this experimental data.`;
  }
}

module.exports = { analyzeExperiment };