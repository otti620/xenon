import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Copy, Check, Share2, Award, ArrowUpRight } from 'lucide-react';
import { SYSTEM_INFO } from '../data/packages';

export const TeamTab: React.FC = () => {
  const { user, teamMembers } = useApp();
  const [copied, setCopied] = useState(false);
  const [levelTab, setLevelTab] = useState<1 | 2>(1);

  const inviteCode = user?.invitationCode || '';
  const inviteLink = inviteCode ? `${window.location.origin}?code=${inviteCode}` : 'Log in to view invite link';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredMembers = teamMembers.filter((m) => m?.level === levelTab);
  const totalCommission = teamMembers.reduce((acc, m) => acc + (m?.commissionEarned || 0), 0);

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] rounded-[32px] p-6 text-white shadow-xl shadow-purple-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs font-semibold opacity-90 uppercase tracking-wider">Total Referral Earnings</div>
            <div className="text-3xl font-black mt-1">₦{totalCommission.toLocaleString()}.00</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Invite Link Box */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center justify-between gap-2">
          <div className="truncate text-xs font-mono font-medium opacity-90">
            {inviteLink}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-white text-purple-900 font-bold text-xs shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Commission Rate Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-purple-50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Level 1 Commission</div>
            <div className="text-lg font-black text-purple-900">{SYSTEM_INFO.referralL1}</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-purple-50 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase">Level 2 Commission</div>
            <div className="text-lg font-black text-pink-900">{SYSTEM_INFO.referralL2}</div>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-[32px] p-5 shadow-sm border border-purple-50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-gray-900">Team Breakdown</h3>
          <div className="bg-gray-100 p-1 rounded-full flex text-xs font-bold">
            <button
              onClick={() => setLevelTab(1)}
              className={`px-3 py-1 rounded-full transition-all ${
                levelTab === 1 ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              Level 1 ({teamMembers.filter((m) => m.level === 1).length})
            </button>
            <button
              onClick={() => setLevelTab(2)}
              className={`px-3 py-1 rounded-full transition-all ${
                levelTab === 2 ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-500'
              }`}
            >
              Level 2 ({teamMembers.filter((m) => m.level === 2).length})
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredMembers.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs font-medium">
              No team members at Level {levelTab} yet. Share your code to invite friends!
            </div>
          ) : (
            filteredMembers.map((m) => (
              <div
                key={m?.id || Math.random()}
                className="bg-[#f8f9fb] rounded-2xl p-3 border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-extrabold text-gray-900">{m?.phone || 'User'}</div>
                  <div className="text-[10px] text-gray-400 font-medium">Joined {m?.joinedDate || 'Recent'}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-purple-700">
                    +₦{(m?.commissionEarned || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    Invested: ₦{(m?.totalInvested || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
