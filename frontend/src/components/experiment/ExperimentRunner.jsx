import React, { useEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import { runExperiment } from '../../utils/jsPsychConverter';
import 'jspsych/css/jspsych.css';

const ExperimentRunner = ({ blocks, onClose }) => {
  const containerRef = useRef(null);
  const [experimentData, setExperimentData] = useState(null);
  const [isRunning, setIsRunning] = useState(true);
  const jsPsychInstanceRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && blocks.length > 0) {
      // Run the experiment
      runExperiment(blocks, (data) => {
        setExperimentData(data);
        setIsRunning(false);
      }).then((instance) => {
        jsPsychInstanceRef.current = instance;
      });
    }

    return () => {
      if (jsPsychInstanceRef.current) {
        try {
          jsPsychInstanceRef.current.endExperiment();
        } catch (e) {
          console.log('Experiment already ended');
        }
      }
    };
  }, [blocks]);

  const handleClose = () => {
    if (isRunning && jsPsychInstanceRef.current) {
      try {
        jsPsychInstanceRef.current.endExperiment();
      } catch (e) {
        console.log('Could not end experiment');
      }
    }
    onClose();
  };

  const handleDownloadData = () => {
    if (!experimentData) return;
    
    const dataStr = JSON.stringify(experimentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `experiment-data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header with close button - Fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="text-white">
          <h2 className="text-lg font-semibold">Experiment Preview</h2>
          <p className="text-sm text-white/70">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''}
            {isRunning && ' • Running...'}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          title="Close experiment"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* jsPsych container - Takes full remaining space */}
      <div 
        ref={containerRef}
        id="jspsych-container"
        className="flex-1 w-full overflow-auto"
      />

      {/* Data display overlay (shown after experiment finishes) */}
      {experimentData && !isRunning && (
        <div className="fixed inset-0 z-[10001] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-6 max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-foreground">Experiment Results</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Preview completed successfully
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadData}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Data
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1">
              <div className="bg-muted/30 rounded-lg p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Trials</p>
                  <p className="text-2xl font-bold text-foreground">{experimentData.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="text-2xl font-bold text-foreground">
                    {experimentData.length > 0 
                      ? ((experimentData[experimentData.length - 1].time_elapsed - experimentData[0].time_elapsed) / 1000).toFixed(1) + 's'
                      : '0s'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Raw Data (JSON)
                </h4>
                <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-auto border border-border">
                  {JSON.stringify(experimentData, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for jsPsych - FULLSCREEN STYLES */}
      <style>{`
        #jspsych-container {
          background: #1a1a1a !important;
        }
        
        .jspsych-display-element {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: transparent !important;
        }
        
        #jspsych-content {
          background: white !important;
          border-radius: 16px !important;
          padding: 60px !important;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6) !important;
          max-width: 1000px !important;
          width: 95% !important;
          min-height: 500px !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          position: relative !important;
        }
        
        .jspsych-btn {
          background: hsl(var(--primary)) !important;
          color: white !important;
          border: none !important;
          padding: 12px 32px !important;
          border-radius: 8px !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
        }
        
        .jspsych-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }
        
        .jspsych-btn:active {
          transform: translateY(0) !important;
        }
        
        .jspsych-survey-multi-choice-question,
        .jspsych-survey-text-question {
          margin: 24px 0 !important;
          text-align: left !important;
        }
        
        .jspsych-survey-multi-choice-text,
        .jspsych-survey-text-question-text {
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #333 !important;
          margin-bottom: 16px !important;
        }
        
        .jspsych-survey-multi-choice-option {
          margin: 12px 0 !important;
          padding: 12px !important;
          border-radius: 8px !important;
          transition: background 0.2s !important;
        }
        
        .jspsych-survey-multi-choice-option:hover {
          background: #f5f5f5 !important;
        }
        
        input[type="radio"],
        input[type="checkbox"] {
          margin-right: 12px !important;
          cursor: pointer !important;
          width: 18px !important;
          height: 18px !important;
        }
        
        textarea {
          width: 100% !important;
          padding: 12px !important;
          border: 2px solid #e0e0e0 !important;
          border-radius: 8px !important;
          font-family: inherit !important;
          font-size: 16px !important;
          transition: border-color 0.2s !important;
        }
        
        textarea:focus {
          outline: none !important;
          border-color: hsl(var(--primary)) !important;
        }
        
        #jspsych-progressbar-container {
          position: fixed !important;
          top: 80px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important;
          overflow: hidden !important;
          width: 600px !important;
          max-width: 90% !important;
          height: 12px !important;
          z-index: 10000 !important;
        }
        
        #jspsych-progressbar-inner {
          background: hsl(var(--primary)) !important;
          height: 100% !important;
          transition: width 0.3s ease !important;
        }

        #jspsych-progressbar-container .jspsych-progressbar-text {
          color: white !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }

        /* Remove default jsPsych margins */
        .jspsych-content-wrapper {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

export default ExperimentRunner;