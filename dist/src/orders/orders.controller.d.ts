import { OrdersService } from './orders.service';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    createOrder(req: any): Promise<{
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
    getOrderHistory(req: any): Promise<({
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
    getOrderDetails(req: any, id: string): Promise<{
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
