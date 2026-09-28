const OrderService = require('./orderService');
const ApiResponse = require('../../utils/apiResponse');

class OrderController {
  static checkout(req, res, next) {
    try {
      const { shippingAddress } = req.body;
      const order = OrderService.checkout(req.user.id, { shippingAddress });
      return ApiResponse.success(res, 'Order placed successfully.', order, 201);
    } catch (err) {
      next(err);
    }
  }

  static getOrders(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = OrderService.getUserOrders(req.user.id, req.user.role, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10
      });

      return ApiResponse.success(
        res,
        'Orders retrieved successfully.',
        result.orders,
        200,
        result.pagination
      );
    } catch (err) {
      next(err);
    }
  }

  static getOrderById(req, res, next) {
    try {
      const { id } = req.params;
      const order = OrderService.getOrderById(id, req.user.id, req.user.role);
      return ApiResponse.success(res, 'Order details retrieved successfully.', order, 200);
    } catch (err) {
      next(err);
    }
  }

  static updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return ApiResponse.error(res, 'Status parameter is required.', 400);
      }

      const updatedOrder = OrderService.updateOrderStatus(id, status);
      return ApiResponse.success(res, 'Order status updated successfully.', updatedOrder, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
