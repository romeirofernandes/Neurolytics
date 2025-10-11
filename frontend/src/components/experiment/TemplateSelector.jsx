import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Eye, 
  Zap, 
  Users, 
  Clock, 
  Target, 
  ChevronRight,
  Mic
} from 'lucide-react';

// Import template components
import StroopTaskTemplate from './templates/StroopTaskTemplate';
import EmotionTracker from './templates/EmotionTracker';
import VoiceCRTTemplate from './templates/VoiceCRTTemplate';

const TemplateSelector = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

const templates = [
	{
		id: 'stroop-emotion',
		name: 'Stroop + Emotions',
		fullName: 'Stroop Task with Emotion Tracking',
		description: 'Measures selective attention and cognitive control while tracking facial emotions',
		details: 'Combines the classic Stroop color-word interference task with real-time facial emotion recognition. Tracks how emotions change during cognitive conflict and processing.',
		duration: '~8 minutes',
		trials: '50 trials (10 training, 40 test)',
		measures: ['Selective attention', 'Cognitive control', 'Emotional responses', 'Stroop effect', 'Affect during conflict'],
		component: EmotionTracker,
		icon: Camera,
		color: 'from-indigo-500 to-purple-500',
		requiresCamera: true,
	},
	{
		id: 'bart',
		name: 'BART',
		fullName: 'Balloon Analogue Risk Task',
		description: 'Measures risk-taking behavior and decision-making under uncertainty',
		details: 'Participants pump up virtual balloons to earn money. Each pump increases earnings but also explosion risk. Used to assess risk propensity in clinical and behavioral research.',
		duration: '~2 minutes',
		trials: '33 trials (3 training)',
		measures: ['Risk-taking propensity', 'Reward sensitivity', 'Decision-making strategy'],
		component: BARTTemplate,
		icon: Brain,
		color: 'from-blue-500 to-cyan-500'
	},
	{
		id: 'stroop',
		name: 'Stroop Task',
		fullName: 'Stroop Color-Word Task',
		description: 'Measures selective attention, processing speed, and cognitive control',
		details: 'Classic cognitive interference task where participants identify the color of words while ignoring their meaning. Demonstrates automatic processing and executive function.',
		duration: '~1-2 minutes',
		trials: '20 trials (5 training)',
		measures: ['Selective attention', 'Response inhibition', 'Processing speed', 'Stroop effect magnitude'],
		component: StroopTemplate,
		icon: Target,
		color: 'from-purple-500 to-pink-500'
	},
  {
    id: 'flanker',
    name: 'Flanker Task',
    fullName: 'Eriksen Flanker Task',
    description: 'Measures selective attention and response inhibition',
    details: 'Participants respond to a central target letter while ignoring flanking distractors. Compatible and incompatible trials reveal cognitive control mechanisms.',
    duration: '~1-2 minutes',
    trials: '20 trials (5 training)',
    measures: ['Selective attention', 'Cognitive control', 'Interference suppression', 'Flanker effect'],
    component: FlankerTemplate,
    icon: Filter,
    color: 'from-orange-500 to-red-500'
  },
	{
		id: 'posner',
		name: 'Posner Cueing',
		fullName: 'Posner Spatial Cueing Task',
		description: 'Assesses spatial attention orienting and visual processing',
		details: 'Participants respond to targets appearing in cued or uncued locations. Measures the cost and benefit of spatial attention shifting, fundamental to understanding attentional mechanisms.',
		duration: '~2 minutes',
		trials: '40 trials',
		measures: ['Spatial attention', 'Cueing effects', 'Attentional orienting', 'Response time benefits'],
		component: PosnerTemplate,
		icon: Zap,
		color: 'from-yellow-500 to-orange-500'
	},
  {
    id: 'simon',
    name: 'Simon Task',
    fullName: 'Simon Stimulus-Response Compatibility',
    description: 'Measures stimulus-response compatibility and spatial attention',
    details: 'Respond to word meaning while ignoring spatial position. Compatible vs incompatible spatial mapping reveals automatic processing of irrelevant location information.',
    duration: '~1-2 minutes',
    trials: '24 trials (5 training)',
    measures: ['S-R compatibility', 'Spatial interference', 'Automatic processing', 'Simon effect'],
    component: SimonTemplate,
    icon: Move,
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'gonogo',
    name: 'Go/No-Go',
    fullName: 'Go/No-Go Inhibition Task',
    description: 'Measures response inhibition and impulse control',
    details: 'Respond quickly to frequent Go signals but withhold responses to rare No-Go signals. Assesses inhibitory control critical for self-regulation.',
    duration: '~1-2 minutes',
    trials: '30 trials',
    measures: ['Response inhibition', 'Impulse control', 'Commission errors', 'Reaction time'],
    component: GoNoGoTemplate,
    icon: Hand,
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'nback',
    name: 'N-Back (2-Back)',
    fullName: '2-Back Working Memory Task',
    description: 'Measures working memory capacity and updating',
    details: 'Monitor a sequence of letters and respond when the current letter matches one shown 2 positions back. Classic working memory paradigm used in cognitive training.',
    duration: '~1-2 minutes',
    trials: '30 trials (2 blocks)',
    measures: ['Working memory', 'Updating ability', 'Sustained attention', 'Executive function'],
    component: NBackTemplate,
    icon: RefreshCw,
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'digitspan',
    name: 'Digit Span',
    fullName: 'Digit Span Memory Test',
    description: 'Measures short-term memory capacity',
    details: 'Remember and recall increasingly long sequences of digits. Classic measure of memory span, typically 7±2 digits for adults.',
    duration: '~1-2 minutes',
    trials: 'Adaptive (until 2 errors)',
    measures: ['Short-term memory', 'Memory span', 'Recall accuracy', 'Sequential processing'],
    component: DigitSpanTemplate,
    icon: Hash,
    color: 'from-emerald-500 to-green-500'
  },
  {
    id: 'visualsearch',
    name: 'Visual Search',
    fullName: 'Conjunction Visual Search',
    description: 'Measures visual attention and search efficiency',
    details: 'Find an orange upright T among rotated Ts and colored Ts. Search time increases with set size, revealing serial vs parallel processing.',
    duration: '~1-2 minutes',
    trials: '20 trials (3 training)',
    measures: ['Visual attention', 'Search slopes', 'Feature integration', 'Processing efficiency'],
    component: VisualSearchTemplate,
    icon: Search,
    color: 'from-indigo-500 to-blue-500'
  },
	{
		id: 'abba',
		name: 'ABBA Task',
		fullName: 'Action-Based Backward Activation',
		description: 'Examines action planning and response compatibility effects',
		details: 'Tests the reversed-compatibility effect where participants plan one response and execute another. Critical for understanding motor planning and cognitive control interactions.',
		duration: '~2 minutes',
		trials: '40 trials',
		measures: ['Action planning', 'Response compatibility', 'Motor control', 'Cognitive flexibility'],
		component: ABBATemplate,
		icon: Layers,
		color: 'from-green-500 to-emerald-500'
	},
	{
		id: 'hanoi',
		name: 'Tower of Hanoi',
		fullName: 'Tower of Hanoi Puzzle',
		description: 'Evaluates planning, problem-solving, and executive function',
		details: 'Classic problem-solving task requiring participants to move discs between pegs following specific rules. Assesses planning ability, working memory, and strategic thinking.',
		duration: '~5 minutes',
		trials: '1 puzzle (3 discs)',
		measures: ['Planning ability', 'Problem-solving efficiency', 'Working memory', 'Strategic thinking'],
		component: TowerHanoiTemplate,
		icon: Puzzle,
		color: 'from-red-500 to-rose-500'
	}
];

