import { Order, IOrder, Cart, Product } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery, OrderStatus, PaymentStatus } from '../../common/types';

export interface CreateOrderData {
  email: string;
  phone?: string;
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod?: string;
  paymentMethod: string;
  notes?: string;
  couponCode?: string;
}

export class OrdersService {
  public static async getOrders(
    pagination: PaginationQuery,
    filters: FilterQuery,
    userId?: string
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { status, search, startDate, endDate } = filters;

    const query: any = {};
    
    if (userId) {
      query.customer = userId;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = PaginationUtils.getSkip(page, limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('customer', 'firstName lastName email')
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    const paginationInfo = PaginationUtils.calculatePagination(page, limit, total);

    return { orders, pagination: paginationInfo };
  }

  public static async getOrderById(orderId: string, userId?: string): Promise<IOrder> {
    const query: any = { _id: orderId };
    if (userId) {
      query.customer = userId;
    }

    const order = await Order.findOne(query)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name slug images');
    
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return order;
  }

  public static async getOrderByNumber(orderNumber: string, userId?: string): Promise<IOrder> {
    const query: any = { orderNumber };
    if (userId) {
      query.customer = userId;
    }

    const order = await Order.findOne(query)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name slug images');
    
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return order;
  }

  public static async createOrder(
    data: CreateOrderData,
    userId: string
  ): Promise<IOrder> {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      throw new AppError(MESSAGES.CART_EMPTY, HTTP_STATUS.BAD_REQUEST);
    }

    // Verify stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new AppError(`Product ${item.product} not found`, HTTP_STATUS.NOT_FOUND);
      }

      if (product.trackQuantity && product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }

      orderItems.push({
        product: product._id,
        variant: item.variant,
        name: product.name,
        sku: product.sku,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        image: product.images?.[0],
      });

      // Reduce stock
      if (product.trackQuantity) {
        product.stock -= item.quantity;
        product.salesCount += item.quantity;
        await product.save();
      }
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * 0.1; // 10% tax
    const shippingAmount = 10; // Fixed shipping
    const discountAmount = 0; // TODO: Apply coupon
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Create order
    const order = new Order({
      orderNumber,
      customer: userId,
      email: data.email,
      phone: data.phone,
      items: orderItems,
      subtotal,
      taxAmount,
      shippingAmount,
      discountAmount,
      totalAmount,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress || data.shippingAddress,
      shippingMethod: data.shippingMethod,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      couponCode: data.couponCode,
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    return order;
  }

  public static async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    order.status = status;

    if (status === OrderStatus.SHIPPED) {
      order.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
      order.paymentStatus = PaymentStatus.COMPLETED;
    } else if (status === OrderStatus.CANCELLED) {
      order.cancelledAt = new Date();
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, salesCount: -item.quantity },
        });
      }
    }

    await order.save();
    return order;
  }

  public static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus,
    paymentIntentId?: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    order.paymentStatus = paymentStatus;
    if (paymentIntentId) {
      order.paymentIntentId = paymentIntentId;
    }

    await order.save();
    return order;
  }

  public static async cancelOrder(orderId: string, userId?: string): Promise<IOrder> {
    const query: any = { _id: orderId };
    if (userId) {
      query.customer = userId;
    }

    const order = await Order.findOne(query);
    
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if ([OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
      throw new AppError(MESSAGES.ORDER_CANNOT_BE_CANCELLED, HTTP_STATUS.BAD_REQUEST);
    }

    return this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
  }

  public static async getOrderStats() {
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: OrderStatus.PENDING }),
      Order.countDocuments({ status: OrderStatus.PROCESSING }),
      Order.countDocuments({ status: OrderStatus.SHIPPED }),
      Order.countDocuments({ status: OrderStatus.DELIVERED }),
      Order.countDocuments({ status: OrderStatus.CANCELLED }),
      Order.aggregate([
        { $match: { status: { $ne: OrderStatus.CANCELLED } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    };
  }

  public static async addTrackingNumber(
    orderId: string,
    trackingNumber: string,
    shippingMethod?: string
  ): Promise<IOrder> {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    order.trackingNumber = trackingNumber;
    if (shippingMethod) {
      order.shippingMethod = shippingMethod;
    }

    // Auto-update status to shipped if not already
    if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.DELIVERED) {
      order.status = OrderStatus.SHIPPED;
      order.shippedAt = new Date();
    }

    await order.save();
    return order;
  }

  public static async getOrderTracking(orderId: string, userId?: string) {
    const query: any = { _id: orderId };
    if (userId) {
      query.customer = userId;
    }

    const order = await Order.findOne(query).select(
      'orderNumber status trackingNumber shippingMethod shippingAddress createdAt shippedAt deliveredAt'
    );
    
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      orderNumber: order.orderNumber,
      status: order.status,
      trackingNumber: order.trackingNumber,
      shippingMethod: order.shippingMethod,
      shippingAddress: order.shippingAddress,
      timeline: {
        ordered: order.createdAt,
        shipped: order.shippedAt,
        delivered: order.deliveredAt,
      },
    };
  }

  public static async getUserOrderHistory(userId: string, limit: number = 10) {
    const orders = await Order.find({ customer: userId })
      .select('orderNumber status totalAmount createdAt items')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return orders;
  }

  private static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await Order.countDocuments({
      createdAt: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1),
      },
    });

    return `ORD-${year}${month}-${String(count + 1).padStart(5, '0')}`;
  }
}
