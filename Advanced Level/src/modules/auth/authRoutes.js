const express = require('express');
const router = express.Router();
const AuthController = require('./authController');
const { authenticateJWT } = require('../../middleware/auth');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateJWT, AuthController.getProfile);

module.exports = router;
