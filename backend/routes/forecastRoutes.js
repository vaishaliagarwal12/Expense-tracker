const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/ForecastController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);
router.get('/', (req, res, next) => forecastController.getForecast(req, res, next));

module.exports = router;
