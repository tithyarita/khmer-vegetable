import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() body: { email: string; password: string }) {
		const { email, password } = body;
		if (!email || !password) {
			return { message: 'Email and password are required.' };
		}
		return this.authService.login(email, password);
	}

	@Post('forgot-password')
	async forgotPassword(@Body() body: { email?: string; phone?: string }) {
		if (!body.email && !body.phone) {
			return { message: 'Email or phone number is required.' };
		}
		return this.authService.forgotPassword(body.email, body.phone);
	}

	@Post('verify-otp')
	async verifyOtp(@Body() body: { email?: string; phone?: string; otp: string }) {
		if (!body.otp) {
			return { message: 'OTP is required.' };
		}
		return this.authService.verifyOtp(body.email, body.phone, body.otp);
	}

	@Post('reset-password')
	async resetPassword(@Body() body: { token: string; password: string }) {
		if (!body.token || !body.password) {
			return { message: 'Token and password are required.' };
		}
		return this.authService.resetPassword(body.token, body.password);
	}
}
