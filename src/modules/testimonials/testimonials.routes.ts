import { Router } from 'express';
import { TestimonialsController } from './testimonials.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdmin } from '../../common/middlewares/role.middleware';

const router = Router();
const testimonialsController = new TestimonialsController();

// Public routes
router.get('/', testimonialsController.getAllTestimonials.bind(testimonialsController));
router.get('/:id', testimonialsController.getTestimonialById.bind(testimonialsController));

// Admin routes
router.post('/', authenticate, requireAdmin, testimonialsController.createTestimonial.bind(testimonialsController));
router.get('/admin/all', authenticate, requireAdmin, testimonialsController.getAllTestimonialsAdmin.bind(testimonialsController));
router.put('/:id', authenticate, requireAdmin, testimonialsController.updateTestimonial.bind(testimonialsController));
router.delete('/:id', authenticate, requireAdmin, testimonialsController.deleteTestimonial.bind(testimonialsController));

export const testimonialsRoutes = router;
