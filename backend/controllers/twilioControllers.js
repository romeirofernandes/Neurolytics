const twilio = require('twilio');
const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const cloudinary = require('cloudinary').v2;

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Cloudinary config (already configured in your app)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Generate chart image
const generateChartImage = async (chartConfig) => {
  const width = 800;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  return await chartJSNodeCanvas.renderToBuffer(chartConfig);
};

// Generate simple PDF
const generateSimplePDF = async (participants) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.rect(0, 0, 612, 100).fill('#667eea');
      doc.fontSize(24).fillColor('#ffffff').font('Helvetica-Bold')
         .text('BART Results', 50, 35, { align: 'center' });
      doc.fontSize(12).fillColor('#f0f0f0').font('Helvetica')
         .text(`Generated: ${new Date().toLocaleDateString()}`, 50, 70, { align: 'center' });

      let yPos = 130;

      // Summary
      doc.fontSize(14).fillColor('#1e3a8a').font('Helvetica-Bold')
         .text('Summary', 50, yPos);
      yPos += 25;
      
      const avgPumps = (participants.reduce((sum, p) => sum + p.avgPumps, 0) / participants.length).toFixed(1);
      
      doc.fontSize(10).fillColor('#374151').font('Helvetica');
      doc.text(`Total Participants: ${participants.length}`, 70, yPos);
      yPos += 18;
      doc.text(`Average Pumps: ${avgPumps}`, 70, yPos);
      yPos += 35;

      // Chart
      const chartConfig = {
        type: 'bar',
        data: {
          labels: participants.map(p => p.id),
          datasets: [{
            label: 'Average Pumps',
            data: participants.map(p => p.avgPumps),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: 'Risk Analysis', font: { size: 16, weight: 'bold' } },
            legend: { display: true }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Pumps' } },
            x: { title: { display: true, text: 'Participant' } }
          }
        }
      };

      doc.fontSize(12).fillColor('#1e3a8a').font('Helvetica-Bold')
         .text('Risk Analysis', 50, yPos);
      yPos += 15;

      const chartImage = await generateChartImage(chartConfig);
      doc.image(chartImage, 50, yPos, { width: 500, height: 250 });
      yPos += 270;

      // Participant Table
      doc.fontSize(12).fillColor('#1e3a8a').font('Helvetica-Bold')
         .text('Participant Data', 50, yPos);
      yPos += 20;

      doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold');
      doc.rect(50, yPos, 500, 18).fill('#667eea');
      doc.text('ID', 60, yPos + 4, { width: 60 });
      doc.text('Avg Pumps', 150, yPos + 4, { width: 80 });
      doc.text('Explosions', 260, yPos + 4, { width: 80 });
      doc.text('Risk', 370, yPos + 4, { width: 100 });
      yPos += 18;

      doc.fontSize(8).fillColor('#374151').font('Helvetica');
      participants.forEach((p, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(50, yPos, 500, 16).fill(bgColor);
        
        doc.fillColor('#374151');
        doc.text(p.id, 60, yPos + 3, { width: 60 });
        doc.text(p.avgPumps.toString(), 150, yPos + 3, { width: 80 });
        doc.text(p.explosions.toString(), 260, yPos + 3, { width: 80 });
        doc.text(p.riskScore, 370, yPos + 3, { width: 100 });
        yPos += 16;
      });

      // Footer
      yPos = 750;
      doc.fontSize(8).fillColor('#6b7280').font('Helvetica')
         .text('BnB Research Platform', 50, yPos, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Send WhatsApp message with PDF
const sendWhatsAppAnalytics = async (req, res) => {
  try {
    const { phoneNumber, participantData, experimentName = 'BART' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const participants = participantData || [
      { id: 'P001', avgPumps: 28.4, explosions: 8, riskScore: 'Moderate' },
      { id: 'P002', avgPumps: 35.2, explosions: 12, riskScore: 'High' },
      { id: 'P003', avgPumps: 22.1, explosions: 5, riskScore: 'Conservative' },
    ];

    console.log('Generating PDF...');
    const pdfBuffer = await generateSimplePDF(participants);

    // Upload PDF to Cloudinary
    console.log('Uploading PDF to Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'whatsapp-pdfs',
          public_id: `BART-${Date.now()}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(pdfBuffer);
    });

    const pdfUrl = uploadResult.secure_url;
    console.log('PDF uploaded:', pdfUrl);

    // Simple message
    const messageBody = `Your ${experimentName} results are ready!\n\nParticipants: ${participants.length}\nPDF: ${pdfUrl}`;

    console.log(`Sending WhatsApp to ${phoneNumber}...`);
    
    // Send message with media URL
    const message = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${phoneNumber}`,
      body: messageBody,
      mediaUrl: [pdfUrl]
    });

    console.log('Message sent successfully!');

    res.status(200).json({
      success: true,
      message: 'WhatsApp message sent successfully',
      recipient: phoneNumber,
      messageSid: message.sid,
      pdfUrl: pdfUrl
    });
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send WhatsApp message',
      error: error.message
    });
  }
};

