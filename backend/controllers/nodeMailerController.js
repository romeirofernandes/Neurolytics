const nodemailer = require('nodemailer');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Create a transporter using your SMTP settings
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Generate chart images
const generateChartImage = async (chartConfig) => {
  const width = 800;
  const height = 400;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  
  return await chartJSNodeCanvas.renderToBuffer(chartConfig);
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

    // Sample data if not provided
    const participants = participantData || [
      { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', avgPumps: 28.4, totalEarnings: 2450, explosions: 8, riskScore: 'Moderate' },
      { id: 'P002', age: 30, gender: 'Male', education: "Master's", city: 'Bangalore, Karnataka', avgPumps: 35.2, totalEarnings: 2890, explosions: 12, riskScore: 'High' },
      { id: 'P003', age: 27, gender: 'Male', education: "Bachelor's", city: 'Delhi, Delhi', avgPumps: 22.1, totalEarnings: 2180, explosions: 5, riskScore: 'Conservative' },
      { id: 'P004', age: 25, gender: 'Female', education: "Master's", city: 'Pune, Maharashtra', avgPumps: 31.5, totalEarnings: 2720, explosions: 10, riskScore: 'Moderate-High' },
      { id: 'P005', age: 29, gender: 'Male', education: 'PhD', city: 'Chennai, Tamil Nadu', avgPumps: 26.8, totalEarnings: 2530, explosions: 7, riskScore: 'Moderate' },
    ];

    const avgPumps = (participants.reduce((sum, p) => sum + p.avgPumps, 0) / participants.length).toFixed(1);
    const avgEarnings = Math.round(participants.reduce((sum, p) => sum + p.totalEarnings, 0) / participants.length);

    // Generate chart 1: Average Pumps by Participant
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
          title: {
            display: true,
            text: 'Risk-Taking by Participant',
            font: { size: 20, weight: 'bold' },
            color: '#1e3a8a'
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Average Pumps per Balloon',
              font: { size: 14 }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Participant ID',
              font: { size: 14 }
            }
          }
        }
      }
    };

    // Generate chart 2: Total Earnings Distribution
    const chart2Config = {
      type: 'bar',
      data: {
        labels: participants.map(p => p.id),
        datasets: [{
          label: 'Total Earnings (₹)',
          data: participants.map(p => p.totalEarnings),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Total Earnings Distribution',
            font: { size: 20, weight: 'bold' },
            color: '#065f46'
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Earnings (₹)',
              font: { size: 14 }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Participant ID',
              font: { size: 14 }
            }
          }
        }
      }
    };

    console.log('📊 Generating chart images...');
    const chart1Image = await generateChartImage(chart1Config);
    const chart2Image = await generateChartImage(chart2Config);

    // Create HTML email template
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BART Analytics Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
        }
        .email-container {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 36px;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
        .header p {
            font-size: 18px;
            opacity: 0.95;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8fafc;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            border-left: 4px solid #667eea;
            transition: transform 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-label {
            font-size: 13px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .content {
            padding: 40px 30px;
        }
        .section-title {
            font-size: 24px;
            color: #1e293b;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            font-weight: bold;
        }
        .chart-container {
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 15px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .chart-container img {
            width: 100%;
            height: auto;
            border-radius: 10px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .data-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .data-table th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .data-table td {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            color: #334155;
        }
        .data-table tbody tr:hover {
            background-color: #f1f5f9;
        }
        .data-table tbody tr:last-child td {
            border-bottom: none;
        }
        .risk-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
        .risk-conservative {
            background: #dcfce7;
            color: #166534;
        }
        .risk-moderate {
            background: #dbeafe;
            color: #1e40af;
        }
        .risk-moderate-high {
            background: #fef3c7;
            color: #92400e;
        }
        .risk-high {
            background: #fee2e2;
            color: #991b1b;
        }
        .insights {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            padding: 25px;
            border-radius: 15px;
            margin: 30px 0;
            border-left: 5px solid #667eea;
        }
        .insights h3 {
            color: #1e3a8a;
            margin-bottom: 15px;
            font-size: 20px;
        }
        .insights ul {
            list-style: none;
            padding: 0;
        }
        .insights li {
            padding: 10px 0;
            color: #334155;
            line-height: 1.6;
            position: relative;
            padding-left: 25px;
        }
        .insights li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            background: #1e293b;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .footer a {
            color: #93c5fd;
            text-decoration: none;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 35px;
            border-radius: 30px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>🎈 BART Analytics Report</h1>
            <p>Balloon Analogue Risk Task</p>
            <p style="font-size: 14px; margin-top: 10px; opacity: 0.8;">Generated on ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Participants</div>
                <div class="stat-value">${participants.length}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg Pumps</div>
                <div class="stat-value">${avgPumps}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Avg Earnings</div>
                <div class="stat-value">₹${avgEarnings}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Risk Profile</div>
                <div class="stat-value" style="font-size: 20px;">Moderate</div>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Chart 1 -->
            <h2 class="section-title">📊 Risk-Taking Analysis</h2>
            <div class="chart-container">
                <img src="cid:chart1" alt="Average Pumps by Participant" />
            </div>

            <!-- Chart 2 -->
            <h2 class="section-title">💰 Earnings Distribution</h2>
            <div class="chart-container">
                <img src="cid:chart2" alt="Total Earnings Distribution" />
            </div>

            <!-- Participant Data Table -->
            <h2 class="section-title">👥 Detailed Participant Data</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Education</th>
                        <th>City</th>
                        <th>Avg Pumps</th>
                        <th>Earnings</th>
                        <th>Explosions</th>
                        <th>Risk Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${participants.map(p => `
                        <tr>
                            <td><strong>${p.id}</strong></td>
                            <td>${p.age}</td>
                            <td>${p.gender}</td>
                            <td>${p.education}</td>
                            <td>${p.city}</td>
                            <td><strong>${p.avgPumps}</strong></td>
                            <td style="color: #059669; font-weight: 600;">₹${p.totalEarnings}</td>
                            <td style="color: #dc2626; font-weight: 600;">${p.explosions}</td>
                            <td>
                                <span class="risk-badge risk-${p.riskScore.toLowerCase().replace(' ', '-').replace('-', '')}">
                                    ${p.riskScore}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <!-- Key Insights -->
            <div class="insights">
                <h3>🔍 Key Insights</h3>
                <ul>
                    <li>Risk-taking behavior shows moderate variation across participants</li>
                    <li>Average pumps per balloon ranges from ${Math.min(...participants.map(p => p.avgPumps)).toFixed(1)} (conservative) to ${Math.max(...participants.map(p => p.avgPumps)).toFixed(1)} (high risk)</li>
                    <li>Total earnings correlate positively with risk-taking propensity</li>
                    <li>Participants with higher education tend to show more strategic risk-taking</li>
                    <li>Risk progression remains relatively stable across trial blocks</li>
                    <li>Explosion rate indicates balanced decision-making strategy</li>
                </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="cta-button">View Full Dashboard</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="font-size: 18px; margin-bottom: 10px;"><strong>${experimentName}</strong></p>
            <p>This report was automatically generated by BnB Analytics System</p>
            <p style="margin-top: 15px; font-size: 12px;">
                Questions? Contact us at <a href="mailto:support@bnbresearch.com">support@bnbresearch.com</a>
            </p>
            <p style="margin-top: 20px; font-size: 11px; opacity: 0.7;">
                © ${new Date().getFullYear()} BnB Research Platform. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;

    // Create transporter
    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: {
        name: 'BnB Analytics System',
        address: process.env.FROM_EMAIL || process.env.SMTP_USER
      },
      to: userEmail,
      subject: `📊 ${experimentName} - Analytics Report Ready!`,
      html: htmlTemplate,
      attachments: [
        {
          filename: 'chart1.png',
          content: chart1Image,
          cid: 'chart1'
        },
        {
          filename: 'chart2.png',
          content: chart2Image,
          cid: 'chart2'
        }
      ]
    };

    console.log(`📧 Sending email to ${userEmail}...`);
    
    // Send email
    await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');

    res.status(200).json({
      success: true,
      message: 'Analytics email sent successfully',
      recipient: userEmail
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send analytics email',
      error: error.message
    });
  }
};

// Send notification to all users
const sendAnalyticsToAllUsers = async (req, res) => {
  try {
    const User = require('../models/User');
    const { participantData, experimentName } = req.body;

    // Get all users
    const users = await User.find({}, 'email name');
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found'
      });
    }

    console.log(`📧 Sending analytics to ${users.length} users...`);

    const results = [];
    
    for (const user of users) {
      try {
        // Call the single email function for each user
        await new Promise((resolve, reject) => {
          const mockReq = {
            body: {
              userEmail: user.email,
              participantData,
              experimentName
            }
          };
          
          const mockRes = {
            status: (code) => ({
              json: (data) => {
                if (code === 200) {
                  resolve(data);
                } else {
                  reject(data);
                }
              }
            })
          };
          
          sendBARTAnalyticsEmail(mockReq, mockRes);
        });

        results.push({
          email: user.email,
          status: 'sent',
          name: user.name
        });
      } catch (error) {
        results.push({
          email: user.email,
          status: 'failed',
          error: error.message
        });
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
    console.error('❌ Bulk email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk emails',
      error: error.message
    });
  }
};

// Initialize automatic email sending every 10 minutes
const initializeAutoEmailScheduler = () => {
  // Schedule task to run every 10 minutes
  // Cron format: */10 * * * * = every 10 minutes
  const task = cron.schedule('*/10 * * * *', async () => {
    console.log('\n⏰ AUTO-SEND: Scheduled email task running...');
    console.log(`📅 Time: ${new Date().toLocaleString()}`);
    
    try {
      const User = require('../models/User');
      
      // Get all users
      const users = await User.find({}, 'email name');
      
      if (!users || users.length === 0) {
        console.log('⚠️ No users found in database');
        return;
      }

      console.log(`👥 Found ${users.length} users. Sending analytics...`);

      // Sample participant data - you can modify this or fetch from database
      const participantData = [
        { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', avgPumps: 28.4, totalEarnings: 2450, explosions: 8, riskScore: 'Moderate' },
        { id: 'P002', age: 30, gender: 'Male', education: "Master's", city: 'Bangalore, Karnataka', avgPumps: 35.2, totalEarnings: 2890, explosions: 12, riskScore: 'High' },
        { id: 'P003', age: 27, gender: 'Male', education: "Bachelor's", city: 'Delhi, Delhi', avgPumps: 22.1, totalEarnings: 2180, explosions: 5, riskScore: 'Conservative' },
        { id: 'P004', age: 25, gender: 'Female', education: "Master's", city: 'Pune, Maharashtra', avgPumps: 31.5, totalEarnings: 2720, explosions: 10, riskScore: 'Moderate-High' },
        { id: 'P005', age: 29, gender: 'Male', education: 'PhD', city: 'Chennai, Tamil Nadu', avgPumps: 26.8, totalEarnings: 2530, explosions: 7, riskScore: 'Moderate' },
      ];

      let successCount = 0;
      let failCount = 0;

      // Send to each user
      for (const user of users) {
        try {
          await new Promise((resolve, reject) => {
            const mockReq = {
              body: {
                userEmail: user.email,
                participantData,
                experimentName: `BART Analytics - ${new Date().toLocaleDateString()}`
              }
            };
            
            const mockRes = {
              status: (code) => ({
                json: (data) => {
                  if (code === 200) {
                    resolve(data);
                  } else {
                    reject(data);
                  }
                }
              })
            };
            
            sendBARTAnalyticsEmail(mockReq, mockRes);
          });

          successCount++;
          console.log(`✅ Sent to ${user.email}`);
        } catch (error) {
          failCount++;
          console.log(`❌ Failed to send to ${user.email}: ${error.message}`);
        }

        // Small delay between emails to avoid rate limiting
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

// Manual trigger for auto-send (useful for testing)
const triggerAutoSend = async (req, res) => {
  try {
    const User = require('../models/User');
    
    const users = await User.find({}, 'email name');
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found'
      });
    }

    console.log(`📧 Manual trigger: Sending to ${users.length} users...`);

    const participantData = [
      { id: 'P001', age: 24, gender: 'Female', education: "Bachelor's", city: 'Mumbai, Maharashtra', avgPumps: 28.4, totalEarnings: 2450, explosions: 8, riskScore: 'Moderate' },
      { id: 'P002', age: 30, gender: 'Male', education: "Master's", city: 'Bangalore, Karnataka', avgPumps: 35.2, totalEarnings: 2890, explosions: 12, riskScore: 'High' },
      { id: 'P003', age: 27, gender: 'Male', education: "Bachelor's", city: 'Delhi, Delhi', avgPumps: 22.1, totalEarnings: 2180, explosions: 5, riskScore: 'Conservative' },
      { id: 'P004', age: 25, gender: 'Female', education: "Master's", city: 'Pune, Maharashtra', avgPumps: 31.5, totalEarnings: 2720, explosions: 10, riskScore: 'Moderate-High' },
      { id: 'P005', age: 29, gender: 'Male', education: 'PhD', city: 'Chennai, Tamil Nadu', avgPumps: 26.8, totalEarnings: 2530, explosions: 7, riskScore: 'Moderate' },
    ];

    const results = [];
    
    for (const user of users) {
      try {
        await new Promise((resolve, reject) => {
          const mockReq = {
            body: {
              userEmail: user.email,
              participantData,
              experimentName: `BART Analytics - Manual Trigger`
            }
          };
          
          const mockRes = {
            status: (code) => ({
              json: (data) => {
                if (code === 200) {
                  resolve(data);
                } else {
                  reject(data);
                }
              }
            })
          };
          
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

    res.status(200).json({
      success: true,
      message: `Manual send complete: ${successCount} sent, ${failCount} failed`,
      totalUsers: users.length,
      successCount,
      failCount,
      results
    });

  } catch (error) {
    console.error('❌ Manual trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger manual send',
      error: error.message
    });
  }
};

module.exports = {
  sendBARTAnalyticsEmail,
  sendAnalyticsToAllUsers,
  initializeAutoEmailScheduler,
  triggerAutoSend
};
