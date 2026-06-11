import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
      port: Number(process.env.MAIL_PORT ?? 587),
      secure: true, // true for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendProviderApproval(params: {
    to: string;
    ownerName: string;
    businessName: string;
    password: string;
    loginUrl: string;
  }): Promise<void> {
    const { to, ownerName, businessName, password, loginUrl } = params;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body        { font-family: Arial, sans-serif; background: #f5f7fb; margin: 0; padding: 0; }
          .wrapper    { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
          .header     { background: linear-gradient(135deg, #16a34a, #14532d); padding: 36px 32px; text-align: center; }
          .header h1  { color: #fff; margin: 0; font-size: 24px; }
          .header p   { color: #bbf7d0; margin: 6px 0 0; font-size: 14px; }
          .body       { padding: 32px; color: #374151; }
          .body h2    { font-size: 20px; margin: 0 0 8px; color: #111827; }
          .body p     { font-size: 14px; line-height: 1.7; margin: 0 0 16px; }
          .cred-box   { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 18px 22px; margin: 20px 0; }
          .cred-row   { display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 8px; }
          .cred-label { color: #6b7280; font-weight: 600; }
          .cred-value { color: #111827; font-weight: 700; font-family: monospace; }
          .warning    { background: #fef9c3; border-left: 4px solid #eab308; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #854d0e; margin: 20px 0; }
          .btn-wrap   { text-align: center; margin: 28px 0 8px; }
          .btn        { display: inline-block; background: #16a34a; color: #fff; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; }
          .footer     { text-align: center; padding: 20px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="wrapper">

          <div class="header">
            <h1>🌿 Organic Editorial</h1>
            <p>Smart Agricultural Marketplace</p>
          </div>

          <div class="body">
            <h2>Congratulations, ${ownerName}! 🎉</h2>
            <p>
              Your provider application for <strong>${businessName}</strong> has been
              <strong style="color:#16a34a;">approved</strong> by our staff team.
              You can now log in to your provider dashboard and start managing your products.
            </p>

            <div class="cred-box">
              <div class="cred-row">
                <span class="cred-label">Login Email</span>
                <span class="cred-value">${to}</span>
              </div>
              <div class="cred-row" style="margin-bottom:0">
                <span class="cred-label">Temporary Password</span>
                <span class="cred-value">${password}</span>
              </div>
            </div>

            <div class="warning">
              ⚠️ <strong>Please change your password immediately after your first login.</strong>
              This temporary password should not be kept for long-term use.
            </div>

            <div class="btn-wrap">
              <a href="${loginUrl}" class="btn">Login to Dashboard →</a>
            </div>

            <p style="font-size:13px; color:#6b7280; text-align:center;">
              If the button doesn't work, copy this link:<br/>
              <a href="${loginUrl}" style="color:#16a34a;">${loginUrl}</a>
            </p>
          </div>

          <div class="footer">
            © 2026 Digital Greenhouse System · You received this because you applied as a provider.
          </div>

        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ?? 'Organic Editorial <no-reply@example.com>',
        to,
        subject: 'Your Provider Application Has Been Approved!',
        html,
      });
      this.logger.log(`Approval email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send approval email to ${to}:`, err);
    }
  }
  async sendVerificationCode(params: {
    to: string;
    code: string;
  }): Promise<void> {
    const { to, code } = params;

    const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; background: #f5f7fb; margin: 0; }
      .wrapper { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
      .header { background: linear-gradient(135deg, #16a34a, #14532d); padding: 28px 32px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 20px; }
      .body { padding: 32px; color: #374151; text-align: center; }
      .code-box { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0; letter-spacing: 8px; font-size: 36px; font-weight: 800; color: #14532d; font-family: monospace; }
      .note { font-size: 13px; color: #6b7280; }
      .footer { text-align: center; padding: 16px; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
    </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header"><h1>🌿 Organic Editorial</h1></div>
        <div class="body">
          <p>Use this code to verify your email for the provider application:</p>
          <div class="code-box">${code}</div>
          <p class="note">This code expires in <strong>10 minutes</strong>.<br/>If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">© 2026 Digital Greenhouse System</div>
      </div>
    </body>
    </html>
  `;

    try {
      await this.transporter.sendMail({
        from:
          process.env.MAIL_FROM ?? 'Organic Editorial <no-reply@example.com>',
        to,
        subject: '🔐 Your verification code',
        html,
      });
      this.logger.log(`Verification code sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send verification code to ${to}:`, err);
      throw new Error('Failed to send verification email. Please try again.');
    }
  }
}
