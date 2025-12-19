import { Router } from 'express';
import { PaymentsController } from './payments.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';

const router = Router();

// All payment routes require admin/staff authentication
router.use(authenticate);
router.use(requireAdminOrStaff);

router.get('/', PaymentsController.getPayments);
router.get('/stats', PaymentsController.getPaymentStats);
router.get('/intent/:intentId', PaymentsController.getPaymentByIntentId);
router.get('/order/:orderId', PaymentsController.getPaymentsByOrder);
router.get('/:id', PaymentsController.getPaymentById);
router.post('/', PaymentsController.createPayment);
router.put('/:id/status', PaymentsController.updatePaymentStatus);
router.post('/:id/refund', PaymentsController.processRefund);

export { router as paymentsRoutes };
