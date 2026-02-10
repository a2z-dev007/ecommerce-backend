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
  
  // Pricing & Discounts
  price: number;
  compareAtPrice?: number; // Original price for showing discounts
  cost?: number; // Cost price for profit calculation
  discountType?: 'percentage' | 'fixed' | 'none';
  discountValue?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  
  // Inventory Management
  stock: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  backorderLimit?: number;
  inventoryPolicy?: 'deny' | 'continue';
  
  // Physical Properties
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit?: 'cm' | 'm' | 'in' | 'ft';
  };
  
  // Media
  images: string[];
  videos?: string[];
  
  // Variants
  variants: IProductVariant[];
  attributes: {
    name: string;
    values: string[];
  }[];
  
  // Product Status & Visibility
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller?: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  taxable: boolean;
  taxClass?: string;
  
  // Product Condition
  condition?: 'new' | 'refurbished' | 'used';
  
  // Shipping
  freeShipping?: boolean;
  shippingClass?: string;
  
  // SEO
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
  };
  
  // Reviews & Ratings
  ratings: {
    average: number;
    count: number;
  };
  reviewsEnabled?: boolean;
  
  // Analytics
  salesCount: number;
  viewCount: number;
  wishlistCount?: number;
  
  // Additional Info
  specifications: {
    name: string;
    value: string;
  }[];
  warranty?: string;
  returnPolicy?: string;
  
  // Availability
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Related Products
  relatedProducts?: Types.ObjectId[];
  crossSellProducts?: Types.ObjectId[];
  upSellProducts?: Types.ObjectId[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  finalPrice?: number;
  isOnSale?: boolean;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'on_backorder';
}

const variantSchema = new Schema({
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

const productSchema = new Schema({
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
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none',
  },
  discountValue: {
    type: Number,
    min: 0,
  },
  discountStartDate: Date,
  discountEndDate: Date,
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
  backorderLimit: {
    type: Number,
    min: 0,
  },
  inventoryPolicy: {
    type: String,
    enum: ['deny', 'continue'],
    default: 'deny',
  },
  weight: {
    type: Number,
    min: 0,
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz'],
    default: 'kg',
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: {
      type: String,
      enum: ['cm', 'm', 'in', 'ft'],
      default: 'cm',
    },
  },
  images: [String],
  videos: [String],
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
  isNew: {
    type: Boolean,
    default: false,
  },
  isBestseller: {
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
  taxClass: {
    type: String,
    trim: true,
  },
  condition: {
    type: String,
    enum: ['new', 'refurbished', 'used'],
    default: 'new',
  },
  freeShipping: {
    type: Boolean,
    default: false,
  },
  shippingClass: {
    type: String,
    trim: true,
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
    canonicalUrl: {
      type: String,
      trim: true,
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
  reviewsEnabled: {
    type: Boolean,
    default: true,
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
  wishlistCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  warranty: {
    type: String,
    trim: true,
  },
  returnPolicy: {
    type: String,
    trim: true,
  },
  availableFrom: Date,
  availableUntil: Date,
  relatedProducts: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
  }],
  crossSellProducts: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
  }],
  upSellProducts: [{
    type: Schema.Types.ObjectId as any,
    ref: 'Product',
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual: Calculate final price with discount
productSchema.virtual('finalPrice').get(function(this: IProduct) {
  if (this.discountType === 'none' || !this.discountValue) {
    return this.price;
  }
  
  const now = new Date();
  if (this.discountStartDate && now < this.discountStartDate) {
    return this.price;
  }
  if (this.discountEndDate && now > this.discountEndDate) {
    return this.price;
  }
  
  if (this.discountType === 'percentage') {
    return this.price - (this.price * this.discountValue / 100);
  } else if (this.discountType === 'fixed') {
    return Math.max(0, this.price - this.discountValue);
  }
  
  return this.price;
});

// Virtual: Check if product is on sale
productSchema.virtual('isOnSale').get(function(this: IProduct) {
  if (this.discountType === 'none' || !this.discountValue) {
    return false;
  }
  
  const now = new Date();
  if (this.discountStartDate && now < this.discountStartDate) {
    return false;
  }
  if (this.discountEndDate && now > this.discountEndDate) {
    return false;
  }
  
  return true;
});

// Virtual: Get stock status
productSchema.virtual('stockStatus').get(function(this: IProduct) {
  if (!this.trackQuantity) {
    return 'in_stock';
  }
  
  if (this.stock <= 0) {
    return this.allowBackorder ? 'on_backorder' : 'out_of_stock';
  }
  
  if (this.stock <= this.lowStockThreshold) {
    return 'low_stock';
  }
  
  return 'in_stock';
});

// Indexes
// productSchema.index({ slug: 1 }); // Redundant due to unique: true on slug field
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNew: 1 });
productSchema.index({ isBestseller: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ salesCount: -1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ discountType: 1, discountStartDate: 1, discountEndDate: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ brand: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);