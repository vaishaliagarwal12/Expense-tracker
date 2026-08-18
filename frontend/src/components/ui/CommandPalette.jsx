import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Search, 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  CreditCard, 
  Repeat, 
  BarChart3, 
  Sparkles, 
  Settings, 
  Plus, 
  ArrowRight,
  X
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onOpenAddTransaction }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent('fintrack_open_command_palette'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigationItems = [
    { label: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { label: t('nav.transactions'), path: '/transactions', icon: Receipt, category: 'Navigation' },
    { label: t('nav.budgets'), path: '/budgets', icon: PieChart, category: 'Navigation' },
    { label: t('nav.goals'), path: '/goals', icon: Target, category: 'Navigation' },
    { label: t('nav.subscriptions'), path: '/subscriptions', icon: CreditCard, category: 'Navigation' },
    { label: t('nav.recurring'), path: '/recurring', icon: Repeat, category: 'Navigation' },
    { label: t('nav.analytics'), path: '/analytics', icon: BarChart3, category: 'Navigation' },
    { label: t('nav.insights'), path: '/insights', icon: Sparkles, category: 'Navigation' },
    { label: t('nav.profile'), path: '/profile', icon: Settings, category: 'Navigation' }
  ];

  const actionItems = [
    {
      label: t('transactions.add'),
      action: () => { onClose(); onOpenAddTransaction(); },
      icon: Plus,
      category: 'Actions'
    }
  ];

  const filteredNav = navigationItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Palette Container */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden z-10 animate-slide-up">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder={t('nav.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="ml-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
          {/* Action Items */}
          {filteredActions.length > 0 && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">Actions</span>
              {filteredActions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 rounded-lg">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{item.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Navigation Items */}
          {filteredNav.length > 0 && (
            <div className="p-2 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1">Destinations</span>
              {filteredNav.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectNav(item.path)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                    {item.path}
                  </span>
                </button>
              ))}
            </div>
          )}

          {filteredActions.length === 0 && filteredNav.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
