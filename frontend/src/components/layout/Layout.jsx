import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import TransactionModal from '../transactions/TransactionModal';
import { getCurrentMonthYear } from '../../utils/date';

export default function Layout() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/transactions': return 'Transactions Directory';
      case '/budgets': return 'Monthly Budgets';
      case '/goals': return 'Savings Goals';
      case '/analytics': return 'Financial Analytics';
      case '/subscriptions': return 'Subscription Tracker';
      case '/recurring': return 'Recurring Expenses';
      case '/insights': return 'Financial Insights';
      case '/profile': return 'Profile & Settings';
      default: return 'FinTrack';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          title={getPageTitle(location.pathname)}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
          onToggleMobileNav={() => setMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ selectedMonth, setSelectedMonth }} />
        </main>
      </div>

      {/* Global Add Transaction Modal Trigger */}
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
