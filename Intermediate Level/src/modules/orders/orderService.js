const db = require('../../config/database');
const CartService = require('../cart/cartService');
const crypto = require('crypto');

class OrderService {
  static generateOrderCode() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${Date.now().toString().slice(-6)}-${randomHex}`;
  }

  static checkout(userId, { shippingAddress }) {
    const cart = CartService.getUserCart(userId);

    if (!cart.items || cart.items.length === 0) {
      const error = new Error('Cannot checkout with an empty cart.');
      error.statusCode = 400;
      throw error;
    }

    const products = db.getCollection('products');

    // 1. Validate stock availability for all cart items first
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.product_id);
      if (!product) {
        const error = new Error(`Product ID ${item.product_id} no longer exists.`);
        error.statusCode = 404;
        throw error;
      }
      if (product.stock < item.quantity) {
        const error = new Error(
          `Checkout Failed: Product '${product.name}' only has ${product.stock} units remaining in stock, but ${item.quantity} were requested.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // 2. Perform Atomic Inventory Stock Deduction
    const orderItems = [];
    for (const item of cart.items) {
      const product = products.find(p => p.id === item.product_id);
      product.stock -= item.quantity;
      product.updated_at = new Date().toISOString();

      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: product.price,
        quantity: item.quantity,
        subtotal: parseFloat((product.price * item.quantity).toFixed(2))
      });
    }

    // 3. Create Order Record
    const orders = db.getCollection('orders');
    const newOrder = {
      id: db.getNextId('orders'),
      order_code: this.generateOrderCode(),
      user_id: userId,
      status: 'PENDING',
      items: orderItems,
      total_amount: cart.total_amount,
      shipping_address: shippingAddress || 'Default Address',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    orders.push(newOrder);

    // 4. Clear Customer's Cart
    CartService.clearCart(userId);

    // 5. Save database transaction
    db.save();

    return newOrder;
  }

  static getUserOrders(userId, userRole, { page = 1, limit = 10 }) {
    let orders = db.getCollection('orders');

    // Filter by user if not ADMIN
    if (userRole !== 'ADMIN') {
      orders = orders.filter(o => o.user_id === userId);
    }

    const total = orders.length;
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const offset = (page - 1) * limit;
    const paginated = orders.slice(offset, offset + parseInt(limit, 10));

    return {
      orders: paginated,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  static getOrderById(orderId, userId, userRole) {
    const orders = db.getCollection('orders');
    const order = orders.find(o => o.id === parseInt(orderId, 10));

    if (!order) {
      const error = new Error(`Order with ID ${orderId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    // Check authorization: User can only view their own order, Admin can view any order
    if (userRole !== 'ADMIN' && order.user_id !== userId) {
      const error = new Error('Forbidden: You are not authorized to view this order.');
      error.statusCode = 403;
      throw error;
    }

    return order;
  }

  static updateOrderStatus(orderId, status) {
    const ALLOWED_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const newStatus = status.toUpperCase();

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      const error = new Error(`Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const orders = db.getCollection('orders');
    const order = orders.find(o => o.id === parseInt(orderId, 10));

    if (!order) {
      const error = new Error(`Order with ID ${orderId} not found.`);
      error.statusCode = 404;
      throw error;
    }

    const previousStatus = order.status;

    if (previousStatus === 'CANCELLED') {
      const error = new Error('Cancelled orders cannot be modified.');
      error.statusCode = 422;
      throw error;
    }

    // If order is cancelled now, restore inventory stock!
    if (newStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      const products = db.getCollection('products');
      for (const item of order.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          product.stock += item.quantity;
          product.updated_at = new Date().toISOString();
        }
      }
    }

    order.status = newStatus;
    order.updated_at = new Date().toISOString();

    db.save();
    return order;
  }
}

module.exports = OrderService;
