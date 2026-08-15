const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/SubscriptionController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', (req, res, next) => subscriptionController.getAll(req, res, next));
router.post('/', (req, res, next) => subscriptionController.create(req, res, next));
router.put('/:id', (req, res, next) => subscriptionController.update(req, res, next));
router.delete('/:id', (req, res, next) => subscriptionController.delete(req, res, next));

module.exports = router;
