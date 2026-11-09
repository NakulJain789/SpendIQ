const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// @desc    Get complete dynamic dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    // 1. Fetch all user transactions
    const allTransactions = await Transaction.find({ user: userId }).sort({ date: -1 });

    // 2. Compute overall totals
    let totalIncome = 0;
    let totalExpenses = 0;

    // Current month totals
    let currentMonthIncome = 0;
    let currentMonthExpense = 0;

    const startOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0));
    const endOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

    // Category spending map (for current month and overall)
    const categorySpendingMap = {};
    const categoryCountMap = {};

    allTransactions.forEach((t) => {
      const amount = t.amount;
      const tDate = new Date(t.date);

      if (t.type === 'income') {
        totalIncome += amount;
        if (tDate >= startOfCurrentMonth && tDate <= endOfCurrentMonth) {
          currentMonthIncome += amount;
        }
      } else if (t.type === 'expense') {
        totalExpenses += amount;
        if (tDate >= startOfCurrentMonth && tDate <= endOfCurrentMonth) {
          currentMonthExpense += amount;
        }

        // Categorize expenses
        categorySpendingMap[t.category] = (categorySpendingMap[t.category] || 0) + amount;
        categoryCountMap[t.category] = (categoryCountMap[t.category] || 0) + 1;
      }
    });

    const totalBalance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

    // 3. User categories with their colors
    const userCategories = await Category.find({ user: userId });
    const categoryColorMap = {};
    userCategories.forEach((c) => {
      categoryColorMap[c.name] = c.color;
    });

    // 4. Category-wise breakdown list
    const categoryBreakdown = Object.keys(categorySpendingMap).map((catName) => {
      const amount = categorySpendingMap[catName];
      const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
      return {
        name: catName,
        amount,
        percentage,
        count: categoryCountMap[catName] || 0,
        color: categoryColorMap[catName] || '#6366F1'
      };
    }).sort((a, b) => b.amount - a.amount);

    // 5. Monthly trend for past 6 months (dynamic calculation)
    const monthlyTrend = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth();

      const mStart = new Date(Date.UTC(mYear, mMonth, 1, 0, 0, 0));
      const mEnd = new Date(Date.UTC(mYear, mMonth + 1, 0, 23, 59, 59, 999));

      let mIncome = 0;
      let mExpense = 0;

      allTransactions.forEach((t) => {
        const tDate = new Date(t.date);
        if (tDate >= mStart && tDate <= mEnd) {
          if (t.type === 'income') mIncome += t.amount;
          if (t.type === 'expense') mExpense += t.amount;
        }
      });

      monthlyTrend.push({
        month: `${monthNames[mMonth]} '${String(mYear).slice(-2)}`,
        fullMonth: monthNames[mMonth],
        year: mYear,
        monthIndex: mMonth + 1,
        income: mIncome,
        expense: mExpense,
        net: mIncome - mExpense
      });
    }

    // 6. Recent transactions (last 6)
    const recentTransactions = allTransactions.slice(0, 6);

    res.json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpenses,
        savingsRate,
        currentMonth: {
          name: monthNames[currentMonth],
          year: currentYear,
          income: currentMonthIncome,
          expense: currentMonthExpense,
          net: currentMonthIncome - currentMonthExpense
        },
        monthlyTrend,
        categoryBreakdown,
        recentTransactions,
        transactionCount: allTransactions.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
