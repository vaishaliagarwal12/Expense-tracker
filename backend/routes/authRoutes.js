const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, (req, res, next) => authController.register(req, res, next));
router.post('/login', validateLogin, (req, res, next) => authController.login(req, res, next));
router.post('/logout', (req, res) => authController.logout(req, res));

router.get('/me', authenticate, (req, res, next) => authController.me(req, res, next));
router.put('/profile', authenticate, (req, res, next) => authController.updateProfile(req, res, next));

module.exports = router;
