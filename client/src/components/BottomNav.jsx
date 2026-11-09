import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, FileSpreadsheet, Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function BottomNav() {
  const { setIsQuickAddOpen } = useFinance();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070A12]/90 backdrop-blur-xl border-t border-white/10 px-3 py-2">
      <div className="flex items-center justify-around relative">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-brand-violet font-semibold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1">Home</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-brand-violet font-semibold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px] mt-1">Entries</span>
        </NavLink>

        {/* Center Elevated Floating Add Button */}
        <div className="relative -top-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Add transaction"
            className="w-13 h-13 sm:w-14 sm:h-14 w-[52px] h-[52px] p-3.5 rounded-full bg-gradient-to-tr from-brand-violet via-indigo-600 to-brand-cyan text-white shadow-xl shadow-brand-violet/40 border-2 border-[#070A12] flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <NavLink
          to="/budget"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-brand-violet font-semibold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-1">Budget</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-colors ${
              isActive ? 'text-brand-violet font-semibold' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span className="text-[10px] mt-1">Reports</span>
        </NavLink>
      </div>
    </nav>
  );
}
