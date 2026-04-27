import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

/**
 * AuthModule: The central hub for authentication.
 * This imports the UsersModule (to check emails in DB) and configures the standard 'Passport' JWT module.
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Step 1: Securely configure the exact parameters for our JSON Web Tokens uniquely generated per-user.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy], // Registers the Service and Strategy
  controllers: [AuthController], // Exposes the Endpoints
})
export class AuthModule {}
