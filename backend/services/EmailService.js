const nodemailer = require('nodemailer');
const env = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      const host = process.env.MAIL_HOST || env.MAIL?.host;
      const port = Number(process.env.MAIL_PORT || env.MAIL?.port || 587);
      const user = process.env.MAIL_USER || env.MAIL?.user;
      const pass = process.env.MAIL_PASSWORD || env.MAIL?.password;

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined
      });
    }
    return this.transporter;
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const from = process.env.MAIL_FROM || env.MAIL?.from || 'FinTrack <noreply@fintrack.app>';
      const transporter = this.getTransporter();

      const mailOptions = {
        from,
        to,
        subject,
        text,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully to ${to}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(to, userName = 'User') {
    const subject = 'Welcome to FinTrack';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FinTrack</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4f6f9;
      margin: 0;
      padding: 0;
      color: #1e293b;
    }
    .email-container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 32px 24px 32px;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .feature-box {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid #f1f5f9;
    }
    .feature-title {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
      font-size: 15px;
    }
    .feature-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .feature-item {
      font-size: 14px;
      color: #334155;
      padding: 6px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px 24px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">FinTrack</div>
    </div>
    <div class="content">
      <h1 class="greeting">Welcome to FinTrack!</h1>
      <p class="text">Hello ${userName},</p>
      <p class="text">Your account has been successfully created.</p>
      
      <div class="feature-box">
        <div class="feature-title">FinTrack helps you track:</div>
        <ul class="feature-list">
          <li class="feature-item">• Expenses</li>
          <li class="feature-item">• Income</li>
          <li class="feature-item">• Budgets</li>
          <li class="feature-item">• Savings goals</li>
          <li class="feature-item">• Subscriptions</li>
          <li class="feature-item">• Financial insights</li>
        </ul>
      </div>

      <p class="text">Start managing your finances with FinTrack.</p>
    </div>
    <div class="footer">
      &copy; FinTrack Expense Tracker. All rights reserved.
    </div>
  </div>
</body>
</html>
    `.trim();

    const text = `
Welcome to FinTrack!

Hello ${userName},

Your account has been successfully created.

FinTrack helps you track:
• Expenses
• Income
• Budgets
• Savings goals
• Subscriptions
• Financial insights

Start managing your finances with FinTrack.
    `.trim();

    return this.sendEmail({
      to,
      subject,
      html,
      text
    });
  }

  async sendPasswordResetEmail(to, resetToken) {
    const subject = 'FinTrack Password Reset Request';
    const text = `You requested a password reset. Reset token: ${resetToken}`;
    const html = `<p>You requested a password reset. Token: <strong>${resetToken}</strong></p>`;
    return this.sendEmail({ to, subject, html, text });
  }
}

module.exports = new EmailService();
