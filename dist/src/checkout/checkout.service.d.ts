import { PrismaService } from '../prisma/prisma.service';
import { PaymentDto } from './dto/checkout.dto';
export declare class CheckoutService {
    private prisma;
    constructor(prisma: PrismaService);
    processPayment(userId: number, dto: PaymentDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: number;
        status: import("@prisma/client").$Enums.OrderStatus;
    }>;
}
