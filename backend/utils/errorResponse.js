class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

function successResponse(res, statusCode = 200, data = {}, message = 'Success') {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function errorResponse(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
  const response = {
    success: false,
    error: message
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
}

module.exports = {
  AppError,
  successResponse,
  errorResponse
};
