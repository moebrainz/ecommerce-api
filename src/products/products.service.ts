import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../database/schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    // Step 1: Inject the Redis Cache Manager to optimize database read operations
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Process: Creating a new product
   */
  async create(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }) {
    // Save to MongoDB
    const product = new this.productModel(data);
    return product.save();
  }

  /**
   * Process: Retrieving products utilizing Pagination and Redis Cache
   */
  async findAll(cursor?: string, limit = 10) {
    // Step 2a: Generate a unique cache key based on the paginated parameters.
    const cacheKey = `products_${cursor || '0'}_${limit}`;

    // Step 2b: Check if Redis already has this request cached to avoid querying the DB.
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Step 2c: If cache is missed, construct the optimized database query.
    // Use cursor-based pagination with MongoDB ObjectId comparison.
    const query: { _id?: { $gt: Types.ObjectId } } = {};

    // Step 2d: Apply the Cursor based pagination logic.
    if (cursor) {
      query._id = { $gt: new Types.ObjectId(cursor) }; // Start querying directly AFTER this unique ID
    }

    // Step 2e: Query the database.
    const products = await this.productModel
      .find(query)
      .sort({ _id: 1 }) // Ensure strict ordering
      .limit(limit)
      .exec();

    // Step 2f: Store the expensive result in Redis for future requests (60,000 ms duration).
    await this.cacheManager.set(cacheKey, products, 60000);

    return products;
  }

  async findOne(id: string) {
    return this.productModel.findById(id).exec();
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
    }>,
  ) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
