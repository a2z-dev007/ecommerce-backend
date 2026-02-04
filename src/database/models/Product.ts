import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProductVariant {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  attributes: {
    [key: string]: string; // e.g., { color: 'red', size: 'M' }
  };
  images: string[];
  isActive: boolean;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategories: string[];
  tags: string[];
  brand?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  stock: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  variants: IProductVariant[];
  attributes: {
    name: string;
    values: string[];
  }[];
  isActive: boolean;
  isFeatured: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  taxable: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  salesCount: number;
  viewCount: number;
  specifications: {
    name: string;
    value: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IProductVariant>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  cost: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  attributes: {
    type: Map,
    of: String,
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { _id: true });

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  category: {
    type: Schema.Types.ObjectId as any,
    ref: 'Category',
    required: true,
  },
  subcategories: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Category',
  }],
  tags: [String],
  brand: {
    type: String,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  compareAtPrice: {
    type: Number,
    min: 0,
  },
  cost: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0,
  },
  trackQuantity: {
    type: Boolean,
    default: true,
  },
  allowBackorder: {
    type: Boolean,
    default: false,
  },
  weight: {
    type: Number,
    min: 0,
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  images: [String],
  variants: [variantSchema],
  attributes: [{
    name: { type: String, required: true },
    values: [String],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isDigital: {
    type: Boolean,
    default: false,
  },
  requiresShipping: {
    type: Boolean,
    default: true,
  },
  taxable: {
    type: Boolean,
    default: true,
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
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  salesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
}, {
  timestamps: true,
});

// Indexes
// productSchema.index({ slug: 1 }); // Redundant due to unique: true on slug field
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', productSchema);