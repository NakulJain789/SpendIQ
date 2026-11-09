const express = require('express');
const { body } = require('express-validator');
const {
  getTransactions,
  exportTransactionsCSV,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Apply auth protection to all transaction routes
router.use(protect);

const transactionValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title max length is 100'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number greater than 0'),
  body('type').isIn(['income', 'expense']).withMessage('Type must be either income or expense'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  validateRequest
];

router.get('/export', exportTransactionsCSV);
router.route('/')
  .get(getTransactions)
  .post(transactionValidation, createTransaction);

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
