import { Coupon, ICoupon } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery, CouponType } from '../../common/types';

export interface CreateCouponData {
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumOrderValue?: number;
  maximumDiscountAmount?: number;
  usageLimit?: number;
  userUsageLimit?: number;
  isActive?: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
}

export class CouponsService {
  public static async getCoupons(pagination: PaginationQuery, filters: FilterQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { search, status } = filters;

    const query: any = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [coupons, total] = await Promise.all([
      Coupon.find(query)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return { coupons, pagination: paginationInfo };
  }

  public static async getCouponById(couponId: string): Promise<ICoupon> {
    const coupon = await Coupon.findById(couponId)
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name')
      .populate('excludedCategories', 'name')
      .populate('excludedProducts', 'name');
    
    if (!coupon) {
      throw new AppError('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }

    return coupon;
  }

  public static async getCouponByCode(code: string): Promise<ICoupon> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      throw new AppError(MESSAGES.INVALID_COUPON, HTTP_STATUS.NOT_FOUND);
    }

    return coupon;
  }

  public static async validateCoupon(
    code: string,
    orderValue: number,
    productIds: string[],
    categoryIds: string[]
  ): Promise<{ valid: boolean; discount: number; message?: string }> {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Coupon not found' };
    }

    // Check if active
    if (!coupon.isActive) {
      return { valid: false, discount: 0, message: 'Coupon is not active' };
    }

    // Check dates
    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return { valid: false, discount: 0, message: 'Coupon not yet valid' };
    }
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return { valid: false, discount: 0, message: 'Coupon has expired' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Coupon usage limit reached' };
    }

    // Check minimum order value
    if (coupon.minimumOrderValue && orderValue < coupon.minimumOrderValue) {
      return {
        valid: false,
        discount: 0,
        message: `Minimum order value of ${coupon.minimumOrderValue} required`,
      };
    }

    // Check applicable products/categories
    if (coupon.applicableProducts.length > 0) {
      const hasApplicableProduct = productIds.some(id =>
        coupon.applicableProducts.some(p => p.toString() === id)
      );
      if (!hasApplicableProduct) {
        return { valid: false, discount: 0, message: 'Coupon not applicable to cart items' };
      }
    }

    if (coupon.applicableCategories.length > 0) {
      const hasApplicableCategory = categoryIds.some(id =>
        coupon.applicableCategories.some(c => c.toString() === id)
      );
      if (!hasApplicableCategory) {
        return { valid: false, discount: 0, message: 'Coupon not applicable to cart items' };
      }
    }

    // Check excluded products/categories
    if (coupon.excludedProducts.length > 0) {
      const hasExcludedProduct = productIds.some(id =>
        coupon.excludedProducts.some(p => p.toString() === id)
      );
      if (hasExcludedProduct) {
        return { valid: false, discount: 0, message: 'Coupon not applicable to some cart items' };
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (orderValue * coupon.value) / 100;
      if (coupon.maximumDiscountAmount) {
        discount = Math.min(discount, coupon.maximumDiscountAmount);
      }
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discount = coupon.value;
    }

    return { valid: true, discount, message: 'Coupon applied successfully' };
  }

  public static async createCoupon(data: CreateCouponData): Promise<ICoupon> {
    const existingCoupon = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existingCoupon) {
      throw new AppError('Coupon code already exists', HTTP_STATUS.CONFLICT);
    }

    const coupon = new Coupon({
      ...data,
      code: data.code.toUpperCase(),
    });

    await coupon.save();
    return coupon;
  }

  public static async updateCoupon(
    couponId: string,
    data: Partial<CreateCouponData>
  ): Promise<ICoupon> {
    if (data.code) {
      const existingCoupon = await Coupon.findOne({
        code: data.code.toUpperCase(),
        _id: { $ne: couponId },
      });
      if (existingCoupon) {
        throw new AppError('Coupon code already exists', HTTP_STATUS.CONFLICT);
      }
      data.code = data.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      throw new AppError('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }

    return coupon;
  }

  public static async deleteCoupon(couponId: string): Promise<void> {
    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      throw new AppError('Coupon not found', HTTP_STATUS.NOT_FOUND);
    }
  }

  public static async incrementUsage(couponId: string): Promise<void> {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usageCount: 1 } });
  }
}
