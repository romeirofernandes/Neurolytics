const express = require('express');
const router = express.Router();
const { sendWhatsAppAnalytics, sendWhatsAppToAll } = require('../controllers/twilioControllers');

// Send WhatsApp analytics to a single user
router.post('/send-whatsapp', sendWhatsAppAnalytics);

// Send WhatsApp analytics to all users
router.post('/send-whatsapp-all', sendWhatsAppToAll);

// Manually trigger auto-send (sends to all users immediately)
router.post('/trigger-auto-send', sendWhatsAppToAll);

module.exports = router;
