import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThreeHeroScene from '../components/ThreeHeroScene';

export default function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const errors = {};
    if (!isLoginMode && (!name.trim() || name.trim().length < 2)) {
      errors.name = 'Name must be at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    if (isLoginMode) {
      await login(email.trim(), password);
    } else {
      await register(name.trim(), email.trim(), password);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#05070D] aurora-auth flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-violet/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-cyan/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Column: 3D Immersive Hero */}
        <div className="hidden lg:flex flex-col justify-center items-start pr-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-cyan backdrop-blur-md shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Personal Finance Intelligence</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Master your wealth with{' '}
            <span className="text-gradient-primary">SpendIQ</span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md">
            Seamlessly track income, monitor category budgets, discover spending patterns, and maintain total clarity over your finances.
          </p>

          {/* 3D Scene Container */}
          <div className="w-full h-80 rounded-3xl overflow-hidden glass-panel-subtle relative border border-white/10 shadow-2xl">
            <ThreeHeroScene />
          </div>

          <div className="grid grid-cols-3 gap-3 w-full text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>₹ INR Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real-time Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Encrypted Data</span>
            </div>
          </div>
        </div>

        {/* Right Column: Controlled Auth Card */}
        <div className="w-full max-w-md mx-auto">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
            {/* Header / Brand */}
            <div className="text-center mb-6">
              <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan items-center justify-center text-white shadow-xl shadow-brand-violet/30 mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isLoginMode ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isLoginMode
                  ? 'Sign in to access your personal finance dashboard'
                  : 'Start tracking your expenses and mastering budgets today'}
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-dark-900 p-1 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(true);
                  setFormErrors({});
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  isLoginMode
                    ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(false);
                  setFormErrors({});
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  !isLoginMode
                    ? 'bg-brand-violet text-white shadow-md shadow-brand-violet/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Nakul Jain"
                      className="w-full bg-dark-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.name}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-dark-900 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-dark-900 border border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-brand-violet"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-[11px] text-rose-400 mt-1">{formErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-violet to-brand-cyan hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-brand-violet/25 flex items-center justify-center gap-2 transition-all mt-2 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Please wait...' : isLoginMode ? 'Sign In' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-400">
              {isLoginMode ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(false);
                      setFormErrors({});
                    }}
                    className="text-brand-cyan hover:underline font-semibold"
                  >
                    Create one now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(true);
                      setFormErrors({});
                    }}
                    className="text-brand-violet hover:underline font-semibold"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
