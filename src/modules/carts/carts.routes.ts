import { Router } from 'express';
import { CartsController } from './carts.controller';
import { optionalAuth, authenticate } from '../../common/middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, CartsController.getCart);
router.post('/items', optionalAuth, CartsController.addToCart);
router.put('/items/:productId', optionalAuth, CartsController.updateCartItem);
router.delete('/items/:productId', optionalAuth, CartsController.removeFromCart);
router.delete('/', optionalAuth, CartsController.clearCart);
router.post('/merge', authenticate, CartsController.mergeCart);

export { router as cartsRoutes };
