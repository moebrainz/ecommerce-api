import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { ProductDocument } from '../database/schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
type PopulatedCartItem = {
    _id: Types.ObjectId;
    productId: ProductDocument | Types.ObjectId;
    quantity: number;
};
type PopulatedCart = Omit<CartDocument, 'items'> & {
    items: PopulatedCartItem[];
};
export declare class CartService {
    private cartModel;
    constructor(cartModel: Model<CartDocument>);
    getCart(userId: string): Promise<PopulatedCart | null>;
    addToCart(userId: string, dto: AddToCartDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Cart, {}, import("mongoose").DefaultSchemaOptions> & Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Cart, {}, import("mongoose").DefaultSchemaOptions> & Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
    updateQuantity(userId: string, cartItemId: string, dto: UpdateCartItemDto): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Cart, {}, import("mongoose").DefaultSchemaOptions> & Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Cart, {}, import("mongoose").DefaultSchemaOptions> & Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
    removeFromCart(userId: string, cartItemId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Cart, {}, import("mongoose").DefaultSchemaOptions> & Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, Cart, {}, import("mongoose").DefaultSchemaOptions> & Cart & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: Types.ObjectId;
    }>) | null>;
}
export {};
