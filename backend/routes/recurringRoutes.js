const express = require('express');
const router = express.Router();
const recurringController = require('../controllers/RecurringController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', (req, res, next) => recurringController.getAll(req, res, next));
router.post('/', (req, res, next) => recurringController.create(req, res, next));
router.put('/:id', (req, res, next) => recurringController.update(req, res, next));
router.delete('/:id', (req, res, next) => recurringController.delete(req, res, next));

module.exports = router;