const TemplateSelector = ({ onTemplateSelect }) => {
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [isRunning, setIsRunning] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [error, setError] = useState(null);
	const [participantId] = useState(`participant-${Date.now()}`);
	const [experimentId] = useState(`experiment-${Date.now()}`);

	const handleTemplateClick = (templateId) => {
		const template = templates.find(t => t.id === templateId);
		
		// Check if template requires camera
		if (template?.requiresCamera) {
			// Show warning and request permission
			if (confirm('⚠️ This experiment requires camera access for emotion tracking.\n\nCamera permissions will be requested when you start the experiment.\n\nClick OK to continue.')) {
				setSelectedTemplate(templateId);
			}
		} else {
			setSelectedTemplate(templateId);
		}
	};

	const handleRunTemplate = () => {
		setIsRunning(true);
	};

	const handleComplete = async (data) => {
		console.log('Template completed with data:', data);
		setIsRunning(false);
		setIsAnalyzing(true);
		setError(null);
		
		try {
			const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analysis/analyze`, {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					templateId: selectedTemplate,
					results: data
				})
			});
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const analysisData = await response.json();
			
			if (analysisData.success) {
				setResults({ rawData: data, analysis: analysisData.analysis });
				setShowResults(true);
			} else {
				throw new Error(analysisData.message || 'Analysis failed');
			}
		} catch (error) {
			console.error('Analysis error:', error);
			setError(error.message);
			setResults({ rawData: data, analysis: null });
			setShowResults(true);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleBack = () => {
		setSelectedTemplate(null);
		setIsRunning(false);
		setShowResults(false);
		setResults(null);
		setError(null);
	};

	// Analyzing state - show loading spinner
	if (isAnalyzing) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center gap-4">
							<Loader2 className="h-12 w-12 animate-spin text-primary" />
							<h3 className="text-lg font-semibold">Analyzing Results...</h3>
							<p className="text-sm text-muted-foreground text-center">
								Our AI is processing your experiment data and generating insights.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Results state - show analysis with PDF download
	if (showResults) {
		const template = templates.find(t => t.id === selectedTemplate);
		
		return (
			<div className="space-y-6">
				<Button onClick={handleBack} variant="outline" className="gap-2">
					<ArrowLeft className="h-4 w-4" />
					Back to Templates
				</Button>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<template.icon className="h-6 w-6" />
							{template.fullName} - Results
						</CardTitle>
						<CardDescription>
							Comprehensive analysis of your performance
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>
									Error during analysis: {error}. Showing raw data only.
								</AlertDescription>
							</Alert>
						)}

						{results?.analysis ? (
							<div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:text-base prose-p:leading-7 prose-li:text-base prose-table:text-sm prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-strong:text-foreground prose-strong:font-semibold">
								<ReactMarkdown 
									remarkPlugins={[remarkGfm]} 
									rehypePlugins={[rehypeRaw]}
									components={{
										h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 pb-2 border-b border-border text-foreground" {...props} />,
										h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground" {...props} />,
										p: ({node, ...props}) => <p className="text-base leading-7 mb-4 text-foreground/90" {...props} />,
										ul: ({node, ...props}) => <ul className="my-4 ml-6 list-disc space-y-2" {...props} />,
										ol: ({node, ...props}) => <ol className="my-4 ml-6 list-decimal space-y-2" {...props} />,
										li: ({node, ...props}) => <li className="text-base text-foreground/90" {...props} />,
										table: ({node, ...props}) => (
											<div className="my-6 overflow-x-auto">
												<table className="w-full border-collapse border border-border rounded-lg overflow-hidden" {...props} />
											</div>
										),
										thead: ({node, ...props}) => <thead className="bg-muted" {...props} />,
										th: ({node, ...props}) => <th className="border border-border p-3 text-left font-semibold text-foreground" {...props} />,
										td: ({node, ...props}) => <td className="border border-border p-3 text-foreground/90" {...props} />,
										strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
										em: ({node, ...props}) => <em className="italic text-foreground/80" {...props} />,
										code: ({node, inline, ...props}) => 
											inline 
												? <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
												: <code className="block bg-muted p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono" {...props} />,
										blockquote: ({node, ...props}) => (
											<blockquote className="border-l-4 border-primary pl-4 my-4 italic text-foreground/80" {...props} />
										),
									}}
								>
									{results.analysis}
								</ReactMarkdown>
							</div>
						) : (
							<div className="space-y-4">
								<h3 className="font-semibold">Raw Data</h3>
								<pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-xs">
									{JSON.stringify(results?.rawData, null, 2)}
								</pre>
							</div>
						)}

						<div className="flex gap-4">
							<Button onClick={handleBack} className="flex-1">
								Try Another Experiment
							</Button>
							<Button 
								onClick={() => {
									try {
										const doc = new jsPDF();
										const pageWidth = doc.internal.pageSize.getWidth();
										const pageHeight = doc.internal.pageSize.getHeight();
										const margin = 20;
										const maxWidth = pageWidth - (margin * 2);
										let yPosition = margin;

										// Title
										doc.setFontSize(20);
										doc.setFont('helvetica', 'bold');
										doc.setTextColor(26, 26, 26);
										doc.text(`${template.fullName}`, margin, yPosition);
										yPosition += 10;
										
										doc.setFontSize(16);
										doc.text('Experiment Results', margin, yPosition);
										yPosition += 15;

										// Date
										doc.setFontSize(10);
										doc.setFont('helvetica', 'normal');
										doc.setTextColor(102, 102, 102);
										doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
										yPosition += 15;

										// Add a line separator
										doc.setDrawColor(59, 130, 246);
										doc.setLineWidth(0.5);
										doc.line(margin, yPosition, pageWidth - margin, yPosition);
										yPosition += 10;

										if (results?.analysis) {
											// Helper function to parse inline markdown formatting
											const parseInlineMarkdown = (text) => {
												const segments = [];
												let remaining = text;
												
												const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
												let match;
												let lastIndex = 0;
												
												while ((match = pattern.exec(remaining)) !== null) {
													if (match.index > lastIndex) {
														segments.push({
															text: remaining.substring(lastIndex, match.index),
															style: 'normal'
														});
													}
													
													const matched = match[0];
													if (matched.startsWith('**') && matched.endsWith('**')) {
														segments.push({
															text: matched.slice(2, -2),
															style: 'bold'
														});
													} else if (matched.startsWith('*') && matched.endsWith('*') && !matched.startsWith('**')) {
														segments.push({
															text: matched.slice(1, -1),
															style: 'italic'
														});
													} else if (matched.startsWith('`') && matched.endsWith('`')) {
														segments.push({
															text: matched.slice(1, -1),
															style: 'code'
														});
													}
													
													lastIndex = pattern.lastIndex;
												}
												
												if (lastIndex < remaining.length) {
													segments.push({
														text: remaining.substring(lastIndex),
														style: 'normal'
													});
												}
												
												return segments;
											};
											
											// Helper function to render text with formatting
											const renderFormattedText = (text, x, y, maxW) => {
												const segments = parseInlineMarkdown(text);
												let currentX = x;
												const lineHeight = 6;
												let currentY = y;
												
												for (const segment of segments) {
													if (segment.style === 'bold') {
														doc.setFont('helvetica', 'bold');
														doc.setTextColor(26, 26, 26);
													} else if (segment.style === 'italic') {
														doc.setFont('helvetica', 'italic');
														doc.setTextColor(55, 65, 81);
													} else if (segment.style === 'code') {
														doc.setFont('courier', 'normal');
														doc.setFontSize(10);
														doc.setTextColor(79, 70, 229);
													} else {
														doc.setFont('helvetica', 'normal');
														doc.setFontSize(11);
														doc.setTextColor(55, 65, 81);
													}
													
													const words = segment.text.split(' ');
													for (let w = 0; w < words.length; w++) {
														const word = words[w] + (w < words.length - 1 ? ' ' : '');
														const wordWidth = doc.getTextWidth(word);
														
														if (currentX + wordWidth > x + maxW) {
															currentY += lineHeight;
															currentX = x;
															
															if (currentY > pageHeight - 30) {
																doc.addPage();
																currentY = margin;
															}
														}
														
														doc.text(word, currentX, currentY);
														currentX += wordWidth;
													}
												}
												
												doc.setFont('helvetica', 'normal');
												doc.setFontSize(11);
												doc.setTextColor(55, 65, 81);
												
												return currentY + lineHeight + 2;
											};
											
											const lines = results.analysis.split('\n');
											
											for (let i = 0; i < lines.length; i++) {
												const line = lines[i].trim();
												
												if (yPosition > pageHeight - 30) {
													doc.addPage();
													yPosition = margin;
												}

												if (line.startsWith('## ')) {
													yPosition += 5;
													doc.setFontSize(16);
													doc.setFont('helvetica', 'bold');
													doc.setTextColor(30, 64, 175);
													const text = line.substring(3);
													doc.text(text, margin, yPosition);
													yPosition += 8;
													
													doc.setDrawColor(219, 234, 254);
													doc.setLineWidth(0.5);
													doc.line(margin, yPosition, pageWidth - margin, yPosition);
													yPosition += 8;
												} else if (line.startsWith('### ')) {
													yPosition += 4;
													doc.setFontSize(14);
													doc.setFont('helvetica', 'bold');
													doc.setTextColor(30, 64, 175);
													const text = line.substring(4);
													doc.text(text, margin, yPosition);
													yPosition += 7;
												} else if (line.startsWith('- ') || line.startsWith('* ')) {
													const text = line.substring(2);
													doc.setFontSize(11);
													doc.setFont('helvetica', 'normal');
													doc.setTextColor(55, 65, 81);
													doc.text('•', margin + 2, yPosition);
													yPosition = renderFormattedText(text, margin + 7, yPosition, maxWidth - 7);
												} else if (line.startsWith('> ')) {
													yPosition += 2;
													doc.setDrawColor(59, 130, 246);
													doc.setLineWidth(2);
													doc.line(margin, yPosition - 3, margin, yPosition + 8);
													
													const text = line.substring(2);
													doc.setFontSize(11);
													doc.setFont('helvetica', 'italic');
													doc.setTextColor(75, 85, 99);
													yPosition = renderFormattedText(text, margin + 6, yPosition, maxWidth - 6);
													yPosition += 2;
												} else if (line.includes('|') && line.trim().length > 0) {
													const tableLines = [line];
													let j = i + 1;
													while (j < lines.length && lines[j].includes('|')) {
														tableLines.push(lines[j].trim());
														j++;
													}
													
													if (tableLines.length > 2) {
														const headers = tableLines[0].split('|').filter(c => c.trim()).map(c => c.trim());
														const data = tableLines.slice(2).map(row => 
															row.split('|').filter(c => c.trim()).map(c => c.trim())
														);
														
														autoTable(doc, {
															startY: yPosition,
															head: [headers],
															body: data,
															theme: 'grid',
															headStyles: { 
																fillColor: [249, 250, 251],
																textColor: [26, 26, 26],
																fontStyle: 'bold',
																lineWidth: 0.1,
																lineColor: [209, 213, 219]
															},
															bodyStyles: {
																textColor: [55, 65, 81],
																lineWidth: 0.1,
																lineColor: [209, 213, 219]
															},
															margin: { left: margin, right: margin },
															styles: { fontSize: 10 }
														});
														
														yPosition = doc.lastAutoTable.finalY + 10;
														i = j - 1;
													}
												} else if (line.length > 0) {
													yPosition = renderFormattedText(line, margin, yPosition, maxWidth);
												}
											}
										} else {
											doc.setFontSize(11);
											doc.setTextColor(102, 102, 102);
											doc.text('No analysis available.', margin, yPosition);
										}

										doc.save(`${template.id}-results-${Date.now()}.pdf`);
									} catch (error) {
										console.error('PDF generation error:', error);
										alert('Failed to generate PDF. Please try again.');
									}
								}}
								variant="outline"
								className="gap-2"
							>
								<Download className="h-4 w-4" />
								Download PDF Report
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Running state - full screen experiment
	if (isRunning && selectedTemplate) {
		const template = templates.find(t => t.id === selectedTemplate);
		const TemplateComponent = template?.component;
		
		if (!TemplateComponent) {
			return (
				<div className="flex items-center justify-center min-h-screen">
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Error: Template component not found
						</AlertDescription>
					</Alert>
				</div>
			);
		}
		
		return (
			<div className="fixed inset-0 z-50 bg-background">
				<TemplateComponent 
					onComplete={handleComplete}
					participantId={participantId}
					experimentId={experimentId}
				/>
			</div>
		);
	}

	// Detail view - show template details and start button
	if (selectedTemplate) {
		const template = templates.find(t => t.id === selectedTemplate);
		
		if (!template) {
			return (
				<div className="space-y-6">
					<Button onClick={handleBack} variant="outline" className="gap-2">
						<ArrowLeft className="h-4 w-4" />
						Back to Templates
					</Button>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							Template not found
						</AlertDescription>
					</Alert>
				</div>
			);
		}

		const Icon = template.icon;

		return (
			<div className="space-y-6 max-w-4xl mx-auto">
				<Button onClick={handleBack} variant="outline" className="gap-2">
					<ArrowLeft className="h-4 w-4" />
					Back to Templates
				</Button>

				<Card className="border-2">
					<div className={`h-3 bg-gradient-to-r ${template.color}`} />
					<CardHeader className="space-y-6">
						<div className="flex items-start gap-6">
							<div className={`p-4 rounded-xl bg-gradient-to-br ${template.color} text-white shadow-lg`}>
								<Icon className="h-10 w-10" />
							</div>
							<div className="flex-1">
								<CardTitle className="text-3xl mb-2">{template.fullName}</CardTitle>
								<CardDescription className="text-base">{template.description}</CardDescription>
							</div>
						</div>

						{template.requiresCamera && (
							<Alert className="border-amber-500 bg-amber-50 dark:bg-amber-900/20">
								<Camera className="h-4 w-4 text-amber-600" />
								<AlertDescription className="text-amber-800 dark:text-amber-200">
									<strong>Camera Required:</strong> This experiment uses facial emotion tracking. You will be asked for camera permission.
								</AlertDescription>
							</Alert>
						)}
					</CardHeader>

					<CardContent className="space-y-8">
						{/* Details */}
						<div>
							<h3 className="font-semibold text-lg mb-3">About This Task</h3>
							<p className="text-muted-foreground leading-relaxed">{template.details}</p>
						</div>

						{/* Info Grid */}
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-secondary/50 rounded-lg p-4">
								<div className="text-sm text-muted-foreground mb-1">Duration</div>
								<div className="text-xl font-semibold">{template.duration}</div>
							</div>
							<div className="bg-secondary/50 rounded-lg p-4">
								<div className="text-sm text-muted-foreground mb-1">Trials</div>
								<div className="text-xl font-semibold">{template.trials}</div>
							</div>
						</div>

						{/* Measures */}
						<div>
							<h3 className="font-semibold text-lg mb-3">What This Measures</h3>
							<div className="flex flex-wrap gap-2">
								{template.measures.map((measure, idx) => (
									<span 
										key={idx} 
										className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium"
									>
										{measure}
									</span>
								))}
							</div>
						</div>

						{/* Start Button */}
						<div className="flex gap-4 pt-4">
							<Button 
								onClick={handleRunTemplate}
								size="lg"
								className="flex-1 h-14 text-lg gap-2"
							>
								{template.requiresCamera && <Camera className="h-5 w-5" />}
								Start Experiment
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Grid view - show all templates
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{templates.map((template) => {
					const Icon = template.icon;
					return (
						<Card 
							key={template.id} 
							className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer overflow-hidden"
							onClick={() => handleTemplateClick(template.id)}
						>
							<div className={`h-2 bg-gradient-to-r ${template.color}`} />
							<CardHeader className="space-y-4">
								<div className="flex items-start justify-between">
									<div className={`p-3 rounded-lg bg-gradient-to-br ${template.color} text-white shadow-md`}>
										<Icon className="h-6 w-6" />
									</div>
									<div className="text-right text-xs text-muted-foreground space-y-1">
										<div className="font-medium">{template.duration}</div>
										<div>{template.trials}</div>
										{template.requiresCamera && (
											<div className="flex items-center gap-1 text-amber-600">
												<Camera className="h-3 w-3" />
												<span>Camera</span>
											</div>
										)}
									</div>
								</div>
								<div>
									<CardTitle className="text-xl group-hover:text-primary transition-colors">
										{template.fullName}
									</CardTitle>
									<CardDescription className="mt-2 line-clamp-2">
										{template.description}
									</CardDescription>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex flex-wrap gap-1">
									{template.measures.slice(0, 3).map((measure, idx) => (
										<span 
											key={idx} 
											className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
										>
											{measure}
										</span>
									))}
									{template.measures.length > 3 && (
										<span className="text-xs text-muted-foreground px-2 py-1">
											+{template.measures.length - 3} more
										</span>
									)}
								</div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => onSelectTemplate(template)}
                    className="w-full group-hover:shadow-md transition-shadow gap-2"
                  >
                    Select Template
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground space-y-2">
              <Target className="w-16 h-16 mx-auto opacity-50" />
              <p className="text-xl font-medium">No templates found</p>
              <p className="text-sm">Try selecting a different category</p>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Need a custom template?
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Contact our team to create a custom experiment tailored to your research needs. 
                We support various cognitive tasks, questionnaires, and interactive paradigms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;