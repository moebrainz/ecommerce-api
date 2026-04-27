import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  /**
   * Process: Processing (Mock) External Transactions
   */
  async processPayment(userId: number, dto: PaymentDto) {
    // Step 1: Fetch the created Order using the specific userId to ensure robust access-control mechanisms.
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, userId }
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Step 2: Validate against race-conditions where a user triggers multiple payment pushes.
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is already paid or cancelled');
    }

    // Step 3: Mock payment processing delay (Typically you await Stripe.checkout here)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 4: System assumes validity! Now we execute the status shift natively on the PostgreSQL model layer!
    return this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'PAID' }
    });
  }
}
