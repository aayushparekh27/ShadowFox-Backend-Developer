const db = require('../../config/database');
const ProductService = require('../products/productService');

class CartService {
  static getUserCart(userId) {
    const carts = db.getCollection('carts');
    let userCart = carts.find(c => c.user_id === userId);

    if (!userCart) {
      userCart = {
        id: db.getNextId('carts'),
        user_id: userId,
        items: [],
        updated_at: new Date().toISOString()
      };
      carts.push(userCart);
      db.save();
    }

    // Populate item product details and calculate totals
    let totalAmount = 0;
    const populatedItems = userCart.items.map(item => {
      const product = db.getCollection('products').find(p => p.id === item.product_id);
      const unitPrice = product ? product.price : 0;
      const subtotal = unitPrice * item.quantity;
      totalAmount += subtotal;

      return {
        product_id: item.product_id,
        product_name: product ? product.name : 'Unknown Product',
        sku: product ? product.sku : 'N/A',
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: parseFloat(subtotal.toFixed(2)),
        available_stock: product ? product.stock : 0
      };
    });

    return {
      cart_id: userCart.id,
      user_id: userId,
      items: populatedItems,
      total_items: populatedItems.reduce((acc, item) => acc + item.quantity, 0),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      updated_at: userCart.updated_at
    };
  }

  static addItem(userId, { productId, quantity }) {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      const error = new Error('Quantity must be greater than zero.');
      error.statusCode = 400;
      throw error;
    }

    // Validate product existence and stock
    const product = ProductService.getProductById(productId);

    const carts = db.getCollection('carts');
    let userCart = carts.find(c => c.user_id === userId);

    if (!userCart) {
      userCart = {
        id: db.getNextId('carts'),
        user_id: userId,
        items: [],
        updated_at: new Date().toISOString()
      };
      carts.push(userCart);
    }

    const existingItem = userCart.items.find(i => i.product_id === parseInt(productId, 10));
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQty = currentQtyInCart + qty;

    if (newTotalQty > product.stock) {
      const error = new Error(
        `Insufficient stock for product '${product.name}'. Requested total: ${newTotalQty}, Available stock: ${product.stock}`
      );
      error.statusCode = 400;
      throw error;
    }

    if (existingItem) {
      existingItem.quantity = newTotalQty;
    } else {
      userCart.items.push({
        product_id: parseInt(productId, 10),
        quantity: qty
      });
    }

    userCart.updated_at = new Date().toISOString();
    db.save();

    return this.getUserCart(userId);
  }

  static updateItemQuantity(userId, productId, quantity) {
    const qty = parseInt(quantity, 10);
    const pId = parseInt(productId, 10);

    const carts = db.getCollection('carts');
    const userCart = carts.find(c => c.user_id === userId);

    if (!userCart) {
      const error = new Error('Cart not found.');
      error.statusCode = 404;
      throw error;
    }

    const itemIndex = userCart.items.findIndex(i => i.product_id === pId);
    if (itemIndex === -1) {
      const error = new Error('Product not found in your cart.');
      error.statusCode = 404;
      throw error;
    }

    if (qty <= 0) {
      // Remove item if quantity is zero or less
      userCart.items.splice(itemIndex, 1);
    } else {
      const product = ProductService.getProductById(pId);
      if (qty > product.stock) {
        const error = new Error(
          `Insufficient stock for product '${product.name}'. Requested: ${qty}, Available: ${product.stock}`
        );
        error.statusCode = 400;
        throw error;
      }
      userCart.items[itemIndex].quantity = qty;
    }

    userCart.updated_at = new Date().toISOString();
    db.save();

    return this.getUserCart(userId);
  }

  static removeItem(userId, productId) {
    const pId = parseInt(productId, 10);
    const carts = db.getCollection('carts');
    const userCart = carts.find(c => c.user_id === userId);

    if (userCart) {
      userCart.items = userCart.items.filter(i => i.product_id !== pId);
      userCart.updated_at = new Date().toISOString();
      db.save();
    }

    return this.getUserCart(userId);
  }

  static clearCart(userId) {
    const carts = db.getCollection('carts');
    const userCart = carts.find(c => c.user_id === userId);

    if (userCart) {
      userCart.items = [];
      userCart.updated_at = new Date().toISOString();
      db.save();
    }

    return this.getUserCart(userId);
  }
}

module.exports = CartService;
