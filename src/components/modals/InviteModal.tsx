import React, { useState } from 'react';
import { X, Share2, Copy, Check, Users, Gift } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_INFO } from '../../data/packages';

export const InviteModal: React.FC = () => {
  const { inviteModalOpen, setInviteModalOpen, user } = useApp();
  const [copied, setCopied] = useState(false);

  if (!inviteModalOpen) return null;

  const inviteCode = user?.invitationCode || 'XN894201';
  const inviteLink = `${window.location.origin}?code=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">Invite & Earn</h3>
            <p className="text-xs text-gray-500 font-medium">Earn passive referral commissions</p>
          </div>
        </div>
        <button
          onClick={() => setInviteModalOpen(false)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30">
          <Share2 className="w-10 h-10" />
        </div>

        <div>
          <h3 className="text-2xl font-black text-gray-900">Invite Friends</h3>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Share your unique invitation link and earn instant cash rewards!
          </p>
        </div>

        {/* Commission Tier Cards */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-purple-50 p-4 rounded-3xl border border-purple-100">
            <div className="text-[10px] font-extrabold text-purple-600 uppercase">Level 1 Commission</div>
            <div className="text-2xl font-black text-purple-950 mt-1">{SYSTEM_INFO.referralL1}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">Direct Referrals</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-3xl border border-pink-100">
            <div className="text-[10px] font-extrabold text-pink-600 uppercase">Level 2 Commission</div>
            <div className="text-2xl font-black text-pink-950 mt-1">{SYSTEM_INFO.referralL2}</div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">Sub-Referrals</div>
          </div>
        </div>

        {/* Invitation Code Box */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-1">
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your Invitation Code</div>
          <div className="text-2xl font-black text-purple-700 tracking-wider">{inviteCode}</div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="w-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-4 rounded-full shadow-lg shadow-purple-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm"
        >
          {copied ? <Check className="w-5 h-5 text-green-300" /> : <Copy className="w-5 h-5" />}
          {copied ? 'Link Copied to Clipboard!' : 'Copy Invitation Link'}
        </button>
      </div>
    </div>
  );
};
