import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OrderStatus } from '../../common/enums/order-status.enum';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: true })
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

@Schema()
export class Payment {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  method: string;

  @Prop({ unique: true, sparse: true })
  transactionId?: string;

  @Prop({ default: 'PENDING' })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

@Schema()
export class OrderStatusHistoryEntry {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: String, enum: OrderStatus, required: true })
  status: OrderStatus;

  @Prop({ type: Date, default: Date.now })
  changedAt: Date;
}

export const OrderStatusHistoryEntrySchema = SchemaFactory.createForClass(
  OrderStatusHistoryEntry,
);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: Types.ObjectId, ref: 'Address' })
  addressId?: Types.ObjectId;

  @Prop({ type: [PaymentSchema], default: [] })
  payments: Payment[];

  @Prop({ type: [OrderStatusHistoryEntrySchema], default: [] })
  statusHistory: OrderStatusHistoryEntry[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ addressId: 1 });
