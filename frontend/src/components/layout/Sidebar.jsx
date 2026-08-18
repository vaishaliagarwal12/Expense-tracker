import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  CreditCard, 
  Repeat, 
  BarChart3, 
  Sparkles, 
  Settings, 
  LogOut,
  TrendingUp
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navLinks = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.transactions'), path: '/transactions', icon: Receipt },
    { name: t('nav.budgets'), path: '/budgets', icon: PieChart },
    { name: t('nav.goals'), path: '/goals', icon: Target },
    { name: t('nav.subscriptions'), path: '/subscriptions', icon: CreditCard },
    { name: t('nav.recurring'), path: '/recurring', icon: Repeat },
    { name: t('nav.analytics'), path: '/analytics', icon: BarChart3 },
    { name: t('nav.insights'), path: '/insights', icon: Sparkles },
    { name: t('nav.profile'), path: '/profile', icon: Settings }
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between p-4 z-20">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
            <TrendingUp className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">FinTrack</h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financial Pulse</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer / User Profile Card */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs shrink-0 border border-slate-200 dark:border-slate-700">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={t('nav.logout')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
