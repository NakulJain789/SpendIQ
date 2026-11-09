const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

// @desc    Get budget details and month-specific spending progress
// @route   GET /api/budget
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1; // 1 - 12
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // 1. Fetch user's budget configuration for this month & year
    let budget = await Budget.findOne({
      user: req.user._id,
      month,
      year
    });

    // 2. Fetch categories
    const categories = await Category.find({ user: req.user._id });

    // If no explicit monthly budget document exists, calculate fallback from sum of category monthly budgets
    let targetAmount = budget ? budget.amount : categories.reduce((sum, c) => sum + (c.monthlyBudget || 0), 0);

    // 3. Calculate actual expenses for this specific month & year
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const expenseTransactions = await Transaction.find({
      user: req.user._id,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalSpent = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

    // Calculate category-level spending
    const categorySpendingMap = {};
    expenseTransactions.forEach((t) => {
      categorySpendingMap[t.category] = (categorySpendingMap[t.category] || 0) + t.amount;
    });

    const categoryBreakdown = categories.map((cat) => {
      const spent = categorySpendingMap[cat.name] || 0;
      // Find category budget override in monthly budget doc if present, else fallback to cat.monthlyBudget
      const catBudgetDoc = budget?.categoryBudgets?.find((b) => b.category.toLowerCase() === cat.name.toLowerCase());
      const catBudget = catBudgetDoc !== undefined ? catBudgetDoc.amount : (cat.monthlyBudget || 0);
      const remaining = catBudget - spent;
      const percentage = catBudget > 0 ? Math.round((spent / catBudget) * 100) : 0;

      return {
        id: cat._id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        budget: catBudget,
        spent,
        remaining,
        percentage,
        isOverBudget: catBudget > 0 && spent > catBudget
      };
    });

    const remainingBudget = targetAmount - totalSpent;
    const percentageUsed = targetAmount > 0 ? Math.round((totalSpent / targetAmount) * 100) : 0;

    let alertLevel = 'normal';
    if (percentageUsed >= 100) {
      alertLevel = 'exceeded';
    } else if (percentageUsed >= 80) {
      alertLevel = 'warning';
    }

    res.json({
      success: true,
      data: {
        month,
        year,
        budgetAmount: targetAmount,
        totalSpent,
        remainingBudget,
        percentageUsed,
        alertLevel, // 'normal' | 'warning' | 'exceeded'
        categoryBreakdown,
        isCustomBudgetSet: Boolean(budget)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update budget for a specific month & year
// @route   PUT /api/budget
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const { month, year, amount, categoryBudgets } = req.body;

    if (!month || !year || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Month, year, and amount are required'
      });
    }

    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);
    const parsedAmount = parseFloat(amount);

    if (parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    let budget = await Budget.findOne({
      user: req.user._id,
      month: parsedMonth,
      year: parsedYear
    });

    if (budget) {
      budget.amount = parsedAmount;
      if (Array.isArray(categoryBudgets)) {
        budget.categoryBudgets = categoryBudgets;
      }
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user._id,
        month: parsedMonth,
        year: parsedYear,
        amount: parsedAmount,
        categoryBudgets: Array.isArray(categoryBudgets) ? categoryBudgets : []
      });
    }

    // Optionally update Category defaults if categoryBudgets provided
    if (Array.isArray(categoryBudgets)) {
      for (const item of categoryBudgets) {
        if (item.category && item.amount !== undefined) {
          await Category.updateOne(
            { user: req.user._id, name: item.category },
            { $set: { monthlyBudget: parseFloat(item.amount) } }
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Monthly budget updated successfully',
      data: budget
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudget,
  updateBudget
};
