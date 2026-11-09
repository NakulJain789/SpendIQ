const express = require('express');
const { body } = require('express-validator');
const { getBudget, updateBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

const budgetValidation = [
  body('month').isInt({ min: 1, max: 12 }).withMessage('Valid month (1-12) is required'),
  body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Budget amount must be a positive number'),
  validateRequest
];

router.route('/')
  .get(getBudget)
  .put(budgetValidation, updateBudget);

module.exports = router;
