import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  // Inject our global Prisma Client connection
  constructor(private prisma: PrismaService) {}

  /**
   * Database Operation: Creates an overarching User record.
   * Typically called by AuthService during new registrations.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  /**
   * Database Operation: Looks up a user purely by uniquely indexed email.
   * Crucial for login validation (comparing stored hashed passwords) and denying duplicate registration.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Database Operation: Resolves a user natively via ID.
   * Utilized heavily by JwtStrategy to resolve JWT payloads into actual Database Entities!
   */
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
