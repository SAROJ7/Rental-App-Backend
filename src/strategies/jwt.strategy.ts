import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  'custom:role'?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        // Provide your secret key here
        done(null, process.env.JWT_SECRET);
      },
    });
  }

  validate(payload: JwtPayload) {
    // The payload is automatically decoded for you.
    // Here you can perform additional validations or lookups if needed.
    return {
      id: payload.sub,
      role: payload['custom:role'] || '',
    };
  }
}
