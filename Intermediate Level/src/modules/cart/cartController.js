const CartService = require('./cartService');
const ApiResponse = require('../../utils/apiResponse');

class CartController {
  static getCart(req, res, next) {
    try {
      const cart = CartService.getUserCart(req.user.id);
      return ApiResponse.success(res, 'User cart retrieved successfully.', cart, 200);
    } catch (err) {
      next(err);
    }
  }

  static addItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;

      if (!productId || !quantity) {
        return ApiResponse.error(res, 'Product ID and quantity are required.', 400);
      }

      const cart = CartService.addItem(req.user.id, { productId, quantity });
      return ApiResponse.success(res, 'Item added to cart successfully.', cart, 200);
    } catch (err) {
      next(err);
    }
  }

  static updateItemQuantity(req, res, next) {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return ApiResponse.error(res, 'Quantity parameter is required.', 400);
      }

      const cart = CartService.updateItemQuantity(req.user.id, productId, quantity);
      return ApiResponse.success(res, 'Cart item quantity updated successfully.', cart, 200);
    } catch (err) {
      next(err);
    }
  }

  static removeItem(req, res, next) {
    try {
      const { productId } = req.params;
      const cart = CartService.removeItem(req.user.id, productId);
      return ApiResponse.success(res, 'Item removed from cart successfully.', cart, 200);
    } catch (err) {
      next(err);
    }
  }

  static clearCart(req, res, next) {
    try {
      const cart = CartService.clearCart(req.user.id);
      return ApiResponse.success(res, 'Cart cleared successfully.', cart, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CartController;
