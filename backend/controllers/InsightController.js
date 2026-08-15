const insightService = require('../services/InsightService');
const { successResponse } = require('../utils/errorResponse');

class InsightController {
  async getInsights(req, res, next) {
    try {
      const insights = await insightService.generateRuleBasedInsights(req.user.id, req.query.monthYear);
      return successResponse(res, 200, { insights }, 'Financial insights generated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new InsightController();
