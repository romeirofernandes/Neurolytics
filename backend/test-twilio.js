require('dotenv').config();
const { sendWhatsAppAnalytics } = require('./controllers/twilioControllers');

// Test data
const testData = {
  body: {
    phoneNumber: '+918097996263', // Your phone number
    participantData: [
      { id: 'P001', avgPumps: 28.4, explosions: 8, riskScore: 'Moderate' },
      { id: 'P002', avgPumps: 35.2, explosions: 12, riskScore: 'High' },
      { id: 'P003', avgPumps: 22.1, explosions: 5, riskScore: 'Conservative' },
    ],
    experimentName: 'BART Test'
  }
};

const mockRes = {
  status: (code) => ({
    json: (data) => {
      console.log('Status:', code);
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  })
};

console.log('Testing Twilio WhatsApp...');
sendWhatsAppAnalytics(testData, mockRes);
