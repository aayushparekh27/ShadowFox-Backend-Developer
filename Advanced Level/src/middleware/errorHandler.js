const ApiResponse = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  console.error('[ClientPulse Error Handler]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}

function notFoundHandler(req, res) {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = {
  errorHandler,
  notFoundHandler
};
