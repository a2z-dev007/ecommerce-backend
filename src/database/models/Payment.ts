import mongoose, { Document, Schema, Types } from 'mongoose';
import { PaymentStatus, PaymentMethod } from '../../common/types';

export interface IPayment extends Document {
  _id: Types.ObjectId;
  order: string;
  paymentIntentId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: string;
  gatewayResponse?: any;
  failureReason?: string;
  refunds: {
    amount: number;
    reason?: string;
    refundId: string;
    processedAt: Date;
  }[];
  metadata?: {
    [key: string]: any;
  };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  order: {
    type: Schema.Types.ObjectId as any,
    ref: 'Order',
    required: true,
  },
  paymentIntentId: {
    type: String,
    required: true,
    unique: true,
  },
  method: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
  },
  gatewayResponse: Schema.Types.Mixed,
  failureReason: String,
  refunds: [{
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: String,
    refundId: {
      type: String,
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  metadata: Schema.Types.Mixed,
  processedAt: Date,
}, {
  timestamps: true,
});

// Indexes
paymentSchema.index({ order: 1 });
// paymentSchema.index({ paymentIntentId: 1 }); // Redundant due to unique: true on paymentIntentId field
paymentSchema.index({ status: 1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);