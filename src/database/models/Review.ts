import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  product: string;
  user: string;
  order?: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  reportCount: number;
  response?: {
    message: string;
    respondedBy: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
  product: {
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true,
  },
  order: {
    type: Schema.Types.ObjectId as any,
    ref: 'Order',
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  images: [String],
  isVerifiedPurchase: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  helpfulCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  reportCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  response: {
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    respondedBy: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
    },
    respondedAt: Date,
  },
}, {
  timestamps: true,
});

// Indexes
reviewSchema.index({ product: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index to ensure one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);