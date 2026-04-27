import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { Address, AddressSchema } from './schemas/address.schema';
import { Review, ReviewSchema } from './schemas/review.schema';

const mongooseFeatures = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
  { name: Category.name, schema: CategorySchema },
  { name: Product.name, schema: ProductSchema },
  { name: Cart.name, schema: CartSchema },
  { name: Order.name, schema: OrderSchema },
  { name: Address.name, schema: AddressSchema },
  { name: Review.name, schema: ReviewSchema },
]);

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    mongooseFeatures,
  ],
  exports: [mongooseFeatures],
})
export class DatabaseModule {}
