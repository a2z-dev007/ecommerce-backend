import { Product, IProduct, Category } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils, SlugUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery } from '../../common/types';
import getDataUrl from '../../common/utils/bufferGenerator';
import cloudinary from 'cloudinary';
export interface CreateProductData {
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategories?: string[];
  tags?: string[];
  brand?: string;
  sku: string;
  
  // Pricing & Discounts
  price: number;
  compareAtPrice?: number;
  cost?: number;
  discountType?: 'percentage' | 'fixed' | 'none';
  discountValue?: number;
  discountStartDate?: Date;
  discountEndDate?: Date;
  
  // Inventory
  stock: number;
  lowStockThreshold?: number;
  trackQuantity?: boolean;
  allowBackorder?: boolean;
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
  images?: string[];
  videos?: string[];
  
  // Variants & Attributes
  variants?: any[];
  attributes?: any[];
  
  // Status & Visibility
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  isDigital?: boolean;
  requiresShipping?: boolean;
  taxable?: boolean;
  taxClass?: string;
  
  // Product Condition
  condition?: 'new' | 'refurbished' | 'used';
  
  // Shipping
  freeShipping?: boolean;
  shippingClass?: string;
  
  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    canonicalUrl?: string;
  };
  
  // Reviews
  reviewsEnabled?: boolean;
  
  // Additional Info
  specifications?: {
    name: string;
    value: string;
  }[];
  warranty?: string;
  returnPolicy?: string;
  
  // Availability
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Related Products
  relatedProducts?: string[];
  crossSellProducts?: string[];
  upSellProducts?: string[];
}

export class ProductsService {
  public static async getProducts(
    pagination: PaginationQuery,
    filters: FilterQuery
  ): Promise<{
    products: any[];
    pagination: any;
  }> {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { search, category, minPrice, maxPrice } = filters;

    // Build query
    const query: any = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (category) {
      query.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = minPrice;
      if (maxPrice !== undefined) query.price.$lte = maxPrice;
    }

    // Execute query with pagination
    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('subcategories', 'name slug')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return {
      products,
      pagination: paginationInfo,
    };
  }

  public static async getProductById(productId: string): Promise<IProduct> {
    const product = await Product.findById(productId)
      .populate('category', 'name slug')
      .populate('subcategories', 'name slug');

    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    return product;
  }

  public static async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('subcategories', 'name slug');

    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    return product;
  }

  public static async createProduct(data: CreateProductData, files: any): Promise<IProduct> {
    // Verify category exists
    const category = await Category.findById(data.category);
    if (!category) {
      throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if SKU already exists anywhere (root or variants)
    const existingProduct = await Product.findOne({
      $or: [
        { sku: data.sku },
        { 'variants.sku': data.sku }
      ]
    });

    if (existingProduct) {
      throw new AppError('Product with this SKU already exists', HTTP_STATUS.CONFLICT);
    }

    // Generate slug
    const existingSlugs = await Product.find({}, 'slug').lean();
    const slugs = existingSlugs.map(p => p.slug);
    const slug = SlugUtils.generateUnique(data.name, slugs);

    // Create product
    const product = new Product({
      ...data,
      slug,
    });

    // Upload images to Cloudinary
    const cloudinaryImages: string[] = [];

    if (files && Array.isArray(files) && files.length > 0) {
      for (const file of files) {
        const imgBuffer = getDataUrl(file);

        const uploadCloud = await cloudinary.v2.uploader.upload(imgBuffer.content!, {
          folder: 'products',
          resource_type: 'image',
        });

        cloudinaryImages.push(uploadCloud.secure_url);
      }

      console.log('✓ Uploaded', cloudinaryImages.length, 'images to Cloudinary');
      product.images = cloudinaryImages;
    }

    await product.save();
    return product;
  }

  public static async updateProduct(productId: string, data: Partial<CreateProductData>, files?: any): Promise<IProduct> {
    // If updating name, regenerate slug
    if (data.name) {
      const existingSlugs = await Product.find({ _id: { $ne: productId } }, 'slug').lean();
      const slugs = existingSlugs.map(p => p.slug);
      data.slug = SlugUtils.generateUnique(data.name, slugs);
    }

    // If updating category, verify it exists
    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) {
        throw new AppError(MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
    }


    // Upload images to Cloudinary
    if (files && Array.isArray(files) && files.length > 0) {
      const cloudinaryImages: string[] = [];

      for (const file of files) {
        const imgBuffer = getDataUrl(file);

        const uploadCloud = await cloudinary.v2.uploader.upload(imgBuffer.content!, {
          folder: 'products',
          resource_type: 'image',
        });

        cloudinaryImages.push(uploadCloud.secure_url);
      }

      console.log('✓ Uploaded', cloudinaryImages.length, 'images to Cloudinary');
      (data as any).images = cloudinaryImages;
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return product;
  }

  public static async deleteProduct(productId: string): Promise<void> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Soft delete by deactivating
    product.isActive = false;
    await product.save();
  }

  public static async getFeaturedProducts(limit: number = 10): Promise<any[]> {
    const products = await Product.find({
      isActive: true,
      isFeatured: true
    })
      .populate('category', 'name slug')
      .sort({ salesCount: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return products;
  }

  public static async getRelatedProducts(productId: string, limit: number = 6): Promise<any[]> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      category: product.category,
      isActive: true,
    })
      .populate('category', 'name slug')
      .sort({ salesCount: -1 })
      .limit(limit)
      .lean();

    return relatedProducts;
  }

  public static async updateStock(productId: string, quantity: number, variantId?: string): Promise<void> {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (variantId) {
      const variant = (product.variants as any).id(variantId);
      if (!variant) {
        throw new AppError('Product variant not found', HTTP_STATUS.NOT_FOUND);
      }
      variant.stock = Math.max(0, variant.stock + quantity);
    } else {
      product.stock = Math.max(0, product.stock + quantity);
    }

    await product.save();
  }

  public static async bulkUpdateProducts(
    productIds: string[],
    updateData: Partial<CreateProductData>
  ): Promise<number> {
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    return result.modifiedCount;
  }

  public static async bulkDeleteProducts(productIds: string[]): Promise<number> {
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: { isActive: false } }
    );

    return result.modifiedCount;
  }

  public static async getProductStats() {
    const [
      totalProducts,
      activeProducts,
      featuredProducts,
      outOfStockProducts,
      lowStockProducts,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({ isFeatured: true }),
      Product.countDocuments({ stock: 0, trackQuantity: true }),
      Product.countDocuments({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        trackQuantity: true,
        stock: { $gt: 0 },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      featuredProducts,
      outOfStockProducts,
      lowStockProducts,
    };
  }
}