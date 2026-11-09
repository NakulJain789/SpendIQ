import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Pencil,
  Trash2,
  Calendar,
  Tag
} from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters';

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  categoryColor = '#6366F1'
}) {
  const isIncome = transaction.type === 'income';

  return (
    <div className="glass-panel-subtle rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.07] border border-white/5 hover:border-white/10 group flex items-center justify-between gap-3 sm:gap-4">
      {/* Left: Type Icon + Title + Category + Date */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className={`w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center border ${
            isIncome
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/25'
          }`}
        >
          {isIncome ? (
            <ArrowDownLeft className="w-5 h-5" />
          ) : (
            <ArrowUpRight className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-xs">
              {transaction.title}
            </h3>
            {transaction.isRecurring && (
              <span className="flex items-center gap-1 text-[10px] font-medium bg-brand-violet/20 text-brand-violet border border-brand-violet/30 px-2 py-0.5 rounded-full flex-shrink-0">
                <Repeat className="w-2.5 h-2.5" />
                <span className="hidden sm:inline capitalize">{transaction.recurringFrequency}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span
              className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md text-[11px]"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
              }}
            >
              <Tag className="w-2.5 h-2.5" />
              {transaction.category}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              {formatDate(transaction.date, 'short')}
            </span>
          </div>

          {transaction.notes && (
            <p className="text-xs text-slate-500 truncate mt-1 italic max-w-xs">
              "{transaction.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Right: Amount + Actions */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="text-right">
          <div
            className={`font-numeric font-bold text-sm sm:text-base ${
              isIncome ? 'text-emerald-400' : 'text-slate-100'
            }`}
          >
            {isIncome ? '+' : '-'}{formatINR(transaction.amount)}
          </div>
          <div className="text-[10px] uppercase text-slate-500 font-medium tracking-wider">
            {transaction.type}
          </div>
        </div>

        {/* Action buttons (always accessible on mobile, highlighted on hover) */}
        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-violet/20 hover:text-brand-violet text-slate-400 transition-colors"
              title="Edit Transaction"
              aria-label="Edit transaction"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(transaction)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
              title="Delete Transaction"
              aria-label="Delete transaction"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
