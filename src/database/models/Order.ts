import mongoose, { Document, Schema, Types } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../common/types';

export interface IOrderItem {
  product: string;
  variant?: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNumber: string;
  customer?: string;
  email: string;
  phone?: string;
  items: IOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  sessionId?: string;
  shippingAddress: IShippingAddress;
  billingAddress?: IShippingAddress;
  shippingMethod?: string;
  trackingNumber?: string;
  notes?: string;
  couponCode?: string;
  refundAmount?: number;
  refundReason?: string;
  cancelledAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
    required: true,
  },
  variant: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  image: String,
}, { _id: false });

const shippingAddressSchema = new Schema<IShippingAddress>({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true,
  },
  addressLine2: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: false,
  },
  sessionId: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  shippingAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true,
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING,
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
  },
  paymentIntentId: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  billingAddress: shippingAddressSchema,
  shippingMethod: String,
  trackingNumber: String,
  notes: String,
  couponCode: String,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  refundReason: String,
  cancelledAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
}, {
  timestamps: true,
});

// Ensure either customer or sessionId is provided
orderSchema.pre('save', function (this: IOrder, next) {
  if (!this.customer && !this.sessionId) {
    return next(new Error('Either customer or sessionId must be provided'));
  }
  next();
});

// Indexes
// orderSchema.index({ orderNumber: 1 }); // Redundant due to unique: true on orderNumber field
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ email: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);