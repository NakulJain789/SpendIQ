const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(protect);

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 40 }).withMessage('Name must be under 40 characters'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color code'),
  validateRequest
];

router.route('/')
  .get(getCategories)
  .post(categoryValidation, createCategory);

router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;
