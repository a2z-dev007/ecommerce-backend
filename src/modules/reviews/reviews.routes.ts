import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate, optionalAuth } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/', optionalAuth, ReviewsController.getReviews);
router.get('/product/:productId/stats', ReviewsController.getProductReviewStats);
router.get('/:id', optionalAuth, ReviewsController.getReviewById);

// Authenticated user routes
router.post('/', authenticate, ReviewsController.createReview);
router.put('/:id', authenticate, ReviewsController.updateReview);
router.delete('/:id', authenticate, ReviewsController.deleteReview);
router.post('/:id/helpful', optionalAuth, ReviewsController.markHelpful);
router.post('/:id/report', optionalAuth, ReviewsController.reportReview);

// Admin/Staff routes
router.post('/:id/approve', authenticate, requireAdminOrStaff, ReviewsController.approveReview);
router.post('/:id/respond', authenticate, requireAdminOrStaff, ReviewsController.respondToReview);

export { router as reviewsRoutes };
