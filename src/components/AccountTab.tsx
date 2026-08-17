import React from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  LogOut,
  User as UserIcon,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Users,
  Share2,
  Landmark,
  History,
  Send,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SYSTEM_INFO } from '../data/packages';

export const AccountTab: React.FC<{ onOpenAdmin?: () => void }> = ({ onOpenAdmin }) => {
  const {
    user,
    balance,
    investments,
    logout,
    setActiveTab,
    setDepositModalOpen,
    setWithdrawModalOpen,
    setBankAccountModalOpen,
    setHistoryModalOpen,
    setHistoryType,
    setInviteModalOpen,
    setMyInvestmentsModalOpen,
  } = useApp();

  const activeInvsCount = investments.filter(i => i.status === 'active').length;
  const claimableInvsCount = investments.filter(i => i.status === 'active' && i.canClaimToday).length;

  const handleOpenHistory = (type: 'all' | 'deposit' | 'withdraw') => {
    setHistoryType(type);
    setHistoryModalOpen(true);
  };

  const isAdminUser = Boolean(
    user &&
    user.phone &&
    (['07077599057', '09011711470'].includes(user.phone) || user.role === 'admin')
  );

  return (
    <div className="min-h-screen bg-[#faf8fc] pb-28">
      {/* 1. Header & Available Balance Banner (Exact match to Screenshot 5) */}
      <div className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] pt-8 pb-14 px-4 rounded-b-[40px] shadow-lg relative overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30">
            <Logo size="md" />
          </div>

          <button
            onClick={logout}
            className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* User Info Row */}
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/60 p-1 flex items-center justify-center text-white shrink-0 shadow-md">
            <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {user?.name || 'User'}
            </h2>
            <div className="text-xs font-semibold text-purple-200 mt-0.5">
              ID: {user?.phone || 'Not available'}
            </div>
          </div>
        </div>

        {/* Floating Available Balance Card (Exact match to Screenshot 5) */}
        <div className="bg-white/20 backdrop-blur-md rounded-[28px] p-6 text-white border border-white/30 shadow-xl shadow-purple-950/20 relative z-10">
          <div className="text-sm font-medium text-purple-100">
            Available Balance
          </div>
          <div className="text-4xl font-black tracking-tight mt-1">
            ₦{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Main Account Content Wrapper */}
      <div className="max-w-md mx-auto px-4 -mt-6 relative z-20 space-y-4">
        {/* 2. Quick Action Row (Exact match to Screenshot 5: Deposit, Withdraw, My Invest, Team) */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Action 1: Deposit */}
          <button
            onClick={() => setDepositModalOpen(true)}
            className="bg-white rounded-3xl p-3.5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform hover:shadow-md cursor-pointer"
          >
            <ArrowUpRight className="w-5 h-5 text-gray-800" />
            <span className="text-[11px] font-bold text-gray-700">Deposit</span>
          </button>

          {/* Action 2: Withdraw */}
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="bg-white rounded-3xl p-3.5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform hover:shadow-md cursor-pointer"
          >
            <ArrowDownLeft className="w-5 h-5 text-pink-600" />
            <span className="text-[11px] font-bold text-gray-700">Withdraw</span>
          </button>

          {/* Action 3: My Invest */}
          <button
            onClick={() => setMyInvestmentsModalOpen(true)}
            className="bg-white rounded-3xl p-3.5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform hover:shadow-md cursor-pointer relative"
          >
            {claimableInvsCount > 0 ? (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
                {claimableInvsCount}
              </span>
            ) : activeInvsCount > 0 ? (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            ) : null}
            <TrendingUp className="w-5 h-5 text-gray-800" />
            <span className="text-[11px] font-bold text-gray-700">My Invest</span>
          </button>

          {/* Action 4: Team */}
          <button
            onClick={() => setActiveTab('team')}
            className="bg-white rounded-3xl p-3.5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform hover:shadow-md cursor-pointer"
          >
            <Users className="w-5 h-5 text-gray-800" />
            <span className="text-[11px] font-bold text-gray-700">Team</span>
          </button>
        </div>

        {/* Active Product Yields Card */}
        {activeInvsCount > 0 && (
          <div
            onClick={() => setMyInvestmentsModalOpen(true)}
            className="bg-gradient-to-r from-[#2a0845] via-[#5a1378] to-[#ea2cb6] rounded-3xl p-4 text-white shadow-md cursor-pointer active:scale-[0.99] transition-all border border-purple-300/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-200">
                  {activeInvsCount} Running {activeInvsCount === 1 ? 'Plan' : 'Plans'} Active
                </span>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  +₦{investments.filter(i => i.status === 'active').reduce((sum, i) => sum + (Number(i.dailyIncome) || 0), 0).toLocaleString()}/day earning rate
                </div>
              </div>
              <div className="text-right">
                {claimableInvsCount > 0 ? (
                  <span className="px-3 py-1.5 bg-emerald-400 text-purple-950 font-black text-xs rounded-xl shadow-xs animate-pulse">
                    Collect Yields &rarr;
                  </span>
                ) : (
                  <span className="text-xs font-bold text-purple-200 flex items-center gap-1">
                    Manage &rarr;
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Menu Items List Container (Exact match to Screenshots 5 & 6) */}
        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-purple-50 divide-y divide-gray-100">
          {/* Menu Item 1: Invite Friends */}
          <button
            onClick={() => setInviteModalOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Share2 className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-gray-800">Invite Friends</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Menu Item 2: Bank Account */}
          <button
            onClick={() => setBankAccountModalOpen(true)}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Landmark className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-gray-800">Bank Account</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Menu Item 3: Transaction History */}
          <button
            onClick={() => handleOpenHistory('all')}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <History className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold text-gray-800">Transaction History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Menu Item 4: Withdraw History */}
          <button
            onClick={() => handleOpenHistory('withdraw')}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <History className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold text-gray-800">Withdraw History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Menu Item 5: Deposit History */}
          <button
            onClick={() => handleOpenHistory('deposit')}
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <History className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold text-gray-800">Deposit History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          {/* Menu Item 6: Telegram Group */}
          <a
            href={SYSTEM_INFO.telegramGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Send className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-gray-800">Telegram Group</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>

          {/* Menu Item 7: Telegram Channel */}
          <a
            href={SYSTEM_INFO.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full p-4 flex items-center justify-between hover:bg-purple-50/50 rounded-2xl transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Send className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-gray-800">Telegram Channel</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </a>

          {/* Menu Item 8: Admin Control Panel (Instant Access for Admin) */}
          {isAdminUser && (
            <button
              onClick={() => onOpenAdmin && onOpenAdmin()}
              className="w-full p-4 flex items-center justify-between hover:bg-pink-50 rounded-2xl transition-colors text-left cursor-pointer bg-gradient-to-r from-purple-50/80 to-pink-50/80 border border-pink-100"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-purple-950">Xenova Admin Portal</div>
                  <div className="text-[10px] text-pink-600 font-semibold">Instant Access (No PIN Required)</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>
          )}

          {/* Menu Item 9: Logout */}
          <button
            onClick={logout}
            className="w-full p-4 flex items-center justify-between hover:bg-red-50 rounded-2xl transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-extrabold text-red-600">Sign Out / Log Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
