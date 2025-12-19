import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';

export class PaymentsController {
  public static getPayments = asyncHandler(async (req: Request, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt',
      order: req.query.order as 'asc' | 'desc' || 'desc',
    };

    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
    };

    const result = await PaymentsService.getPayments(pagination, filters);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.payments, result.pagination)
    );
  });

  public static getPaymentById = asyncHandler(async (req: Request, res: Response) => {
    const payment = await PaymentsService.getPaymentById(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, payment)
    );
  });

  public static getPaymentByIntentId = asyncHandler(async (req: Request, res: Response) => {
    const payment = await PaymentsService.getPaymentByIntentId(req.params.intentId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, payment)
    );
  });

  public static getPaymentsByOrder = asyncHandler(async (req: Request, res: Response) => {
    const payments = await PaymentsService.getPaymentsByOrder(req.params.orderId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, payments)
    );
  });

  public static createPayment = asyncHandler(async (req: Request, res: Response) => {
    const payment = await PaymentsService.createPayment(req.body);
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success('Payment created successfully', payment)
    );
  });

  public static updatePaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, gatewayResponse, failureReason } = req.body;
    const payment = await PaymentsService.updatePaymentStatus(
      req.params.id,
      status,
      gatewayResponse,
      failureReason
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Payment status updated', payment)
    );
  });

  public static processRefund = asyncHandler(async (req: Request, res: Response) => {
    const { amount, reason, refundId } = req.body;
    const payment = await PaymentsService.processRefund(
      req.params.id,
      amount,
      reason,
      refundId
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Refund processed successfully', payment)
    );
  });

  public static getPaymentStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await PaymentsService.getPaymentStats();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Payment statistics fetched successfully', stats)
    );
  });
}
