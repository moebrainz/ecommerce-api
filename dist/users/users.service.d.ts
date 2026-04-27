import { Model } from 'mongoose';
import { UserDocument } from '../database/schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(data: {
        email: string;
        password: string;
        name?: string;
    }): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
}
