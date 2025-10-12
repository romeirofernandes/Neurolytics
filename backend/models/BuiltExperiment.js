const mongoose = require('mongoose');

const builtExperimentSchema = new mongoose.Schema({
  experimentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experiment',
    required: true,
    unique: true
  },
  publicId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  // Bundled standalone files
  htmlContent: {
    type: String,
    required: true
  },
  cssContent: {
    type: String,
    default: ''
  },
  jsContent: {
    type: String,
    required: true
  },
  // Metadata
  buildVersion: {
    type: String,
    default: '1.0.0'
  },
  buildStatus: {
    type: String,
    enum: ['building', 'success', 'failed'],
    default: 'success'
  },
  buildError: {
    type: String,
    default: null
  },
  // Access control
  isPublic: {
    type: Boolean,
    default: false
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
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

// Index for fast public access
builtExperimentSchema.index({ publicId: 1, isPublic: 1 });

module.exports = mongoose.model('BuiltExperiment', builtExperimentSchema);
