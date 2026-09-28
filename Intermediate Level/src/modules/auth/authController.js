const AuthService = require('./authService');
const ApiResponse = require('../../utils/apiResponse');

class AuthController {
  static register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return ApiResponse.error(res, 'Name, email, and password are required.', 400);
      }

      if (password.length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long.', 400);
      }

      const result = AuthService.register({ name, email, password, role });
      return ApiResponse.success(res, 'User registered successfully.', result, 201);
    } catch (err) {
      next(err);
    }
  }

  static login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ApiResponse.error(res, 'Email and password are required.', 400);
      }

      const result = AuthService.login({ email, password });
      return ApiResponse.success(res, 'Login successful.', result, 200);
    } catch (err) {
      next(err);
    }
  }

  static getProfile(req, res, next) {
    try {
      const user = AuthService.getProfile(req.user.id);
      return ApiResponse.success(res, 'User profile retrieved successfully.', user, 200);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
