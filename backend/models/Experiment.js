const mongoose = require('mongoose');

const experimentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  researcherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateType: {
    type: String,
    required: true,
    enum: [
      'stroop',
      'nback',
      'posner',
      'flanker',
      'gonogo',
      'simon',
      'visualsearch',
      'towerhanoi',
      'bart',
      'abba',
      'digitspan',
      'emotiontracker',
      'custom-ai-generated',
      'custom'
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // For AI-generated experiments
  aiGenerated: {
    type: Boolean,
    default: false
  },
  componentCode: {
    type: String,
    default: null
  },
  // Participation tracking
  participantCount: {
    type: Number,
    default: 0
  },
  // Results storage reference
  resultsCollectionName: {
    type: String,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
experimentSchema.index({ researcherId: 1, status: 1 });
experimentSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('Experiment', experimentSchema);