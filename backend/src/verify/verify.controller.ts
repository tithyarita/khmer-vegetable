import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

// Simple in-memory store — key: email, value: { code, expiresAt }
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Controller('api/verify')
export class VerifyController {
  constructor(private readonly mailService: MailService) {}

  @Post('send')
  async send(@Body('email') email: string) {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      throw new BadRequestException('Valid email is required');
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email.toLowerCase(), { code, expiresAt });

    // Send via your existing MailService
    await this.mailService.sendVerificationCode({ to: email, code });

    return { message: 'Verification code sent' };
  }

  @Post('confirm')
  confirm(@Body('email') email: string, @Body('code') code: string) {
    if (!email || !code) {
      throw new BadRequestException('Email and code are required');
    }

    const record = otpStore.get(email.toLowerCase());

    if (!record) {
      throw new BadRequestException(
        'No code found for this email. Please request a new one.',
      );
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email.toLowerCase());
      throw new BadRequestException(
        'Code has expired. Please request a new one.',
      );
    }
    if (record.code !== code.trim()) {
      throw new BadRequestException('Incorrect code. Please try again.');
    }

    // Valid — remove from store so it can't be reused
    otpStore.delete(email.toLowerCase());

    return { message: 'Email verified successfully' };
  }
}
