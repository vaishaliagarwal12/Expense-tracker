const express = require('express');
const router = express.Router();
const insightController = require('../controllers/InsightController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', (req, res, next) => insightController.getInsights(req, res, next));

module.exports = router;
