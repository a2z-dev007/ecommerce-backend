import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';

const router = Router();

// Public routes
router.get('/published', CmsController.getPublishedPages);
router.get('/slug/:slug', CmsController.getPageBySlug);

// Admin/Staff routes
router.get('/', authenticate, requireAdminOrStaff, CmsController.getPages);
router.get('/:id', authenticate, requireAdminOrStaff, CmsController.getPageById);
router.post('/', authenticate, requireAdminOrStaff, CmsController.createPage);
router.put('/:id', authenticate, requireAdminOrStaff, CmsController.updatePage);
router.delete('/:id', authenticate, requireAdminOrStaff, CmsController.deletePage);
router.post('/:id/publish', authenticate, requireAdminOrStaff, CmsController.publishPage);
router.post('/:id/unpublish', authenticate, requireAdminOrStaff, CmsController.unpublishPage);

export { router as cmsRoutes };
