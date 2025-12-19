import { Response } from 'express';
import { CartsService } from './carts.service';
import { ResponseUtils } from '../../common/utils';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';
import { asyncHandler } from '../../common/middlewares/error.middleware';
import { AuthenticatedRequest } from '../../common/types';

export class CartsController {
  public static getCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string;

    const cart = await CartsService.getCart(userId, sessionId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success(MESSAGES.FETCHED_SUCCESS, cart)
    );
  });

  public static addToCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string;

    const cart = await CartsService.addToCart(req.body, userId, sessionId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Item added to cart', cart)
    );
  });

  public static updateCartItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string;
    const { productId } = req.params;
    const { quantity, variantId } = req.body;

    const cart = await CartsService.updateCartItem(productId, quantity, userId, sessionId, variantId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Cart updated', cart)
    );
  });

  public static removeFromCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string;
    const { productId } = req.params;
    const { variantId } = req.query;

    const cart = await CartsService.removeFromCart(
      productId,
      userId,
      sessionId,
      variantId as string
    );
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Item removed from cart', cart)
    );
  });

  public static clearCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string;

    await CartsService.clearCart(userId, sessionId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Cart cleared')
    );
  });

  public static mergeCart = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;
    const sessionId = req.headers['x-session-id'] as string;

    const cart = await CartsService.mergeCart(userId, sessionId);
    
    res.status(HTTP_STATUS.OK).json(
      ResponseUtils.success('Cart merged successfully', cart)
    );
  });
}
