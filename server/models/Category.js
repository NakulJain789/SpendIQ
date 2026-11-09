const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [40, 'Category name cannot exceed 40 characters']
  },
  color: {
    type: String,
    required: true,
    default: '#6366F1'
  },
  icon: {
    type: String,
    default: 'Tag'
  },
  monthlyBudget: {
    type: Number,
    default: 0,
    min: [0, 'Monthly budget cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure uniqueness of category name per user
categorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
