const analyticsService = require('../services/AnalyticsService');
const { successResponse } = require('../utils/errorResponse');

class AnalyticsController {
  async getAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getAnalytics(req.user.id, req.query.monthYear);
      return successResponse(res, 200, data, 'Analytics data retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AnalyticsController();
