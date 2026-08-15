const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/BudgetController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBudget } = require('../middleware/validationMiddleware');

router.use(authenticate);

router.get('/', (req, res, next) => budgetController.getBudgets(req, res, next));
router.post('/', validateBudget, (req, res, next) => budgetController.create(req, res, next));
router.put('/:id', validateBudget, (req, res, next) => budgetController.update(req, res, next));
router.delete('/:id', (req, res, next) => budgetController.delete(req, res, next));

module.exports = router;
