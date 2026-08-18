import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCurrency } from '../../context/CurrencyContext';
import { getMonthYearOptions } from '../../utils/date';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Monitor, 
  Globe, 
  Menu,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function Header({
  title,
  selectedMonth,
  onMonthChange,
  onOpenAddTransaction,
  onToggleMobileNav,
  onOpenCommandPalette
}) {
  const { user } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { displayCurrency, setDisplayCurrency, displaySymbol, SUPPORTED_CURRENCIES } = useCurrency();
  const monthOptions = getMonthYearOptions(12);

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 hidden sm:block">
            FinTrack • {displayCurrency} ({displaySymbol}) Display Mode
          </p>
        </div>
      </div>


      {/* Right Controls & Quick Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Command Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-xl border border-slate-200/80 dark:border-slate-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{t('nav.searchPlaceholder')}</span>
        </button>

        {/* Month Selector */}
        <div className="relative flex items-center">
          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="pl-8 pr-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Display Currency Selector */}
        <div className="relative flex items-center">
          <DollarSign className="w-3.5 h-3.5 text-emerald-500 absolute left-2.5 pointer-events-none" />
          <select
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="pl-7 pr-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            title="Display Currency"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="pl-7 pr-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {supportedLanguages.map(l => (
              <option key={l.code} value={l.code}>{l.nativeName}</option>
            ))}
          </select>
        </div>


        {/* Theme Toggle Dropdown */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            onClick={() => setThemeMode('light')}
            className={`p-1 rounded-lg text-xs transition-colors ${themeMode === 'light' ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            title={t('settings.themeLight')}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            className={`p-1 rounded-lg text-xs transition-colors ${themeMode === 'dark' ? 'bg-white dark:bg-slate-700 text-sky-400 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            title={t('settings.themeDark')}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setThemeMode('system')}
            className={`p-1 rounded-lg text-xs transition-colors ${themeMode === 'system' ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
            title={t('settings.themeSystem')}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">{t('nav.quickAdd')}</span>
        </button>
      </div>
    </header>
  );
}
