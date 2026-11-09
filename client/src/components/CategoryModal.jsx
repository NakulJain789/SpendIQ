import React, { useState, useEffect } from 'react';
import { X, Tag, Palette, IndianRupee, Save } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const PRESET_COLORS = [
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EF4444', // Red
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#6B7280', // Slate
];

export default function CategoryModal({
  isOpen,
  onClose,
  initialData = null,
  onSave
}) {
  const { addCategory, updateCategory } = useFinance();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#8B5CF6');
  const [monthlyBudget, setMonthlyBudget] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(initialData && initialData._id);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setColor(initialData.color || '#8B5CF6');
      setMonthlyBudget(initialData.monthlyBudget ? String(initialData.monthlyBudget) : '0');
    } else {
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      setMonthlyBudget('0');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const payload = {
      name: name.trim(),
      color,
      monthlyBudget: parseFloat(monthlyBudget) || 0
    };

    let result;
    if (isEditMode) {
      result = await updateCategory(initialData._id, payload);
    } else {
      result = await addCategory(payload);
    }

    setIsSubmitting(false);
    if (result?.success) {
      if (onSave) onSave(result.data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0C121E] border border-white/10 rounded-3xl shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white">
              {isEditMode ? 'Edit Category' : 'Create Category'}
            </h2>
            <p className="text-xs text-slate-400">
              Customize tag name, color, and monthly allowance
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Category Name *
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Subscriptions, Groceries, Gym"
              className="w-full bg-dark-900 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet"
              autoFocus
            />
          </div>

          {/* Color Picker with presets */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Color Tag</span>
              <span className="font-numeric text-[11px] text-slate-400 uppercase">{color}</span>
            </label>
            <div className="grid grid-cols-5 gap-2.5 mb-2.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setColor(preset)}
                  className={`h-9 rounded-xl transition-transform flex items-center justify-center ${
                    color.toLowerCase() === preset.toLowerCase()
                      ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-dark-900'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-slate-400">Custom Hex Code</span>
            </div>
          </div>

          {/* Monthly Budget for this Category */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Monthly Budget Limit (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-numeric">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="0"
                className="w-full bg-dark-900 border border-white/10 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-bold font-numeric text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Leave 0 if you don't wish to enforce a monthly limit on this category.
            </p>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-brand-violet/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
