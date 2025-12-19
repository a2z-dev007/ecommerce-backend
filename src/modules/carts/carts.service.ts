import { Cart, ICart, Product } from '../../database';
import { AppError } from '../../common/middlewares/error.middleware';
import { HTTP_STATUS, MESSAGES } from '../../common/constants';

export interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity: number;
}

export class CartsService {
  public static async getCart(userId?: string, sessionId?: string): Promise<ICart> {
    const query = userId ? { user: userId } : { sessionId };
    
    let cart = await Cart.findOne(query).populate('items.product', 'name slug price images stock');
    
    if (!cart) {
      cart = new Cart(userId ? { user: userId } : { sessionId });
      await cart.save();
    }

    return cart;
  }

  public static async addToCart(
    data: AddToCartData,
    userId?: string,
    sessionId?: string
  ): Promise<ICart> {
    const { productId, variantId, quantity } = data;

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError(MESSAGES.PRODUCT_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (product.trackQuantity && product.stock < quantity) {
      throw new AppError(MESSAGES.INSUFFICIENT_STOCK, HTTP_STATUS.BAD_REQUEST);
    }

    // Get or create cart
    const query = userId ? { user: userId } : { sessionId };
    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart(userId ? { user: userId } : { sessionId });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variant === variantId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        variant: variantId,
        quantity,
        price: product.price,
        addedAt: new Date(),
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name slug price images stock');

    return cart;
  }

  public static async updateCartItem(
    productId: string,
    quantity: number,
    userId?: string,
    sessionId?: string,
    variantId?: string
  ): Promise<ICart> {
    const query = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      throw new AppError('Cart not found', HTTP_STATUS.NOT_FOUND);
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variant === variantId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', HTTP_STATUS.NOT_FOUND);
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Verify stock
      const product = await Product.findById(productId);
      if (product && product.trackQuantity && product.stock < quantity) {
        throw new AppError(MESSAGES.INSUFFICIENT_STOCK, HTTP_STATUS.BAD_REQUEST);
      }
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name slug price images stock');

    return cart;
  }

  public static async removeFromCart(
    productId: string,
    userId?: string,
    sessionId?: string,
    variantId?: string
  ): Promise<ICart> {
    const query = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(query);

    if (!cart) {
      throw new AppError('Cart not found', HTTP_STATUS.NOT_FOUND);
    }

    cart.items = cart.items.filter(
      item => !(item.product.toString() === productId && item.variant === variantId)
    );

    await cart.save();
    await cart.populate('items.product', 'name slug price images stock');

    return cart;
  }

  public static async clearCart(userId?: string, sessionId?: string): Promise<void> {
    const query = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(query);

    if (cart) {
      cart.items = [];
      await cart.save();
    }
  }

  public static async mergeCart(userId: string, sessionId: string): Promise<ICart> {
    const [userCart, sessionCart] = await Promise.all([
      Cart.findOne({ user: userId }),
      Cart.findOne({ sessionId }),
    ]);

    if (!sessionCart || sessionCart.items.length === 0) {
      return userCart || new Cart({ user: userId });
    }

    if (!userCart) {
      sessionCart.user = userId;
      sessionCart.sessionId = undefined;
      await sessionCart.save();
      return sessionCart;
    }

    // Merge items
    for (const sessionItem of sessionCart.items) {
      const existingItemIndex = userCart.items.findIndex(
        item =>
          item.product.toString() === sessionItem.product.toString() &&
          item.variant === sessionItem.variant
      );

      if (existingItemIndex > -1) {
        userCart.items[existingItemIndex].quantity += sessionItem.quantity;
      } else {
        userCart.items.push(sessionItem);
      }
    }

    await userCart.save();
    await Cart.deleteOne({ sessionId });

    return userCart;
  }
}
