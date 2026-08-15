const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/AnalyticsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', (req, res, next) => analyticsController.getAnalytics(req, res, next));

module.exports = router;
