import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    // Step 1: Inject the Redis Cache Manager to optimize database read operations
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Process: Creating a new product
   */
  async create(data: Prisma.ProductCreateInput) {
    // Save to PostgreSQL
    const product = await this.prisma.product.create({ data });
    // Invalidate/clear the cache since our product list has been updated.
    return product;
  }

  /**
   * Process: Retrieving products utilizing Pagination and Redis Cache
   */
  async findAll(cursor?: number, limit = 10) {
    // Step 2a: Generate a unique cache key based on the paginated parameters.
    const cacheKey = `products_${cursor || 0}_${limit}`;
    
    // Step 2b: Check if Redis already has this request cached to avoid querying the DB.
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    // Step 2c: If cache is missed, construct the optimized database query.
    const query: Prisma.ProductFindManyArgs = {
      take: limit, // How many items to return
      orderBy: { id: 'asc' }, // Ensure strict ordering
    };
    
    // Step 2d: Apply the Cursor based pagination logic.
    if (cursor) {
      query.cursor = { id: cursor }; // Start querying directly AFTER this unique ID
      query.skip = 1; // Skip the actual cursor ID itself
    }
    
    // Step 2e: Query the database.
    const products = await this.prisma.product.findMany(query);
    
    // Step 2f: Store the expensive result in Redis for future requests (60,000 ms duration).
    await this.cacheManager.set(cacheKey, products, 60000); 
    
    return products;
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
