const mongoose = require('mongoose');

const researcherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  institution: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  fieldOfStudy: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  orcId: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values while maintaining uniqueness for non-null values
    validate: {
      validator: function(v) {
        // ORCID format: 0000-0000-0000-0000
        if (!v) return true; // Allow empty/null values
        return /^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$/.test(v);
      },
      message: props => `${props.value} is not a valid ORCID format! Expected: 0000-0000-0000-0000`
    }
  }
}, { timestamps: true });

// // Index for faster queries
// researcherSchema.index({ userId: 1 });
// researcherSchema.index({ institution: 1 });
// researcherSchema.index({ fieldOfStudy: 1 });

module.exports = mongoose.model('Researcher', researcherSchema);
