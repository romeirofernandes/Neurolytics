const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment Type
  paymentType: {
    type: String,
    enum: ['sponsorship', 'participant_reward'],
    required: true
  },

  // For Researcher Sponsorship
  researcherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  experimentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experiment',
  },
  sponsorshipTier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
  },
  sponsorshipDuration: {
    type: Number, // days
  },
  sponsorshipStartDate: {
    type: Date,
  },
  sponsorshipEndDate: {
    type: Date,
  },

  // For Participant Rewards
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant',
  },
  rewardAmount: {
    type: Number,
  },
  rewardReason: {
    type: String, // 'experiment_completion', 'milestone', 'bonus'
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Razorpay Details
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpaySignature: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ researcherId: 1, status: 1 });
paymentSchema.index({ participantId: 1, status: 1 });
paymentSchema.index({ experimentId: 1 });
paymentSchema.index({ sponsorshipEndDate: 1 });

module.exports = mongoose.model('Payment', paymentSchema);