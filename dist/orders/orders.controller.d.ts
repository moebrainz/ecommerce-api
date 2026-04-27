import { UserDocument } from '../database/schemas/user.schema';
import { OrdersService } from './orders.service';
interface RequestWithUser extends Request {
    user: UserDocument;
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: RequestWithUser): Promise<import("mongoose").Document<unknown, {}, import("../database/schemas/order.schema").Order, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }>;
    getOrderHistory(req: RequestWithUser): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../database/schemas/order.schema").Order, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/order.schema").Order & {
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
    }>)[]>;
    getOrderDetails(req: RequestWithUser, id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../database/schemas/order.schema").Order, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/order.schema").Order & {
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
    }>>;
}
export {};
