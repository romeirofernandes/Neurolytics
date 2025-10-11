const mongoose = require('mongoose');

/**
 * Experiment Schema
 * Represents a cognitive science experiment with full lifecycle management
 * Links to consent forms and tracks all experiment assets and metadata
 */
const experimentSchema = new mongoose.Schema({
  // Unique identifier for public access (URL-friendly)
  experimentId: {
    type: String,
    unique: true,
    required: [true, 'Experiment ID is required'],
    trim: true,
    lowercase: true,
    index: true,
    match: [/^[a-z0-9-]+$/, 'Experiment ID must contain only lowercase letters, numbers, and hyphens'],
  },

  // Researcher who owns this experiment
  researcherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Researcher ID is required'],
    index: true,
  },

  // Linked consent form - REQUIRED for ethical compliance
  consentFormId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConsentForm',
    required: [true, 'Consent form is required for ethical compliance'],
  },

  // Basic experiment information
  title: {
    type: String,
    required: [true, 'Experiment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },

  // Research topic/area
  topic: {
    type: String,
    required: [true, 'Research topic is required'],
    trim: true,
    enum: [
      'attention',
      'memory',
      'perception',
      'decision-making',
      'language',
      'cognitive-control',
      'learning',
      'emotion',
      'social-cognition',
      'neuroscience',
      'other',
    ],
  },

  // Detailed description for participants
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },

  // Researcher bio/background
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },

  // Template information
  templateId: {
    type: String,
    trim: true,
    index: true,
  },

  templateName: {
    type: String,
    trim: true,
  },

  isFromTemplate: {
    type: Boolean,
    default: false,
  },

  // Experiment configuration - JSON blocks from builder
  configuration: {
    blocks: [{
      id: String,
      type: String,
      props: mongoose.Schema.Types.Mixed,
    }],
    settings: {
      randomizeBlocks: {
        type: Boolean,
        default: false,
      },
      showProgressBar: {
        type: Boolean,
        default: true,
      },
      allowPause: {
        type: Boolean,
        default: false,
      },
      fullscreen: {
        type: Boolean,
        default: false,
      },
    },
  },

  // File paths
  htmlFilePath: {
    type: String,
    required: [true, 'HTML file path is required'],
    trim: true,
  },

  jsonContextPath: {
    type: String,
    required: [true, 'JSON context path is required'],
    trim: true,
  },

  // Assets used in experiment (images, audio, etc.)
  assetsUsed: [{
    type: {
      type: String,
      enum: ['image', 'audio', 'video', 'document', 'other'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number, // in bytes
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Experiment status and lifecycle
  status: {
    type: String,
    enum: ['draft', 'testing', 'published', 'paused', 'completed', 'archived'],
    default: 'draft',
    index: true,
  },

  // Publishing information
  publishedLink: {
    type: String,
    trim: true,
    sparse: true, // Allows multiple null values
  },

  publishedAt: {
    type: Date,
  },

  unpublishedAt: {
    type: Date,
  },

  // Participant recruitment
  recruitment: {
    targetParticipants: {
      type: Number,
      min: [0, 'Target participants cannot be negative'],
      default: 0,
    },
    currentParticipants: {
      type: Number,
      min: [0, 'Current participants cannot be negative'],
      default: 0,
    },
    isRecruitmentOpen: {
      type: Boolean,
      default: true,
    },
    recruitmentStartDate: {
      type: Date,
    },
    recruitmentEndDate: {
      type: Date,
    },
  },

  // Data collection settings
  dataCollection: {
    collectDemographics: {
      type: Boolean,
      default: false,
    },
    allowMultipleSubmissions: {
      type: Boolean,
      default: false,
    },
    requireParticipantId: {
      type: Boolean,
      default: false,
    },
    anonymousParticipation: {
      type: Boolean,
      default: true,
    },
  },

  // Experiment results and analytics
  results: {
    totalParticipants: {
      type: Number,
      default: 0,
    },
    completedParticipants: {
      type: Number,
      default: 0,
    },
    droppedParticipants: {
      type: Number,
      default: 0,
    },
    averageDuration: {
      type: Number, // in seconds
      default: 0,
    },
    lastParticipationDate: {
      type: Date,
    },
  },

  // Version control for experiment iterations
  version: {
    type: Number,
    default: 1,
    min: 1,
  },

  versionHistory: [{
    version: Number,
    changes: String,
    modifiedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Collaboration and sharing
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],

  isPublic: {
    type: Boolean,
    default: false,
  },

  // Tags for organization and search
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],

  // Notes for researcher
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  collection: 'experiments',
});

// Indexes for performance
experimentSchema.index({ researcherId: 1, status: 1 });
experimentSchema.index({ experimentId: 1 }, { unique: true });
experimentSchema.index({ status: 1, publishedAt: -1 });
experimentSchema.index({ topic: 1 });
experimentSchema.index({ tags: 1 });
experimentSchema.index({ createdAt: -1 });

// Virtual for getting full published URL
experimentSchema.virtual('fullPublishedUrl').get(function() {
  if (this.publishedLink) {
    return `${process.env.BASE_URL || 'http://localhost:5173'}/experiment/${this.experimentId}`;
  }
  return null;
});

// Virtual for completion rate
experimentSchema.virtual('completionRate').get(function() {
  if (this.results.totalParticipants === 0) return 0;
  return (this.results.completedParticipants / this.results.totalParticipants * 100).toFixed(2);
});

// Pre-save middleware
experimentSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.versionHistory.push({
      version: this.version,
      changes: 'Updated experiment',
      modifiedAt: new Date(),
    });
  }
  this.updatedAt = new Date();
  next();
});

// Method to publish experiment
experimentSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  this.publishedLink = `${this.experimentId}.html`;
  this.recruitment.isRecruitmentOpen = true;
  return this.save();
};

// Method to unpublish experiment
experimentSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.unpublishedAt = new Date();
  this.recruitment.isRecruitmentOpen = false;
  return this.save();
};

// Method to pause experiment
experimentSchema.methods.pause = function() {
  this.status = 'paused';
  this.recruitment.isRecruitmentOpen = false;
  return this.save();
};

// Method to complete experiment
experimentSchema.methods.complete = function() {
  this.status = 'completed';
  this.recruitment.isRecruitmentOpen = false;
  return this.save();
};

// Method to increment participant count
experimentSchema.methods.incrementParticipants = function(completed = false) {
  this.results.totalParticipants += 1;
  this.recruitment.currentParticipants += 1;
  if (completed) {
    this.results.completedParticipants += 1;
  } else {
    this.results.droppedParticipants += 1;
  }
  this.results.lastParticipationDate = new Date();
  return this.save();
};

// Method to check if experiment is accepting participants
experimentSchema.methods.isAcceptingParticipants = function() {
  if (this.status !== 'published') return false;
  if (!this.recruitment.isRecruitmentOpen) return false;
  if (this.recruitment.targetParticipants > 0 && 
      this.recruitment.currentParticipants >= this.recruitment.targetParticipants) {
    return false;
  }
  if (this.recruitment.recruitmentEndDate && 
      new Date() > this.recruitment.recruitmentEndDate) {
    return false;
  }
  return true;
};

module.exports = mongoose.model('Experiment', experimentSchema);