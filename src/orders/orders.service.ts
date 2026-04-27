import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { CartService } from '../cart/cart.service';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { ProductDocument } from '../database/schemas/product.schema';

type PopulatedCartItem = {
  _id: Types.ObjectId;
  productId: ProductDocument | Types.ObjectId;
  quantity: number;
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectConnection() private connection: Connection,
    private cartService: CartService,
  ) {}

  /**
   * Process: Finalizing a Cart into an official Order Invoice (Highly Critical Path)
   */
  async createOrderFromCart(userId: string) {
    // Step 1: Load up the entire user's active shopping cart
    const cart = await this.cartService.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Step 2: Iterate logically over the active cart to freeze current static product prices
    //         and evaluate the accumulative total shopping amount.
    let totalAmount = 0;
    const orderItemsData = cart.items.map((item: PopulatedCartItem) => {
      const product = item.productId as ProductDocument; // populated product object
      const price = product.price; // Locks in the CURRENT product price.
      totalAmount += price * item.quantity;
      return {
        _id: new Types.ObjectId(),
        productId: product._id,
        quantity: item.quantity,
        price: price, // Saves this specific transaction price into the order manifest permanently.
      };
    });

    /**
     * Step 3: Implement an Atomic MongoDB Transaction
     * Transactions ensure that ALL operations complete securely, or NONE execute at all.
     * This protects us from situations where an Order is built, but the Cart fails to clear.
     */
    const session = await this.connection.startSession();
    let order: OrderDocument;

    try {
      await session.withTransaction(async () => {
        // 3(a). Create the official overarching Order entry
        const [newOrder] = await this.orderModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              totalAmount,
              status: 'PENDING', // Awaiting explicit payment
              items: orderItemsData, // Natively injects all the mapped line-items generated above.
            },
          ],
          { session },
        );

        // 3(b). Successfully executing step clear implies we wipe out the dynamic Cart state mapping.
        await this.cartModel.updateOne(
          { userId: new Types.ObjectId(userId) },
          { $set: { items: [] } },
          { session },
        );

        order = newOrder;
      });
    } finally {
      await session.endSession();
    }

    // Step 4: Return the immutable generated order summary
    return order!;
  }

  async getOrderHistory(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('items.productId')
      .exec();
  }

  async getOrderDetails(userId: string, orderId: string) {
    const order = await this.orderModel
      .findOne({ _id: orderId, userId: new Types.ObjectId(userId) })
      .populate('items.productId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
