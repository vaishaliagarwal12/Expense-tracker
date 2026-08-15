const express = require('express');
const router = express.Router();
const healthScoreController = require('../controllers/HealthScoreController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', (req, res, next) => healthScoreController.getHealthScore(req, res, next));

module.exports = router;
