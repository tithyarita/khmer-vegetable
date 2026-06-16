import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailService: MailService,
	) {}

	async validateUser(email: string, password: string) {
		const user = await this.usersService.validateUser(email, password);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		return user;
	}

	async login(email: string, password: string) {
		const user = await this.validateUser(email, password);
		const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
		return {
			access_token: this.jwtService.sign(payload),
			user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role, avatar: user.avatar },
		};
	}

	async forgotPassword(email?: string, phone?: string) {
		let user;
		if (email) {
			user = await this.usersService.findByEmail(email);
		} else if (phone) {
			user = await this.usersService.findByPhone(phone);
		}

		if (!user) {
			return { message: 'If an account exists, a reset link has been sent.' };
		}

		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const expires = new Date(Date.now() + 300000); // 5 minutes

		await this.usersService.setResetToken(user.id, otp, expires);

		// Send OTP via email if email was provided
		if (email) {
			await this.mailService.sendVerificationCode({ to: email, code: otp });
			this.logger.log(`OTP email sent to ${email}`);
		} else if (phone) {
			this.logger.log(`OTP for ${phone}: ${otp} (SMS not implemented)`);
		}

		return { message: 'If an account exists, a verification code has been sent.' };
	}

	async verifyOtp(email?: string, phone?: string, otp?: string) {
		let user;
		if (email) {
			user = await this.usersService.findByEmail(email);
		} else if (phone) {
			user = await this.usersService.findByPhone(phone);
		}

		if (!user || !user.reset_token || !user.reset_token_expires) {
			throw new UnauthorizedException('Invalid or expired code.');
		}

		if (new Date() > user.reset_token_expires) {
			throw new UnauthorizedException('Code has expired. Request a new one.');
		}

		if (user.reset_token !== otp) {
			throw new UnauthorizedException('Invalid code. Try again.');
		}

		// Clear OTP after successful verification
		await this.usersService.clearResetToken(user.id);

		const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
		const resetToken = this.jwtService.sign(payload, { expiresIn: '15m' });

		return {
			message: 'OTP verified successfully.',
			reset_token: resetToken,
		};
	}

	async resetPassword(token: string, password: string) {
		try {
			const payload = this.jwtService.verify(token);
			const user = await this.usersService.findById(payload.sub);
			if (!user) {
				throw new NotFoundException('User not found.');
			}
			await this.usersService.updatePassword(payload.sub, password);
			return { message: 'Password reset successful.' };
		} catch {
			throw new BadRequestException('Invalid or expired token.');
		}
	}
}
