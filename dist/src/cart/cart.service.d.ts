import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartService {
    private prisma;
    constructor(prisma: PrismaService);
    getCart(userId: number): Promise<{
        items: ({
            product: {
                name: string;
                id: number;
                createdAt: Date;
                updatedAt: Date;
                description: string;
                price: number;
                stock: number;
            };
        } & {
            id: number;
            quantity: number;
            productId: number;
            cartId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
    addToCart(userId: number, dto: AddToCartDto): Promise<{
        id: number;
        quantity: number;
        productId: number;
        cartId: number;
    }>;
    updateQuantity(userId: number, cartItemId: number, dto: UpdateCartItemDto): Promise<{
        id: number;
        quantity: number;
        productId: number;
        cartId: number;
    }>;
    removeFromCart(userId: number, cartItemId: number): Promise<{
        id: number;
        quantity: number;
        productId: number;
        cartId: number;
    }>;
}
