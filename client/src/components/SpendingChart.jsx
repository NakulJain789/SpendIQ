import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';
import { formatINR, formatCompactINR } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const income = payload.find((p) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p) => p.dataKey === 'expense')?.value || 0;
    const net = income - expense;

    return (
      <div className="glass-panel p-3.5 rounded-2xl shadow-xl text-xs space-y-1.5 border border-white/10">
        <div className="font-semibold text-slate-300 pb-1 border-b border-white/10">{label}</div>
        <div className="flex items-center justify-between gap-4 text-emerald-400">
          <span>Income:</span>
          <span className="font-numeric font-semibold">{formatINR(income)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-rose-400">
          <span>Expense:</span>
          <span className="font-numeric font-semibold">{formatINR(expense)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-slate-300 pt-1 border-t border-white/10 font-bold">
          <span>Net:</span>
          <span className={`font-numeric ${net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(net)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function SpendingChart({ data = [] }) {
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'

  const safeData = data.length > 0 ? data : [
    { month: 'Jun', income: 0, expense: 0 },
    { month: 'Jul', income: 0, expense: 0 },
    { month: 'Aug', income: 0, expense: 0 },
    { month: 'Sep', income: 0, expense: 0 },
    { month: 'Oct', income: 0, expense: 0 },
    { month: 'Nov', income: 0, expense: 0 },
  ];

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Cashflow Analytics</span>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Income vs. Expenses
          </h2>
        </div>
        {/* Chart type toggle */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              chartType === 'area'
                ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Smooth Flow
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              chartType === 'bar'
                ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bars
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={safeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatCompactINR(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#F43F5E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={safeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => formatCompactINR(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
