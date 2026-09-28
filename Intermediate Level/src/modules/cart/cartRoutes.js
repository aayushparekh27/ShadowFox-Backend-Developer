const express = require('express');
const router = express.Router();
const CartController = require('./cartController');
const { authenticateJWT } = require('../../middleware/auth');

// All cart endpoints require user authentication
router.use(authenticateJWT);

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.put('/items/:productId', CartController.updateItemQuantity);
router.delete('/items/:productId', CartController.removeItem);
router.delete('/', CartController.clearCart);

module.exports = router;
