import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
  ) {}

  /**
   * Process: Finalizing a Cart into an official Order Invoice (Highly Critical Path)
   */
  async createOrderFromCart(userId: number) {
    // Step 1: Load up the entire user's active shopping cart
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Step 2: Iterate logically over the active cart to freeze current static product prices 
    //         and evaluate the accumulative total shopping amount.
    let totalAmount = 0;
    const orderItemsData = cart.items.map(item => {
      const price = item.product.price; // Locks in the CURRENT product price.
      totalAmount += price * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: price, // Saves this specific transaction price into the order manifest permanently.
      };
    });

    /**
     * Step 3: Implement an Atomic Prisma Database Transaction
     * Transactions ensure that ALL operations complete securely, or NONE execute at all.
     * This protects us from situations where an Order is built, but the Cart fails to delete.
     */
    const order = await this.prisma.$transaction(async (prisma) => {
      // 3(a). Create the official overarching Order entry
      const newOrder = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: 'PENDING', // Awaiting explicit payment
          items: {
            create: orderItemsData, // Natively injects all the mapped line-items generated above.
          },
        },
        include: { items: true },
      });

      // 3(b). Successfully executing step clear implies we wipe out the dynamic Cart state mapping.
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    // Step 4: Return the immutable generated order summary
    return order;
  }

  async getOrderHistory(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } }
    });
  }

  async getOrderDetails(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { product: true } } }
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
