import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Target,
  Sparkles,
  Palette
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import BudgetGauge from '../components/BudgetGauge';
import CategoryModal from '../components/CategoryModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SkeletonLoader from '../components/SkeletonLoader';
import { formatINR, MONTH_NAMES } from '../utils/formatters';

export default function BudgetPage() {
  const {
    categories,
    isCategoriesLoading,
    budgetData,
    isBudgetLoading,
    budgetMonth,
    budgetYear,
    setBudgetMonth,
    setBudgetYear,
    updateBudgetTarget,
    deleteCategory
  } = useFinance();

  // Budget Edit Modal
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [targetAmountInput, setTargetAmountInput] = useState('');
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Category Modal States
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (budgetMonth === 1) {
      setBudgetMonth(12);
      setBudgetYear(budgetYear - 1);
    } else {
      setBudgetMonth(budgetMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (budgetMonth === 12) {
      setBudgetMonth(1);
      setBudgetYear(budgetYear + 1);
    } else {
      setBudgetMonth(budgetMonth + 1);
    }
  };

  const handleOpenBudgetEdit = () => {
    setTargetAmountInput(String(budgetData?.budgetAmount || 0));
    setIsEditingBudget(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const amount = parseFloat(targetAmountInput);
    if (isNaN(amount) || amount < 0) return;

    setIsSavingBudget(true);
    await updateBudgetTarget(amount);
    setIsSavingBudget(false);
    setIsEditingBudget(false);
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeletingCat(true);
    await deleteCategory(deletingCategory._id);
    setIsDeletingCat(false);
    setDeletingCategory(null);
  };

  const monthName = MONTH_NAMES[budgetMonth - 1] || 'Current Month';

  return (
    <div className="space-y-6">
      {/* Month & Year Header Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel rounded-3xl p-4 sm:p-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Budget Planner</span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            {monthName} {budgetYear}
          </h2>
        </div>

        {/* Month selector navigation */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-dark-900 rounded-2xl border border-white/10 p-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 text-xs font-bold font-numeric text-white">
              {monthName.slice(0, 3)} {budgetYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenBudgetEdit}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-bold shadow-lg shadow-brand-violet/25 transition-all"
          >
            <Target className="w-4 h-4" />
            <span>Set Target</span>
          </button>
        </div>
      </div>

      {/* Main Budget Dashboard Grid */}
      {isBudgetLoading && !budgetData ? (
        <SkeletonLoader count={2} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Progress Ring Gauge */}
          <div className="lg:col-span-5">
            <BudgetGauge
              spent={budgetData?.totalSpent || 0}
              budget={budgetData?.budgetAmount || 0}
              percentage={budgetData?.percentageUsed || 0}
              monthName={monthName}
              year={budgetYear}
            />
          </div>

          {/* Right Column: Key Overview & Category Progress */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="glass-panel p-4 rounded-2xl">
                <div className="text-xs text-slate-400">Total Monthly Target</div>
                <div className="text-xl font-bold font-numeric text-white mt-1">
                  {formatINR(budgetData?.budgetAmount || 0)}
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl">
                <div className="text-xs text-slate-400">Actual Spent</div>
                <div className="text-xl font-bold font-numeric text-rose-400 mt-1">
                  {formatINR(budgetData?.totalSpent || 0)}
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl">
                <div className="text-xs text-slate-400">Remaining Cushion</div>
                <div
                  className={`text-xl font-bold font-numeric mt-1 ${
                    (budgetData?.remainingBudget || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatINR(budgetData?.remainingBudget || 0)}
                </div>
              </div>
            </div>

            {/* Category-Level Budget Progress */}
            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Category Spending in {monthName}</h3>
                  <p className="text-xs text-slate-400">Track actual spending against per-category targets</p>
                </div>
              </div>

              {(!budgetData?.categoryBreakdown || budgetData.categoryBreakdown.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No categories configured yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {budgetData.categoryBreakdown.map((item) => {
                    const isExceeded = item.budget > 0 && item.spent > item.budget;
                    const isWarning = item.budget > 0 && item.percentage >= 80 && !isExceeded;
                    const barColor = isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

                    return (
                      <div key={item.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="font-semibold text-white">{item.name}</span>
                            {isExceeded && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-400 font-semibold">
                                Exceeded
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 font-numeric">
                            <span className="font-bold text-white">{formatINR(item.spent)}</span>
                            <span className="text-slate-500">/</span>
                            <span className="text-slate-400">
                              {item.budget > 0 ? formatINR(item.budget) : 'No limit'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {item.budget > 0 && (
                          <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                              style={{ width: `${Math.min(item.percentage, 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories Management Section */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Settings</span>
            <h3 className="text-lg font-bold text-white">Manage Categories</h3>
            <p className="text-xs text-slate-400">
              Customize colors, labels, and default monthly caps for each spending bucket
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingCategory(null);
              setCategoryModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>

        {isCategoriesLoading ? (
          <SkeletonLoader count={3} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="p-4 rounded-2xl bg-dark-900/80 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm font-bold text-xs"
                    style={{ backgroundColor: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}40` }}
                  >
                    ●
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs sm:text-sm font-semibold text-white truncate">{cat.name}</h4>
                    <p className="text-[11px] text-slate-400 font-numeric">
                      Cap: {cat.monthlyBudget > 0 ? formatINR(cat.monthlyBudget) : 'Unlimited'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(cat);
                      setCategoryModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-violet/20 hover:text-brand-violet text-slate-400 transition-colors"
                    title="Edit Category"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCategory(cat)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Monthly Target Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setIsEditingBudget(false)} />
          <div className="relative w-full max-w-sm bg-[#0C121E] border border-white/10 rounded-3xl shadow-2xl p-6 z-10">
            <h3 className="text-base font-bold text-white mb-1">Set Monthly Budget</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter overall spending allowance for {monthName} {budgetYear}
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 font-numeric">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={targetAmountInput}
                  onChange={(e) => setTargetAmountInput(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-lg font-bold font-numeric text-white focus:outline-none focus:border-brand-violet"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBudget}
                  className="px-5 py-2 rounded-xl bg-brand-violet text-white text-xs font-bold shadow-md shadow-brand-violet/25"
                >
                  {isSavingBudget ? 'Saving...' : 'Save Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
      />

      {/* Delete Category Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategoryConfirm}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Existing transactions will retain their historical name.`}
        isDeleting={isDeletingCat}
      />
    </div>
  );
}
