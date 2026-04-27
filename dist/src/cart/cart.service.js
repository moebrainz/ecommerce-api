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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } },
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: { items: { include: { product: true } } },
            });
        }
        return cart;
    }
    async addToCart(userId, dto) {
        const cart = await this.getCart(userId);
        const existingItem = await this.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId: dto.productId },
        });
        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity },
            });
        }
        return this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId: dto.productId,
                quantity: dto.quantity,
            },
        });
    }
    async updateQuantity(userId, cartItemId, dto) {
        const cart = await this.getCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: { id: cartItemId, cartId: cart.id },
        });
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        return this.prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity: dto.quantity },
        });
    }
    async removeFromCart(userId, cartItemId) {
        const cart = await this.getCart(userId);
        const item = await this.prisma.cartItem.findFirst({
            where: { id: cartItemId, cartId: cart.id },
        });
        if (!item) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        return this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map