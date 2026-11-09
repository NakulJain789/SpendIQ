import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import QuickAddModal from './components/QuickAddModal';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetPage from './pages/BudgetPage';
import ReportsPage from './pages/ReportsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Guard
function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { setIsQuickAddOpen } = useFinance();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#05070D] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-violet/30 border-t-brand-violet animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Derive title from pathname
  let pageTitle = 'Dashboard';
  if (location.pathname === '/transactions') pageTitle = 'Transactions';
  if (location.pathname === '/budget') pageTitle = 'Budget & Goals';
  if (location.pathname === '/reports') pageTitle = 'Financial Reports';

  return (
    <div className="min-h-screen bg-[#05070D] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Navbar title={pageTitle} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Desktop Floating Action Button (FAB) at bottom-right */}
      <button
        type="button"
        onClick={() => setIsQuickAddOpen(true)}
        aria-label="Add Transaction"
        className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2 py-3 px-5 rounded-full bg-gradient-to-r from-brand-violet via-indigo-600 to-brand-cyan hover:opacity-95 text-white font-bold text-xs shadow-2xl shadow-brand-violet/40 border border-white/20 transition-all hover:scale-105 active:scale-95 group"
      >
        <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
        <span>Add Transaction</span>
      </button>

      {/* Global Fast Add Transaction Modal */}
      <QuickAddModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FinanceProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0D131F',
                color: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '500',
                padding: '12px 16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#0D131F',
                },
              },
              error: {
                iconTheme: {
                  primary: '#F43F5E',
                  secondary: '#0D131F',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
