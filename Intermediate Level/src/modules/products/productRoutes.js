const express = require('express');
const router = express.Router();
const ProductController = require('./productController');
const { authenticateJWT, authorize } = require('../../middleware/auth');

// Public routes
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Admin-only routes
router.post('/', authenticateJWT, authorize(['ADMIN']), ProductController.createProduct);
router.put('/:id', authenticateJWT, authorize(['ADMIN']), ProductController.updateProduct);
router.delete('/:id', authenticateJWT, authorize(['ADMIN']), ProductController.deleteProduct);

module.exports = router;
