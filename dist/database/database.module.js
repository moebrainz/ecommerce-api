"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const user_schema_1 = require("./schemas/user.schema");
const category_schema_1 = require("./schemas/category.schema");
const product_schema_1 = require("./schemas/product.schema");
const cart_schema_1 = require("./schemas/cart.schema");
const order_schema_1 = require("./schemas/order.schema");
const address_schema_1 = require("./schemas/address.schema");
const review_schema_1 = require("./schemas/review.schema");
const mongooseFeatures = mongoose_1.MongooseModule.forFeature([
    { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
    { name: category_schema_1.Category.name, schema: category_schema_1.CategorySchema },
    { name: product_schema_1.Product.name, schema: product_schema_1.ProductSchema },
    { name: cart_schema_1.Cart.name, schema: cart_schema_1.CartSchema },
    { name: order_schema_1.Order.name, schema: order_schema_1.OrderSchema },
    { name: address_schema_1.Address.name, schema: address_schema_1.AddressSchema },
    { name: review_schema_1.Review.name, schema: review_schema_1.ReviewSchema },
]);
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    uri: configService.get('MONGODB_URI'),
                }),
            }),
            mongooseFeatures,
        ],
        exports: [mongooseFeatures],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map