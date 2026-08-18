import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Drawer } from '../ui/Modal';
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
  MoreHorizontal
} from 'lucide-react';

export default function MobileNav({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const primaryLinks = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.transactions'), path: '/transactions', icon: Receipt },
    { name: t('nav.budgets'), path: '/budgets', icon: PieChart }
  ];

  const secondaryLinks = [
    { name: t('nav.goals'), path: '/goals', icon: Target },
    { name: t('nav.subscriptions'), path: '/subscriptions', icon: CreditCard },
    { name: t('nav.recurring'), path: '/recurring', icon: Repeat },
    { name: t('nav.analytics'), path: '/analytics', icon: BarChart3 },
    { name: t('nav.insights'), path: '/insights', icon: Sparkles },
    { name: t('nav.profile'), path: '/profile', icon: Settings }
  ];

  return (
    <>
      {/* Slide-Over Overflow Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="FinTrack Workspace"
        subtitle={user?.email}
        position="left"
        maxWidth="max-w-xs"
      >
        <div className="space-y-6">
          <nav className="space-y-1">
            {[...primaryLinks, ...secondaryLinks].map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <link.icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { onClose(); logout(); }}
              className="w-full flex items-center gap-3 px-3.5 py-3 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      </Drawer>

      {/* Fixed Bottom Navigation Bar (Mobile Viewports Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-4 py-2 flex items-center justify-around">
        {primaryLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-1 text-[10px] font-bold transition-colors ${
                isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`
            }
          >
            <link.icon className="w-5 h-5" />
            <span>{link.name}</span>
          </NavLink>
        ))}

        <button
          onClick={onClose}
          className="flex flex-col items-center gap-1 p-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
