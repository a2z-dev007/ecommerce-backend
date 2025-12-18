import mongoose, { Document, Schema, Types } from 'mongoose';
import { CouponType } from '../../common/types';

export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  applicableCategories: string[];
  applicableProducts: string[];
  excludedCategories: string[];
  excludedProducts: string[];
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 50,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  type: {
    type: String,
    enum: Object.values(CouponType),
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  minimumOrderValue: {
    type: Number,
    min: 0,
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0,
  },
  usageLimit: {
    type: Number,
    min: 1,
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  userUsageLimit: {
    type: Number,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startsAt: Date,
  expiresAt: Date,
  applicableCategories: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Category',
  }],
  applicableProducts: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
  }],
  excludedCategories: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Category',
  }],
  excludedProducts: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
  }],
}, {
  timestamps: true,
});

// Indexes
// couponSchema.index({ code: 1 }); // Redundant due to unique: true on code field
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiresAt: 1 });
couponSchema.index({ startsAt: 1 });

// Virtual to check if coupon is valid
couponSchema.virtual('isValid').get(function () {
  const now = new Date();

  if (!this.isActive) return false;
  if (this.startsAt && now < this.startsAt) return false;
  if (this.expiresAt && now > this.expiresAt) return false;
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;

  return true;
});

// Ensure virtual fields are serialized
couponSchema.set('toJSON', { virtuals: true });

export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);