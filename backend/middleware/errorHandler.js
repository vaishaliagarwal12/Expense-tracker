const { errorResponse } = require('../utils/errorResponse');

function globalErrorHandler(err, req, res, next) {
  console.error('❌ Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, statusCode, message);
}

module.exports = globalErrorHandler;
