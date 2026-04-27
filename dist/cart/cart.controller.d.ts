import { UserDocument } from '../database/schemas/user.schema';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
interface RequestWithUser extends Request {
    user: UserDocument;
}
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: RequestWithUser): Promise<(Omit<import("mongoose").Document<unknown, {}, import("../database/schemas/cart.schema").Cart, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/cart.schema").Cart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, "items"> & {
        items: {
            _id: import("mongoose").Types.ObjectId;
            productId: import("../database/schemas/product.schema").ProductDocument | import("mongoose").Types.ObjectId;
            quantity: number;
        }[];
    }) | null>;
    addToCart(req: RequestWithUser, dto: AddToCartDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../database/schemas/cart.schema").Cart, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/cart.schema").Cart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("../database/schemas/cart.schema").Cart, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/cart.schema").Cart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    updateQuantity(req: RequestWithUser, id: string, dto: UpdateCartItemDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../database/schemas/cart.schema").Cart, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/cart.schema").Cart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("../database/schemas/cart.schema").Cart, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/cart.schema").Cart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | null>;
    removeFromCart(req: RequestWithUser, id: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../database/schemas/cart.schema").Cart, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/cart.schema").Cart & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("../database/schemas/cart.schema").Cart, {}, import("mongoose").DefaultSchemaOptions> & import("../database/schemas/cart.schema").Cart & {
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
