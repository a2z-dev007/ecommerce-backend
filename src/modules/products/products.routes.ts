import { Router } from 'express';
import { ProductsController } from './products.controller';
import { authenticate, optionalAuth } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';
import { uploadMultipleFiles } from '../../multer/multipleUploads';

const router = Router();

// Public routes
router.get('/', optionalAuth, ProductsController.getProducts);
router.get('/featured', ProductsController.getFeaturedProducts);
router.get('/slug/:slug', optionalAuth, ProductsController.getProductBySlug);
router.get('/:id', optionalAuth, ProductsController.getProductById);
router.get('/:id/related', ProductsController.getRelatedProducts);

// Admin/Staff routes
router.get('/admin/stats', authenticate, requireAdminOrStaff, ProductsController.getProductStats);
router.post('/', authenticate, uploadMultipleFiles, requireAdminOrStaff, ProductsController.createProduct);
router.put('/:id', authenticate, requireAdminOrStaff, ProductsController.updateProduct);
router.delete('/:id', authenticate, requireAdminOrStaff, ProductsController.deleteProduct);
router.put('/bulk/update', authenticate, requireAdminOrStaff, ProductsController.bulkUpdateProducts);
router.delete('/bulk/delete', authenticate, requireAdminOrStaff, ProductsController.bulkDeleteProducts);

export { router as productsRoutes };