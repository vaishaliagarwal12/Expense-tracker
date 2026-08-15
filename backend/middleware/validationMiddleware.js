const { errorResponse } = require('../utils/errorResponse');

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  if (!name || name.trim().length < 2) {
    return errorResponse(res, 400, 'Name must be at least 2 characters long');
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return errorResponse(res, 400, 'Valid email address is required');
  }
  if (!password || password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters long');
  }
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }
  next();
}

function validateTransaction(req, res, next) {
  const { amount, type, category, description, date, payment_method } = req.body;
  
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return errorResponse(res, 400, 'Transaction amount must be a positive number');
  }
  if (!type || !['income', 'expense'].includes(type.toLowerCase())) {
    return errorResponse(res, 400, 'Type must be either income or expense');
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    return errorResponse(res, 400, 'Category is required');
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return errorResponse(res, 400, 'Description is required');
  }
  if (!date || isNaN(Date.parse(date))) {
    return errorResponse(res, 400, 'Valid transaction date is required');
  }
  if (!payment_method) {
    return errorResponse(res, 400, 'Payment method is required');
  }
  next();
}

function validateBudget(req, res, next) {
  const { category, amount, month_year } = req.body;
  if (!category || !category.trim()) {
    return errorResponse(res, 400, 'Category is required');
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return errorResponse(res, 400, 'Budget amount must be greater than zero');
  }
  if (!month_year || !/^\d{4}-\d{2}$/.test(month_year)) {
    return errorResponse(res, 400, 'Month and Year format must be YYYY-MM');
  }
  next();
}

function validateGoal(req, res, next) {
  const { name, target_amount, deadline } = req.body;
  if (!name || !name.trim()) {
    return errorResponse(res, 400, 'Goal name is required');
  }
  if (target_amount === undefined || isNaN(target_amount) || Number(target_amount) <= 0) {
    return errorResponse(res, 400, 'Target amount must be a positive number');
  }
  if (!deadline || isNaN(Date.parse(deadline))) {
    return errorResponse(res, 400, 'Valid deadline date is required');
  }
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateTransaction,
  validateBudget,
  validateGoal
};
