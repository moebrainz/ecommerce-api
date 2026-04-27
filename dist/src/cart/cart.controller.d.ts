import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(req: any): Promise<{
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
    addToCart(req: any, dto: AddToCartDto): Promise<{
        id: number;
        quantity: number;
        productId: number;
        cartId: number;
    }>;
    updateQuantity(req: any, id: string, dto: UpdateCartItemDto): Promise<{
        id: number;
        quantity: number;
        productId: number;
        cartId: number;
    }>;
    removeFromCart(req: any, id: string): Promise<{
        id: number;
        quantity: number;
        productId: number;
        cartId: number;
    }>;
}
