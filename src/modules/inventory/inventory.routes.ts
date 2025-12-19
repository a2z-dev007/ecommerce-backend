import { Router } from 'express';
import { InventoryController } from './inventory.controller';
import { authenticate } from '../../common/middlewares/auth.middleware';
import { requireAdminOrStaff } from '../../common/middlewares/role.middleware';

const router = Router();

// All inventory routes require admin/staff authentication
router.use(authenticate);
router.use(requireAdminOrStaff);

router.get('/', InventoryController.getTransactions);
router.get('/stats', InventoryController.getInventoryStats);
router.get('/product/:productId', InventoryController.getProductTransactions);
router.get('/:id', InventoryController.getTransactionById);
router.post('/', InventoryController.createTransaction);
router.post('/adjust', InventoryController.adjustStock);
router.post('/add', InventoryController.addStock);
router.post('/remove', InventoryController.removeStock);

export { router as inventoryRoutes };
