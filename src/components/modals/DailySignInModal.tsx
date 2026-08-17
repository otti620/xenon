import React from 'react';
import { X, Gift, Check, CalendarCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_INFO } from '../../data/packages';

const DAYS = [
  { day: 'Day 1', reward: 120 },
  { day: 'Day 2', reward: 120 },
  { day: 'Day 3', reward: 120 },
  { day: 'Day 4', reward: 120 },
  { day: 'Day 5', reward: 120 },
  { day: 'Day 6', reward: 120 },
  { day: 'Day 7', reward: 120 },
];

export const DailySignInModal: React.FC = () => {
  const {
    dailySignInModalOpen,
    setDailySignInModalOpen,
    claimDailySignIn,
    isDailyClaimedToday,
  } = useApp();

  const [claiming, setClaiming] = React.useState(false);

  if (!dailySignInModalOpen) return null;

  const handleClaim = async () => {
    setClaiming(true);
    await claimDailySignIn();
    setClaiming(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">Daily Sign-In Bonus</h3>
            <p className="text-xs text-gray-500 font-medium">Claim your daily passive income reward</p>
          </div>
        </div>
        <button
          onClick={() => setDailySignInModalOpen(false)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Gift className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-2xl font-black text-gray-900">Daily Rewards</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Sign in every day to claim your <span className="text-purple-700 font-bold">₦{SYSTEM_INFO.dailySignInBonus}</span> reward!
          </p>
        </div>

        {/* 7-day streak grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 pt-2">
          {DAYS.map((d, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                i === 0 && isDailyClaimedToday
                  ? 'bg-purple-50 border-purple-300 text-purple-700 shadow-xs'
                  : 'bg-white border-gray-100 text-gray-600'
              }`}
            >
              <span className="text-[10px] font-bold text-gray-400">{d.day}</span>
              <span className="text-xs font-black text-purple-900 mt-0.5">₦{d.reward}</span>
              {i === 0 && isDailyClaimedToday ? (
                <Check className="w-4 h-4 text-green-600 mt-1" />
              ) : (
                <CalendarCheck className="w-4 h-4 text-purple-400 mt-1" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleClaim}
          disabled={isDailyClaimedToday || claiming}
          className={`w-full py-4 rounded-full font-extrabold text-sm shadow-lg transition-all ${
            isDailyClaimedToday
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white shadow-purple-500/25 active:scale-98 hover:brightness-105'
          }`}
        >
          {claiming
            ? 'Claiming...'
            : isDailyClaimedToday
            ? 'Claimed Today (₦120)'
            : `Claim Today's ₦${SYSTEM_INFO.dailySignInBonus}`}
        </button>
      </div>
    </div>
  );
};
