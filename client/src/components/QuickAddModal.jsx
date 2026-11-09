import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, ArrowDownLeft, ArrowUpRight, Repeat, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { toInputDateFormat } from '../utils/formatters';

export default function QuickAddModal() {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    categories,
    lastUsed,
    addTransaction
  } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(toInputDateFormat(new Date()));
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with last used preferences and defaults when opened
  useEffect(() => {
    if (isQuickAddOpen) {
      setTitle('');
      setAmount('');
      setDate(toInputDateFormat(new Date()));
      setNotes('');
      setIsRecurring(false);

      if (lastUsed) {
        setType(lastUsed.type || 'expense');
        setCategory(lastUsed.category || (categories[0]?.name || 'Food & Dining'));
      } else if (categories.length > 0) {
        setCategory(categories[0].name);
      }
    }
  }, [isQuickAddOpen, lastUsed, categories]);

  if (!isQuickAddOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsSubmitting(true);
    const result = await addTransaction({
      title: title.trim(),
      amount: parsedAmount,
      type,
      category: category || (categories[0]?.name || 'Other'),
      date,
      notes: notes.trim(),
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : 'none'
    });

    setIsSubmitting(false);
    if (result?.success) {
      setIsQuickAddOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setIsQuickAddOpen(false)}
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-[#0C121E] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add Transaction</h2>
              <p className="text-xs text-slate-400">Prefilled with today's date & last preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Income / Expense Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-dark-900 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Income</span>
            </button>
          </div>

          {/* Amount in INR */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400 font-numeric">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-dark-900 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xl font-bold font-numeric text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
                autoFocus
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Description / Title *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Swiggy Dinner, Groceries, Client Retainer"
              className="w-full bg-dark-900 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet"
            />
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-violet"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name} className="bg-dark-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-2xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-violet [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              maxLength={200}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add payment method or receipt note"
              className="w-full bg-dark-900 border border-white/10 rounded-2xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet"
            />
          </div>

          {/* Recurring Transaction Toggle */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-brand-violet" />
                <span className="text-xs font-medium text-slate-300">Recurring Transaction</span>
              </div>
              <input
                type="checkbox"
                id="quickRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-brand-violet focus:ring-brand-violet bg-dark-900 border-white/20 accent-brand-violet"
              />
            </div>

            {isRecurring && (
              <div className="mt-2.5">
                <select
                  value={recurringFrequency}
                  onChange={(e) => setRecurringFrequency(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly (Rent, Subscriptions)</option>
                  <option value="yearly">Yearly (Insurance, Annual Fee)</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting || !amount || !title.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-brand-violet/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Add Transaction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
