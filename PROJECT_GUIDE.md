# **Complete E-Commerce API Project Guide: Step-by-Step Implementation**

## **📋 Project Overview**

This is a **NestJS e-commerce API** with MongoDB, featuring:

- JWT Authentication with roles
- Product management with Redis caching
- Shopping cart functionality
- Order management with transactions
- Payment processing (mock)
- Swagger documentation

---

## **🚀 Phase 1: Project Initialization**

### **Step 1.1: Create Project Structure**

```bash
# Initialize NestJS project
nest new ecommerce-api
cd ecommerce-api

# Install core dependencies
npm install @nestjs/mongoose mongoose
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config @nestjs/cache-manager cache-manager cache-manager-redis-yet
npm install bcrypt @types/bcrypt
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
```

### **Step 1.2: Create Configuration Files**

**📄 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2020",
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**📄 `.env.example`**

```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1d
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
```

**📄 `docker-compose.yml`**

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: ecommerce
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  mongodb_data:
```

---

## **🏗️ Phase 2: Database & Core Setup**

### **Step 2.1: Create Common Enums**

**📁 `src/common/enums/role.enum.ts`**

```typescript
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
```

**📁 `src/common/enums/order-status.enum.ts`**

```typescript
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
```

### **Step 2.2: Create Database Module**

**📁 `src/database/database.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### **Step 2.3: Create Mongoose Schemas**

**📁 `src/database/schemas/user.schema.ts`**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  name?: string;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
```

**📁 `src/database/schemas/product.schema.ts`**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class ProductImage {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  url: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ unique: true, sparse: true })
  sku?: string;

  @Prop({ unique: true, sparse: true })
  slug?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  categoryId?: Types.ObjectId;

  @Prop({ type: [ProductImageSchema], default: [] })
  images: ProductImage[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for common query patterns
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ isActive: 1 });
```

**📁 `src/database/schemas/cart.schema.ts`**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CartDocument = HydratedDocument<Cart>;

@Schema({ _id: true })
export class CartItem {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
```

**📁 `src/database/schemas/order.schema.ts`**

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OrderStatus } from '../../common/enums/order-status.enum';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
```

---

## **🔐 Phase 3: Authentication System**

### **Step 3.1: Create Auth Decorators**

**📁 `src/auth/decorators/roles.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### **Step 3.2: Create Auth Guards**

**📁 `src/auth/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**📁 `src/auth/guards/roles.guard.ts`**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../common/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserDocument } from '../../database/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: UserDocument } = context
      .switchToHttp()
      .getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### **Step 3.3: Create JWT Strategy**

**📁 `src/auth/strategies/jwt.strategy.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

### **Step 3.4: Create Auth DTOs**

**📁 `src/auth/dto/auth.dto.ts`**

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name?: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

### **Step 3.5: Create Auth Service**

**📁 `src/auth/auth.service.ts`**

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  private generateToken(user: any) {
    const payload = { sub: user._id.toString(), email: user.email };
    return this.jwtService.sign(payload);
  }
}
```

### **Step 3.6: Create Auth Controller**

**📁 `src/auth/auth.controller.ts`**

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

### **Step 3.7: Create Auth Module**

**📁 `src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## **👤 Phase 4: Users Module**

### **Step 4.1: Create Users Service**

**📁 `src/users/users.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: {
    email: string;
    password: string;
    name?: string;
  }): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}
```

### **Step 4.2: Create Users Module**

**📁 `src/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from '../database/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

## **📦 Phase 5: Products Module**

### **Step 5.1: Create Products DTOs**

**📁 `src/products/dto/products.dto.ts`**

```typescript
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  stock: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
```

### **Step 5.2: Create Products Service**

**📁 `src/products/products.service.ts`**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(data: {
    name: string;
    description: string;
    price: number;
    stock: number;
  }) {
    const product = new this.productModel(data);
    return product.save();
  }

  async findAll(cursor?: string, limit = 10) {
    const cacheKey = `products_${cursor || '0'}_${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const query: any = {};
    if (cursor) {
      query._id = { $gt: cursor };
    }

    const products = await this.productModel
      .find(query)
      .sort({ _id: 1 })
      .limit(limit)
      .exec();

    await this.cacheManager.set(cacheKey, products, 60000);
    return products;
  }

  async findOne(id: string) {
    return this.productModel.findById(id).exec();
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
    }>,
  ) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string) {
    return this.productModel.findByIdAndDelete(id).exec();
  }
}
```

### **Step 5.3: Create Products Controller**

**📁 `src/products/products.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  findAll(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.productsService.findAll(cursor, limit ? parseInt(limit) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

### **Step 5.4: Create Products Module**

**📁 `src/products/products.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductSchema } from '../database/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    CacheModule.register(),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

---

