import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { authRateLimit } from '../../common/middlewares/rateLimit.middleware';
import {
  validateSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation';

const router = Router();

// Public routes
router.post('/register', authRateLimit, validateSchema(registerSchema), AuthController.register);
router.post('/login', authRateLimit, validateSchema(loginSchema), AuthController.login);
router.post('/refresh-token', validateSchema(refreshTokenSchema), AuthController.refreshToken);
router.post('/forgot-password', authRateLimit, validateSchema(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authRateLimit, validateSchema(resetPasswordSchema), AuthController.resetPassword);
router.post('/verify-email', authRateLimit, AuthController.verifyEmail);
router.post('/resend-verification', authRateLimit, AuthController.resendVerification);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/logout-all', authenticate, AuthController.logoutAll);
router.post('/change-password', authenticate, validateSchema(changePasswordSchema), AuthController.changePassword);
router.get('/profile', authenticate, AuthController.getProfile);

export { router as authRoutes };