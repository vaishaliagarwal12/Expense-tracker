import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  BarChart3, 
  Repeat, 
  CreditCard, 
  Sparkles, 
  User,
  X,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Transactions', path: '/transactions', icon: Receipt },
    { label: 'Budgets', path: '/budgets', icon: PieChart },
    { label: 'Savings Goals', path: '/goals', icon: Target },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
    { label: 'Recurring', path: '/recurring', icon: Repeat },
    { label: 'Insights', path: '/insights', icon: Sparkles },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-fade-in" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="relative flex-1 max-w-xs w-full bg-slate-900 text-slate-200 flex flex-col h-full z-10 shadow-2xl animate-fade-in">
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-600 rounded-xl text-white">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-white tracking-tight">FinTrack PRO</span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 text-sky-400" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full py-2.5 px-4 bg-rose-950/60 text-rose-400 border border-rose-800/50 text-xs font-bold rounded-xl"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
