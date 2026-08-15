const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/errorResponse');

function authenticate(req, res, next) {
  let token = null;

  // Extract from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return errorResponse(res, 401, 'Unauthorized: Access token is missing');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return errorResponse(res, 401, 'Unauthorized: Token is invalid or expired');
  }

  req.user = decoded;
  next();
}

module.exports = {
  authenticate
};
