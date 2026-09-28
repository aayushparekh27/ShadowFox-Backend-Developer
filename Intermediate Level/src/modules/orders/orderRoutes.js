const express = require('express');
const router = express.Router();
const OrderController = require('./orderController');
const { authenticateJWT, authorize } = require('../../middleware/auth');

router.use(authenticateJWT);

router.post('/checkout', OrderController.checkout);
router.get('/', OrderController.getOrders);
router.get('/:id', OrderController.getOrderById);

// Admin-only status updates
router.patch('/:id/status', authorize(['ADMIN']), OrderController.updateOrderStatus);

module.exports = router;
