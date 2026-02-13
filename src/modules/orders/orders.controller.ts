import { Response } from 'express';
import { OrdersService } from './orders.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';
import { AuthenticatedRequest } from '../../common/types';

export class OrdersController {
  public static getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt',
      order: req.query.order as 'asc' | 'desc' || 'desc',
    };

    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      paymentStatus: req.query.paymentStatus as string,
      paymentMethod: req.query.paymentMethod as string,
      minAmount: req.query.minAmount as string,
      maxAmount: req.query.maxAmount as string,
    };

    const userId = req.user?.role === 'user' ? req.user.userId : undefined;
    const result = await OrdersService.getOrders(pagination, filters, userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.orders, result.pagination)
    );
  });

  public static getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.role === 'user' ? req.user.userId : undefined;
    const order = await OrdersService.getOrderById(req.params.id, userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, order)
    );
  });

  public static getOrderByNumber = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.role === 'user' ? req.user.userId : undefined;
    const order = await OrdersService.getOrderByNumber(req.params.orderNumber, userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, order)
    );
  });

  public static createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string;

    const order = await OrdersService.createOrder(req.body, userId, sessionId);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success('Order created successfully', order)
    );
  });

  public static updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body;
    const order = await OrdersService.updateOrderStatus(req.params.id, status);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Order status updated', order)
    );
  });

  public static updatePaymentStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { paymentStatus, paymentIntentId } = req.body;
    const order = await OrdersService.updatePaymentStatus(
      req.params.id,
      paymentStatus,
      paymentIntentId
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Payment status updated', order)
    );
  });

  public static cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.role === 'user' ? req.user.userId : undefined;
    const order = await OrdersService.cancelOrder(req.params.id, userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Order cancelled successfully', order)
    );
  });

  public static getOrderStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await OrdersService.getOrderStats();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Order statistics fetched successfully', stats)
    );
  });

  public static addTrackingNumber = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { trackingNumber, shippingMethod } = req.body;
    const order = await OrdersService.addTrackingNumber(
      req.params.id,
      trackingNumber,
      shippingMethod
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Tracking number added successfully', order)
    );
  });

  public static getOrderTracking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.role === 'user' ? req.user.userId : undefined;
    const tracking = await OrdersService.getOrderTracking(req.params.id, userId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, tracking)
    );
  });

  public static getUserOrderHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const orders = await OrdersService.getUserOrderHistory(req.params.userId, limit);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, orders)
    );
  });

  public static verifyRazorpayPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const order = await OrdersService.verifyRazorpayPayment(
      req.params.id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Payment verified successfully', order)
    );
  });
}
