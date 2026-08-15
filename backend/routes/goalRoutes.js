const express = require('express');
const router = express.Router();
const goalController = require('../controllers/GoalController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateGoal } = require('../middleware/validationMiddleware');

router.use(authenticate);

router.get('/', (req, res, next) => goalController.getGoals(req, res, next));
router.post('/', validateGoal, (req, res, next) => goalController.create(req, res, next));
router.put('/:id', validateGoal, (req, res, next) => goalController.update(req, res, next));
router.post('/:id/deposit', (req, res, next) => goalController.deposit(req, res, next));
router.delete('/:id', (req, res, next) => goalController.delete(req, res, next));

module.exports = router;
