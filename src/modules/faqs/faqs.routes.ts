import { Router } from 'express';
import { FaqsController } from './faqs.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdmin } from '../../common/middlewares/role.middleware';

const router = Router();
const faqsController = new FaqsController();

// Public routes
router.get('/', faqsController.getAllFaqs.bind(faqsController));
router.get('/:id', faqsController.getFaqById.bind(faqsController));

// Admin routes
router.post('/', authenticate, requireAdmin, faqsController.createFaq.bind(faqsController));
router.get('/admin/all', authenticate, requireAdmin, faqsController.getAllFaqsAdmin.bind(faqsController));
router.put('/:id', authenticate, requireAdmin, faqsController.updateFaq.bind(faqsController));
router.delete('/:id', authenticate, requireAdmin, faqsController.deleteFaq.bind(faqsController));

export const faqsRoutes = router;
