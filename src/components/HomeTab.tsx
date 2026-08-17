import React from 'react';
import { IncomeTableBanner } from './IncomeTableBanner';
import { LiveActivityWidget } from './ActivitySimulator';
import { ArrowUpRight, ArrowDownLeft, Ticket, Share2, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LEGACY_PACKAGES } from '../data/packages';
import { Logo } from './Logo';

export const HomeTab: React.FC = () => {
  const {
    investments,
    setDepositModalOpen,
    setWithdrawModalOpen,
    setGiftCodeModalOpen,
    setInviteModalOpen,
    setMyInvestmentsModalOpen,
    setSelectedPackageForInvest,
  } = useApp();

  const activeInvs = investments.filter((i) => i.status === 'active');
  const claimableInvs = activeInvs.filter((i) => i.canClaimToday);
  const totalDailyRevenue = activeInvs.reduce((sum, i) => sum + (Number(i.dailyIncome) || 0), 0);
  const claimableAmount = claimableInvs.reduce((sum, i) => sum + (Number(i.dailyIncome) || 0), 0);

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* 1. Income Table Graphic Banner */}
      <IncomeTableBanner />

      {/* Active Running Investments Callout */}
      {activeInvs.length > 0 && (
        <div
          onClick={() => setMyInvestmentsModalOpen(true)}
          className="bg-gradient-to-r from-[#2a0845] via-[#5a1378] to-[#ea2cb6] rounded-3xl p-4 text-white shadow-md shadow-purple-950/15 cursor-pointer active:scale-[0.99] transition-all border border-purple-300/30 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-emerald-300 shadow-inner">
                <Zap className="w-5 h-5 fill-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                    {activeInvs.length} Active {activeInvs.length === 1 ? 'Product' : 'Products'} Running
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                </div>
                <div className="text-sm font-extrabold text-white mt-0.5">
                  +₦{totalDailyRevenue.toLocaleString()}<span className="text-xs text-purple-200 font-semibold">/day earning rate</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {claimableInvs.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-400 text-purple-950 font-black text-xs shadow-sm animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  Collect ₦{claimableAmount.toLocaleString()}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 text-purple-100 font-bold text-[11px]">
                  View &bull; &rarr;
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Live Platform Activity Stream */}
      <LiveActivityWidget />

      {/* 2. Quick Actions Section (Exact match to Screenshot 4) */}
      <div>
        <h3 className="text-lg font-black text-gray-900 tracking-tight mb-3">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Action 1: Deposit */}
          <button
            onClick={() => setDepositModalOpen(true)}
            className="bg-white rounded-[26px] p-5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-2.5 active:scale-98 transition-transform hover:shadow-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-800 tracking-tight">Deposit</span>
          </button>

          {/* Action 2: Invite */}
          <button
            onClick={() => setInviteModalOpen(true)}
            className="bg-white rounded-[26px] p-5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-2.5 active:scale-98 transition-transform hover:shadow-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-800 tracking-tight">Invite</span>
          </button>

          {/* Action 3: Withdraw */}
          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="bg-white rounded-[26px] p-5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-2.5 active:scale-98 transition-transform hover:shadow-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-800 tracking-tight">Withdraw</span>
          </button>

          {/* Action 4: Gift Code */}
          <button
            onClick={() => setGiftCodeModalOpen(true)}
            className="bg-white rounded-[26px] p-5 shadow-sm border border-purple-50 flex flex-col items-center justify-center gap-2.5 active:scale-98 transition-transform hover:shadow-md cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Ticket className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-800 tracking-tight">Gift Code</span>
          </button>
        </div>
      </div>

      {/* 3. Our Products Section (Exact match to Screenshot 4) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            Our Products
          </h3>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            90 Days Investment
          </span>
        </div>

        <div className="space-y-4">
          {LEGACY_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-purple-50 hover:shadow-md transition-shadow"
            >
              {/* Product Header Pill */}
              <div className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] p-5 text-white flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-extrabold tracking-tight">{pkg.name}</h4>
                  <div className="text-2xl font-black mt-1">₦{pkg.price.toLocaleString()}.00</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30">
                  <Logo size="md" />
                </div>
              </div>

              {/* Product Card Details */}
              <div className="p-5 space-y-3 bg-white">
                <div className="grid grid-cols-3 gap-2 py-1 text-center bg-[#f8f9fb] rounded-2xl p-3 border border-gray-100">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Daily Income</div>
                    <div className="text-xs font-black text-purple-700 mt-0.5">₦{pkg.dailyIncome.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Total Revenue</div>
                    <div className="text-xs font-black text-emerald-600 mt-0.5">₦{pkg.totalIncome.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Duration</div>
                    <div className="text-xs font-black text-gray-800 mt-0.5">{pkg.durationDays} Days</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPackageForInvest(pkg)}
                  className="w-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-3.5 rounded-full shadow-md shadow-purple-500/20 active:scale-98 hover:brightness-105 transition-all text-sm tracking-wide"
                >
                  Invest Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
