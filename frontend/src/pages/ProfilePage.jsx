import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { User, Mail, Sun, Moon, Monitor, Globe, DollarSign, Shield, CheckCircle2 } from 'lucide-react';

import { useCurrency } from '../context/CurrencyContext';

const CURRENCIES = [
  { symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { symbol: '$', label: 'USD ($) - US Dollar' },
  { symbol: '€', label: 'EUR (€) - Euro' },
  { symbol: '£', label: 'GBP (£) - British Pound' },
  { symbol: '¥', label: 'JPY (¥) - Japanese Yen' },
  { symbol: 'A$', label: 'AUD (A$) - Australian Dollar' },
  { symbol: 'C$', label: 'CAD (C$) - Canadian Dollar' },
  { symbol: 'AED', label: 'AED (AED) - UAE Dirham' }
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currencySymbol, setCurrencySymbol] = useState(user?.currency_symbol || '₹');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateProfile({
        name,
        currency_symbol: currencySymbol
      });
      setDisplayCurrency(currencySymbol);
      showSuccess(t('settings.savedSuccess'));
    } catch (err) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-3xl">
      {/* Header Bar */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t('settings.title')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Profile Details Card */}
        <div className="fin-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
              {t('settings.profile')}
            </h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              icon={Mail}
              value={user?.email || ''}
              disabled
              className="opacity-70 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Appearance & Theme Card */}
        <div className="fin-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sun className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
              {t('settings.appearance')}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
                themeMode === 'light'
                  ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold ring-2 ring-sky-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-amber-500" />
              <span className="text-[11px] sm:text-xs block">{t('settings.themeLight')}</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
                themeMode === 'dark'
                  ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold ring-2 ring-sky-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-sky-400" />
              <span className="text-[11px] sm:text-xs block">{t('settings.themeDark')}</span>
            </button>

            <button
              type="button"
              onClick={() => setThemeMode('system')}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
                themeMode === 'system'
                  ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold ring-2 ring-sky-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2 text-indigo-500" />
              <span className="text-[11px] sm:text-xs block">{t('settings.themeSystem')}</span>
            </button>
          </div>
        </div>

        {/* Internationalization & Currency Card */}
        <div className="fin-card p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">
              Regional & Internationalization
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('settings.language')}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {supportedLanguages.map(l => (
                <option key={l.code} value={l.code}>{l.name} ({l.nativeName})</option>
              ))}
            </Select>

            <Select
              label={t('settings.currency')}
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.symbol} value={c.symbol}>{c.label}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={loading} icon={CheckCircle2} className="w-full sm:w-auto">
            {t('settings.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
