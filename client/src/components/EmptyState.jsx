import React from 'react';
import { Plus } from 'lucide-react';

export default function EmptyState({
  icon = '💳',
  title = 'No records found',
  description = 'Start tracking by adding your first entry.',
  actionLabel,
  onAction
}) {
  return (
    <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6 border border-white/5">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4 shadow-inner">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-brand-violet/25 flex items-center gap-2 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
