const userRepository = require('../repositories/UserRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const budgetRepository = require('../repositories/BudgetRepository');
const goalRepository = require('../repositories/GoalRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');
const recurringRepository = require('../repositories/RecurringRepository');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { AppError } = require('../utils/errorResponse');

class AuthService {
  async register({ name, email, password, currency_symbol = '₹' }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('An account with this email address already exists', 400);
    }

    const password_hash = await hashPassword(password);
    const user = await userRepository.create({ name, email, password_hash, currency_symbol });

    // Seed sample financial data for new user so dashboard is immediately rich & realistic
    await this.seedSampleData(user.id);

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency_symbol: user.currency_symbol
      },
      token
    };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency_symbol: user.currency_symbol
      },
      token
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User profile not found', 404);
    }
    return user;
  }

  async updateProfile(userId, { name, currency_symbol }) {
    const updated = await userRepository.updateProfile(userId, { name, currency_symbol });
    return updated;
  }

  async seedSampleData(userId) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const monthYear = `${currentYear}-${currentMonth}`;

    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 15);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonthStr = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const prevMonthYear = `${prevYear}-${prevMonthStr}`;

    // Sample Transactions (Current Month)
    await transactionRepository.create(userId, {
      amount: 85000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly Tech Salary Credit',
      date: `${monthYear}-01`,
      payment_method: 'Bank Transfer',
      notes: 'Direct deposit into Savings Account'
    });

    await transactionRepository.create(userId, {
      amount: 15000,
      type: 'income',
      category: 'Freelancing',
      description: 'UI/UX Design Consultation',
      date: `${monthYear}-08`,
      payment_method: 'UPI',
      notes: 'Project milestone 1'
    });

    await transactionRepository.create(userId, {
      amount: 22000,
      type: 'expense',
      category: 'Rent',
      description: 'Apartment Monthly Rent',
      date: `${monthYear}-02`,
      payment_method: 'Bank Transfer'
    });

    await transactionRepository.create(userId, {
      amount: 6400,
      type: 'expense',
      category: 'Food',
      description: 'Supermarket Groceries & Essentials',
      date: `${monthYear}-05`,
      payment_method: 'Debit Card'
    });

    await transactionRepository.create(userId, {
      amount: 2800,
      type: 'expense',
      category: 'Food',
      description: 'Weekend Dining Out & Coffee',
      date: `${monthYear}-12`,
      payment_method: 'UPI'
    });

    await transactionRepository.create(userId, {
      amount: 4500,
      type: 'expense',
      category: 'Bills',
      description: 'Electricity & High-speed Internet',
      date: `${monthYear}-06`,
      payment_method: 'UPI'
    });

    await transactionRepository.create(userId, {
      amount: 5200,
      type: 'expense',
      category: 'Shopping',
      description: 'New Apparel & Sneakers',
      date: `${monthYear}-10`,
      payment_method: 'Credit Card'
    });

    await transactionRepository.create(userId, {
      amount: 1800,
      type: 'expense',
      category: 'Transport',
      description: 'Metro Pass & Uber Commute',
      date: `${monthYear}-09`,
      payment_method: 'Wallet'
    });

    // Sample Transactions (Previous Month)
    await transactionRepository.create(userId, {
      amount: 85000,
      type: 'income',
      category: 'Salary',
      description: 'Monthly Salary Credit',
      date: `${prevMonthYear}-01`,
      payment_method: 'Bank Transfer'
    });

    await transactionRepository.create(userId, {
      amount: 22000,
      type: 'expense',
      category: 'Rent',
      description: 'Apartment Monthly Rent',
      date: `${prevMonthYear}-02`,
      payment_method: 'Bank Transfer'
    });

    await transactionRepository.create(userId, {
      amount: 7500,
      type: 'expense',
      category: 'Food',
      description: 'Groceries & Provisions',
      date: `${prevMonthYear}-10`,
      payment_method: 'Debit Card'
    });

    // Sample Budgets
    await budgetRepository.create(userId, {
      category: 'Food',
      amount: 10000,
      month_year: monthYear
    });

    await budgetRepository.create(userId, {
      category: 'Rent',
      amount: 25000,
      month_year: monthYear
    });

    await budgetRepository.create(userId, {
      category: 'Shopping',
      amount: 6000,
      month_year: monthYear
    });

    await budgetRepository.create(userId, {
      category: 'Bills',
      amount: 5000,
      month_year: monthYear
    });

    // Sample Savings Goals
    const futureDate1 = new Date(today.getFullYear(), today.getMonth() + 6, 15).toISOString().split('T')[0];
    const futureDate2 = new Date(today.getFullYear() + 1, today.getMonth(), 1).toISOString().split('T')[0];

    await goalRepository.create(userId, {
      name: 'MacBook Pro M3 Fund',
      target_amount: 150000,
      current_saved: 65000,
      deadline: futureDate1,
      description: 'Upgrading work laptop for mobile dev & video editing'
    });

    await goalRepository.create(userId, {
      name: 'Emergency Reserve Fund',
      target_amount: 200000,
      current_saved: 120000,
      deadline: futureDate2,
      description: '6 months of essential living expenses'
    });

    // Sample Subscriptions
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await subscriptionRepository.create(userId, {
      name: 'Netflix Premium (4K)',
      amount: 649,
      billing_frequency: 'Monthly',
      next_billing_date: nextWeek,
      category: 'Entertainment'
    });

    await subscriptionRepository.create(userId, {
      name: 'Spotify Premium Family',
      amount: 179,
      billing_frequency: 'Monthly',
      next_billing_date: nextWeek,
      category: 'Entertainment'
    });

    await subscriptionRepository.create(userId, {
      name: 'GitHub Copilot Pro',
      amount: 1000,
      billing_frequency: 'Monthly',
      next_billing_date: `${monthYear}-28`,
      category: 'Education'
    });

    // Sample Recurring Expenses
    await recurringRepository.create(userId, {
      name: 'House Rent',
      amount: 22000,
      category: 'Rent',
      type: 'expense',
      frequency: 'Monthly',
      start_date: `${monthYear}-01`,
      next_occurrence: `${currentYear}-${String(today.getMonth() + 2).padStart(2, '0')}-01`
    });

    await recurringRepository.create(userId, {
      name: 'Internet Broadband (100 Mbps)',
      amount: 999,
      category: 'Bills',
      type: 'expense',
      frequency: 'Monthly',
      start_date: `${monthYear}-05`,
      next_occurrence: `${currentYear}-${String(today.getMonth() + 2).padStart(2, '0')}-05`
    });
  }
}

module.exports = new AuthService();
