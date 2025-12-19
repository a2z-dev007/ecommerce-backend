import { Router } from 'express';
import { CouponsController } from './coupons.controller';
import { authenticate, optionalAuth } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';

const router = Router();

// Public routes
router.post('/validate', optionalAuth, CouponsController.validateCoupon);

// Admin/Staff routes
router.get('/', authenticate, requireAdminOrStaff, CouponsController.getCoupons);
router.get('/:id', authenticate, requireAdminOrStaff, CouponsController.getCouponById);
router.post('/', authenticate, requireAdminOrStaff, CouponsController.createCoupon);
router.put('/:id', authenticate, requireAdminOrStaff, CouponsController.updateCoupon);
router.delete('/:id', authenticate, requireAdminOrStaff, CouponsController.deleteCoupon);

export { router as couponsRoutes };
