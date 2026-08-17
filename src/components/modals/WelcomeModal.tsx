import React from 'react';
import { X, Landmark, ArrowUpRight, Clock, Gift } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_INFO } from '../../data/packages';

export const WelcomeModal: React.FC = () => {
  const { welcomeModalOpen, setWelcomeModalOpen } = useApp();

  if (!welcomeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-purple-50 text-center animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setWelcomeModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ba2fa8] tracking-tight mt-1">
          Welcome to Xenova
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 text-sm font-medium mt-1.5">
          First profit drops immediately after buying!
        </p>

        {/* Key Benefits Card Container */}
        <div className="bg-[#fef4fa] border border-[#fce3f3] rounded-2xl p-4 mt-5 text-left">
          <div className="text-xs font-bold text-[#ba2fa8] mb-3">
            Key Benefits:
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Box 1: Min Deposit */}
            <div className="bg-white border border-[#fde8f5] rounded-2xl p-3 shadow-xs flex flex-col justify-between min-h-[100px]">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-[#fae6f4] flex items-center justify-center text-[#ba2fa8] shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 text-right leading-tight">
                  Min.<br />Deposit
                </span>
              </div>
              <div className="font-black text-gray-900 text-sm sm:text-base text-right mt-2">
                ₦{SYSTEM_INFO.minDeposit.toLocaleString()}
              </div>
            </div>

            {/* Box 2: Min Withdrawal */}
            <div className="bg-white border border-[#fde8f5] rounded-2xl p-3 shadow-xs flex flex-col justify-between min-h-[100px]">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-[#fae6f4] flex items-center justify-center text-[#ba2fa8] shrink-0">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 text-right leading-tight">
                  Min.<br />Withdrawal
                </span>
              </div>
              <div className="font-black text-gray-900 text-sm sm:text-base text-right mt-2">
                ₦{SYSTEM_INFO.minWithdrawal.toLocaleString()}
              </div>
            </div>

            {/* Box 3: Withdrawal Time */}
            <div className="bg-white border border-[#fde8f5] rounded-2xl p-3 shadow-xs flex flex-col justify-between min-h-[100px]">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-[#fae6f4] flex items-center justify-center text-[#ba2fa8] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 text-right leading-tight">
                  Withdrawal<br />Time
                </span>
              </div>
              <div className="font-black text-gray-900 text-xs sm:text-sm text-right mt-2 leading-tight">
                9am - 9pm<br />Daily
              </div>
            </div>

            {/* Box 4: Sign-up Bonus */}
            <div className="bg-white border border-[#fde8f5] rounded-2xl p-3 shadow-xs flex flex-col justify-between min-h-[100px]">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-[#fae6f4] flex items-center justify-center text-[#ba2fa8] shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-semibold text-gray-400 text-right leading-tight">
                  Sign-up<br />Bonus
                </span>
              </div>
              <div className="font-black text-gray-900 text-xs sm:text-sm text-right mt-2 leading-tight">
                ₦{SYSTEM_INFO.signUpBonus.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Action Buttons */}
        <div className="mt-5 space-y-3">
          <a
            href={SYSTEM_INFO.telegramGroupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#28a8ea] hover:bg-[#209bd9] text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.19-1.82 6.99-3.02 8.4-3.6 4-.1.65 4.84.1 4.84.1z" />
            </svg>
            <span>Join Our Telegram Group</span>
          </a>

          <a
            href={SYSTEM_INFO.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.07-.78 4.19-1.82 6.99-3.02 8.4-3.6 4-.1.65 4.84.1 4.84.1z" />
            </svg>
            <span>Join Our Telegram Channel</span>
          </a>
        </div>
      </div>
    </div>
  );
};
