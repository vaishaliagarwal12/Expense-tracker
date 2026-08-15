import React, { useState } from 'react';
import { Sun, Moon, Plus, Calendar, ChevronDown, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getPastMonthsOptions } from '../../utils/date';

export default function Header({ title, selectedMonth, onMonthChange, onOpenAddTransaction, onToggleMobileNav }) {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const monthOptions = getPastMonthsOptions(12);

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Month Selector Filter */}
        {selectedMonth && onMonthChange && (
          <div className="relative flex items-center bg-slate-100 dark:bg-slate-900/80 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700">
            <Calendar className="w-3.5 h-3.5 mr-2 text-sky-600 dark:text-sky-400 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-3 text-xs font-semibold text-slate-900 dark:text-slate-100"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Add Transaction Button */}
        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-popover border border-slate-200/90 dark:border-slate-700 py-1.5 z-50 animate-fade-in"
              onClick={() => setShowUserMenu(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/80">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <a
                href="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" /> Profile & Settings
              </a>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
