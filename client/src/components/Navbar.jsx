import React from 'react';
import { Sparkles, Plus, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatDate } from '../utils/formatters';

export default function Navbar({ title = 'Dashboard' }) {
  const { user, logout } = useAuth();
  const { setIsQuickAddOpen } = useFinance();

  const todayStr = formatDate(new Date(), 'medium');

  return (
    <header className="sticky top-0 z-20 w-full bg-[#05070D]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Title & Greeting */}
      <div className="flex items-center gap-3">
        {/* Mobile brand icon */}
        <div className="md:hidden w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Welcome back, <span className="text-slate-200 font-semibold">{user?.name}</span>
          </p>
        </div>
      </div>

      {/* Date badge & Fast Add Button */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-brand-cyan" />
          <span>{todayStr}</span>
        </div>

        {/* Desktop Quick Add Button */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-95 text-white font-bold text-xs shadow-md shadow-brand-violet/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Entry</span>
        </button>

        {/* Mobile logout button */}
        <button
          type="button"
          onClick={logout}
          className="md:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-rose-400 transition-colors"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
