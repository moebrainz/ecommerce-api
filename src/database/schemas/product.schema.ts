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
