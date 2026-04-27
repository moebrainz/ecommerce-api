import { CheckoutService } from './checkout.service';
import { PaymentDto } from './dto/checkout.dto';
export declare class CheckoutController {
    private readonly checkoutService;
    constructor(checkoutService: CheckoutService);
    processPayment(req: any, dto: PaymentDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
        totalAmount: number;
        status: import("@prisma/client").$Enums.OrderStatus;
    }>;
}
