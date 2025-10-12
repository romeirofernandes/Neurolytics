const mongoose = require('mongoose');

const VoiceResponseSchema = new mongoose.Schema({
  experimentId: { type: String, required: true },
  participantId: { type: String, required: true },
  trialIndex: { type: Number, required: true },
  questionId: { type: String },
  stimulusText: { type: String },
  transcript: { type: String },
  transcriptConfidence: { type: Number },
  reactionTimeMs: { type: Number, required: true },
  speechStartTimestamp: { type: Number },
  speechEndTimestamp: { type: Number },
  isCorrect: { type: Number, default: 0 }, // 0 or 1
  correctAnswer: { type: String },
  mode: { type: String, enum: ['voice', 'typed'], default: 'voice' },
  createdAt: { type: Date, default: () => new Date() }
}, {
  timestamps: true
});

module.exports = mongoose.model('VoiceResponse', VoiceResponseSchema);
