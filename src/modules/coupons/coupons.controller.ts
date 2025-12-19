import { Request, Response } from 'express';
import { CouponsService } from './coupons.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class CouponsController {
  public static getCoupons = asyncHandler(async (req: Request, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt',
      order: req.query.order as 'asc' | 'desc' || 'desc',
    };

    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
    };

    const result = await CouponsService.getCoupons(pagination, filters);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.coupons, result.pagination)
    );
  });

  public static getCouponById = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await CouponsService.getCouponById(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, coupon)
    );
  });

  public static validateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const { code, orderValue, productIds, categoryIds } = req.body;
    
    const result = await CouponsService.validateCoupon(
      code,
      orderValue,
      productIds || [],
      categoryIds || []
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(result.message || 'Coupon validated', result)
    );
  });

  public static createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await CouponsService.createCoupon(req.body);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success(MESSAGES.CREATED_SUCCESS, coupon)
    );
  });

  public static updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const coupon = await CouponsService.updateCoupon(req.params.id, req.body);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.UPDATED_SUCCESS, coupon)
    );
  });

  public static deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    await CouponsService.deleteCoupon(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.DELETED_SUCCESS)
    );
  });
}
