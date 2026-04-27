import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
// AuthService: The central hub for authentication. It handles creating new users securely and logging them in.
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Step 1: Registration Process
   * Handles creating new users securely.
   */
  async register(dto: RegisterDto) {
    // 1(a). Check the database if a user with the provided email already exists.
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // 1(b). Hash the plaintext password using bcrypt to securely store it in the database.
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 1(c). Save the user to the database using the UsersService.
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
    });

    // 1(d). Automatically generate and return a JSON Web Token (JWT) so the user is logged in.
    return this.generateToken(user.id, user.email, user.role);
  }

  /**
   * Step 2: Login Process
   * Handles authenticating existing users.
   */
  async login(dto: LoginDto) {
    // 2(a). Attempt to find the user in the database by their email.
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2(b). Compare the provided plaintext password against the hashed password in the DB.
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2(c). Generate and return the secure JWT for future authenticated requests.
    return this.generateToken(user.id, user.email, user.role);
  }

  /**
   * Utility Process: JWT Token Generation
   */
  private generateToken(userId: string, email: string, role: string) {
    // Create the payload structure containing public (but unmodifiable) identifying data.
    const payload = { sub: userId, email, role };
    // Sign the token using the application's secure JWT_SECRET and return it.
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
