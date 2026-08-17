import React, { useState } from 'react';
import { X, Gift, Send, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_INFO } from '../../data/packages';

export const GiftCodeModal: React.FC = () => {
  const { giftCodeModalOpen, setGiftCodeModalOpen, redeemGiftCode } = useApp();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!giftCodeModalOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setFeedback(null);

    const res = await redeemGiftCode(code.trim());
    setLoading(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setCode('');
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">Daily Gift Code</h3>
            <p className="text-xs text-gray-500 font-medium">Redeem code for daily ₦100 reward</p>
          </div>
        </div>
        <button
          onClick={() => {
            setFeedback(null);
            setGiftCodeModalOpen(false);
          }}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] text-white mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Gift className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-gray-900">Redeem Gift Code</h3>
            <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto mt-1">
              Enter the gift code within <strong className="text-purple-600">20 minutes</strong> of issuance to claim your reward! Gift codes expire after 20 minutes.
            </p>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-sm font-bold flex items-start gap-3 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{feedback.message}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Enter Gift Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. XN-7829"
                className="w-full bg-white border border-purple-100 rounded-2xl px-4 py-4 text-center text-lg font-black tracking-widest text-purple-950 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className={`w-full py-4 rounded-full font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
              loading || !code.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white shadow-purple-500/25 active:scale-98 hover:brightness-105'
            }`}
          >
            {loading ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <Ticket className="w-5 h-5" />
                <span>Claim ₦100 Reward</span>
              </>
            )}
          </button>
        </form>

        {/* Telegram Link Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-black text-blue-900">Need Daily Codes?</div>
            <div className="text-[11px] font-semibold text-blue-700">
              Join our official Telegram community to get daily codes.
            </div>
          </div>
          <a
            href={SYSTEM_INFO.telegramChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join</span>
          </a>
        </div>
      </div>
    </div>
  );
};
