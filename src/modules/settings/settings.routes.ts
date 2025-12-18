import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdmin } from '../../common/middlewares/role.middleware';

const router = Router();

// Public routes (read-only for certain settings)
router.get('/public', SettingsController.getSettings);

// Admin-only routes
router.get('/', authenticate, requireAdmin, SettingsController.getSettings);
router.put('/', authenticate, requireAdmin, SettingsController.updateSettings);
router.put('/business', authenticate, requireAdmin, SettingsController.updateBusinessInfo);
router.put('/currency', authenticate, requireAdmin, SettingsController.updateCurrency);
router.put('/theme', authenticate, requireAdmin, SettingsController.updateTheme);
router.put('/features', authenticate, requireAdmin, SettingsController.updateFeatures);
router.put('/tax', authenticate, requireAdmin, SettingsController.updateTaxSettings);
router.put('/shipping', authenticate, requireAdmin, SettingsController.updateShippingSettings);
router.put('/payments', authenticate, requireAdmin, SettingsController.updatePaymentSettings);
router.put('/email', authenticate, requireAdmin, SettingsController.updateEmailSettings);
router.put('/seo', authenticate, requireAdmin, SettingsController.updateSeoSettings);
router.put('/legal', authenticate, requireAdmin, SettingsController.updateLegalSettings);
router.put('/maintenance', authenticate, requireAdmin, SettingsController.updateMaintenanceMode);

export { router as settingsRoutes };