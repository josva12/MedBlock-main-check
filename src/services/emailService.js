const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Use environment variables for email configuration
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      // Verify connection
      await this.transporter.verify();
      logger.info('EMAIL_SERVICE_INITIALIZED', { host: process.env.EMAIL_HOST });
    } catch (error) {
      logger.error('EMAIL_SERVICE_INITIALIZATION_FAILED', { error: error.message });
      // Fallback to console logging for development
      this.transporter = {
        sendMail: async (options) => {
          console.log('📧 EMAIL (Development Mode):', {
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
          });
          return { messageId: 'dev-' + Date.now() };
        }
      };
    }
  }

  async sendMFAEmail(email, code, userName, purpose = 'login') {
    const subject = this.getMFAEmailSubject(purpose);
    const html = this.generateMFAEmailHTML(code, userName, purpose);
    const text = this.generateMFAEmailText(code, userName, purpose);

    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@medblock.com',
        to: email,
        subject,
        text,
        html
      });

      logger.info('MFA_EMAIL_SENT', { 
        email, 
        purpose, 
        messageId: result.messageId 
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('MFA_EMAIL_SEND_FAILED', { 
        email, 
        purpose, 
        error: error.message 
      });
      throw new Error('Failed to send MFA email');
    }
  }

  getMFAEmailSubject(purpose) {
    const subjects = {
      login: 'Your MedBlock Login Code',
      password_reset: 'Your MedBlock Password Reset Code',
      account_verification: 'Your MedBlock Account Verification Code',
      settings_change: 'Your MedBlock Settings Change Code'
    };
    return subjects[purpose] || 'Your MedBlock Security Code';
  }

  generateMFAEmailHTML(code, userName, purpose) {
    const purposes = {
      login: 'login to your account',
      password_reset: 'reset your password',
      account_verification: 'verify your account',
      settings_change: 'change your account settings'
    };

    const actionText = purposes[purpose] || 'complete this action';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MedBlock Security Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .code { background: #1e293b; color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 8px; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 MedBlock Security</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to ${actionText}. Use the following security code to complete this action:</p>
            
            <div class="code">${code}</div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This code will expire in 10 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The MedBlock Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 MedBlock. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateMFAEmailText(code, userName, purpose) {
    const purposes = {
      login: 'login to your account',
      password_reset: 'reset your password',
      account_verification: 'verify your account',
      settings_change: 'change your account settings'
    };

    const actionText = purposes[purpose] || 'complete this action';

    return `
MedBlock Security Code

Hello ${userName},

We received a request to ${actionText}. Use the following security code to complete this action:

${code}

⚠️ SECURITY NOTICE:
- This code will expire in 10 minutes
- Never share this code with anyone
- If you didn't request this code, please ignore this email

If you have any questions, please contact our support team.

Best regards,
The MedBlock Team

---
This is an automated message. Please do not reply to this email.
© 2024 MedBlock. All rights reserved.
    `;
  }

  async sendWelcomeEmail(email, userName) {
    const subject = 'Welcome to MedBlock!';
    const html = this.generateWelcomeEmailHTML(userName);
    const text = this.generateWelcomeEmailText(userName);

    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@medblock.com',
        to: email,
        subject,
        text,
        html
      });

      logger.info('WELCOME_EMAIL_SENT', { email, messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('WELCOME_EMAIL_SEND_FAILED', { email, error: error.message });
      throw new Error('Failed to send welcome email');
    }
  }

  generateWelcomeEmailHTML(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MedBlock</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Welcome to MedBlock</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Welcome to MedBlock! We're excited to have you on board.</p>
            
            <p>MedBlock is a comprehensive healthcare management platform that provides:</p>
            <ul>
              <li>Secure patient record management</li>
              <li>Appointment scheduling and management</li>
              <li>Real-time communication tools</li>
              <li>Advanced analytics and reporting</li>
              <li>Multi-factor authentication for security</li>
            </ul>
            
            <p>Your account has been successfully created and is ready to use.</p>
            
            <p>Best regards,<br>The MedBlock Team</p>
          </div>
          <div class="footer">
            <p>© 2024 MedBlock. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateWelcomeEmailText(userName) {
    return `
Welcome to MedBlock!

Hello ${userName},

Welcome to MedBlock! We're excited to have you on board.

MedBlock is a comprehensive healthcare management platform that provides:
- Secure patient record management
- Appointment scheduling and management
- Real-time communication tools
- Advanced analytics and reporting
- Multi-factor authentication for security

Your account has been successfully created and is ready to use.

Best regards,
The MedBlock Team

---
© 2024 MedBlock. All rights reserved.
    `;
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your MedBlock Password';
    const html = this.generatePasswordResetEmailHTML(resetUrl, userName);
    const text = this.generatePasswordResetEmailText(resetUrl, userName);

    try {
      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@medblock.com',
        to: email,
        subject,
        text,
        html
      });

      logger.info('PASSWORD_RESET_EMAIL_SENT', { email, messageId: result.messageId });
      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('PASSWORD_RESET_EMAIL_SEND_FAILED', { email, error: error.message });
      throw new Error('Failed to send password reset email');
    }
  }

  generatePasswordResetEmailHTML(resetUrl, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your MedBlock Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your MedBlock password. Click the button below to create a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
            
            <p>Best regards,<br>The MedBlock Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© 2024 MedBlock. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePasswordResetEmailText(resetUrl, userName) {
    return `
Password Reset Request

Hello ${userName},

We received a request to reset your MedBlock password. Click the link below to create a new password:

${resetUrl}

⚠️ SECURITY NOTICE:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

Best regards,
The MedBlock Team

---
This is an automated message. Please do not reply to this email.
© 2024 MedBlock. All rights reserved.
    `;
  }
}

module.exports = new EmailService(); 