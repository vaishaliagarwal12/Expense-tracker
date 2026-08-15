const healthScoreService = require('../services/HealthScoreService');
const { successResponse } = require('../utils/errorResponse');

class HealthScoreController {
  async getHealthScore(req, res, next) {
    try {
      const data = await healthScoreService.calculateHealthScore(req.user.id, req.query.monthYear);
      return successResponse(res, 200, data, 'Financial health score evaluated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new HealthScoreController();
