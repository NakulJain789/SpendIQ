import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ArrowUpDown,
  Calendar,
  X,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { transactionsAPI } from '../services/api';
import TransactionItem from '../components/TransactionItem';
import TransactionModal from '../components/TransactionModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { formatINR } from '../utils/formatters';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const {
    categories,
    deleteTransaction,
    setIsQuickAddOpen
  } = useFinance();

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'income' | 'expense'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch transactions from server with query params
  const fetchTransactionsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        sortBy,
        order,
        limit: 200,
      };

      if (selectedType !== 'all') params.type = selectedType;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await transactionsAPI.getAll(params);
      if (res.data?.success) {
        setTransactions(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err.message);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, order, selectedType, selectedCategory, search, startDate, endDate]);

  useEffect(() => {
    fetchTransactionsList();
  }, [fetchTransactionsList]);

  // Handle Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await transactionsAPI.exportCSV(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SpendIQ_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Transactions CSV exported successfully');
    } catch (err) {
      console.error('Export CSV error:', err.message);
      toast.error('Failed to export CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTransaction) return;
    setIsDeleting(true);
    await deleteTransaction(deletingTransaction._id);
    setIsDeleting(false);
    setDeletingTransaction(null);
    fetchTransactionsList();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setOrder('desc');
  };

  const hasActiveFilters = Boolean(
    search || selectedType !== 'all' || selectedCategory !== 'All' || startDate || endDate
  );

  // Compute summary metrics for filtered list
  const { filteredIncome, filteredExpense, filteredNet } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    });
    return {
      filteredIncome: income,
      filteredExpense: expense,
      filteredNet: income - expense
    };
  }, [transactions]);

  const categoryColorMap = {};
  categories.forEach((c) => {
    categoryColorMap[c.name] = c.color;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Transaction Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Search, filter, and inspect all income and expense history
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || transactions.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-95 text-white text-xs font-bold shadow-md shadow-brand-violet/20 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Summary Chips for Current Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Records</div>
          <div className="text-lg font-bold font-numeric text-white">{transactions.length} entries</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Filtered Income</div>
          <div className="text-lg font-bold font-numeric text-emerald-400">+{formatINR(filteredIncome)}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Filtered Expenses</div>
          <div className="text-lg font-bold font-numeric text-rose-400">-{formatINR(filteredExpense)}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl">
          <div className="text-[10px] uppercase font-semibold text-slate-400">Filtered Net</div>
          <div className={`text-lg font-bold font-numeric ${filteredNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatINR(filteredNet)}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, merchant, notes..."
              className="w-full bg-dark-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="md:col-span-4 flex items-center bg-dark-900 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedType === 'all'
                  ? 'bg-brand-violet text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('expense')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedType === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('income')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                selectedType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-2xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-violet"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range & Sorting Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Range:</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-brand-violet [color-scheme:dark]"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-dark-900 border border-white/10 rounded-xl px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-brand-violet [color-scheme:dark]"
            />
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-rose-400 hover:text-rose-300 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Sort By Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort:</span>
            <button
              type="button"
              onClick={() => {
                if (sortBy === 'date') {
                  setOrder(order === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortBy('date');
                  setOrder('desc');
                }
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                sortBy === 'date'
                  ? 'bg-brand-violet/20 text-brand-violet border-brand-violet/30'
                  : 'bg-dark-900 text-slate-400 border-white/10'
              }`}
            >
              Date ({sortBy === 'date' && order === 'asc' ? 'Oldest' : 'Newest'})
            </button>
            <button
              type="button"
              onClick={() => {
                if (sortBy === 'amount') {
                  setOrder(order === 'desc' ? 'asc' : 'desc');
                } else {
                  setSortBy('amount');
                  setOrder('desc');
                }
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium border ${
                sortBy === 'amount'
                  ? 'bg-brand-violet/20 text-brand-violet border-brand-violet/30'
                  : 'bg-dark-900 text-slate-400 border-white/10'
              }`}
            >
              Amount ({sortBy === 'amount' && order === 'asc' ? 'Lowest' : 'Highest'})
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6">
        {isLoading ? (
          <SkeletonLoader type="transaction" count={6} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="🔍"
            title={hasActiveFilters ? 'No matches found' : 'No transactions recorded'}
            description={
              hasActiveFilters
                ? 'Try tweaking your search keywords, category, or date range.'
                : 'Keep your ledger organized by adding your transactions.'
            }
            actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add First Transaction'}
            onAction={hasActiveFilters ? clearFilters : () => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {transactions.map((t) => (
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

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={() => fetchTransactionsList()}
      />

      {/* Edit Transaction Modal */}
      <TransactionModal
        isOpen={Boolean(editingTransaction)}
        onClose={() => setEditingTransaction(null)}
        initialData={editingTransaction}
        onSave={() => fetchTransactionsList()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTransaction)}
        onClose={() => setDeletingTransaction(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deletingTransaction?.title}" (${formatINR(deletingTransaction?.amount)})?`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
