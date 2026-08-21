import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import CommandPalette from '../ui/CommandPalette';
import TransactionModal from '../transactions/TransactionModal';
import { getCurrentMonthYear } from '../../utils/date';
import { useLanguage } from '../../context/LanguageContext';

export default function Layout() {
  const location = useLocation();
  const { t } = useLanguage();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  useEffect(() => {
    const handleCommandPaletteEvent = () => setCommandPaletteOpen(true);
    window.addEventListener('fintrack_open_command_palette', handleCommandPaletteEvent);
    return () => window.removeEventListener('fintrack_open_command_palette', handleCommandPaletteEvent);
  }, []);

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return t('nav.dashboard');
      case '/transactions': return t('nav.transactions');
      case '/budgets': return t('nav.budgets');
      case '/goals': return t('nav.goals');
      case '/analytics': return t('nav.analytics');
      case '/subscriptions': return t('nav.subscriptions');
      case '/recurring': return t('nav.recurring');
      case '/insights': return t('nav.insights');
      case '/profile': return t('nav.profile');
      default: return 'FinTrack';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090D16] transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-8">
        <Header 
          title={getPageTitle(location.pathname)}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
          onToggleMobileNav={() => setMobileNavOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl w-full mx-auto animate-fade-in min-w-0">
          <Outlet context={{ selectedMonth, setSelectedMonth }} />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
      />

      {/* Global Add Transaction Modal */}
      {isAddTxModalOpen && (
        <TransactionModal
          isOpen={isAddTxModalOpen}
          onClose={() => setIsAddTxModalOpen(false)}
          onSuccess={() => {
            setIsAddTxModalOpen(false);
            window.dispatchEvent(new CustomEvent('fintrack_transaction_updated'));
          }}
        />
      )}
    </div>
  );
}
