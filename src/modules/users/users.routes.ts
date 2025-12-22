import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdmin, requireAdminOrStaff } from '../../common/middlewares/role.middleware';
import {
  validateSchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  addressSchema,
} from './users.validation';
import { uploadFile } from '../../multer/localUpload';

const router = Router();

// Admin/Staff routes
router.get('/', authenticate, requireAdminOrStaff, UsersController.getUsers);
router.get('/stats', authenticate, requireAdmin, UsersController.getUserStats);
router.get('/:id', authenticate, requireAdminOrStaff, UsersController.getUserById);
router.post('/', authenticate, requireAdmin, uploadFile, validateSchema(createUserSchema), UsersController.createUser);
router.put('/:id', authenticate, requireAdmin, uploadFile, validateSchema(updateUserSchema), UsersController.updateUser);
router.delete('/:id', authenticate, requireAdmin, UsersController.deleteUser);

// User profile routes
router.put('/profile/update', authenticate, validateSchema(updateProfileSchema), UsersController.updateProfile);
router.post('/profile/addresses', authenticate, validateSchema(addressSchema), UsersController.addAddress);
router.put('/profile/addresses/:addressId', authenticate, validateSchema(addressSchema), UsersController.updateAddress);
router.delete('/profile/addresses/:addressId', authenticate, UsersController.deleteAddress);

// Wishlist routes
router.get('/profile/wishlist', authenticate, UsersController.getWishlist);
router.post('/profile/wishlist', authenticate, UsersController.addToWishlist);
router.delete('/profile/wishlist/:productId', authenticate, UsersController.removeFromWishlist);
router.delete('/profile/wishlist', authenticate, UsersController.clearWishlist);

export { router as usersRoutes };