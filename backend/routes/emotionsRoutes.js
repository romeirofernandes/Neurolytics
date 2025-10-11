const express = require('express');
const router = express.Router();
const Emotion = require('../models/Emotion');

// Store emotion data
router.post('/', async (req, res) => {
  try {
    const { participantId, experimentId, timestamp, emotion, confidence, allEmotions } = req.body;

    const emotionData = new Emotion({
      participantId,
      experimentId,
      timestamp,
      emotion,
      confidence,
      allEmotions,
    });

    await emotionData.save();

    res.status(201).json({
      success: true,
      message: 'Emotion data recorded',
    });
  } catch (error) {
    console.error('Error saving emotion data:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving emotion data',
      error: error.message,
    });
  }
});

// Get emotions for an experiment
router.get('/experiment/:experimentId', async (req, res) => {
  try {
    const { experimentId } = req.params;

    const emotions = await Emotion.find({ experimentId })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      count: emotions.length,
      emotions,
    });
  } catch (error) {
    console.error('Error fetching emotions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emotions',
      error: error.message,
    });
  }
});

// Get emotions for a participant
router.get('/participant/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;

    const emotions = await Emotion.find({ participantId })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      count: emotions.length,
      emotions,
    });
  } catch (error) {
    console.error('Error fetching emotions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emotions',
      error: error.message,
    });
  }
});

module.exports = router;
