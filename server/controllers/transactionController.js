const Transaction = require('../models/Transaction');

// @desc    Get user transactions with comprehensive filtering, search, and pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      month,
      year,
      search,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 100
    } = req.query;

    const query = { user: req.user._id };

    // Filter by type
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Date Range or Month/Year
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set to end of the selected day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    } else if (month && year) {
      const parsedMonth = parseInt(month, 10) - 1; // 0-indexed in JS
      const parsedYear = parseInt(year, 10);
      const start = new Date(Date.UTC(parsedYear, parsedMonth, 1, 0, 0, 0));
      const end = new Date(Date.UTC(parsedYear, parsedMonth + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    // Text search in title or notes
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { notes: searchRegex }];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      Transaction.countDocuments(query)
    ]);

    res.json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export transactions as CSV
// @route   GET /api/transactions/export
// @access  Private
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, month, year } = req.query;
    const query = { user: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    } else if (month && year) {
      const parsedMonth = parseInt(month, 10) - 1;
      const parsedYear = parseInt(year, 10);
      const start = new Date(Date.UTC(parsedYear, parsedMonth, 1, 0, 0, 0));
      const end = new Date(Date.UTC(parsedYear, parsedMonth + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Format CSV
    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount (INR)', 'Recurring', 'Notes'];
    const rows = transactions.map((t) => {
      const formattedDate = new Date(t.date).toISOString().split('T')[0];
      const cleanTitle = `"${(t.title || '').replace(/"/g, '""')}"`;
      const cleanCategory = `"${(t.category || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(t.notes || '').replace(/"/g, '""')}"`;
      const recurring = t.isRecurring ? t.recurringFrequency : 'No';
      return [formattedDate, cleanTitle, t.type, cleanCategory, t.amount, recurring, cleanNotes].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=SpendIQ_Transactions_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, notes, isRecurring, recurringFrequency } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: parseFloat(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      isRecurring: Boolean(isRecurring),
      recurringFrequency: isRecurring ? (recurringFrequency || 'monthly') : 'none'
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount, type, category, date, notes, isRecurring, recurringFrequency } = req.body;

    let transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ownership check: user can only update their own records
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this transaction'
      });
    }

    if (title !== undefined) transaction.title = title;
    if (amount !== undefined) transaction.amount = parseFloat(amount);
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes;
    if (isRecurring !== undefined) {
      transaction.isRecurring = Boolean(isRecurring);
      transaction.recurringFrequency = isRecurring ? (recurringFrequency || 'monthly') : 'none';
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ownership check
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this transaction'
      });
    }

    await transaction.deleteOne();

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  exportTransactionsCSV,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
