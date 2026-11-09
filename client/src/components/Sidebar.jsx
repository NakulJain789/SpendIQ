import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: Receipt },
  { name: 'Budget & Goals', path: '/budget', icon: PieChart },
  { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { setIsQuickAddOpen } = useFinance();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#070A12] border-r border-white/10 p-5 select-none z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-lg shadow-brand-violet/30 text-white font-black text-xl">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Spend<span className="text-brand-violet">IQ</span>
          </span>
          <div className="text-[10px] tracking-wider uppercase font-semibold text-brand-cyan">
            Finance OS
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={() => setIsQuickAddOpen(true)}
        className="w-full mb-6 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-violet via-indigo-600 to-brand-cyan hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-brand-violet/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>Add Transaction</span>
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-violet/20 to-brand-cyan/10 text-white border border-brand-violet/30 shadow-md shadow-brand-violet/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="pt-4 mt-auto border-t border-white/10">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-violet to-emerald-400 flex items-center justify-center font-bold text-xs text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate max-w-[100px]">
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                {user?.email}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
