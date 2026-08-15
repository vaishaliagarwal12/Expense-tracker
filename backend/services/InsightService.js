const analyticsService = require('./AnalyticsService');
const budgetService = require('./BudgetService');
const subscriptionRepository = require('../repositories/SubscriptionRepository');

class InsightService {
  async generateRuleBasedInsights(userId, monthYear) {
    const insights = [];

    const analytics = await analyticsService.getAnalytics(userId, monthYear);
    const budgetsData = await budgetService.getBudgetsWithProgress(userId, monthYear);
    const subscriptions = await subscriptionRepository.findAll(userId);

    const { metrics, momComparison, expenseCategories } = analytics;

    // 1. Highest Expense Category Insight
    if (metrics.highestCategory && metrics.highestCategory.total > 0) {
      insights.push({
        id: 'highest-category',
        type: 'info',
        title: 'Highest Expense Category',
        message: `${metrics.highestCategory.category} is your highest expense category this month at ₹${metrics.highestCategory.total.toLocaleString()}.`,
        impact: 'neutral'
      });
    }

    // 2. Savings Rate MoM Change Insight
    if (momComparison.savingsChangePct !== 0) {
      const isPositive = momComparison.savingsChangePct > 0;
      insights.push({
        id: 'savings-rate-change',
        type: isPositive ? 'success' : 'warning',
        title: isPositive ? 'Savings Rate Improved' : 'Savings Rate Decreased',
        message: isPositive
          ? `Great job! Your savings rate improved by ${momComparison.savingsChangePct}% compared with last month.`
          : `Your savings rate declined by ${Math.abs(momComparison.savingsChangePct)}% compared with last month.`,
        impact: isPositive ? 'positive' : 'negative'
      });
    }

    // 3. Category Spending Increase/Decrease (MoM)
    // Check specific categories like Food, Rent, Shopping
    if (expenseCategories.length > 0) {
      const topCat = expenseCategories[0];
      if (momComparison.expenseChangePct > 15) {
        insights.push({
          id: 'category-increase',
          type: 'warning',
          title: `${topCat.category} Spending Surge`,
          message: `Your ${topCat.category.toLowerCase()} spending increased significantly by ${momComparison.expenseChangePct}% compared with last month.`,
          impact: 'negative'
        });
      }
    }

    // 4. Budget Utilization Insights
    budgetsData.budgets.forEach(b => {
      if (b.usagePercentage >= 100) {
        insights.push({
          id: `budget-exceeded-${b.category}`,
          type: 'danger',
          title: `Budget Exceeded: ${b.category}`,
          message: `You have exceeded your ${b.category} budget by ₹${Math.abs(b.remaining).toLocaleString()} (${b.usagePercentage}% used).`,
          impact: 'negative'
        });
      } else if (b.usagePercentage >= 80) {
        insights.push({
          id: `budget-warning-${b.category}`,
          type: 'warning',
          title: `High Budget Usage: ${b.category}`,
          message: `You have used ${b.usagePercentage}% of your monthly ${b.category.toLowerCase()} budget.`,
          impact: 'negative'
        });
      }
    });

    // 5. Subscription Renewals Insight
    const upcomingRenewals = subscriptions.filter(sub => {
      if (!sub.next_billing_date) return false;
      const diffDays = (new Date(sub.next_billing_date) - new Date()) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    });

    if (upcomingRenewals.length > 0) {
      const names = upcomingRenewals.map(s => s.name).join(', ');
      insights.push({
        id: 'upcoming-subscriptions',
        type: 'info',
        title: 'Upcoming Subscription Renewals',
        message: `You have ${upcomingRenewals.length} subscription(s) renewing in the next 7 days (${names}).`,
        impact: 'neutral'
      });
    }

    // 6. Good Financial Habit Default Insight if list is short
    if (insights.length < 2) {
      insights.push({
        id: 'financial-health-tip',
        type: 'success',
        title: 'Financial Tip',
        message: 'Building an emergency fund of 3 to 6 months of living expenses provides strong security against unexpected costs.',
        impact: 'positive'
      });
    }

    return insights;
  }
}

module.exports = new InsightService();
