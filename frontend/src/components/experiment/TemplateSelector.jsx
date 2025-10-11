import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BARTTemplate } from './templates/BARTTemplate';
import { StroopTemplate } from './templates/StroopTemplate';
import { PosnerTemplate } from './templates/PosnerTemplate';
import { ABBATemplate } from './templates/ABBATemplate';
import { TowerHanoiTemplate } from './templates/TowerHanoiTemplate';
import { FlankerTemplate } from './templates/FlankerTemplate';
import { GoNoGoTemplate } from './templates/GoNoGoTemplate';
import { NBackTemplate } from './templates/NBackTemplate';
import { SimonTemplate } from './templates/SimonTemplate';
import { DigitSpanTemplate } from './templates/DigitSpanTemplate';
import { VisualSearchTemplate } from './templates/VisualSearchTemplate';
import EmotionTracker from './templates/EmotionTracker';
import { Loader2, ArrowLeft, Brain, Target, Zap, Layers, Puzzle, Download, Filter, Hand, RefreshCw, Move, Hash, Search, Camera, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
	const [results, setResults] = useState(null);
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

	const handleComplete = (data) => {
		console.log('Template completed with data:', data);
		setResults(data);
		setIsRunning(false);
		
		// Show results summary
		if (data.summary) {
			alert(`Experiment Complete!\n\nTotal Trials: ${data.summary.totalTrials}\nAccuracy: ${data.summary.accuracy}\nAverage RT: ${data.summary.averageRT}\n\nData has been saved.`);
		}
	};

	const handleBack = () => {
		setSelectedTemplate(null);
		setIsRunning(false);
		setResults(null);
	};

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
			<div className="text-center space-y-2">
				<h2 className="text-3xl font-bold">Choose an Experiment Template</h2>
				<p className="text-muted-foreground text-lg">
					Select from our validated cognitive science experiments
				</p>
			</div>

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

								<Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
									View Details
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
};

export default TemplateSelector;