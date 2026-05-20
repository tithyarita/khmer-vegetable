import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'your_jwt_secret', // Must match the secret in AuthModule
    });
  }

  async validate(payload: any) {
    // This returned object is what becomes req.user in your controllers
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}