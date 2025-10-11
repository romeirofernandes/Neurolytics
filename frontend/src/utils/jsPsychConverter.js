import { initJsPsych } from 'jspsych';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import imageKeyboardResponse from '@jspsych/plugin-image-keyboard-response';
import surveyText from '@jspsych/plugin-survey-text';
import surveyMultiChoice from '@jspsych/plugin-survey-multi-choice';

export const convertBlocksToTimeline = (blocks) => {
  const timeline = blocks.map((block, index) => {
    switch (block.type) {
      case 'text':
        return {
          type: htmlKeyboardResponse,
          stimulus: `
            <div style="padding: 40px; width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div style="position: absolute; top: 20px; left: 20px; color: #666; font-size: 14px;">
                Block ${index + 1} of ${blocks.length}
              </div>
              <div style="text-align: ${block.props.alignment}; font-size: ${block.props.fontSize}; max-width: 800px;">
                ${block.props.content}
              </div>
            </div>
          `,
          choices: ['Enter', ' '],
          prompt: '<p style="margin-top: 30px; color: #666; font-size: 14px;">Press ENTER or SPACE to continue</p>',
        };

      case 'image':
        return {
          type: imageKeyboardResponse,
          stimulus: block.props.url || 'https://via.placeholder.com/600x400?text=No+Image',
          stimulus_width: block.props.width === '100%' ? 600 : parseInt(block.props.width) || 400,
          stimulus_height: 400,
          maintain_aspect_ratio: true,
          choices: ['Enter', ' '],
          prompt: `
            <div style="position: absolute; top: 20px; left: 20px; color: #666; font-size: 14px;">
              Block ${index + 1} of ${blocks.length}
            </div>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Press ENTER or SPACE to continue</p>
          `,
        };

      case 'reaction':
        return {
          type: htmlKeyboardResponse,
          stimulus: `
            <div style="padding: 40px; width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <div style="position: absolute; top: 20px; left: 20px; color: #666; font-size: 14px;">
                Block ${index + 1} of ${blocks.length} - Reaction Time
              </div>
              <div style="text-align: center; font-size: 32px; font-weight: bold;">
                ${block.props.stimulus || 'Press SPACE when you see this!'}
              </div>
              <div style="text-align: center; margin-top: 30px; color: #666;">
                <p>Time Limit: ${(block.props.timeLimit / 1000).toFixed(1)} seconds</p>
              </div>
            </div>
          `,
          choices: [' '],
          trial_duration: block.props.timeLimit || 5000,
          data: {
            task: 'reaction-time',
            stimulus: block.props.stimulus,
          },
          prompt: '<p style="color: #999; font-size: 14px; margin-top: 20px;">Press SPACE to respond</p>',
        };

      case 'survey':
        if (block.props.type === 'text') {
          return {
            type: surveyText,
            preamble: `
              <div style="position: absolute; top: 20px; left: 20px; color: #666; font-size: 14px;">
                Block ${index + 1} of ${blocks.length}
              </div>
              <div style="padding-top: 40px;"></div>
            `,
            questions: [
              {
                prompt: block.props.question,
                required: false,
                rows: 4,
              },
            ],
            button_label: 'Continue →',
          };
        } else if (block.props.type === 'multiple-choice') {
          return {
            type: surveyMultiChoice,
            preamble: `
              <div style="position: absolute; top: 20px; left: 20px; color: #666; font-size: 14px;">
                Block ${index + 1} of ${blocks.length}
              </div>
              <div style="padding-top: 40px;"></div>
            `,
            questions: [
              {
                prompt: block.props.question,
                options: block.props.options || ['Yes', 'No'],
                required: false,
              },
            ],
            button_label: 'Continue →',
          };
        } else if (block.props.type === 'rating') {
          return {
            type: surveyMultiChoice,
            preamble: `
              <div style="position: absolute; top: 20px; left: 20px; color: #666; font-size: 14px;">
                Block ${index + 1} of ${blocks.length} - Rating Scale
              </div>
              <div style="padding-top: 40px;"></div>
            `,
            questions: [
              {
                prompt: block.props.question,
                options: ['1 - Very Poor', '2 - Poor', '3 - Average', '4 - Good', '5 - Excellent'],
                required: false,
                horizontal: true,
              },
            ],
            button_label: 'Continue →',
          };
        }
        break;

      default:
        return {
          type: htmlKeyboardResponse,
          stimulus: '<p style="text-align: center; padding: 40px;">Unknown block type</p>',
          choices: ['Enter'],
        };
    }
  });

  return timeline;
};

export const runExperiment = async (blocks, onFinish) => {
  // Initialize jsPsych with display_element targeting
  const jsPsych = initJsPsych({
    display_element: 'jspsych-container',
    on_finish: () => {
      console.log('Experiment finished!');
      
      const trials = jsPsych.data.get().values();
      console.log('Trial data:', trials);
      
      if (onFinish) {
        onFinish(trials);
      }
    },
    show_progress_bar: true,
    message_progress_bar: 'Experiment Progress',
    auto_update_progress_bar: true,
  });

  const timeline = convertBlocksToTimeline(blocks);

  // Add welcome screen with AUTO-ADVANCE
  timeline.unshift({
    type: htmlKeyboardResponse,
    stimulus: `
      <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px;">
        <h1 style="font-size: 42px; margin-bottom: 24px; color: #333; font-weight: bold;">
          Welcome to the Experiment
        </h1>
        <p style="font-size: 20px; color: #666; margin-bottom: 40px; line-height: 1.6; max-width: 700px;">
          You are about to preview an experiment with <strong>${blocks.length}</strong> block${blocks.length !== 1 ? 's' : ''}.
        </p>
        <p style="font-size: 16px; color: #999;">
          Starting automatically in 2 seconds...
        </p>
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: 2000, // Auto-advance after 2 seconds
  });

  // Add thank you screen with AUTO-ADVANCE
  timeline.push({
    type: htmlKeyboardResponse,
    stimulus: `
      <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 40px;">
        <h1 style="font-size: 42px; margin-bottom: 24px; color: #333; font-weight: bold;">
          Experiment Complete!
        </h1>
        <p style="font-size: 20px; color: #666; margin-bottom: 40px; line-height: 1.6;">
          Thank you for completing this preview.
        </p>
        <p style="font-size: 16px; color: #999;">
          Loading results in 2 seconds...
        </p>
      </div>
    `,
    choices: "NO_KEYS",
    trial_duration: 2000, // Auto-advance after 2 seconds
  });

  // Run the experiment
  await jsPsych.run(timeline);

  return jsPsych;
};