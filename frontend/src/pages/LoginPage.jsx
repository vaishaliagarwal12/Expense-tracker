import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, AlertCircle, ArrowRight, Lock, Mail, Eye, EyeOff, ShieldCheck, TrendingUp } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@fintrack.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 text-slate-100 font-sans">
      {/* Left Branding Showcase Panel (Desktop Only) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800 relative overflow-hidden select-none">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-sky-600/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl text-white tracking-tight">FinTrack</span>
            <span className="block text-[11px] text-sky-400 font-bold uppercase tracking-wider">Financial SaaS Platform</span>
          </div>
        </div>

        {/* Financial Graphic Highlights */}
        <div className="max-w-md space-y-6 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-sky-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bank-Grade Data Encryption & Privacy</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Take complete control of your wealth & monthly cashflow.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Real-time analytics, automated recurring expense scheduling, budgeting thresholds, and intelligent financial health indicators.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-2xl font-black text-white">100%</span>
              <span className="block text-xs text-slate-400 mt-0.5">Automated Tracking</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <span className="text-2xl font-black text-emerald-400">₹0</span>
              <span className="block text-xs text-slate-400 mt-0.5">Hidden Fees</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          © 2026 FinTrack Inc. All rights reserved.
        </div>
      </div>

      {/* Right Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-700 p-5 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="p-2 bg-sky-600 rounded-xl text-white">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">FinTrack</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign in to your portal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your credentials to access your financial dashboard
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100 dark:border-slate-700/80">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-sky-600 dark:text-sky-400 hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
