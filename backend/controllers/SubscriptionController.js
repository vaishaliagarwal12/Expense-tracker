const subscriptionService = require('../services/SubscriptionService');
const { successResponse } = require('../utils/errorResponse');

class SubscriptionController {
  async getAll(req, res, next) {
    try {
      const data = await subscriptionService.getSubscriptions(req.user.id);
      return successResponse(res, 200, data, 'Subscriptions fetched');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const subscription = await subscriptionService.createSubscription(req.user.id, req.body);
      return successResponse(res, 201, { subscription }, 'Subscription created');
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const subscription = await subscriptionService.updateSubscription(req.user.id, req.params.id, req.body);
      return successResponse(res, 200, { subscription }, 'Subscription updated');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await subscriptionService.deleteSubscription(req.user.id, req.params.id);
      return successResponse(res, 200, null, 'Subscription deleted');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SubscriptionController();
