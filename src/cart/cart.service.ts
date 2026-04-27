import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { ProductDocument } from '../database/schemas/product.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

type PopulatedCartItem = {
  _id: Types.ObjectId;
  productId: ProductDocument | Types.ObjectId;
  quantity: number;
};

type PopulatedCart = Omit<CartDocument, 'items'> & {
  items: PopulatedCartItem[];
};

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  /**
   * Process: Retrieve or Generate a Shopping Cart
   * Every user possesses exactly one cart natively connected to their User ID.
   */
  async getCart(userId: string): Promise<PopulatedCart | null> {
    // Step 1: Query the database to find an existing Cart for the specific User ID
    // We populate the product details on each cart item so prices are dynamically attached.
    let cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId')
      .exec();

    // Step 2: If no cart exists, automatically create a new empty one bound to their User ID
    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
      // Re-populate after creation
      cart = await this.cartModel
        .findById(cart._id)
        .populate('items.productId')
        .exec();
    }
    return cart;
  }

  /**
   * Process: Adding Items to the Cart
   */
  async addToCart(userId: string, dto: AddToCartDto) {
    // Step 1: Ensure the user has an active cart
    const cart = await this.getCart(userId);
    if (!cart) throw new NotFoundException('Cart not found');

    // Step 2: Check if the exact product exists inside the current cart items.
    const existingItemIndex = cart.items.findIndex((item) => {
      const productId = (item.productId as ProductDocument)._id.toString();
      return productId === dto.productId;
    });

    // Step 3a: If item exists, simply augment the quantity to avoid duplicates
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += dto.quantity;
    } else {
      // Step 3b: If item does not exist, physically create a new cart entry mapped to the product.
      cart.items.push({
        _id: new Types.ObjectId(),
        productId: new Types.ObjectId(dto.productId),
        quantity: dto.quantity,
      });
    }

    await cart.save();
    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }

  /**
   * Process: Update an Existing Cart Item's Quantity
   */
  async updateQuantity(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getCart(userId);
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i._id.toString() === cartItemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Direct item update
    item.quantity = dto.quantity;
    await cart.save();
    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }

  /**
   * Process: Delete an item completely from Cart.
   */
  async removeFromCart(userId: string, cartItemId: string) {
    const cart = await this.getCart(userId);
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i._id.toString() === cartItemId);
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Direct Database Deletion using $pull
    await this.cartModel.updateOne(
      { _id: cart._id },
      { $pull: { items: { _id: new Types.ObjectId(cartItemId) } } },
    );

    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }
}
