import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-4 shadow-xl">
        🌌
      </div>
      <h1 className="text-4xl font-black text-white font-numeric tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-300 mt-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-xs mt-2 mb-6">
        The financial coordinates you're looking for do not exist or have moved.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-violet hover:bg-brand-violet/90 text-white text-xs font-bold shadow-lg shadow-brand-violet/25 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
