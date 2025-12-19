import { Review, IReview, Product, Order } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery, OrderStatus } from '../../common/types';

export interface CreateReviewData {
  productId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export class ReviewsService {
  public static async getReviews(
    pagination: PaginationQuery,
    filters: FilterQuery & { productId?: string; userId?: string; approved?: boolean }
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { productId, userId, approved } = filters;

    const query: any = {};
    
    if (productId) {
      query.product = productId;
    }

    if (userId) {
      query.user = userId;
    }

    if (approved !== undefined) {
      query.isApproved = approved;
    }

    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'firstName lastName')
        .populate('product', 'name slug')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return { reviews, pagination: paginationInfo };
  }

  public static async getReviewById(reviewId: string): Promise<IReview> {
    const review = await Review.findById(reviewId)
      .populate('user', 'firstName lastName')
      .populate('product', 'name slug')
      .populate('response.respondedBy', 'firstName lastName');
    
    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    return review;
  }

  public static async getProductReviewStats(productId: string) {
    const stats = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    return stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0,
    };
  }

  public static async createReview(
    data: CreateReviewData,
    userId: string
  ): Promise<IReview> {
    // Check if product exists
    const product = await Product.findById(data.productId);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: data.productId,
      user: userId,
    });

    if (existingReview) {
      throw new AppError('You have already reviewed this product', HTTP_STATUS.CONFLICT);
    }

    // Check if verified purchase
    let isVerifiedPurchase = false;
    if (data.orderId) {
      const order = await Order.findOne({
        _id: data.orderId,
        customer: userId,
        status: OrderStatus.DELIVERED,
        'items.product': data.productId,
      });
      isVerifiedPurchase = !!order;
    }

    const review = new Review({
      product: data.productId,
      user: userId,
      order: data.orderId,
      rating: data.rating,
      title: data.title,
      comment: data.comment,
      images: data.images || [],
      isVerifiedPurchase,
      isApproved: false, // Requires admin approval
    });

    await review.save();

    // Update product rating
    await this.updateProductRating(data.productId);

    return review;
  }

  public static async updateReview(
    reviewId: string,
    data: Partial<CreateReviewData>,
    userId: string
  ): Promise<IReview> {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    
    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    if (data.rating !== undefined) review.rating = data.rating;
    if (data.title !== undefined) review.title = data.title;
    if (data.comment !== undefined) review.comment = data.comment;
    if (data.images !== undefined) review.images = data.images;

    await review.save();

    // Update product rating
    await this.updateProductRating(review.product.toString());

    return review;
  }

  public static async deleteReview(reviewId: string, userId?: string): Promise<void> {
    const query: any = { _id: reviewId };
    if (userId) {
      query.user = userId;
    }

    const review = await Review.findOneAndDelete(query);
    
    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    // Update product rating
    await this.updateProductRating(review.product.toString());
  }

  public static async approveReview(reviewId: string): Promise<IReview> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    // Update product rating
    await this.updateProductRating(review.product.toString());

    return review;
  }

  public static async respondToReview(
    reviewId: string,
    message: string,
    respondedBy: string
  ): Promise<IReview> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        response: {
          message,
          respondedBy,
          respondedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    return review;
  }

  public static async markHelpful(reviewId: string): Promise<IReview> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    return review;
  }

  public static async reportReview(reviewId: string): Promise<IReview> {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { reportCount: 1 } },
      { new: true }
    );

    if (!review) {
      throw new AppError('Review not found', HTTP_STATUS.NOT_FOUND);
    }

    return review;
  }

  private static async updateProductRating(productId: string): Promise<void> {
    const stats = await this.getProductReviewStats(productId);
    
    await Product.findByIdAndUpdate(productId, {
      rating: stats.averageRating || 0,
      reviewCount: stats.totalReviews || 0,
    });
  }
}
