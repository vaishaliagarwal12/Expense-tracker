const authService = require('../services/AuthService');
const { successResponse, errorResponse } = require('../utils/errorResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, 201, result, 'Registration successful');
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, 200, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return successResponse(res, 200, { user }, 'User profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      return successResponse(res, 200, { user }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res) {
    return successResponse(res, 200, null, 'Logged out successfully');
  }
}

module.exports = new AuthController();
