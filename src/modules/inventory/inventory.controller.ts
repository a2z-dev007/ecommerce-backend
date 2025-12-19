import { Response } from 'express';
import { InventoryService } from './inventory.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';
import { AuthenticatedRequest } from '../../common/types';

export class InventoryController {
  public static getTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string || 'createdAt',
      order: req.query.order as 'asc' | 'desc' || 'desc',
    };

    const filters = {
      productId: req.query.productId as string,
      action: req.query.action as string,
    };

    const result = await InventoryService.getTransactions(pagination, filters);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, result.transactions, result.pagination)
    );
  });

  public static getTransactionById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await InventoryService.getTransactionById(req.params.id);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, transaction)
    );
  });

  public static getProductTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const transactions = await InventoryService.getProductTransactions(req.params.productId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, transactions)
    );
  });

  public static createTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const transaction = await InventoryService.createTransaction(
      req.body,
      req.user!.userId
    );
    
    res.status(HTTP_STATUS.CREATED).json(
      ResponseUtils.success('Transaction created successfully', transaction)
    );
  });

  public static adjustStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, quantity, reason, variantId } = req.body;
    const transaction = await InventoryService.adjustStock(
      productId,
      quantity,
      reason,
      req.user!.userId,
      variantId
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Stock adjusted successfully', transaction)
    );
  });

  public static addStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, quantity, reason, reference, variantId } = req.body;
    const transaction = await InventoryService.addStock(
      productId,
      quantity,
      reason,
      req.user!.userId,
      reference,
      variantId
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Stock added successfully', transaction)
    );
  });

  public static removeStock = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, quantity, reason, reference, variantId } = req.body;
    const transaction = await InventoryService.removeStock(
      productId,
      quantity,
      reason,
      req.user!.userId,
      reference,
      variantId
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Stock removed successfully', transaction)
    );
  });

  public static getInventoryStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await InventoryService.getInventoryStats();
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Inventory statistics fetched successfully', stats)
    );
  });
}
