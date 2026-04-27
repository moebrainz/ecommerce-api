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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cart_service_1 = require("../cart/cart.service");
let OrdersService = class OrdersService {
    prisma;
    cartService;
    constructor(prisma, cartService) {
        this.prisma = prisma;
        this.cartService = cartService;
    }
    async createOrderFromCart(userId) {
        const cart = await this.cartService.getCart(userId);
        if (!cart.items || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        let totalAmount = 0;
        const orderItemsData = cart.items.map(item => {
            const price = item.product.price;
            totalAmount += price * item.quantity;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: price,
            };
        });
        const order = await this.prisma.$transaction(async (prisma) => {
            const newOrder = await prisma.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: 'PENDING',
                    items: {
                        create: orderItemsData,
                    },
                },
                include: { items: true },
            });
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return newOrder;
        });
        return order;
    }
    async getOrderHistory(userId) {
        return this.prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { items: { include: { product: true } } }
        });
    }
    async getOrderDetails(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { id: orderId, userId },
            include: { items: { include: { product: true } } }
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cart_service_1.CartService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map