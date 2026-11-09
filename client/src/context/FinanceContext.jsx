import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { dashboardAPI, transactionsAPI, categoriesAPI, budgetAPI } from '../services/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Dashboard state
  const [dashboard, setDashboard] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // Categories state
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Budget state for selected month/year
  const today = new Date();
  const [budgetMonth, setBudgetMonth] = useState(today.getMonth() + 1);
  const [budgetYear, setBudgetYear] = useState(today.getFullYear());
  const [budgetData, setBudgetData] = useState(null);
  const [isBudgetLoading, setIsBudgetLoading] = useState(true);

  // Global Quick Add Modal State & Last-used memory
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [lastUsed, setLastUsed] = useState(() => {
    try {
      const saved = localStorage.getItem('spendiq_last_used');
      return saved ? JSON.parse(saved) : { type: 'expense', category: 'Food & Dining' };
    } catch {
      return { type: 'expense', category: 'Food & Dining' };
    }
  });

  // Confetti celebration helper
  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B']
    });
  }, []);

  // Fetch Dashboard Summary
  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsDashboardLoading(true);
    try {
      const res = await dashboardAPI.getSummary();
      if (res.data?.success) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err.message);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch Categories
  const refreshCategories = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsCategoriesLoading(true);
    try {
      const res = await categoriesAPI.getAll();
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err.message);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch Budget
  const refreshBudget = useCallback(async (month = budgetMonth, year = budgetYear) => {
    if (!isAuthenticated) return;
    setIsBudgetLoading(true);
    try {
      const res = await budgetAPI.get(month, year);
      if (res.data?.success) {
        setBudgetData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching budget:', err.message);
    } finally {
      setIsBudgetLoading(false);
    }
  }, [isAuthenticated, budgetMonth, budgetYear]);

  // Initial data loading when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboard();
      refreshCategories();
      refreshBudget(budgetMonth, budgetYear);
    } else {
      setDashboard(null);
      setCategories([]);
      setBudgetData(null);
    }
  }, [isAuthenticated, refreshDashboard, refreshCategories, refreshBudget, budgetMonth, budgetYear]);

  // Add a transaction
  const addTransaction = async (data) => {
    try {
      const res = await transactionsAPI.create(data);
      if (res.data?.success) {
        toast.success('Transaction saved!');
        triggerConfetti();

        // Remember last used type and category
        const updatedLastUsed = {
          type: data.type || 'expense',
          category: data.category || 'Food & Dining'
        };
        setLastUsed(updatedLastUsed);
        localStorage.setItem('spendiq_last_used', JSON.stringify(updatedLastUsed));

        // Instantly refresh dashboard & budget
        await Promise.all([refreshDashboard(), refreshBudget(budgetMonth, budgetYear)]);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save transaction';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update a transaction
  const updateTransaction = async (id, data) => {
    try {
      const res = await transactionsAPI.update(id, data);
      if (res.data?.success) {
        toast.success('Transaction updated!');
        await Promise.all([refreshDashboard(), refreshBudget(budgetMonth, budgetYear)]);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update transaction';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id) => {
    try {
      const res = await transactionsAPI.delete(id);
      if (res.data?.success) {
        toast.success('Transaction deleted');
        await Promise.all([refreshDashboard(), refreshBudget(budgetMonth, budgetYear)]);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete transaction';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Add category
  const addCategory = async (data) => {
    try {
      const res = await categoriesAPI.create(data);
      if (res.data?.success) {
        toast.success(`Category "${data.name}" added`);
        await Promise.all([refreshCategories(), refreshBudget(budgetMonth, budgetYear)]);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add category';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update category
  const updateCategory = async (id, data) => {
    try {
      const res = await categoriesAPI.update(id, data);
      if (res.data?.success) {
        toast.success('Category updated');
        await Promise.all([refreshCategories(), refreshBudget(budgetMonth, budgetYear), refreshDashboard()]);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update category';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    try {
      const res = await categoriesAPI.delete(id);
      if (res.data?.success) {
        toast.success('Category deleted');
        await Promise.all([refreshCategories(), refreshBudget(budgetMonth, budgetYear)]);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete category';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Update budget
  const updateBudgetTarget = async (amount, categoryBudgets) => {
    try {
      const res = await budgetAPI.update({
        month: budgetMonth,
        year: budgetYear,
        amount: parseFloat(amount),
        categoryBudgets
      });
      if (res.data?.success) {
        toast.success('Budget settings updated');
        await refreshBudget(budgetMonth, budgetYear);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update budget';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    dashboard,
    isDashboardLoading,
    categories,
    isCategoriesLoading,
    budgetData,
    isBudgetLoading,
    budgetMonth,
    budgetYear,
    setBudgetMonth,
    setBudgetYear,
    lastUsed,
    isQuickAddOpen,
    setIsQuickAddOpen,
    triggerConfetti,
    refreshDashboard,
    refreshCategories,
    refreshBudget,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    updateBudgetTarget
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
