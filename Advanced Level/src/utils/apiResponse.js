class ApiResponse {
  static success(res, message, data = null, statusCode = 200, meta = null) {
    const response = {
      success: true,
      message,
      ...(data !== null && { data }),
      ...(meta !== null && { meta })
    };
    return res.status(statusCode).json(response);
  }

  static error(res, message, statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
      ...(errors !== null && { errors })
    };
    return res.status(statusCode).json(response);
  }
}

module.exports = ApiResponse;
