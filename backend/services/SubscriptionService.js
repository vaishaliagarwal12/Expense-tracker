const subscriptionRepository = require('../repositories/SubscriptionRepository');
const { AppError } = require('../utils/errorResponse');

class SubscriptionService {
  async getSubscriptions(userId) {
    const subscriptions = await subscriptionRepository.findAll(userId);

    const activeSubs = subscriptions.filter(s => s.status === 'Active');

    let totalMonthlyCost = 0;
    let totalYearlyCost = 0;

    activeSubs.forEach(sub => {
      const amt = parseFloat(sub.amount);
      if (sub.billing_frequency === 'Monthly') {
        totalMonthlyCost += amt;
        totalYearlyCost += amt * 12;
      } else if (sub.billing_frequency === 'Yearly') {
        totalMonthlyCost += amt / 12;
        totalYearlyCost += amt;
      } else if (sub.billing_frequency === 'Quarterly') {
        totalMonthlyCost += amt / 3;
        totalYearlyCost += amt * 4;
      }
    });

    return {
      subscriptions,
      summary: {
        totalSubscriptions: subscriptions.length,
        activeSubscriptionsCount: activeSubs.length,
        totalMonthlyCost: Math.round(totalMonthlyCost),
        totalYearlyCost: Math.round(totalYearlyCost)
      }
    };
  }

  async createSubscription(userId, data) {
    return subscriptionRepository.create(userId, data);
  }

  async updateSubscription(userId, id, data) {
    const existing = await subscriptionRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Subscription not found', 404);
    }
    return subscriptionRepository.update(userId, id, data);
  }

  async deleteSubscription(userId, id) {
    const existing = await subscriptionRepository.findById(userId, id);
    if (!existing) {
      throw new AppError('Subscription not found', 404);
    }
    return subscriptionRepository.delete(userId, id);
  }
}

module.exports = new SubscriptionService();
