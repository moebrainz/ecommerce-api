import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  /**
   * Process: Retrieve or Generate a Shopping Cart
   * Every user possesses exactly one cart natively connected to their User ID.
   */
  async getCart(userId: number) {
    // Step 1: Query the database to find an existing Cart for the specific User ID
    // We heavily join existing relational data (Items -> Products) so prices are dynamically attached.
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    
    // Step 2: If no cart exists, automatically create a new empty one bound to their User ID
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }
    return cart;
  }

  /**
   * Process: Adding Items to the Cart
   */
  async addToCart(userId: number, dto: AddToCartDto) {
    // Step 1: Ensure the user has an active cart
    const cart = await this.getCart(userId);
    
    // Step 2: Check if the exact product exists inside the current cart items.
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: dto.productId },
    });

    // Step 3a: If item exists, simply augment the quantity to avoid duplicates
    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    }

    // Step 3b: If item does not exist, physically create a new cart entry mapped to the product.
    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }

  /**
   * Process: Update an Existing Cart Item's Quantity
   */
  async updateQuantity(userId: number, cartItemId: number, dto: UpdateCartItemDto) {
    const cart = await this.getCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Direct Database Update
    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });
  }

  /**
   * Process: Delete an item completely from Cart.
   */
  async removeFromCart(userId: number, cartItemId: number) {
    const cart = await this.getCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Direct Database Deletion
    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }
}
