import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import type { Cache } from 'cache-manager';
export declare class ProductsService {
    private prisma;
    private cacheManager;
    constructor(prisma: PrismaService, cacheManager: Cache);
    create(data: Prisma.ProductCreateInput): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        price: number;
        stock: number;
    }>;
    findAll(cursor?: number, limit?: number): Promise<{}>;
    findOne(id: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        price: number;
        stock: number;
    } | null>;
    update(id: number, data: Prisma.ProductUpdateInput): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        price: number;
        stock: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        price: number;
        stock: number;
    }>;
}
