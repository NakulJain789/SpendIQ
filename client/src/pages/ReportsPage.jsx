import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  Percent,
  Sparkles,
  PieChart
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { transactionsAPI } from '../services/api';
import { formatINR, MONTH_NAMES } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const { categories } = useFinance();
  const today = new Date();
  const [reportYear, setReportYear] = useState(today.getFullYear());
  const [reportMonth, setReportMonth] = useState(today.getMonth() + 1);
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportTransactions = async () => {
      setIsLoading(true);
      try {
        const res = await transactionsAPI.getAll({
          month: reportMonth,
          year: reportYear,
          limit: 500
        });
        if (res.data?.success) {
          setReportData(res.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching report data:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportTransactions();
  }, [reportMonth, reportYear]);

  // Compute metrics
  let totalIncome = 0;
  let totalExpense = 0;
  let highestExpense = null;
  const categoryMap = {};

  reportData.forEach((t) => {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense') {
      totalExpense += t.amount;
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      if (!highestExpense || t.amount > highestExpense.amount) {
        highestExpense = t;
      }
    }
  });

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const categoryRanking = Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  const monthName = MONTH_NAMES[reportMonth - 1] || 'Current Month';

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = async () => {
    try {
      const response = await transactionsAPI.exportCSV({ month: reportMonth, year: reportYear });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SpendIQ_Report_${monthName}_${reportYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report CSV exported');
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Month/Year Selection & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel rounded-3xl p-5 sm:p-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Executive Audit</span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Financial Statement & Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Comprehensive breakdown of cash flows, margins, and category distribution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={reportMonth}
            onChange={(e) => setReportMonth(parseInt(e.target.value, 10))}
            className="bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-violet"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={reportYear}
            onChange={(e) => setReportYear(parseInt(e.target.value, 10))}
            className="bg-dark-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-violet"
          >
            {[2024, 2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-semibold shadow-md shadow-brand-violet/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Statement Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Inflow</div>
          <div className="text-2xl font-bold font-numeric text-emerald-400 mt-2">
            +{formatINR(totalIncome)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified earned revenue</div>
        </div>

        <div className="glass-panel p-5 rounded-3xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Outflow</div>
          <div className="text-2xl font-bold font-numeric text-rose-400 mt-2">
            -{formatINR(totalExpense)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total recorded disbursements</div>
        </div>

        <div className="glass-panel p-5 rounded-3xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Savings</div>
          <div
            className={`text-2xl font-bold font-numeric mt-2 ${
              netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatINR(netSavings)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {netSavings >= 0 ? 'Positive financial cushion' : 'Net deficit incurred'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Savings Margin</div>
          <div className="text-2xl font-bold font-numeric text-brand-cyan mt-2">
            {savingsRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Retention of total inflows</div>
        </div>
      </div>

      {/* Category Spend Ranking */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Category Allocations for {monthName} {reportYear}
            </h3>
            <p className="text-xs text-slate-400">
              Ranked breakdown of major expenditure channels
            </p>
          </div>
          <div className="text-xs font-numeric font-semibold text-slate-400">
            {reportData.length} records processed
          </div>
        </div>

        {categoryRanking.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No expense records registered for {monthName} {reportYear}.
          </div>
        ) : (
          <div className="space-y-3">
            {categoryRanking.map((cat, idx) => (
              <div
                key={cat.name}
                className="p-3.5 rounded-2xl bg-dark-900/60 border border-white/5 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-white/5 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-numeric">
                    <span className="font-bold text-slate-200">{formatINR(cat.amount)}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-brand-cyan font-bold text-[11px]">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-violet to-brand-cyan rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highest Single Expense Spotlight */}
      {highestExpense && (
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-brand-violet/20">
          <div className="flex items-center gap-2.5 text-xs text-brand-violet font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Highest Single Outflow Spotlight</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-white">{highestExpense.title}</h4>
              <p className="text-xs text-slate-400">
                Category: <span className="text-slate-200 font-semibold">{highestExpense.category}</span>
                {highestExpense.notes ? ` • "${highestExpense.notes}"` : ''}
              </p>
            </div>
            <div className="text-2xl font-bold font-numeric text-rose-400">
              -{formatINR(highestExpense.amount)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
