const mongoose = require('mongoose');

const emotionSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
    index: true,
  },
  experimentId: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  emotion: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'],
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  allEmotions: {
    happy: Number,
    sad: Number,
    angry: Number,
    fearful: Number,
    disgusted: Number,
    surprised: Number,
    neutral: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'emotions',
});

// Indexes for performance
emotionSchema.index({ experimentId: 1, timestamp: 1 });
emotionSchema.index({ participantId: 1, timestamp: 1 });

module.exports = mongoose.model('Emotion', emotionSchema);
