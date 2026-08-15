const analyticsService = require('./AnalyticsService');
const budgetService = require('./BudgetService');
const goalService = require('./GoalService');
const subscriptionRepository = require('../repositories/SubscriptionRepository');

class HealthScoreService {
  async calculateHealthScore(userId, monthYear) {
    const analytics = await analyticsService.getAnalytics(userId, monthYear);
    const budgetsData = await budgetService.getBudgetsWithProgress(userId, monthYear);
    const goalsData = await goalService.getGoalsWithCalculations(userId);
    const subscriptions = await subscriptionRepository.findAll(userId);

    const { metrics, momComparison } = analytics;

    // 1. Savings Rate Score (0 to 30 pts)
    // 20%+ savings rate gets full 30 pts; 0% gets 0 pts
    let savingsRateScore = 0;
    if (metrics.savingsRate >= 30) savingsRateScore = 30;
    else if (metrics.savingsRate >= 20) savingsRateScore = 25;
    else if (metrics.savingsRate >= 10) savingsRateScore = 18;
    else if (metrics.savingsRate > 0) savingsRateScore = 10;
    else savingsRateScore = 0;

    // 2. Budget Adherence Score (0 to 25 pts)
    // Deduct points for exceeded or warned budgets
    let budgetScore = 25;
    if (budgetsData.budgets.length > 0) {
      const exceededCount = budgetsData.budgets.filter(b => b.isExceeded).length;
      const warningCount = budgetsData.budgets.filter(b => b.isWarning).length;
      budgetScore = Math.max(0, 25 - (exceededCount * 10 + warningCount * 4));
    }

    // 3. Expense Control & Stability Score (0 to 15 pts)
    let expenseScore = 15;
    if (momComparison.expenseChangePct > 25) expenseScore = 5;
    else if (momComparison.expenseChangePct > 10) expenseScore = 10;
    else expenseScore = 15;

    // 4. Goal Progress Score (0 to 15 pts)
    let goalScore = 10;
    if (goalsData.summary.totalGoals > 0) {
      const avgProgress = goalsData.summary.overallProgress;
      goalScore = Math.min(15, Math.round((avgProgress / 100) * 15));
    }

    // 5. Subscription Control Score (0 to 15 pts)
    let subscriptionScore = 15;
    const monthlySubCost = subscriptions.reduce((sum, s) => {
      const amt = parseFloat(s.amount);
      if (s.billing_frequency === 'Yearly') return sum + (amt / 12);
      if (s.billing_frequency === 'Quarterly') return sum + (amt / 3);
      return sum + amt;
    }, 0);

    if (metrics.income > 0) {
      const subRatio = (monthlySubCost / metrics.income) * 100;
      if (subRatio > 10) subscriptionScore = 5;
      else if (subRatio > 5) subscriptionScore = 10;
      else subscriptionScore = 15;
    }

    const totalScore = Math.min(100, Math.max(0, Math.round(savingsRateScore + budgetScore + expenseScore + goalScore + subscriptionScore)));

    let ratingGrade = 'Fair';
    let color = '#F59E0B'; // Amber

    if (totalScore >= 80) {
      ratingGrade = 'Excellent';
      color = '#10B981'; // Green
    } else if (totalScore >= 65) {
      ratingGrade = 'Good';
      color = '#3B82F6'; // Blue
    } else if (totalScore >= 50) {
      ratingGrade = 'Fair';
      color = '#F59E0B'; // Amber
    } else {
      ratingGrade = 'Needs Improvement';
      color = '#EF4444'; // Red
    }

    const factors = [
      {
        category: 'Savings Rate',
        score: savingsRateScore,
        maxScore: 30,
        status: savingsRateScore >= 20 ? 'Optimal' : 'Needs boost',
        explanation: `Your savings rate is ${metrics.savingsRate}% of total monthly income.`
      },
      {
        category: 'Budget Adherence',
        score: budgetScore,
        maxScore: 25,
        status: budgetScore >= 20 ? 'Strong' : 'Overbudget risks',
        explanation: budgetsData.budgets.length > 0 
          ? `Overall budget utilization is ${budgetsData.summary.overallUsagePercentage}%.`
          : 'No category budgets created yet.'
      },
      {
        category: 'Expense Stability',
        score: expenseScore,
        maxScore: 15,
        status: expenseScore >= 12 ? 'Stable' : 'Volatile',
        explanation: `Month-over-month expense change is ${momComparison.expenseChangePct}%.`
      },
      {
        category: 'Savings Goal Track',
        score: goalScore,
        maxScore: 15,
        status: goalScore >= 10 ? 'On Track' : 'Lagging',
        explanation: `Overall savings goal progress is ${goalsData.summary.overallProgress}%.`
      },
      {
        category: 'Fixed Cost Ratio',
        score: subscriptionScore,
        maxScore: 15,
        status: subscriptionScore >= 12 ? 'Controlled' : 'High Subscriptions',
        explanation: `Monthly subscriptions account for ₹${Math.round(monthlySubCost).toLocaleString()}.`
      }
    ];

    return {
      score: totalScore,
      ratingGrade,
      color,
      factors,
      disclaimer: 'This financial health score is an application-generated indicator based on your logged transactions and budgets. It does not constitute formal financial advice.'
    };
  }
}

module.exports = new HealthScoreService();
