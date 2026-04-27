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
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../database/schemas/product.schema");
let ProductsService = class ProductsService {
    productModel;
    cacheManager;
    constructor(productModel, cacheManager) {
        this.productModel = productModel;
        this.cacheManager = cacheManager;
    }
    async create(data) {
        const product = new this.productModel(data);
        return product.save();
    }
    async findAll(cursor, limit = 10) {
        const cacheKey = `products_${cursor || '0'}_${limit}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const query = {};
        if (cursor) {
            query._id = { $gt: new mongoose_2.Types.ObjectId(cursor) };
        }
        const products = await this.productModel
            .find(query)
            .sort({ _id: 1 })
            .limit(limit)
            .exec();
        await this.cacheManager.set(cacheKey, products, 60000);
        return products;
    }
    async findOne(id) {
        return this.productModel.findById(id).exec();
    }
    async update(id, data) {
        return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }
    async remove(id) {
        return this.productModel.findByIdAndDelete(id).exec();
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [mongoose_2.Model, Object])
], ProductsService);
//# sourceMappingURL=products.service.js.map