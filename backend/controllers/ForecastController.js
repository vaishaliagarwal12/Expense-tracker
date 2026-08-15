const forecastService = require('../services/ForecastService');
const { successResponse } = require('../utils/errorResponse');

class ForecastController {
  async getForecast(req, res, next) {
    try {
      const data = await forecastService.calculateSpendingForecast(req.user.id, req.query.monthYear);
      return successResponse(res, 200, data, 'Spending forecast calculated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ForecastController();
