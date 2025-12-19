import { Response } from 'express';
import { ReviewsService } from './reviews.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';
import { AuthenticatedRequest } from '../../common/types';

export class ReviewsController {
  public static getReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt',
      order: req.query.order as 'asc' | 'desc' || 'desc',
    };

    const filters = {
      productId: req.query.productId as string,
      userId: req.query.userId as string,
      approved: req.query.approved === 'true' ? true : req.query.approved === 'false' ? false : undefined,
    };

    const result = await ReviewsService.getReviews(pagination, filters);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.reviews, result.pagination)
    );
  });

  public static getReviewById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const review = await ReviewsService.getReviewById(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, review)
    );
  });

  public static getProductReviewStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await ReviewsService.getProductReviewStats(req.params.productId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Review statistics fetched successfully', stats)
    );
  });

  public static createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const review = await ReviewsService.createReview(req.body, req.user!.userId);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success('Review submitted successfully', review)
    );
  });

  public static updateReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const review = await ReviewsService.updateReview(req.params.id, req.body, req.user!.userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, review)
    );
  });

  public static deleteReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.role === 'user' ? req.user.userId : undefined;
    await ReviewsService.deleteReview(req.params.id, userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.DELETED_SUCCESS)
    );
  });

  public static approveReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const review = await ReviewsService.approveReview(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Review approved successfully', review)
    );
  });

  public static respondToReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { message } = req.body;
    const review = await ReviewsService.respondToReview(
      req.params.id,
      message,
      req.user!.userId
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Response added successfully', review)
    );
  });

  public static markHelpful = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const review = await ReviewsService.markHelpful(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Review marked as helpful', review)
    );
  });

  public static reportReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const review = await ReviewsService.reportReview(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Review reported successfully', review)
    );
  });
}
