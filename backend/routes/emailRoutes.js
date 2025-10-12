const express = require('express');
const router = express.Router();
const { sendBARTAnalyticsEmail, sendAnalyticsToAllUsers, triggerAutoSend } = require('../controllers/nodeMailerController');

// Send analytics email to a single user
router.post('/send-analytics', sendBARTAnalyticsEmail);

// Send analytics email to all users
router.post('/send-analytics-all', sendAnalyticsToAllUsers);

// Manually trigger auto-send (sends to all users immediately)
router.post('/trigger-auto-send', triggerAutoSend);

module.exports = router;
