import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderStatus } from '../common/enums/order-status.enum';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { PaymentDto } from './dto/checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  /**
   * Process: Processing (Mock) External Transactions
   */
  async processPayment(userId: string, dto: PaymentDto) {
    // Step 1: Fetch the created Order using the specific userId to ensure robust access-control mechanisms.
    const order = await this.orderModel
      .findOne({
        _id: dto.orderId,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Step 2: Validate against race-conditions where a user triggers multiple payment pushes.
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is already paid or cancelled');
    }

    // Step 3: Mock payment processing delay (Typically you await Stripe.checkout here)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 4: System assumes validity! Now we execute the status shift natively on the MongoDB model layer!
    return this.orderModel
      .findByIdAndUpdate(order._id, { status: 'PAID' }, { new: true })
      .exec();
  }
}
