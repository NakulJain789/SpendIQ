const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

// Generate JWT token valid for 7 days
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'spendiq_fallback_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Default categories seeded for each new user
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#F59E0B', icon: 'Utensils', monthlyBudget: 8000 },
  { name: 'Transport', color: '#3B82F6', icon: 'Car', monthlyBudget: 3000 },
  { name: 'Rent & Housing', color: '#8B5CF6', icon: 'Home', monthlyBudget: 15000 },
  { name: 'Bills & Utilities', color: '#EF4444', icon: 'Zap', monthlyBudget: 4000 },
  { name: 'Shopping', color: '#EC4899', icon: 'ShoppingBag', monthlyBudget: 5000 },
  { name: 'Health & Medical', color: '#10B981', icon: 'Activity', monthlyBudget: 2500 },
  { name: 'Entertainment', color: '#6366F1', icon: 'Film', monthlyBudget: 3000 },
  { name: 'Salary', color: '#059669', icon: 'Banknote', monthlyBudget: 0 },
  { name: 'Other', color: '#6B7280', icon: 'MoreHorizontal', monthlyBudget: 2000 }
];

// @desc    Register a new user & seed default categories
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password
    });

    // Seed default categories for this newly registered user
    try {
      const seeded = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        user: user._id
      }));
      await Category.insertMany(seeded);
    } catch (seedError) {
      console.warn('Default categories seeding note:', seedError.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  DEFAULT_CATEGORIES
};
