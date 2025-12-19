import { InventoryTransaction, IInventoryTransaction, Product } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery, InventoryAction } from '../../common/types';

export interface CreateInventoryTransactionData {
  productId: string;
  variantId?: string;
  action: InventoryAction;
  quantity: number;
  reason?: string;
  reference?: string;
  notes?: string;
}

export class InventoryService {
  public static async getTransactions(
    pagination: PaginationQuery,
    filters: FilterQuery & { productId?: string; action?: string }
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { productId, action } = filters;

    const query: any = {};
    
    if (productId) {
      query.product = productId;
    }

    if (action) {
      query.action = action;
    }

    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [transactions, total] = await Promise.all([
      InventoryTransaction.find(query)
        .populate('product', 'name sku')
        .populate('performedBy', 'firstName lastName email')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      InventoryTransaction.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return { transactions, pagination: paginationInfo };
  }

  public static async getTransactionById(transactionId: string): Promise<IInventoryTransaction> {
    const transaction = await InventoryTransaction.findById(transactionId)
      .populate('product', 'name sku stock')
      .populate('performedBy', 'firstName lastName email');
    
    if (!transaction) {
      throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND);
    }

    return transaction;
  }

  public static async getProductTransactions(productId: string): Promise<IInventoryTransaction[]> {
    const transactions = await InventoryTransaction.find({ product: productId })
      .populate('performedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    return transactions;
  }

  public static async createTransaction(
    data: CreateInventoryTransactionData,
    performedBy: string
  ): Promise<IInventoryTransaction> {
    // Get product
    const product = await Product.findById(data.productId);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const previousStock = product.stock;
    let newStock = previousStock;

    // Calculate new stock based on action
    switch (data.action) {
      case InventoryAction.IN:
        newStock = previousStock + data.quantity;
        break;
      case InventoryAction.OUT:
        newStock = Math.max(0, previousStock - data.quantity);
        break;
      case InventoryAction.ADJUSTMENT:
        newStock = data.quantity; // Direct adjustment to specific quantity
        break;
    }

    // Create transaction
    const transaction = new InventoryTransaction({
      product: data.productId,
      variant: data.variantId,
      action: data.action,
      quantity: data.quantity,
      previousStock,
      newStock,
      reason: data.reason,
      reference: data.reference,
      notes: data.notes,
      performedBy,
    });

    await transaction.save();

    // Update product stock
    product.stock = newStock;
    await product.save();

    return transaction;
  }

  public static async adjustStock(
    productId: string,
    quantity: number,
    reason: string,
    performedBy: string,
    variantId?: string
  ): Promise<IInventoryTransaction> {
    return this.createTransaction(
      {
        productId,
        variantId,
        action: InventoryAction.ADJUSTMENT,
        quantity,
        reason,
      },
      performedBy
    );
  }

  public static async addStock(
    productId: string,
    quantity: number,
    reason: string,
    performedBy: string,
    reference?: string,
    variantId?: string
  ): Promise<IInventoryTransaction> {
    return this.createTransaction(
      {
        productId,
        variantId,
        action: InventoryAction.IN,
        quantity,
        reason,
        reference,
      },
      performedBy
    );
  }

  public static async removeStock(
    productId: string,
    quantity: number,
    reason: string,
    performedBy: string,
    reference?: string,
    variantId?: string
  ): Promise<IInventoryTransaction> {
    return this.createTransaction(
      {
        productId,
        variantId,
        action: InventoryAction.OUT,
        quantity,
        reason,
        reference,
      },
      performedBy
    );
  }

  public static async getInventoryStats() {
    const [
      totalTransactions,
      stockInTransactions,
      stockOutTransactions,
      adjustmentTransactions,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      InventoryTransaction.countDocuments(),
      InventoryTransaction.countDocuments({ action: InventoryAction.IN }),
      InventoryTransaction.countDocuments({ action: InventoryAction.OUT }),
      InventoryTransaction.countDocuments({ action: InventoryAction.ADJUSTMENT }),
      Product.countDocuments({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        trackQuantity: true,
        stock: { $gt: 0 },
      }),
      Product.countDocuments({ stock: 0, trackQuantity: true }),
    ]);

    return {
      totalTransactions,
      stockInTransactions,
      stockOutTransactions,
      adjustmentTransactions,
      lowStockProducts,
      outOfStockProducts,
    };
  }
}