## **🛒 Phase 6: Cart Module**

### **Step 6.1: Create Cart DTOs**

**📁 `src/cart/dto/cart.dto.ts`**

```typescript
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}
```

### **Step 6.2: Create Cart Service**

**📁 `src/cart/cart.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

type PopulatedCartItem = {
  _id: Types.ObjectId;
  productId: any;
  quantity: number;
};

type PopulatedCart = Omit<CartDocument, 'items'> & {
  items: PopulatedCartItem[];
};

@Injectable()
export class CartService {
  constructor(@InjectModel(Cart.name) private cartModel: Model<CartDocument>) {}

  async getCart(userId: string): Promise<PopulatedCart | null> {
    let cart = await this.cartModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('items.productId')
      .exec();

    if (!cart) {
      cart = await this.cartModel.create({
        userId: new Types.ObjectId(userId),
        items: [],
      });
      cart = await this.cartModel
        .findById(cart._id)
        .populate('items.productId')
        .exec();
    }
    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const cart = await this.getCart(userId);
    if (!cart) throw new NotFoundException('Cart not found');

    const existingItemIndex = cart.items.findIndex((item) => {
      const productId = (item.productId as any)._id.toString();
      return productId === dto.productId;
    });

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += dto.quantity;
    } else {
      cart.items.push({
        _id: new Types.ObjectId(),
        productId: new Types.ObjectId(dto.productId),
        quantity: dto.quantity,
      });
    }

    await cart.save();
    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }

  async updateQuantity(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getCart(userId);
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i._id.toString() === cartItemId);
    if (!item) throw new NotFoundException('Cart item not found');

    item.quantity = dto.quantity;
    await cart.save();
    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const cart = await this.getCart(userId);
    if (!cart) throw new NotFoundException('Cart not found');

    const item = cart.items.find((i) => i._id.toString() === cartItemId);
    if (!item) throw new NotFoundException('Cart item not found');

    await this.cartModel.updateOne(
      { _id: cart._id },
      { $pull: { items: { _id: new Types.ObjectId(cartItemId) } } },
    );

    return this.cartModel.findById(cart._id).populate('items.productId').exec();
  }
}
```

### **Step 6.3: Create Cart Controller**

**📁 `src/cart/cart.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserDocument } from '../database/schemas/user.schema';

interface RequestWithUser extends Request {
  user: UserDocument;
}

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve your shopping cart' })
  getCart(@Request() req: RequestWithUser) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  addToCart(@Request() req: RequestWithUser, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  updateQuantity(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateQuantity(req.user.id, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeFromCart(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.cartService.removeFromCart(req.user.id, id);
  }
}
```

### **Step 6.4: Create Cart Module**

**📁 `src/cart/cart.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from '../database/schemas/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
```

---

## **📋 Phase 7: Orders Module**

### **Step 7.1: Create Orders Service**

**📁 `src/orders/orders.service.ts`**

```typescript
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectConnection() private connection: Connection,
    private cartService: CartService,
  ) {}

  async createOrderFromCart(userId: string) {
    const cart = await this.cartService.getCart(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let totalAmount = 0;
    const orderItemsData = cart.items.map((item: any) => {
      const product = item.productId;
      const price = product.price;
      totalAmount += price * item.quantity;
      return {
        _id: new Types.ObjectId(),
        productId: product._id,
        quantity: item.quantity,
        price: price,
      };
    });

    const session = await this.connection.startSession();
    let order: OrderDocument;

    try {
      await session.withTransaction(async () => {
        const [newOrder] = await this.orderModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              totalAmount,
              status: 'PENDING',
              items: orderItemsData,
            },
          ],
          { session },
        );

        await this.cartModel.updateOne(
          { userId: new Types.ObjectId(userId) },
          { $set: { items: [] } },
          { session },
        );

        order = newOrder;
      });
    } finally {
      await session.endSession();
    }

    return order!;
  }

  async getOrderHistory(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('items.productId')
      .exec();
  }

  async getOrderDetails(userId: string, orderId: string) {
    const order = await this.orderModel
      .findOne({ _id: orderId, userId: new Types.ObjectId(userId) })
      .populate('items.productId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
```

### **Step 7.2: Create Orders Controller**

**📁 `src/orders/orders.controller.ts`**

```typescript
import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserDocument } from '../database/schemas/user.schema';

interface RequestWithUser extends Request {
  user: UserDocument;
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order from the current cart' })
  createOrder(@Request() req: RequestWithUser) {
    return this.ordersService.createOrderFromCart(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get order history' })
  getOrderHistory(@Request() req: RequestWithUser) {
    return this.ordersService.getOrderHistory(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  getOrderDetails(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.ordersService.getOrderDetails(req.user.id, id);
  }
}
```

