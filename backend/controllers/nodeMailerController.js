const nodemailer = require('nodemailer');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const PDFDocument = require('pdfkit');
const cron = require('node-cron');

// Create a transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate chart image
const generateChartImage = async (chartConfig) => {
  const width = 800;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  return await chartJSNodeCanvas.renderToBuffer(chartConfig);
};

// Generate PDF with charts
const generateAnalyticsPDF = async (participants) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.rect(0, 0, 612, 120).fill('#667eea');
      doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold')
         .text('🎈 BART Analytics Report', 50, 40, { align: 'center' });
      doc.fontSize(14).fillColor('#f0f0f0').font('Helvetica')
         .text('Your Experiment Participation Results Are Ready!', 50, 75, { align: 'center' });
      doc.fontSize(10).fillColor('#e0e0e0')
         .text(`Generated on ${new Date().toLocaleDateString('en-IN', { 
           weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
         })}`, 50, 95, { align: 'center' });

      let yPos = 150;

      // Summary Statistics
      doc.fontSize(16).fillColor('#1e3a8a').font('Helvetica-Bold')
         .text('📊 Summary Statistics', 50, yPos);
      yPos += 30;
      
      const avgPumps = (participants.reduce((sum, p) => sum + p.avgPumps, 0) / participants.length).toFixed(1);
      
      doc.fontSize(11).fillColor('#374151').font('Helvetica');
      doc.text(`Total Participants: ${participants.length}`, 70, yPos);
      yPos += 20;
      doc.text(`Average Pumps per Balloon: ${avgPumps}`, 70, yPos);
      yPos += 20;
      doc.text(`Overall Risk Profile: Moderate`, 70, yPos);
      yPos += 40;

      // Chart 1
      const chart1Config = {
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
            title: { display: true, text: 'Risk-Taking by Participant', font: { size: 18, weight: 'bold' }, color: '#1e3a8a' },
            legend: { display: true, position: 'top' }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Average Pumps', font: { size: 12 } } },
            x: { title: { display: true, text: 'Participant ID', font: { size: 12 } } }
          }
        }
      };

      doc.fontSize(14).fillColor('#1e3a8a').font('Helvetica-Bold')
         .text('📈 Risk-Taking Analysis', 50, yPos);
      yPos += 20;

      const chart1Image = await generateChartImage(chart1Config);
      doc.image(chart1Image, 50, yPos, { width: 500, height: 250 });
      yPos += 270;

      // New page for Chart 2
      doc.addPage();
      yPos = 50;

      // Chart 2
      const chart2Config = {
        type: 'bar',
        data: {
          labels: participants.map(p => p.id),
          datasets: [{
            label: 'Explosions',
            data: participants.map(p => p.explosions),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2
          }]
        },
        options: {
          plugins: {
            title: { display: true, text: 'Balloon Explosions by Participant', font: { size: 18, weight: 'bold' }, color: '#991b1b' },
            legend: { display: true, position: 'top' }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Number of Explosions', font: { size: 12 } } },
            x: { title: { display: true, text: 'Participant ID', font: { size: 12 } } }
          }
        }
      };

      doc.fontSize(14).fillColor('#991b1b').font('Helvetica-Bold')
         .text('💥 Explosion Analysis', 50, yPos);
      yPos += 20;

      const chart2Image = await generateChartImage(chart2Config);
      doc.image(chart2Image, 50, yPos, { width: 500, height: 250 });
      yPos += 270;

      // Participant Data Table
      doc.fontSize(14).fillColor('#1e3a8a').font('Helvetica-Bold')
         .text('👥 Detailed Participant Data', 50, yPos);
      yPos += 25;

      // Table Header
      doc.fontSize(9).fillColor('#ffffff').font('Helvetica-Bold');
      doc.rect(50, yPos, 500, 20).fill('#667eea');
      doc.text('ID', 60, yPos + 5, { width: 40 });
      doc.text('Age', 100, yPos + 5, { width: 40 });
      doc.text('Gender', 140, yPos + 5, { width: 50 });
      doc.text('Education', 190, yPos + 5, { width: 80 });
      doc.text('Avg Pumps', 270, yPos + 5, { width: 60 });
      doc.text('Explosions', 330, yPos + 5, { width: 60 });
      doc.text('Risk Score', 390, yPos + 5, { width: 100 });
      yPos += 20;

      // Table Rows
      doc.fontSize(8).fillColor('#374151').font('Helvetica');
      participants.forEach((p, index) => {
        const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff';
        doc.rect(50, yPos, 500, 18).fill(bgColor);
        
        doc.fillColor('#374151');
        doc.text(p.id, 60, yPos + 4, { width: 40 });
        doc.text(p.age.toString(), 100, yPos + 4, { width: 40 });
        doc.text(p.gender, 140, yPos + 4, { width: 50 });
        doc.text(p.education, 190, yPos + 4, { width: 80 });
        doc.text(p.avgPumps.toString(), 270, yPos + 4, { width: 60 });
        doc.text(p.explosions.toString(), 330, yPos + 4, { width: 60 });
        doc.text(p.riskScore, 390, yPos + 4, { width: 100 });
        yPos += 18;

        if (yPos > 750) {
          doc.addPage();
          yPos = 50;
        }
      });

      // Key Insights
      yPos += 30;
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.fontSize(14).fillColor('#1e3a8a').font('Helvetica-Bold')
         .text('🔍 Key Insights', 50, yPos);
      yPos += 25;

      doc.fontSize(10).fillColor('#374151').font('Helvetica');
      const insights = [
        '• Risk-taking behavior shows moderate variation across participants',
        `• Average pumps per balloon ranges from ${Math.min(...participants.map(p => p.avgPumps)).toFixed(1)} (conservative) to ${Math.max(...participants.map(p => p.avgPumps)).toFixed(1)} (high risk)`,
        '• Participants with higher education tend to show more strategic risk-taking',
        '• Risk progression remains relatively stable across trial blocks',
        '• Balanced decision-making strategy observed across the group'
      ];

      insights.forEach(insight => {
        doc.text(insight, 70, yPos, { width: 470 });
        yPos += 18;
      });

      // Footer
      yPos = 750;
      doc.fontSize(8).fillColor('#6b7280').font('Helvetica')
         .text('© 2025 BnB Research Platform. All rights reserved.', 50, yPos, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Send BART Analytics Email
const sendBARTAnalyticsEmail = async (req, res) => {
  try {
    const { userEmail, participantData, experimentName = 'BART Experiment' } = req.body;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email is required'
      });
    }

    const participants = participantData || [
      { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai', avgPumps: 28.4, explosions: 8, riskScore: 'Moderate' },
      { id: 'P002', age: 30, gender: 'Male', education: "Master's", city: 'Bangalore', avgPumps: 35.2, explosions: 12, riskScore: 'High' },
      { id: 'P003', age: 27, gender: 'Male', education: "Bachelor's", city: 'Delhi', avgPumps: 22.1, explosions: 5, riskScore: 'Conservative' },
      { id: 'P004', age: 25, gender: 'Female', education: "Master's", city: 'Pune', avgPumps: 31.5, explosions: 10, riskScore: 'Moderate-High' },
      { id: 'P005', age: 29, gender: 'Male', education: 'PhD', city: 'Chennai', avgPumps: 26.8, explosions: 7, riskScore: 'Moderate' },
    ];

    console.log('📊 Generating PDF with analytics...');
    const pdfBuffer = await generateAnalyticsPDF(participants);

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; margin: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center; color: white; }
        .header h1 { margin: 0 0 15px 0; font-size: 32px; font-weight: bold; }
        .header p { margin: 5px 0; font-size: 16px; opacity: 0.95; }
        .content { padding: 40px 30px; }
        .message { background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); padding: 30px; border-radius: 15px; margin: 20px 0; border-left: 5px solid #667eea; }
        .message h2 { color: #1e3a8a; margin: 0 0 15px 0; font-size: 22px; }
        .message p { color: #374151; line-height: 1.6; margin: 10px 0; font-size: 15px; }
        .highlight { background: white; padding: 15px 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
        .highlight strong { color: #667eea; font-size: 18px; }
        .attachment-notice { background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0; }
        .attachment-notice .icon { font-size: 48px; margin-bottom: 10px; }
        .attachment-notice p { color: #92400e; font-weight: 600; margin: 5px 0; font-size: 16px; }
        .footer { background: #1e293b; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; opacity: 0.9; font-size: 14px; }
        ul { color: #374151; line-height: 1.8; margin: 15px 0; }
        li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Congratulations!</h1>
            <p style="font-size: 20px; margin-top: 15px;">Your Experiment Participation is Complete</p>
            <p style="font-size: 15px; margin-top: 10px;">Your Analytics Results Are Ready!</p>
        </div>
        <div class="content">
            <div class="message">
                <h2>✨ ${experimentName} - Results Ready</h2>
                <p>We're excited to share that your participation data has been successfully processed and analyzed!</p>
                <p>Your comprehensive analytics report includes:</p>
                <ul>
                    <li>📊 Detailed performance charts and visualizations</li>
                    <li>📈 Risk-taking behavior analysis</li>
                    <li>👥 Comparative participant data</li>
                    <li>🔍 Key insights and findings</li>
                    <li>📋 Complete statistical breakdown</li>
                </ul>
            </div>
            <div class="attachment-notice">
                <div class="icon">📎</div>
                <p>Your Complete Analytics Report is Attached</p>
                <p style="font-size: 14px; font-weight: normal; margin-top: 10px;">Check the PDF attachment: <strong>BART-Analytics-Report.pdf</strong></p>
            </div>
            <div class="highlight">
                <p style="margin: 0; color: #374151;"><strong>📅 Report Generated:</strong> ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="highlight">
                <p style="margin: 0; color: #374151;"><strong>👥 Total Participants:</strong> ${participants.length}</p>
            </div>
            <div class="message" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left-color: #10b981;">
                <h2 style="color: #065f46;">💡 What's Next?</h2>
                <p>Review your detailed analytics PDF to understand your performance patterns and compare your results with other participants.</p>
                <p>Thank you for your valuable participation in our research!</p>
            </div>
        </div>
        <div class="footer">
            <p style="font-size: 16px; font-weight: bold;">BnB Research Platform</p>
            <p style="margin-top: 15px;">Questions? Contact us at support@bnbresearch.com</p>
            <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">© ${new Date().getFullYear()} BnB Research Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const transporter = createTransporter();
    const mailOptions = {
      from: { name: 'BnB Research Platform', address: process.env.FROM_EMAIL || process.env.SMTP_USER },
      to: userEmail,
      subject: `🎉 Your ${experimentName} Results Are Ready - Analytics Inside!`,
      html: htmlTemplate,
      attachments: [{ filename: 'BART-Analytics-Report.pdf', content: pdfBuffer, contentType: 'application/pdf' }]
    };

    console.log(`📧 Sending email to ${userEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');

    res.status(200).json({ success: true, message: 'Analytics email sent successfully', recipient: userEmail });
  } catch (error) {
    console.error('❌ Email sending error:', error);
    res.status(500).json({ success: false, message: 'Failed to send analytics email', error: error.message });
  }
};

// Send to all users
const sendAnalyticsToAllUsers = async (req, res) => {
  try {
    const User = require('../models/User');
    const { participantData, experimentName } = req.body;
    const users = await User.find({}, 'email name');
    
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }

    console.log(`📧 Sending analytics to ${users.length} users...`);
    const results = [];
    
    for (const user of users) {
      try {
        await new Promise((resolve, reject) => {
          const mockReq = { body: { userEmail: user.email, participantData, experimentName } };
          const mockRes = {
            status: (code) => ({ json: (data) => { if (code === 200) resolve(data); else reject(data); } })
          };
          sendBARTAnalyticsEmail(mockReq, mockRes);
        });
        results.push({ email: user.email, status: 'sent', name: user.name });
      } catch (error) {
        results.push({ email: user.email, status: 'failed', error: error.message });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failCount = results.filter(r => r.status === 'failed').length;
    res.status(200).json({ success: true, message: `Sent to ${successCount} users, ${failCount} failed`, totalUsers: users.length, successCount, failCount, results });
  } catch (error) {
    console.error('❌ Bulk email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send bulk emails', error: error.message });
  }
};

// Auto-scheduler
const initializeAutoEmailScheduler = () => {
  const task = cron.schedule('*/10 * * * *', async () => {
    console.log('\n⏰ AUTO-SEND: Scheduled email task running...');
    console.log(`📅 Time: ${new Date().toLocaleString()}`);
    
    try {
      const User = require('../models/User');
      const users = await User.find({}, 'email name');
      
      if (!users || users.length === 0) {
        console.log('⚠️ No users found in database');
        return;
      }

      console.log(`👥 Found ${users.length} users. Sending analytics...`);

      const participantData = [
        { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai', avgPumps: 28.4, explosions: 8, riskScore: 'Moderate' },
        { id: 'P002', age: 30, gender: 'Male', education: "Master's", city: 'Bangalore', avgPumps: 35.2, explosions: 12, riskScore: 'High' },
        { id: 'P003', age: 27, gender: 'Male', education: "Bachelor's", city: 'Delhi', avgPumps: 22.1, explosions: 5, riskScore: 'Conservative' },
        { id: 'P004', age: 25, gender: 'Female', education: "Master's", city: 'Pune', avgPumps: 31.5, explosions: 10, riskScore: 'Moderate-High' },
        { id: 'P005', age: 29, gender: 'Male', education: 'PhD', city: 'Chennai', avgPumps: 26.8, explosions: 7, riskScore: 'Moderate' },
      ];

      let successCount = 0, failCount = 0;

      for (const user of users) {
        try {
          await new Promise((resolve, reject) => {
            const mockReq = { body: { userEmail: user.email, participantData, experimentName: `BART Analytics - ${new Date().toLocaleDateString()}` } };
            const mockRes = { status: (code) => ({ json: (data) => { if (code === 200) resolve(data); else reject(data); } }) };
            sendBARTAnalyticsEmail(mockReq, mockRes);
          });
          successCount++;
          console.log(`✅ Sent to ${user.email}`);
        } catch (error) {
          failCount++;
          console.log(`❌ Failed to send to ${user.email}: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`\n📊 AUTO-SEND COMPLETE:`);
      console.log(`   ✅ Success: ${successCount}`);
      console.log(`   ❌ Failed: ${failCount}`);
      console.log(`   📧 Total: ${users.length}`);
      console.log(`⏰ Next scheduled run in 10 minutes...\n`);
    } catch (error) {
      console.error('❌ Auto-send scheduler error:', error);
    }
  });

  console.log('\n✅ Email scheduler initialized!');
  console.log('⏰ Emails will be sent automatically every 10 minutes');
  console.log('📧 Next run at:', new Date(Date.now() + 10 * 60 * 1000).toLocaleString());
  return task;
};

// Manual trigger
const triggerAutoSend = async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find({}, 'email name');
    
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found' });
    }

    console.log(`📧 Manual trigger: Sending to ${users.length} users...`);

    const participantData = [
      { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai', avgPumps: 28.4, explosions: 8, riskScore: 'Moderate' },
      { id: 'P002', age: 30, gender: 'Male', education: "Master's", city: 'Bangalore', avgPumps: 35.2, explosions: 12, riskScore: 'High' },
      { id: 'P003', age: 27, gender: 'Male', education: "Bachelor's", city: 'Delhi', avgPumps: 22.1, explosions: 5, riskScore: 'Conservative' },
      { id: 'P004', age: 25, gender: 'Female', education: "Master's", city: 'Pune', avgPumps: 31.5, explosions: 10, riskScore: 'Moderate-High' },
      { id: 'P005', age: 29, gender: 'Male', education: 'PhD', city: 'Chennai', avgPumps: 26.8, explosions: 7, riskScore: 'Moderate' },
    ];

    const results = [];
    
    for (const user of users) {
      try {
        await new Promise((resolve, reject) => {
          const mockReq = { body: { userEmail: user.email, participantData, experimentName: `BART Analytics - Manual Trigger` } };
          const mockRes = { status: (code) => ({ json: (data) => { if (code === 200) resolve(data); else reject(data); } }) };
          sendBARTAnalyticsEmail(mockReq, mockRes);
        });
        results.push({ email: user.email, status: 'sent', name: user.name });
      } catch (error) {
        results.push({ email: user.email, status: 'failed', error: error.message });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failCount = results.filter(r => r.status === 'failed').length;
    res.status(200).json({ success: true, message: `Manual send complete: ${successCount} sent, ${failCount} failed`, totalUsers: users.length, successCount, failCount, results });
  } catch (error) {
    console.error('❌ Manual trigger error:', error);
    res.status(500).json({ success: false, message: 'Failed to trigger manual send', error: error.message });
  }
};

module.exports = { sendBARTAnalyticsEmail, sendAnalyticsToAllUsers, initializeAutoEmailScheduler, triggerAutoSend };
