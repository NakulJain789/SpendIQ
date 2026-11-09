import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function StatCard({
  title,
  amount,
  isCurrency = true,
  icon: Icon,
  trend,
  trendLabel,
  colorScheme = 'violet', // 'violet' | 'emerald' | 'rose' | 'amber' | 'cyan'
}) {
  const schemeStyles = {
    violet: {
      border: 'hover:border-brand-violet/30',
      glow: 'shadow-glow-violet',
      iconBg: 'bg-brand-violet/15 text-brand-violet border-brand-violet/20',
      textGrad: 'text-gradient-primary',
    },
    emerald: {
      border: 'hover:border-emerald-500/30',
      glow: 'shadow-glow-income',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
      textGrad: 'text-gradient-income',
    },
    rose: {
      border: 'hover:border-rose-500/30',
      glow: 'shadow-glow-expense',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
      textGrad: 'text-gradient-expense',
    },
    amber: {
      border: 'hover:border-amber-500/30',
      glow: 'shadow-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
      textGrad: 'text-amber-400',
    },
    cyan: {
      border: 'hover:border-cyan-500/30',
      glow: 'shadow-glow-cyan',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
      textGrad: 'text-cyan-400',
    },
  };

  const selected = schemeStyles[colorScheme] || schemeStyles.violet;

  return (
    <div
      className={`glass-panel rounded-3xl p-5 sm:p-6 transition-all duration-300 ${selected.border} hover:translate-y-[-2px] hover:shadow-xl`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${selected.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-extrabold font-numeric text-white tracking-tight">
        {isCurrency ? formatINR(amount) : amount}
      </div>

      {trendLabel && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
          {trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
          {trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
          {trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
