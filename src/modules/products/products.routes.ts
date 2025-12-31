import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate, optionalAuth } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';
import { uploadCloudMultiple } from '../../multer/cloudinary';

const router = Router();

// Public routes
router.get('/', optionalAuth, ProductsController.getProducts);
router.get('/featured', ProductsController.getFeaturedProducts);
router.get('/slug/:slug', optionalAuth, ProductsController.getProductBySlug);

// Admin/Staff routes
router.get('/admin/stats', authenticate, requireAdminOrStaff, ProductsController.getProductStats);
router.post('/', uploadCloudMultiple, authenticate, requireAdminOrStaff, ProductsController.createProduct);
router.put('/bulk/update', authenticate, requireAdminOrStaff, ProductsController.bulkUpdateProducts);
router.delete('/bulk/delete', authenticate, requireAdminOrStaff, ProductsController.bulkDeleteProducts);

// These must come last because /:id is a catch-all pattern
router.get('/:id', optionalAuth, ProductsController.getProductById);
router.get('/:id/related', ProductsController.getRelatedProducts);
router.put('/:id', uploadCloudMultiple, authenticate, requireAdminOrStaff, ProductsController.updateProduct);
router.delete('/:id', authenticate, requireAdminOrStaff, ProductsController.deleteProduct);

export { router as productsRoutes };