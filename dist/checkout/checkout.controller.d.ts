import { UserDocument } from '../database/schemas/user.schema';
import { CheckoutService } from './checkout.service';
import { PaymentDto } from './dto/checkout.dto';
interface RequestWithUser extends Request {
    user: UserDocument;
}
export declare class CheckoutController {
    private readonly checkoutService;
    constructor(checkoutService: CheckoutService);
    processPayment(req: RequestWithUser, dto: PaymentDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../database/schemas/order.schema").Order, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("../database/schemas/order.schema").Order, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
}
export {};
