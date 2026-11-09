import React, { useState, useRef } from 'react';
import { Eye, EyeOff, Wifi, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export default function ThreeTiltCard({
  totalBalance = 0,
  monthlyIncome = 0,
  monthlyExpense = 0,
  userName = 'Member'
}) {
  const cardRef = useRef(null);
  const [showBalance, setShowBalance] = useState(true);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.3 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full max-w-lg mx-auto"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-900 via-[#101827] to-[#14122e] border border-white/10 shadow-2xl shadow-indigo-950/50 cursor-pointer select-none group"
      >
        {/* Dynamic Glare Overlay */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18), transparent 60%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Ambient background glow accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-brand-violet/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-brand-cyan/20 blur-3xl pointer-events-none" />

        {/* Card Header: Brand + Chip + NFC */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-brand-violet/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Net Worth</span>
              <h2 className="text-sm font-semibold tracking-wide text-white">SpendIQ Metal</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Wifi className="w-5 h-5 rotate-90 opacity-70" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowBalance(!showBalance);
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title={showBalance ? 'Hide balance' : 'Show balance'}
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card Middle: Primary Balance */}
        <div className="relative z-10 my-6">
          <div className="text-xs text-slate-400 font-medium mb-1">Available Balance</div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-numeric text-white">
            {showBalance ? (
              <span className={totalBalance < 0 ? 'text-rose-400' : 'text-white'}>
                {formatINR(totalBalance)}
              </span>
            ) : (
              <span>₹ ••••••••</span>
            )}
          </div>
        </div>

        {/* Card Footer: Monthly Summary + Cardholder */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{showBalance ? formatINR(monthlyIncome) : '••••'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-{showBalance ? formatINR(monthlyExpense) : '••••'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase text-slate-400 tracking-wider">Cardholder</div>
            <div className="font-medium text-slate-200 tracking-wide">{userName.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
