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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_schema_1 = require("../database/schemas/cart.schema");
let CartService = class CartService {
    cartModel;
    constructor(cartModel) {
        this.cartModel = cartModel;
    }
    async getCart(userId) {
        let cart = await this.cartModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
            .populate('items.productId')
            .exec();
        if (!cart) {
            cart = await this.cartModel.create({
                userId: new mongoose_2.Types.ObjectId(userId),
                items: [],
            });
            cart = await this.cartModel
                .findById(cart._id)
                .populate('items.productId')
                .exec();
        }
        return cart;
    }
    async addToCart(userId, dto) {
        const cart = await this.getCart(userId);
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const existingItemIndex = cart.items.findIndex((item) => {
            const productId = item.productId._id.toString();
            return productId === dto.productId;
        });
        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += dto.quantity;
        }
        else {
            cart.items.push({
                _id: new mongoose_2.Types.ObjectId(),
                productId: new mongoose_2.Types.ObjectId(dto.productId),
                quantity: dto.quantity,
            });
        }
        await cart.save();
        return this.cartModel.findById(cart._id).populate('items.productId').exec();
    }
    async updateQuantity(userId, cartItemId, dto) {
        const cart = await this.getCart(userId);
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = cart.items.find((i) => i._id.toString() === cartItemId);
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        item.quantity = dto.quantity;
        await cart.save();
        return this.cartModel.findById(cart._id).populate('items.productId').exec();
    }
    async removeFromCart(userId, cartItemId) {
        const cart = await this.getCart(userId);
        if (!cart)
            throw new common_1.NotFoundException('Cart not found');
        const item = cart.items.find((i) => i._id.toString() === cartItemId);
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.cartModel.updateOne({ _id: cart._id }, { $pull: { items: { _id: new mongoose_2.Types.ObjectId(cartItemId) } } });
        return this.cartModel.findById(cart._id).populate('items.productId').exec();
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CartService);
//# sourceMappingURL=cart.service.js.map