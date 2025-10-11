const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  education: { type: String, required: true },
  city: { type: String },
  experimentsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experiment' }],
},{timestamps: true});

module.exports = mongoose.model('Participant', participantSchema);
