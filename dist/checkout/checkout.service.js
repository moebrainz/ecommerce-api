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
exports.CheckoutService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_status_enum_1 = require("../common/enums/order-status.enum");
const order_schema_1 = require("../database/schemas/order.schema");
let CheckoutService = class CheckoutService {
    orderModel;
    constructor(orderModel) {
        this.orderModel = orderModel;
    }
    async processPayment(userId, dto) {
        const order = await this.orderModel
            .findOne({
            _id: dto.orderId,
            userId: new mongoose_2.Types.ObjectId(userId),
        })
            .exec();
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== order_status_enum_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Order is already paid or cancelled');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.orderModel
            .findByIdAndUpdate(order._id, { status: 'PAID' }, { new: true })
            .exec();
    }
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CheckoutService);
//# sourceMappingURL=checkout.service.js.map