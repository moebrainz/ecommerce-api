import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import type { StringValue } from 'ms';

/**
 * AuthModule: The central hub for authentication.
 * This imports the UsersModule (to check emails in DB) and configures the standard 'Passport' JWT module.
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Step 1: Securely configure the exact parameters for our JSON Web Tokens uniquely generated per-user.
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as StringValue,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy], // Registers the Service and Strategy
  controllers: [AuthController], // Exposes the Endpoints
})
export class AuthModule {}
