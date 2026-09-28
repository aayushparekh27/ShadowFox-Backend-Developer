const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_clientpulse_advanced_2026';

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Access Denied: Missing authentication token.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return ApiResponse.error(res, 'Access Denied: Invalid or expired authentication token.', 401);
  }
}

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Unauthorized: User context missing.', 401);
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden: Role '${req.user.role}' lacks permission for this action. Allowed: [${allowedRoles.join(', ')}]`,
        403
      );
    }

    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateJWT,
  authorize
};
