// routes/voiceResponses.js
const express = require('express');
const VoiceResponse = require('../models/VoiceResponse');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const doc = new VoiceResponse(req.body);
    await doc.save();
    res.status(201).json({ ok: true, id: doc._id });
  } catch (err) {
    console.error('Voice response save error:', err);
    res.status(500).json({ error: 'save failed', details: err.message });
  }
});

// Optional: GET endpoint to retrieve voice responses
router.get('/', async (req, res) => {
  try {
    const { experimentId, participantId } = req.query;
    const query = {};
    
    if (experimentId) query.experimentId = experimentId;
    if (participantId) query.participantId = participantId;
    
    const responses = await VoiceResponse.find(query).sort({ createdAt: -1 });
    res.json({ ok: true, data: responses });
  } catch (err) {
    console.error('Voice response fetch error:', err);
    res.status(500).json({ error: 'fetch failed', details: err.message });
  }
});

module.exports = router;
