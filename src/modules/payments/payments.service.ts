import { Payment, IPayment, Order } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery, PaymentStatus, PaymentMethod } from '../../common/types';

export interface CreatePaymentData {
  orderId: string;
  paymentIntentId: string;
  method: PaymentMethod;
  amount: number;
  currency?: string;
  metadata?: any;
}

export class PaymentsService {
  public static async getPayments(pagination: PaginationQuery, filters: FilterQuery) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { status, search } = filters;

    const query: any = {};
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.paymentIntentId = { $regex: search, $options: 'i' };
    }

    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('order', 'orderNumber totalAmount customer')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return { payments, pagination: paginationInfo };
  }

  public static async getPaymentById(paymentId: string): Promise<IPayment> {
    const payment = await Payment.findById(paymentId)
      .populate('order', 'orderNumber totalAmount customer email');
    
    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    }

    return payment;
  }

  public static async getPaymentByIntentId(paymentIntentId: string): Promise<IPayment> {
    const payment = await Payment.findOne({ paymentIntentId })
      .populate('order', 'orderNumber totalAmount customer email');
    
    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    }

    return payment;
  }

  public static async getPaymentsByOrder(orderId: string): Promise<IPayment[]> {
    const payments = await Payment.find({ order: orderId }).sort({ createdAt: -1 });
    return payments;
  }

  public static async createPayment(data: CreatePaymentData): Promise<IPayment> {
    // Verify order exists
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ paymentIntentId: data.paymentIntentId });
    if (existingPayment) {
      throw new AppError('Payment already exists', HTTP_STATUS.CONFLICT);
    }

    const payment = new Payment({
      order: data.orderId,
      paymentIntentId: data.paymentIntentId,
      method: data.method,
      amount: data.amount,
      currency: data.currency || 'USD',
      metadata: data.metadata,
      status: PaymentStatus.PENDING,
    });

    await payment.save();
    return payment;
  }

  public static async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    gatewayResponse?: any,
    failureReason?: string
  ): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    }

    payment.status = status;
    if (gatewayResponse) {
      payment.gatewayResponse = gatewayResponse;
    }
    if (failureReason) {
      payment.failureReason = failureReason;
    }
    if (status === PaymentStatus.COMPLETED) {
      payment.processedAt = new Date();
    }

    await payment.save();

    // Update order payment status
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: status,
      paymentIntentId: payment.paymentIntentId,
    });

    return payment;
  }

  public static async processRefund(
    paymentId: string,
    amount: number,
    reason?: string,
    refundId?: string
  ): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      throw new AppError('Payment not found', HTTP_STATUS.NOT_FOUND);
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new AppError('Can only refund completed payments', HTTP_STATUS.BAD_REQUEST);
    }

    const totalRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (totalRefunded + amount > payment.amount) {
      throw new AppError('Refund amount exceeds payment amount', HTTP_STATUS.BAD_REQUEST);
    }

    payment.refunds.push({
      amount,
      reason,
      refundId: refundId || `REF-${Date.now()}`,
      processedAt: new Date(),
    });

    // If fully refunded, update status
    if (totalRefunded + amount === payment.amount) {
      payment.status = PaymentStatus.REFUNDED;
    }

    await payment.save();

    // Update order
    const order = await Order.findById(payment.order);
    if (order) {
      order.refundAmount = (order.refundAmount || 0) + amount;
      order.refundReason = reason;
      if (totalRefunded + amount === payment.amount) {
        order.paymentStatus = PaymentStatus.REFUNDED;
      }
      await order.save();
    }

    return payment;
  }

  public static async getPaymentStats() {
    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalRevenue,
      totalRefunded,
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: PaymentStatus.COMPLETED }),
      Payment.countDocuments({ status: PaymentStatus.PENDING }),
      Payment.countDocuments({ status: PaymentStatus.FAILED }),
      Payment.countDocuments({ status: PaymentStatus.REFUNDED }),
      Payment.aggregate([
        { $match: { status: PaymentStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $unwind: '$refunds' },
        { $group: { _id: null, total: { $sum: '$refunds.amount' } } },
      ]),
    ]);

    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalRefunded: totalRefunded[0]?.total || 0,
    };
  }
}
