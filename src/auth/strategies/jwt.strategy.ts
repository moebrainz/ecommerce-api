import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

/**
 * JwtStrategy governs exactly HOW our backend intercepts incoming JWTs.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    // Step 1: Define configurations
    super({
      // We automatically scrape the Bearer token directly from standard API Request Headers.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Ensures expired tokens natively trigger a 401 Unauthorized securely.
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret', // Uses our explicit .env validation key.
    });
  }

  /**
   * Step 2: Validate payload natively matching an existing User mapping context
   * This is executed instantly *after* the raw internal string JWT evaluates true against the mathematical 'secret' signature!
   */
  async validate(payload: any) {
    // Security check: Ensure the decoded token maps directly to an ACTIVE existing user ID currently in Postgres DB!
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // Returns the exact `user` object. This tells Node.js/NestJS internals to explicitly 
    // connect it directly onto `req.user` which makes @Request() req.user.id work on the Controllers.
    return user;
  }
}
