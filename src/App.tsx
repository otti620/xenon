import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { HomeTab } from './components/HomeTab';
import { ProductsTab } from './components/ProductsTab';
import { TeamTab } from './components/TeamTab';
import { AccountTab } from './components/AccountTab';
import { BottomNav } from './components/BottomNav';
import { AdminPanel } from './components/AdminPanel';
import { ServerStatusBanner } from './components/ServerStatusBanner';

// Modals
import { WelcomeModal } from './components/modals/WelcomeModal';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { DailySignInModal } from './components/modals/DailySignInModal';
import { GiftCodeModal } from './components/modals/GiftCodeModal';
import { BankAccountModal } from './components/modals/BankAccountModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { InviteModal } from './components/modals/InviteModal';
import { InvestModal } from './components/modals/InvestModal';
import { MyInvestmentsModal } from './components/modals/MyInvestmentsModal';
import { AdminAuthModal } from './components/modals/AdminAuthModal';
import { ActivitySimulator } from './components/ActivitySimulator';
import { NotificationAlert } from './components/NotificationAlert';

function MainLayout() {
  const { user, activeTab, setActiveTab } = useApp();
  const [adminAuthOpen, setAdminAuthOpen] = useState(false);

  // If user is not logged in, render AuthScreen
  if (!user || !user.isLoggedIn) {
    if (activeTab === 'admin') {
      return (
        <AdminPanel onClose={() => setActiveTab('home')} />
      );
    }
    return (
      <>
        <ServerStatusBanner />
        <AuthScreen />
        <AdminAuthModal
          isOpen={adminAuthOpen}
          onClose={() => setAdminAuthOpen(false)}
          onAdminAuthenticated={() => setActiveTab('admin')}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8fc] text-gray-900 font-sans selection:bg-purple-200 selection:text-purple-900 antialiased">
      <ServerStatusBanner />
      {/* Top Header */}
      <Header />

      {/* Dynamic Tab Views */}
      <main className="transition-all duration-200">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'account' && (
          <AccountTab
            onOpenAdmin={() => {
              if (user && user.phone && (['07077599057', '09011711470'].includes(user.phone) || user.role === 'admin')) {
                setActiveTab('admin');
              } else {
                setAdminAuthOpen(true);
              }
            }}
          />
        )}
        {activeTab === 'admin' && (
          <AdminPanel onClose={() => setActiveTab('account')} />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      {activeTab !== 'admin' && <BottomNav />}

      {/* Real-time Activity Toast Notifications */}
      <ActivitySimulator />

      {/* Deposit/Withdrawal Approval Alerts */}
      <NotificationAlert />

      {/* Modals & Dialogs */}
      <WelcomeModal />
      <DepositModal />
      <WithdrawModal />
      <DailySignInModal />
      <GiftCodeModal />
      <BankAccountModal />
      <HistoryModal />
      <InviteModal />
      <InvestModal />
      <MyInvestmentsModal />
      <AdminAuthModal
        isOpen={adminAuthOpen}
        onClose={() => setAdminAuthOpen(false)}
        onAdminAuthenticated={() => setActiveTab('admin')}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
