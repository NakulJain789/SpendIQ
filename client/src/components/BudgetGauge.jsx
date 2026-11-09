import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function BudgetGauge({
  spent = 0,
  budget = 0,
  percentage = 0,
  monthName = 'This Month',
  year = 2026
}) {
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const validPercentage = Math.max(0, Number(percentage) || 0);
  // Cap visual circle fill at 100% so stroke doesn't loop
  const strokeDashoffset = circumference - (Math.min(validPercentage, 100) / 100) * circumference;

  // Determine color status
  let statusColor = '#10B981'; // Green
  let statusBg = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  let statusLabel = 'On Track';
  let statusIcon = CheckCircle2;

  if (validPercentage >= 100) {
    statusColor = '#F43F5E'; // Red
    statusBg = 'bg-rose-500/15 border-rose-500/30 text-rose-400';
    statusLabel = 'Budget Exceeded';
    statusIcon = AlertTriangle;
  } else if (validPercentage >= 80) {
    statusColor = '#F59E0B'; // Amber
    statusBg = 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    statusLabel = 'Nearing Limit';
    statusIcon = AlertTriangle;
  }

  const StatusIconComponent = statusIcon;
  const remaining = budget - spent;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden">
      {/* Background ambient glow based on status */}
      <div
        className="absolute w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none -top-10 -right-10"
        style={{ backgroundColor: statusColor }}
      />

      <div className="w-full flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Spending Pace</span>
          <h2 className="text-lg font-bold text-white">{monthName} {year}</h2>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBg}`}>
          <StatusIconComponent className="w-3.5 h-3.5" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Circular Progress Gauge */}
      <div className="relative flex items-center justify-center my-4">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            stroke="rgba(255, 255, 255, 0.08)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Animated active stroke */}
          <circle
            stroke={statusColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease'
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-extrabold font-numeric text-white tracking-tight">
            {validPercentage}%
          </span>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Used</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-center">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Spent so far</div>
          <div className="text-base sm:text-lg font-bold font-numeric text-white mt-0.5">
            {formatINR(spent)}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
          <div className="text-xs text-slate-400 font-medium">
            {remaining >= 0 ? 'Remaining' : 'Over budget by'}
          </div>
          <div
            className={`text-base sm:text-lg font-bold font-numeric mt-0.5 ${
              remaining < 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {formatINR(Math.abs(remaining))}
          </div>
        </div>
      </div>

      {/* Warning message if close or exceeded */}
      {validPercentage >= 80 && (
        <div className={`w-full mt-4 p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${statusBg}`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            {validPercentage >= 100
              ? `You have exceeded your ${monthName} budget by ${formatINR(Math.abs(remaining))}. Time to curb non-essential spending!`
              : `You have spent ${validPercentage}% of your budget with time remaining this month. Proceed mindfully.`}
          </span>
        </div>
      )}
    </div>
  );
}
