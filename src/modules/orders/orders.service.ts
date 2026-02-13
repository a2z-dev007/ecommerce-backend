import { Order, IOrder, Cart, Product, User } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { PaginationUtils } from '../../common/utils';
import { PaginationQuery, FilterQuery, OrderStatus, PaymentStatus, PaymentMethod } from '../../common/types';
import { MailService } from '../../common/services/mail.service';
import { RazorpayService } from '../../common/services/razorpay.service';
import crypto from 'crypto';

export interface CreateOrderData {
  email: string;
  phone?: string;
  shippingAddress: any;
  billingAddress?: any;
  shippingMethod?: string;
  paymentMethod: string;
  notes?: string;
  couponCode?: string;
  createAccount?: boolean;
  password?: string;
}

export class OrdersService {
  public static async getOrders(
    pagination: PaginationQuery,
    filters: FilterQuery,
    userId?: string
  ) {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
    const { status, search, startDate, endDate, paymentStatus, paymentMethod, minAmount, maxAmount } = filters;

    const query: any = {};
    
    if (userId) {
      query.customer = userId;
    }

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { "shippingAddress.firstName": { $regex: search, $options: 'i' } },
        { "shippingAddress.lastName": { $regex: search, $options: 'i' } },
        { "items.name": { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.totalAmount = {};
      if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
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
    userId?: string,
    sessionId?: string
  ): Promise<IOrder> {
    // Get cart by user or session
    const query = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(query).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      throw new AppError(MESSAGES.CART_EMPTY, HTTP_STATUS.BAD_REQUEST);
    }

    // Verify stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product as any;
      if (!product) {
        throw new AppError(`Product not found`, HTTP_STATUS.NOT_FOUND);
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

    // Create account if requested
    let finalUserId = userId;
    if (!userId && data.createAccount && data.password) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        // Silently link if it matches, or handle conflict. 
        // Requirements say "no duplicate form", implying we should use existing if possible, 
        // but typically security-wise we shouldn't just link without password.
        // For now, let's just abort account creation if email exists or tell user to login.
        // Actually, the prompt says "If a guest later creates an account with the same email: Orders should be attachable"
        // Let's just create the account if it doesn't exist.
      } else {
        const newUser = new User({
          email: data.email,
          password: data.password,
          firstName: data.shippingAddress.firstName,
          lastName: data.shippingAddress.lastName,
          role: 'user',
        });
        
        // Generate verification token for the new account
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        newUser.emailVerificationToken = hashedVerificationToken;
        newUser.isEmailVerified = false;

        await newUser.save();
        finalUserId = newUser._id.toString();

        // Send welcome email with credentials and verification link
        const verificationUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
        MailService.sendAccountCreatedEmail(data.email, data.password!, verificationUrl).catch(err => console.error('Failed to send welcome email:', err));
      }
    }

    // Create order
    const order = new Order({
      orderNumber,
      customer: finalUserId,
      sessionId: finalUserId ? undefined : sessionId,
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
      status: data.paymentMethod === PaymentMethod.COD ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
      notes: data.notes,
      couponCode: data.couponCode,
    });

    await order.save();

    // Clear cart if not Razorpay (Razorpay cart clear happens after payment verification)
    // Actually, usually we clear it now or on verification. 
    // If we clear now, but payment fails, user has empty cart.
    // If we don't clear now, user sees items in cart while paying.
    // Standard practice: Clear after successful order creation if it's not a payment-mandatory flow, 
    // OR keep it until payment success. 
    // For this app, let's clear it on SUCCESSFUL creation for COD, and on VERIFICATION for Razorpay.
    
    if (data.paymentMethod === PaymentMethod.COD) {
      cart.items = [];
      await cart.save();
    }

    // Handle Razorpay Order Creation
    if (data.paymentMethod === PaymentMethod.RAZORPAY) {
      try {
        const razorpayOrder = await RazorpayService.createOrder(order.totalAmount, order.orderNumber);
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
      } catch (error) {
        // If razorpay order creation fails, we might want to delete the order or mark it failed
        order.status = OrderStatus.CANCELLED;
        order.paymentStatus = PaymentStatus.FAILED;
        await order.save();
        throw new AppError('Failed to initialize payment gateway', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
    }

    // Send order confirmation email (don't await to avoid delaying response)
    MailService.sendOrderConfirmationEmail(order).catch(err => console.error('Failed to send order confirmation email:', err));

    return order;
  }

  public static async verifyRazorpayPayment(
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<IOrder> {
    const isVerified = RazorpayService.verifySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isVerified) {
      throw new AppError('Invalid payment signature', HTTP_STATUS.BAD_REQUEST);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError(MESSAGES.ORDER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    order.paymentStatus = PaymentStatus.COMPLETED;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.status = OrderStatus.CONFIRMED;
    await order.save();

    // Send payment received email
    MailService.sendPaymentReceivedEmail(order).catch(err => console.error('Failed to send payment received email:', err));

    // Clear cart now that payment is confirmed
    const query = order.customer ? { user: order.customer } : { sessionId: order.sessionId };
    await Cart.findOneAndUpdate(query, { $set: { items: [] } });

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

    // Send order status update email
    if ([OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.DELIVERED].includes(status)) {
      MailService.sendOrderStatusUpdateEmail(order, status).catch(err => console.error('Failed to send order status update email:', err));
    }

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
    const user = await User.findById(userId);
    if (!user) return [];

    const orders = await Order.find({
      $or: [
        { customer: userId },
        { email: user.email, customer: { $exists: false } }
      ]
    })
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
