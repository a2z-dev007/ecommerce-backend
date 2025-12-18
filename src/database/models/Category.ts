import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Please enter a valid slug'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  image: {
    type: String,
    trim: true,
  },
  parentCategory: {
    type: Schema.Types.ObjectId as any,
    ref: 'Category',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    metaKeywords: {
      type: String,
      trim: true,
      maxlength: 255,
    },
  },
}, {
  timestamps: true,
});

// Indexes
// categorySchema.index({ slug: 1 }); // Redundant due to unique: true on slug field
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });

export const Category = mongoose.model<ICategory>('Category', categorySchema);