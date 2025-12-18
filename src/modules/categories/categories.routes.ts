import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/', CategoriesController.getCategories);
router.get('/tree', CategoriesController.getCategoryTree);
router.get('/slug/:slug', CategoriesController.getCategoryBySlug);
router.get('/:id', CategoriesController.getCategoryById);

// Admin/Staff routes
router.get('/admin/stats', authenticate, requireAdminOrStaff, CategoriesController.getCategoryStats);
router.post('/', authenticate, requireAdminOrStaff, CategoriesController.createCategory);
router.put('/:id', authenticate, requireAdminOrStaff, CategoriesController.updateCategory);
router.delete('/:id', authenticate, requireAdminOrStaff, CategoriesController.deleteCategory);
router.post('/reorder', authenticate, requireAdminOrStaff, CategoriesController.reorderCategories);

export { router as categoriesRoutes };