import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowRight,
  Plus,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import ThreeTiltCard from '../components/ThreeTiltCard';
import StatCard from '../components/StatCard';
import SpendingChart from '../components/SpendingChart';
import CategoryPieChart from '../components/CategoryPieChart';
import TransactionItem from '../components/TransactionItem';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { formatINR } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    dashboard,
    isDashboardLoading,
    categories,
    deleteTransaction,
    refreshDashboard,
    setIsQuickAddOpen
  } = useFinance();

  // Edit / Delete modal states
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    await deleteTransaction(deletingTransaction._id);
    setIsDeleting(false);
    setDeletingTransaction(null);
  };

  const categoryColorMap = {};
  categories.forEach((c) => {
    categoryColorMap[c.name] = c.color;
  });

  if (isDashboardLoading && !dashboard) {
    return (
      <div className="space-y-6">
        <div className="h-64 glass-panel rounded-3xl animate-pulse" />
        <SkeletonLoader type="stat" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader count={1} />
          <SkeletonLoader count={1} />
        </div>
      </div>
    );
  }

  const {
    totalBalance = 0,
    totalIncome = 0,
    totalExpenses = 0,
    savingsRate = 0,
    currentMonth = {},
    monthlyTrend = [],
    categoryBreakdown = [],
    recentTransactions = [],
    transactionCount = 0
  } = dashboard || {};

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Financial Overview
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-violet/20 text-brand-violet border border-brand-violet/30">
              Live
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time balance, cashflow trends, and category breakdowns
          </p>
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
          title="Refresh dashboard stats"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Hero Section: 3D Tilt Card + Key Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 3D Metal Card */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <ThreeTiltCard
            totalBalance={totalBalance}
            monthlyIncome={currentMonth.income || 0}
            monthlyExpense={currentMonth.expense || 0}
            userName={user?.name || 'SpendIQ Member'}
          />
        </div>

        {/* Right: Key 4 Stat Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Income"
            amount={totalIncome}
            icon={TrendingUp}
            colorScheme="emerald"
            trend="up"
            trendLabel={`${currentMonth.name || 'This month'}: +${formatINR(currentMonth.income || 0)}`}
          />
          <StatCard
            title="Total Expenses"
            amount={totalExpenses}
            icon={TrendingDown}
            colorScheme="rose"
            trend="down"
            trendLabel={`${currentMonth.name || 'This month'}: -${formatINR(currentMonth.expense || 0)}`}
          />
          <StatCard
            title="Net Balance"
            amount={totalBalance}
            icon={Wallet}
            colorScheme="violet"
            trend={totalBalance >= 0 ? 'up' : 'down'}
            trendLabel={`Overall Net Worth`}
          />
          <StatCard
            title="Savings Rate"
            amount={`${savingsRate}%`}
            isCurrency={false}
            icon={Percent}
            colorScheme="cyan"
            trend={savingsRate > 20 ? 'up' : 'neutral'}
            trendLabel={savingsRate >= 20 ? 'Healthy Financial Pace' : 'Consider Budget Goals'}
          />
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Income vs Expenses Cashflow Chart */}
        <div className="lg:col-span-7">
          <SpendingChart data={monthlyTrend} />
        </div>

        {/* Category Spending Donut Chart */}
        <div className="lg:col-span-5">
          <CategoryPieChart
            categoryData={categoryBreakdown}
            totalExpenses={totalExpenses}
          />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Ledger</span>
            <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
          </div>
          <Link
            to="/transactions"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-cyan hover:underline"
          >
            <span>View All ({transactionCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="No transactions yet"
            description="Record your first income or expense entry to bring your dashboard to life."
            actionLabel="Add Transaction"
            onAction={() => setIsQuickAddOpen(true)}
          />
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((t) => (
              <TransactionItem
                key={t._id}
                transaction={t}
                categoryColor={categoryColorMap[t.category] || '#6366F1'}
                onEdit={(item) => setEditingTransaction(item)}
                onDelete={(item) => setDeletingTransaction(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        initialData={editingTransaction}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deletingTransaction?.title}" (${formatINR(deletingTransaction?.amount)})? This cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
