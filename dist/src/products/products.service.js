"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cache_manager_1 = require("@nestjs/cache-manager");
let ProductsService = class ProductsService {
    prisma;
    cacheManager;
    constructor(prisma, cacheManager) {
        this.prisma = prisma;
        this.cacheManager = cacheManager;
    }
    async create(data) {
        const product = await this.prisma.product.create({ data });
        return product;
    }
    async findAll(cursor, limit = 10) {
        const cacheKey = `products_${cursor || 0}_${limit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const query = {
            take: limit,
            orderBy: { id: 'asc' },
        };
        if (cursor) {
            query.cursor = { id: cursor };
            query.skip = 1;
        }
        const products = await this.prisma.product.findMany(query);
        await this.cacheManager.set(cacheKey, products, 60000);
        return products;
    }
    async findOne(id) {
        return this.prisma.product.findUnique({ where: { id } });
    }
    async update(id, data) {
        return this.prisma.product.update({ where: { id }, data });
    }
    async remove(id) {
        return this.prisma.product.delete({ where: { id } });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map