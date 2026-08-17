import React from 'react';
import { LEGACY_PACKAGES, SYSTEM_INFO } from '../data/packages';
import { Logo } from './Logo';
import { Users, Landmark, Clock, Gift } from 'lucide-react';

export const IncomeTableBanner: React.FC = () => {
  return (
    <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-b from-[#3a0d33] via-[#280826] to-[#1a041c] p-3 sm:p-4 text-white shadow-2xl border border-pink-500/20">
      {/* Background futuristic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(234,44,182,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(234,44,182,0.1)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

      {/* Top Banner Header */}
      <div className="flex flex-col items-center mb-3 relative z-10">
        <Logo size="md" />
        <div className="text-center font-black text-xl tracking-wide uppercase text-white mt-1 drop-shadow-md">
          XEN<span className="text-[#f02aa6]">OVA</span>
        </div>
      </div>

      {/* Income Table Outer Box */}
      <div className="rounded-2xl border border-purple-400/40 bg-[#421045]/70 backdrop-blur-md p-1.5 relative z-10 shadow-inner">
        {/* Table Title Bar */}
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <div className="h-[2px] w-6 bg-gradient-to-r from-transparent to-pink-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-pink-200 bg-gradient-to-r from-purple-800 to-pink-700 px-2.5 py-0.5 rounded-full border border-pink-400/30">
            INCOME TABLE
          </span>
          <div className="h-[2px] w-6 bg-gradient-to-l from-transparent to-pink-400" />
        </div>

        {/* Scrollable Table View */}
        <div className="overflow-x-auto max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar">
          <table className="w-full text-center text-[10px] font-medium border-separate border-spacing-y-0.5">
            <thead>
              <tr className="bg-[#6b186e] text-pink-100 font-bold uppercase text-[9px] rounded-lg">
                <th className="py-1 px-1.5 rounded-l-md">Plan</th>
                <th className="py-1 px-1.5">Price</th>
                <th className="py-1 px-1.5 text-yellow-300">Daily</th>
                <th className="py-1 px-1.5 text-green-300">Total</th>
                <th className="py-1 px-1.5 rounded-r-md">Duration</th>
              </tr>
            </thead>
            <tbody>
              {LEGACY_PACKAGES.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="bg-white text-gray-900 font-semibold shadow-sm hover:bg-pink-50 transition-colors"
                >
                  <td className="py-1 px-1.5 rounded-l-full bg-purple-100 text-purple-950 font-black text-[9.5px]">
                    {pkg.name}
                  </td>
                  <td className="py-1 px-1.5 text-gray-800 font-bold text-[10px]">
                    ₦{pkg.price.toLocaleString()}
                  </td>
                  <td className="py-1 px-1.5 text-purple-700 font-bold text-[10px]">
                    ₦{pkg.dailyIncome.toLocaleString()}
                  </td>
                  <td className="py-1 px-1.5 text-emerald-600 font-bold text-[10px]">
                    ₦{pkg.totalIncome.toLocaleString()}
                  </td>
                  <td className="py-1 px-1.5 rounded-r-full text-gray-600 text-[9px] font-bold">
                    {pkg.durationDays}d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Highlight Info Badges Grid */}
      <div className="grid grid-cols-2 gap-2 mt-3 relative z-10 text-[10px] sm:text-[11px]">
        {/* Badge 1: Referral Commission */}
        <div className="bg-white text-gray-900 rounded-xl p-2 flex items-center gap-2 border border-purple-200 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold uppercase text-[9px] text-purple-900">Referral Commission</div>
            <div className="text-gray-700 font-bold">
              Level 1 - <span className="text-purple-700">{SYSTEM_INFO.referralL1}</span> | Level 2 - <span className="text-purple-700">{SYSTEM_INFO.referralL2}</span>
            </div>
          </div>
        </div>

        {/* Badge 2: Limits */}
        <div className="bg-white text-gray-900 rounded-xl p-2 flex items-center gap-2 border border-purple-200 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-[9px] text-purple-900">
              Min Withdraw: <span className="text-purple-700">₦{SYSTEM_INFO.minWithdrawal.toLocaleString()}</span>
            </div>
            <div className="font-extrabold text-[9px] text-purple-900">
              Min Deposit: <span className="text-purple-700">₦{SYSTEM_INFO.minDeposit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Badge 3: Withdrawal Time */}
        <div className="bg-white text-gray-900 rounded-xl p-2 flex items-center gap-2 border border-purple-200 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold uppercase text-[9px] text-purple-900">Withdrawal Time</div>
            <div className="font-bold text-purple-700 text-[9.5px]">
              {SYSTEM_INFO.withdrawalHours}
            </div>
          </div>
        </div>

        {/* Badge 4: Bonuses */}
        <div className="bg-white text-gray-900 rounded-xl p-2 flex items-center gap-2 border border-purple-200 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold text-[9px] text-purple-900 uppercase">
              Sign-up Bonus
            </div>
            <div className="font-extrabold text-purple-700 text-[10px]">
              ₦{SYSTEM_INFO.signUpBonus}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
