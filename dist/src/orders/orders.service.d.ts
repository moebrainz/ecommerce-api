import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
export declare class OrdersService {
    private prisma;
    private cartService;
    constructor(prisma: PrismaService, cartService: CartService);
    createOrderFromCart(userId: number): Promise<{
        items: {
            id: number;
            price: number;
            quantity: number;
            orderId: number;
            productId: number;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: number;
        status: import("@prisma/client").$Enums.OrderStatus;
    }>;
    getOrderHistory(userId: number): Promise<({
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
            price: number;
            quantity: number;
            orderId: number;
            productId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: number;
        status: import("@prisma/client").$Enums.OrderStatus;
    })[]>;
    getOrderDetails(userId: number, orderId: number): Promise<{
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
            price: number;
            quantity: number;
            orderId: number;
            productId: number;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: number;
        status: import("@prisma/client").$Enums.OrderStatus;
    }>;
}
