import { Router } from 'express';
import { NewsletterController } from './newsletter.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdmin } from '../../common/middlewares/role.middleware';

const router = Router();
const newsletterController = new NewsletterController();

// Public routes
router.post('/subscribe', newsletterController.subscribe.bind(newsletterController));
router.post('/unsubscribe', newsletterController.unsubscribe.bind(newsletterController));

// Admin routes
router.get('/subscribers', authenticate, requireAdmin, newsletterController.getAllSubscribers.bind(newsletterController));

export const newsletterRoutes = router;
