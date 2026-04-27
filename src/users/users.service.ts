import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class UsersService {
  // Inject the Mongoose User model for database operations
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Database Operation: Creates an overarching User record.
   * Typically called by AuthService during new registrations.
   */
  async create(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  /**
   * Database Operation: Looks up a user purely by uniquely indexed email.
   * Crucial for login validation (comparing stored hashed passwords) and denying duplicate registration.
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Database Operation: Resolves a user natively via ID.
   * Utilized heavily by JwtStrategy to resolve JWT payloads into actual Database Entities!
   */
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
