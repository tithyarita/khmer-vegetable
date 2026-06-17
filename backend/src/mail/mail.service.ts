import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private _resend: Resend | null = null;
  private readonly logoUrl: string;

  constructor() {
    const key = process.env.RESEND_API_KEY;
    if (key) {
      this.logger.log(`Resend API key loaded (${key.slice(0, 6)}...)`);
    } else {
      this.logger.error('RESEND_API_KEY is NOT set! Check your .env file.');
    }

    this.logoUrl =
      process.env.LOGO_URL ||
      (process.env.APP_URL ? `${process.env.APP_URL}/images/logo.png` : 'https://via.placeholder.com/180x48?text=Logo');
  }

  private get resend(): Resend {
    if (!this._resend) {
      this._resend = new Resend(process.env.RESEND_API_KEY);
    }
    return this._resend;
  }

  // ── SHARED EMAIL BASE STYLES ──────────────────────────────────────────────
  private baseStyles(): string {
    return `
      body {
        margin: 0; padding: 0;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        background-color: #f0f4f0;
      }
      .email-wrapper {
        max-width: 520px;
        margin: 30px auto;
        background: #ffffff;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      }
      .email-header {
        background: #ffffff;
        padding: 28px 28px 8px 28px;
        text-align: center;
        border-bottom: 3px solid #16a34a;
      }
      .email-header img {
        height: 44px;
        object-fit: contain;
      }
      .email-body {
        padding: 28px 28px 22px 28px;
        color: #334155;
      }
      .email-body h2 {
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 10px;
      }
      .email-body p {
        font-size: 14.5px;
        line-height: 1.7;
        margin: 0 0 14px;
        color: #475569;
      }
      .info-box {
        background: #f0fdf4;
        border: 1px solid #d1fae5;
        border-radius: 10px;
        padding: 16px 20px;
        margin: 18px 0;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        padding: 6px 0;
      }
      .info-label {
        color: #64748b;
        font-weight: 600;
      }
      .info-value {
        color: #0f172a;
        font-weight: 700;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 13.5px;
      }
      .code-display {
        background: #f0fdf4;
        border: 2px solid #16a34a;
        border-radius: 10px;
        padding: 18px;
        margin: 20px 0;
        text-align: center;
        letter-spacing: 10px;
        font-size: 34px;
        font-weight: 800;
        color: #14532d;
        font-family: 'SF Mono', 'Fira Code', monospace;
      }
      .btn-wrapper {
        text-align: center;
        margin: 24px 0 10px;
      }
      .btn-primary {
        display: inline-block;
        background: #16a34a;
        color: #ffffff !important;
        text-decoration: none;
        padding: 13px 34px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 15px;
        text-align: center;
      }
      .alert-warning {
        background: #fffbeb;
        border-left: 4px solid #f59e0b;
        border-radius: 6px;
        padding: 12px 16px;
        font-size: 13px;
        color: #92400e;
        margin: 18px 0;
        line-height: 1.5;
      }
      .icon-badge {
        display: inline-block;
        width: 20px; height: 20px;
        border-radius: 50%;
        text-align: center;
        line-height: 20px;
        font-weight: 700;
        font-size: 11px;
        margin-right: 6px;
        vertical-align: middle;
      }
      .icon-warn {
        background: #f59e0b;
        color: #ffffff;
      }
      .icon-info {
        background: #16a34a;
        color: #ffffff;
      }
      .icon-clock {
        background: #3b82f6;
        color: #ffffff;
      }
      .text-muted {
        font-size: 13px;
        color: #94a3b8;
        text-align: center;
        margin-top: 12px;
        line-height: 1.5;
      }
      .text-muted a {
        color: #16a34a;
        word-break: break-all;
      }
      .email-footer {
        text-align: center;
        padding: 18px 28px;
        font-size: 11.5px;
        color: #9ca3af;
        background: #fafbfc;
        border-top: 1px solid #f1f5f9;
        line-height: 1.6;
      }
    `;
  }

  // ── PROVIDER APPROVAL EMAIL ───────────────────────────────────────────────
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
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${this.baseStyles()}</style>
      </head>
      <body>
        <div class="email-wrapper">

          <div class="email-header">
            <img src="${this.logoUrl}" alt="Khmer Vegetable" />
          </div>

          <div class="email-body">
            <h2>Welcome, ${ownerName}!</h2>
            <p>
              Your provider application for <strong style="color:#16a34a;">${businessName}</strong>
              has been <strong>approved</strong> by our team. You can now log in and
              start managing your products on the marketplace.
            </p>

            <div class="info-box">
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${to}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Password</span>
                <span class="info-value">${password}</span>
              </div>
            </div>

            <div class="alert-warning">
              <span class="icon-badge icon-warn">!</span>
              <strong>Please change your password immediately</strong> after your first login.
              This temporary password is for initial access only.
            </div>

            <div class="btn-wrapper">
              <a href="${loginUrl}" class="btn-primary">Go to Dashboard →</a>
            </div>

            <div class="text-muted">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${loginUrl}">${loginUrl}</a>
            </div>
          </div>

          <div class="email-footer">
            You received this email because your provider application was reviewed.
          </div>

        </div>
      </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from:
          process.env.MAIL_FROM ?? 'Khmer Vegetable <no-reply@prave-vinuth.online>',
        to,
        subject: 'Your Provider Application Has Been Approved',
        html,
      });
      this.logger.log(`Approval email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send approval email to ${to}:`, err);
    }
  }

  // ── VERIFICATION CODE EMAIL ───────────────────────────────────────────────
  async sendVerificationCode(params: {
    to: string;
    code: string;
  }): Promise<void> {
    const { to, code } = params;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${this.baseStyles()}</style>
      </head>
      <body>
        <div class="email-wrapper">

          <div class="email-header">
            <img src="${this.logoUrl}" alt="Khmer Vegetable" />
          </div>

          <div class="email-body">
            <h2>Verify Your Identity</h2>
            <p>
              Please use the verification code below to complete your login.
              This code is valid for a single use only.
            </p>

            <div class="code-display">${code}</div>

            <div class="alert-warning">
              <span class="icon-badge icon-clock">&#x23F1;</span>
              This code expires in <strong>10 minutes</strong>.<br/>
              If you didn't request this code, you can safely ignore this email.
            </div>
          </div>

          <div class="email-footer">
            This is an automated message — please do not reply.
          </div>

        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.resend.emails.send({
        from:
          process.env.MAIL_FROM ?? 'Khmer Vegetable <no-reply@prave-vinuth.online>',
        to,
        subject: 'Your Verification Code — Khmer Vegetable',
        html,
      });
      this.logger.log(`Verification code sent to ${to}, id=${result.data?.id}`);
    } catch (err) {
      const message = err?.message || String(err);
      this.logger.error(`Failed to send verification code to ${to}: ${message}`, err?.stack);
      throw new Error(`Failed to send verification email: ${message}`);
    }
  }
}