// Send to multiple users
const sendWhatsAppToAll = async (req, res) => {
  try {
    const User = require('../models/User');
    const { participantData, experimentName } = req.body;
    
    // Get users with phone numbers
    const users = await User.find({ phone: { $exists: true, $ne: null } }, 'phone name');
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users with phone numbers found'
      });
    }

    console.log(`Sending WhatsApp to ${users.length} users...`);
    const results = [];
    
    for (const user of users) {
      try {
        await new Promise((resolve, reject) => {
          const mockReq = {
            body: {
              phoneNumber: user.phone,
              participantData,
              experimentName
            }
          };
          const mockRes = {
            status: (code) => ({
              json: (data) => {
                if (code === 200) resolve(data);
                else reject(data);
              }
            })
          };
          sendWhatsAppAnalytics(mockReq, mockRes);
        });
        results.push({ phone: user.phone, status: 'sent', name: user.name });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
      } catch (error) {
        results.push({ phone: user.phone, status: 'failed', error: error.message });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failCount = results.filter(r => r.status === 'failed').length;

    res.status(200).json({
      success: true,
      message: `Sent to ${successCount} users, ${failCount} failed`,
      totalUsers: users.length,
      successCount,
      failCount,
      results
    });
  } catch (error) {
    console.error('Bulk WhatsApp error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk WhatsApp messages',
      error: error.message
    });
  }
};

// Auto-scheduler for WhatsApp
const initializeAutoWhatsAppScheduler = () => {
  const cron = require('node-cron');
  
  // Hardcoded phone number
  const HARDCODED_PHONE = '+918097996263';
  
  // Function to send WhatsApp to hardcoded number
  const sendWhatsAppToAllUsers = async () => {
    console.log('\n⏰ AUTO-SEND: Scheduled WhatsApp task running...');
    console.log(`📅 Time: ${new Date().toLocaleString()}`);
    
    try {
      console.log(`👥 Sending WhatsApp to hardcoded number: ${HARDCODED_PHONE}`);

      const participantData = [
        { id: 'P001', avgPumps: 28.4, explosions: 8, riskScore: 'Moderate' },
        { id: 'P002', avgPumps: 35.2, explosions: 12, riskScore: 'High' },
        { id: 'P003', avgPumps: 22.1, explosions: 5, riskScore: 'Conservative' },
        { id: 'P004', avgPumps: 31.5, explosions: 10, riskScore: 'Moderate-High' },
        { id: 'P005', avgPumps: 26.8, explosions: 7, riskScore: 'Moderate' },
      ];

      try {
        await new Promise((resolve, reject) => {
          const mockReq = { 
            body: { 
              phoneNumber: HARDCODED_PHONE, 
              participantData, 
              experimentName: `BART - ${new Date().toLocaleDateString()}` 
            } 
          };
          const mockRes = { 
            status: (code) => ({ 
              json: (data) => { 
                if (code === 200) resolve(data); 
                else reject(data); 
              } 
            }) 
          };
          sendWhatsAppAnalytics(mockReq, mockRes);
        });
        console.log(`✅ Sent to ${HARDCODED_PHONE}`);
        console.log(`\n📊 AUTO-SEND COMPLETE: Success!`);
      } catch (error) {
        console.log(`❌ Failed to send to ${HARDCODED_PHONE}: ${error.message}`);
        console.log(`\n📊 AUTO-SEND COMPLETE: Failed`);
      }
      
      console.log(`⏰ Next scheduled run in 10 minutes...\n`);
    } catch (error) {
      console.error('❌ Auto-send WhatsApp scheduler error:', error);
    }
  };

  // Send WhatsApp immediately on server start
  console.log('\n🚀 Sending initial WhatsApp on server startup...');
  setTimeout(() => {
    sendWhatsAppToAllUsers();
  }, 3000); // Wait 3 seconds for MongoDB connection to be stable

  // Schedule to run every 10 minutes
  const task = cron.schedule('*/10 * * * *', sendWhatsAppToAllUsers);

  console.log('\n✅ WhatsApp scheduler initialized!');
  console.log('📱 Initial WhatsApp will be sent in 3 seconds...');
  console.log('⏰ Then WhatsApp will be sent automatically every 10 minutes');
  console.log('📱 Next scheduled run at:', new Date(Date.now() + 10 * 60 * 1000).toLocaleString());
  
  return task;
};

module.exports = {
  sendWhatsAppAnalytics,
  sendWhatsAppToAll,
  initializeAutoWhatsAppScheduler
};
