import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatINR } from '../utils/formatters';

const DEFAULT_COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#EF4444', '#6B7280'];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-3 rounded-2xl shadow-xl text-xs space-y-1 border border-white/10">
        <div className="font-semibold text-slate-200 flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: data.color || '#8B5CF6' }}
          />
          {data.name}
        </div>
        <div className="text-white font-numeric font-bold text-sm">
          {formatINR(data.amount)}
        </div>
        <div className="text-slate-400">
          {data.percentage}% of total expenses
        </div>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ categoryData = [], totalExpenses = 0 }) {
  const [activeIndex, setActiveIndex] = useState(null);

  const hasData = categoryData && categoryData.length > 0 && totalExpenses > 0;

  return (
    <div className="glass-panel rounded-3xl p-5 sm:p-6 w-full flex flex-col justify-between">
      <div className="mb-4">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Spending Distribution</span>
        <h2 className="text-lg font-bold text-white">Category Breakdown</h2>
      </div>

      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-sm font-medium">No expense records yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
            Add your first expense transaction to view category insights.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Donut Chart */}
          <div className="relative w-56 h-56 flex-shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="amount"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                      stroke="#0D131F"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Total Spent</span>
              <span className="text-base sm:text-lg font-bold font-numeric text-white">
                {formatINR(totalExpenses)}
              </span>
            </div>
          </div>

          {/* Category Legend list */}
          <div className="w-full space-y-2 max-h-56 overflow-y-auto pr-2">
            {categoryData.map((item, index) => {
              const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              const isSelected = activeIndex === index;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-medium text-slate-200 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-numeric font-semibold text-white">{formatINR(item.amount)}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 font-numeric w-11 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
