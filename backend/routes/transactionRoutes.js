const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/TransactionController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateTransaction } = require('../middleware/validationMiddleware');

router.use(authenticate);

router.get('/', (req, res, next) => transactionController.getAll(req, res, next));
router.get('/export', (req, res, next) => transactionController.exportCsv(req, res, next));
router.post('/import', (req, res, next) => transactionController.importCsv(req, res, next));

router.get('/:id', (req, res, next) => transactionController.getById(req, res, next));
router.post('/', validateTransaction, (req, res, next) => transactionController.create(req, res, next));
router.put('/:id', validateTransaction, (req, res, next) => transactionController.update(req, res, next));
router.delete('/:id', (req, res, next) => transactionController.delete(req, res, next));

module.exports = router;