### **Step 7.3: Create Orders Module**

**📁 `src/orders/orders.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from '../database/schemas/order.schema';
import { Cart, CartSchema } from '../database/schemas/cart.schema';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
    CartModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
```

---

## **💳 Phase 8: Checkout Module**

### **Step 8.1: Create Checkout DTOs**

**📁 `src/checkout/dto/checkout.dto.ts`**

```typescript
import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
```

### **Step 8.2: Create Checkout Service**

**📁 `src/checkout/checkout.service.ts`**

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { PaymentDto } from './dto/checkout.dto';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async processPayment(userId: string, dto: PaymentDto) {
    const order = await this.orderModel
      .findOne({
        _id: dto.orderId,
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order is already paid or cancelled');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return this.orderModel
      .findByIdAndUpdate(order._id, { status: OrderStatus.PAID }, { new: true })
      .exec();
  }
}
```

### **Step 8.3: Create Checkout Controller**

**📁 `src/checkout/checkout.controller.ts`**

```typescript
import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { PaymentDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserDocument } from '../database/schemas/user.schema';

interface RequestWithUser extends Request {
  user: UserDocument;
}

@ApiTags('Checkout')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('payment')
  @ApiOperation({ summary: 'Process a mock payment for an order' })
  processPayment(@Request() req: RequestWithUser, @Body() dto: PaymentDto) {
    return this.checkoutService.processPayment(req.user.id, dto);
  }
}
```

### **Step 8.4: Create Checkout Module**

**📁 `src/checkout/checkout.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { Order, OrderSchema } from '../database/schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
})
export class CheckoutModule {}
```

---

## **🏠 Phase 9: App Configuration**

### **Step 9.1: Update App Module**

**📁 `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { CheckoutModule } from './checkout/checkout.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    CheckoutModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### **Step 9.2: Update Main.ts**

**📁 `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('The E-Commerce Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  console.log(
    'MongoDB URI:',
    process.env.MONGODB_URI ? 'configured' : 'NOT SET',
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}/api/docs`,
  );
}

bootstrap();
```

---

## **🚀 Phase 10: Final Setup & Testing**

### **Step 10.1: Create Environment File**

**📄 `.env`** (copy from `.env.example` and fill in values)

### **Step 10.2: Start Services**

```bash
# Start MongoDB and Redis
docker-compose up -d

# Install dependencies
npm install

# Start development server
npm run start:dev
```

### **Step 10.3: Test the API**

1. **Register a user**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Create product** (admin): `POST /api/products`
4. **Get products**: `GET /api/products`
5. **Add to cart**: `POST /api/cart/items`
6. **Create order**: `POST /api/orders`
7. **Process payment**: `POST /api/checkout/payment`

---

## **📊 Project Structure Summary**

```
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   └── auth.dto.ts
│   ├── decorators/
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── cart/
│   ├── cart.controller.ts
│   ├── cart.module.ts
│   ├── cart.service.ts
│   └── dto/
│       └── cart.dto.ts
├── checkout/
│   ├── checkout.controller.ts
│   ├── checkout.module.ts
│   ├── checkout.service.ts
│   └── dto/
│       └── checkout.dto.ts
├── common/
│   └── enums/
│       ├── order-status.enum.ts
│       └── role.enum.ts
├── database/
│   ├── database.module.ts
│   └── schemas/
│       ├── cart.schema.ts
│       ├── order.schema.ts
│       ├── product.schema.ts
│       └── user.schema.ts
├── orders/
│   ├── orders.controller.ts
│   ├── orders.module.ts
│   └── orders.service.ts
├── products/
│   ├── products.controller.ts
│   ├── products.module.ts
│   ├── products.service.ts
│   └── dto/
│       └── products.dto.ts
└── users/
    ├── users.module.ts
    └── users.service.ts
```

---

## **🛠️ Technologies Used**

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **Caching**: Redis
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose
- **TypeScript**: Full type safety

---

## **📝 API Endpoints Summary**

### **Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### **Products** (Admin only for CUD operations)

- `POST /api/products` - Create product
- `GET /api/products` - Get products (paginated)
- `GET /api/products/:id` - Get product by ID
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### **Cart**

- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart

### **Orders**

- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Get order history
- `GET /api/orders/:id` - Get order details

### **Checkout**

- `POST /api/checkout/payment` - Process payment (mock)

---

## **🔧 Development Commands**

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Format code
npm run format
```

---

## **📚 Additional Resources**

- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **MongoDB**: `mongodb://localhost:27017/ecommerce`
- **Redis**: `redis://localhost:6379`

This comprehensive guide provides everything needed to build a production-ready e-commerce API from scratch. Each phase builds upon the previous one, ensuring a solid foundation for scalable e-commerce applications.
