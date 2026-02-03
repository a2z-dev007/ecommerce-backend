import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes';
import { usersRoutes } from '../modules/users/users.routes';
import { productsRoutes } from '../modules/products/products.routes';
import { categoriesRoutes } from '../modules/categories/categories.routes';
import { settingsRoutes } from '../modules/settings/settings.routes';
import { cartsRoutes } from '../modules/carts/carts.routes';
import { ordersRoutes } from '../modules/orders/orders.routes';
import { couponsRoutes } from '../modules/coupons/coupons.routes';
import { reviewsRoutes } from '../modules/reviews/reviews.routes';
import { paymentsRoutes } from '../modules/payments/payments.routes';
import { inventoryRoutes } from '../modules/inventory/inventory.routes';
import { cmsRoutes } from '../modules/cms/cms.routes';
import { faqsRoutes } from '../modules/faqs/faqs.routes';
import { testimonialsRoutes } from '../modules/testimonials/testimonials.routes';
import { newsletterRoutes } from '../modules/newsletter/newsletter.routes';
import { contactRoutes } from '../modules/contact/contact.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/settings', settingsRoutes);
router.use('/carts', cartsRoutes);
router.use('/orders', ordersRoutes);
router.use('/coupons', couponsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/cms', cmsRoutes);
router.use('/faqs', faqsRoutes);
router.use('/testimonials', testimonialsRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/contact', contactRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export { router as v1Routes };