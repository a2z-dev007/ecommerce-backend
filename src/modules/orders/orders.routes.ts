import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authenticate, optionalAuth } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';

const router = Router();

// Public routes (Guest friendly)
router.post('/', optionalAuth, OrdersController.createOrder);
router.post('/:id/verify-razorpay', optionalAuth, OrdersController.verifyRazorpayPayment);

// User/Admin routes
router.use(authenticate);

router.get('/', OrdersController.getOrders);
router.get('/stats', requireAdminOrStaff, OrdersController.getOrderStats);
router.get('/number/:orderNumber', OrdersController.getOrderByNumber);
router.get('/user/:userId/history', OrdersController.getUserOrderHistory);
router.get('/:id', OrdersController.getOrderById);
router.get('/:id/tracking', OrdersController.getOrderTracking);
router.put('/:id/status', requireAdminOrStaff, OrdersController.updateOrderStatus);
router.put('/:id/payment', requireAdminOrStaff, OrdersController.updatePaymentStatus);
router.put('/:id/tracking', requireAdminOrStaff, OrdersController.addTrackingNumber);
router.post('/:id/cancel', OrdersController.cancelOrder);

export { router as ordersRoutes };
