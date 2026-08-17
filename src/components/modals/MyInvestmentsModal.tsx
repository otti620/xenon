import React, { useState } from 'react';
import { X, TrendingUp, Zap, Clock, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Coins } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from '../Logo';

export const MyInvestmentsModal: React.FC = () => {
  const {
    myInvestmentsModalOpen,
    setMyInvestmentsModalOpen,
    investments,
    collectInvestmentIncome,
    collectAllInvestmentsIncome,
    setActiveTab,
  } = useApp();

  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [collectingAll, setCollectingAll] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!myInvestmentsModalOpen) return null;

  const activeInvestments = investments.filter((i) => i.status === 'active');
  const totalInvested = investments.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  const totalDailyRevenue = activeInvestments.reduce((sum, i) => sum + (Number(i.dailyIncome) || 0), 0);
  const totalEarnedSoFar = investments.reduce((sum, i) => sum + (Number(i.totalEarned) || 0), 0);

  const claimableInvestments = activeInvestments.filter((i) => i.canClaimToday);
  const totalClaimableAmount = claimableInvestments.reduce((sum, i) => sum + (Number(i.dailyIncome) || 0), 0);

  const handleCollectSingle = async (invId: string) => {
    setCollectingId(invId);
    setFeedback(null);
    try {
      const res = await collectInvestmentIncome(invId);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `₦${res.reward?.toLocaleString()} daily yield credited to your balance!`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Unable to collect income at this moment.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to collect daily product income.',
      });
    } finally {
      setCollectingId(null);
    }
  };

  const handleCollectAll = async () => {
    if (claimableInvestments.length === 0) return;
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
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">My Invest</h3>
            <p className="text-xs text-gray-500 font-medium">Running Products & Daily Yields</p>
          </div>
        </div>
        <button
          onClick={() => setMyInvestmentsModalOpen(false)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {/* Top Summary Banner */}
        <div className="bg-gradient-to-br from-[#2a0845] via-[#4b126e] to-[#7b24f2] rounded-3xl p-5 text-white shadow-lg shadow-purple-950/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Coins className="w-40 h-40 text-white" />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                  Total Daily Yield Rate
                </span>
                <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  ₦{totalDailyRevenue.toLocaleString()}<span className="text-sm font-semibold text-purple-200">/day</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                  Total Earned
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
                  ₦{totalEarnedSoFar.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs font-semibold text-purple-100">
              <div>
                Active Products: <strong className="text-white">{activeInvestments.length}</strong>
              </div>
              <div className="text-right">
                Total Capital: <strong className="text-white">₦{totalInvested.toLocaleString()}</strong>
              </div>
            </div>

            {/* Collect All Button */}
            {claimableInvestments.length > 0 && (
              <button
                onClick={handleCollectAll}
                disabled={collectingAll}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-400 to-teal-400 text-purple-950 font-black rounded-2xl shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-950 fill-purple-950" />
                <span>
                  {collectingAll
                    ? 'Crediting Balance...'
                    : `Collect All Available Yields (+₦${totalClaimableAmount.toLocaleString()})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{feedback.message}</div>
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Product Cards List */}
        {investments.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white rounded-3xl p-6 border border-purple-50 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <div className="text-base font-bold text-gray-800">No Purchased Products Yet</div>
              <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                Explore our guaranteed daily income packages to start receiving instant daily cash returns directly into your balance!
              </p>
            </div>
            <button
              onClick={() => {
                setMyInvestmentsModalOpen(false);
                setActiveTab('products');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white text-xs font-bold rounded-2xl shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-500">
                Your Running Packages ({investments.length})
              </h4>
              <span className="text-[11px] text-purple-600 font-bold">Guaranteed Daily Returns</span>
            </div>

            {investments.map((inv) => {
              const isCollecting = collectingId === inv.id;
              const duration = Number(inv.durationDays || 90);
              const completed = Number(inv.daysCompleted || 0);
              const progressPct = Math.min(100, Math.round((completed / duration) * 100));

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-purple-100 transition-all hover:border-purple-200"
                >
                  {/* Card Banner */}
                  <div className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] p-4 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-extrabold tracking-tight">{inv.packageName}</h4>
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            inv.status === 'active'
                              ? 'bg-emerald-400 text-purple-950'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {inv.status === 'active' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-950 animate-ping inline-block" />
                          )}
                          {inv.status}
                        </span>
                      </div>
                      <div className="text-xl font-black mt-0.5">
                        ₦{(inv.price || 0).toLocaleString()}.00
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md p-1 rounded-xl border border-white/30">
                      <Logo size="sm" />
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 space-y-3.5">
                    <div className="grid grid-cols-3 gap-2 text-center bg-[#f8f9fb] rounded-2xl p-3 border border-gray-100">
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Daily Income</div>
                        <div className="text-xs font-black text-purple-700 mt-0.5">
                          ₦{(inv.dailyIncome || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Total Revenue</div>
                        <div className="text-xs font-black text-emerald-600 mt-0.5">
                          ₦{(inv.totalIncome || (inv.dailyIncome * duration)).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Duration</div>
                        <div className="text-xs font-black text-gray-800 mt-0.5">
                          {duration} Days
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 px-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-600">
                        <span>Cycle Progress: Day {completed} of {duration}</span>
                        <span className="text-purple-700">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, progressPct)}%` }}
                        />
                      </div>
                    </div>

                    {/* Earnings Summary Row */}
                    <div className="flex items-center justify-between text-xs font-semibold px-1 text-gray-600 pt-1 border-t border-gray-50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-600" />
                        Started: {inv.startDate ? inv.startDate.split('T')[0] : 'Recent'}
                      </span>
                      <span className="font-black text-emerald-600">
                        Credited so far: ₦{(inv.totalEarned || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* Action Collection Button / Status */}
                    {inv.status === 'active' && (
                      <div className="pt-1">
                        {inv.canClaimToday ? (
                          <button
                            onClick={() => handleCollectSingle(inv.id)}
                            disabled={isCollecting || collectingAll}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-purple-500/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-4 h-4 fill-white" />
                            <span>
                              {isCollecting
                                ? 'Crediting to Balance...'
                                : `Collect Today's Income (₦${(inv.dailyIncome || 0).toLocaleString()})`}
                            </span>
                          </button>
                        ) : (
                          <div className="w-full py-2.5 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] rounded-2xl flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Today's Income Credited &bull; Next Yield Ready Tomorrow</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

