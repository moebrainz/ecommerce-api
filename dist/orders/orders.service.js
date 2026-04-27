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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_service_1 = require("../cart/cart.service");
const cart_schema_1 = require("../database/schemas/cart.schema");
const order_schema_1 = require("../database/schemas/order.schema");
let OrdersService = class OrdersService {
    orderModel;
    cartModel;
    connection;
    cartService;
    constructor(orderModel, cartModel, connection, cartService) {
        this.orderModel = orderModel;
        this.cartModel = cartModel;
        this.connection = connection;
        this.cartService = cartService;
    }
    async createOrderFromCart(userId) {
        const cart = await this.cartService.getCart(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        let totalAmount = 0;
        const orderItemsData = cart.items.map((item) => {
            const product = item.productId;
            const price = product.price;
            totalAmount += price * item.quantity;
            return {
                _id: new mongoose_2.Types.ObjectId(),
                productId: product._id,
                quantity: item.quantity,
                price: price,
            };
        });
        const session = await this.connection.startSession();
        let order;
        try {
            await session.withTransaction(async () => {
                const [newOrder] = await this.orderModel.create([
                    {
                        userId: new mongoose_2.Types.ObjectId(userId),
                        totalAmount,
                        status: 'PENDING',
                        items: orderItemsData,
                    },
                ], { session });
                await this.cartModel.updateOne({ userId: new mongoose_2.Types.ObjectId(userId) }, { $set: { items: [] } }, { session });
                order = newOrder;
            });
        }
        finally {
            await session.endSession();
        }
        return order;
    }
    async getOrderHistory(userId) {
        return this.orderModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .populate('items.productId')
            .exec();
    }
    async getOrderDetails(userId, orderId) {
        const order = await this.orderModel
            .findOne({ _id: orderId, userId: new mongoose_2.Types.ObjectId(userId) })
            .populate('items.productId')
            .exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __param(2, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Connection,
        cart_service_1.CartService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map