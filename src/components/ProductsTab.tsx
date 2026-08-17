import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  Zap,
  ShieldCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  Package,
  Sparkles,
  ArrowRight,
  Layers,
  Flame,
  Check,
} from 'lucide-react';
import { XENOVA_PACKAGES } from '../data/packages';

export const ProductsTab: React.FC = () => {
  const {
    investments,
    setSelectedPackageForInvest,
    collectInvestmentIncome,
    collectAllInvestmentsIncome,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'running'>('all');
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [collectingAll, setCollectingAll] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ [id: string]: { hours: number; minutes: number; seconds: number } }>({});

  const activeInvs = investments.filter((i) => i.status === 'active');
  const claimableInvs = activeInvs.filter((i) => i.canClaimToday);
  const totalDailyRevenue = activeInvs.reduce((sum, i) => sum + (Number(i.dailyIncome) || 0), 0);
  const totalEarnedSoFar = investments.reduce((sum, i) => sum + (Number(i.totalEarned) || 0), 0);
  const totalClaimableAmount = claimableInvs.reduce((sum, i) => sum + (Number(i.dailyIncome) || 0), 0);

  // If user has active products, default or badge accordingly
  useEffect(() => {
    if (activeInvs.length > 0 && activeSubTab === 'all' && investments.length === 1) {
      // Keep on current or let user switch
    }
  }, [activeInvs.length]);

  // Countdown timer effect
  useEffect(() => {
    const updateCountdowns = () => {
      const newTimeLeft: { [id: string]: { hours: number; minutes: number; seconds: number } } = {};
      const now = Date.now();

      investments.forEach((inv) => {
        const startStr = inv.startDate || inv.createdAt;
        const start = startStr ? new Date(startStr).getTime() : now;
        const safeStart = isNaN(start) ? now : start;
        const elapsed = Math.max(0, now - safeStart);
        const cycle = 24 * 60 * 60 * 1000; // 24 hours
        const remainder = cycle - (elapsed % cycle);

        const totalSeconds = Math.max(0, Math.floor(remainder / 1000));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        newTimeLeft[inv.id] = {
          hours: isNaN(hours) ? 23 : hours,
          minutes: isNaN(minutes) ? 59 : minutes,
          seconds: isNaN(seconds) ? 59 : seconds,
        };
      });

      setTimeLeft(newTimeLeft);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [investments]);

  const handleCollectSingle = async (invId: string) => {
    setCollectingId(invId);
    setFeedback(null);
    try {
      const res = await collectInvestmentIncome(invId);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `₦${res.reward?.toLocaleString()} daily yield credited!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Unable to collect profit at this moment.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to collect daily product income.',
      });
    } finally {
      setCollectingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleCollectAll = async () => {
    if (claimableInvs.length === 0) return;
    setCollectingAll(true);
    setFeedback(null);
    try {
      const res = await collectAllInvestmentsIncome();
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `₦${res.totalReward?.toLocaleString()} credited to your balance!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to collect all revenue.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to collect all product earnings.',
      });
    } finally {
      setCollectingAll(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* 1. Header with financial summary */}
      <div className="bg-gradient-to-r from-[#2a0845] via-[#5a1378] to-[#ea2cb6] rounded-3xl p-5 text-white shadow-lg border border-purple-300/30 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
              Daily Yield Earning Rate
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              +₦{totalDailyRevenue.toLocaleString()}<span className="text-xs font-semibold text-purple-200">/day</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
              Total Profits Earned
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              ₦{totalEarnedSoFar.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Running Products Count */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 text-xs font-medium text-purple-100">
          <span>Active Plans: <strong className="text-white font-bold">{activeInvs.length}</strong></span>
          <span>Guaranteed Term: <strong className="text-white font-bold">90 Days (20% Daily)</strong></span>
        </div>

        {/* Master Collect Button */}
        {claimableInvs.length > 0 && (
          <button
            onClick={handleCollectAll}
            disabled={collectingAll}
            className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-emerald-400 to-teal-300 text-purple-950 font-black rounded-2xl shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <Sparkles className="w-4 h-4 fill-purple-950" />
            <span>
              {collectingAll
                ? 'Crediting to Balance...'
                : `Collect All Available Profits (+₦${totalClaimableAmount.toLocaleString()})`}
            </span>
          </button>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <Zap className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 2. Subtab Pill Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-purple-50 shadow-xs grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white shadow-sm'
              : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          All Packages ({XENOVA_PACKAGES.length})
        </button>

        <button
          onClick={() => setActiveSubTab('running')}
          className={`py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
            activeSubTab === 'running'
              ? 'bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white shadow-sm'
              : 'text-gray-600 hover:text-purple-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          My Running Plans ({activeInvs.length})
          {claimableInvs.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* 3. Tab Content */}
      {activeSubTab === 'running' ? (
        <div className="space-y-4">
          {activeInvs.length === 0 ? (
            <div className="bg-white rounded-[32px] p-8 text-center space-y-4 border border-purple-50 shadow-sm">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">No Running Plans Right Now</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Invest in any Xenova package from ₦3,000 to ₦300,000 to start receiving daily guaranteed yields for 90 days.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('all')}
                className="bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold px-6 py-3 rounded-full shadow-md shadow-purple-500/20 text-xs tracking-wide active:scale-98"
              >
                Browse All Packages
              </button>
            </div>
          ) : (
            activeInvs.map((inv) => {
              const timer = timeLeft[inv.id] || { hours: 23, minutes: 59, seconds: 59 };
              const duration = Number(inv.durationDays || 90);
              const daysCompleted = Number(inv.daysCompleted || 0);
              const progress = Math.min(100, Math.round((daysCompleted / duration) * 100));
              const daily = Number(inv.dailyIncome || 0);
              const totalRevenue = Number(inv.totalIncome || daily * duration);
              const isClaimable = Boolean(inv.canClaimToday);

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-purple-50 hover:shadow-md transition-all"
                >
                  <div className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] p-5 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-extrabold tracking-tight">{inv.packageName}</h4>
                        <span className="text-[10px] font-black uppercase bg-emerald-400 text-purple-950 px-2.5 py-0.5 rounded-full shadow-xs">
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-2xl font-black mt-1">₦{(inv.price || 0).toLocaleString()}.00</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30">
                      <Logo size="md" />
                    </div>
                  </div>

                  <div className="p-5 space-y-4 bg-white">
                    {/* Financial stats breakdown */}
                    <div className="grid grid-cols-3 gap-2 py-1 text-center bg-[#f8f9fb] rounded-2xl p-3 border border-gray-100">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Daily Profit</div>
                        <div className="text-xs font-black text-purple-700 mt-0.5">
                          +₦{daily.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Total Revenue</div>
                        <div className="text-xs font-black text-emerald-600 mt-0.5">
                          ₦{totalRevenue.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Progress</div>
                        <div className="text-xs font-black text-gray-800 mt-0.5">
                          Day {daysCompleted}/{duration}
                        </div>
                      </div>
                    </div>

                    {/* Countdown and Total Earned */}
                    <div className="flex items-center justify-between bg-purple-50/70 p-3 rounded-2xl border border-purple-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                        <Clock className="w-4 h-4 text-purple-600 animate-spin-slow" />
                        <span>Next Cycle:</span>
                        <span className="font-mono text-purple-700">
                          {String(timer.hours).padStart(2, '0')}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-700">
                        Earned: <strong className="text-purple-700">₦{(inv.totalEarned || 0).toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-gray-600">
                        <span>Cycle Duration Completed</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, progress)}%` }}
                        />
                      </div>
                    </div>

                    {/* Collection Button */}
                    {isClaimable ? (
                      <button
                        onClick={() => handleCollectSingle(inv.id)}
                        disabled={collectingId === inv.id}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold py-3.5 rounded-full shadow-md shadow-emerald-500/20 active:scale-98 hover:brightness-105 transition-all text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 fill-white" />
                        <span>
                          {collectingId === inv.id
                            ? 'Crediting to Balance...'
                            : `Collect Today's Income (+₦${daily.toLocaleString()})`}
                        </span>
                      </button>
                    ) : (
                      <div className="w-full py-3 bg-gray-50 border border-gray-200 rounded-full text-center text-xs font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Today's Yield (₦{daily.toLocaleString()}) Credited &bull; Ready Tomorrow</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* All Packages Catalog (Xenova 1 to 13) */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-extrabold text-gray-900">
              All Available Packages
            </h3>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              90 Days Guaranteed Returns
            </span>
          </div>

          <div className="space-y-4">
            {XENOVA_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-purple-50 hover:shadow-md transition-shadow"
              >
                {/* Product Header Pill */}
                <div className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] p-5 text-white flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-extrabold tracking-tight">{pkg.name}</h4>
                      {pkg.popular && (
                        <span className="text-[10px] font-black uppercase bg-yellow-400 text-purple-950 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                          <Flame className="w-3 h-3 fill-purple-950" /> POPULAR
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black mt-1">₦{pkg.price.toLocaleString()}.00</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/30">
                    <Logo size="md" />
                  </div>
                </div>

                {/* Product Card Details */}
                <div className="p-5 space-y-3.5 bg-white">
                  <div className="grid grid-cols-3 gap-2 py-1 text-center bg-[#f8f9fb] rounded-2xl p-3 border border-gray-100">
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Daily Income</div>
                      <div className="text-xs font-black text-purple-700 mt-0.5">
                        +₦{pkg.dailyIncome.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Total Revenue</div>
                      <div className="text-xs font-black text-emerald-600 mt-0.5">
                        ₦{pkg.totalIncome.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">Duration</div>
                      <div className="text-xs font-black text-gray-800 mt-0.5">{pkg.durationDays} Days</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold px-1">
                    <span className="flex items-center gap-1 text-purple-700">
                      <Zap className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                      20% Daily Yield Rate
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      90 Days Guaranteed
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedPackageForInvest(pkg)}
                    className="w-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-3.5 rounded-full shadow-md shadow-purple-500/20 active:scale-98 hover:brightness-105 transition-all text-xs tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Invest Now in {pkg.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


