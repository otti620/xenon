import React, { useState } from 'react';
import { X, ArrowDownLeft, Landmark, AlertCircle, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_INFO } from '../../data/packages';

export const WithdrawModal: React.FC = () => {
  const {
    withdrawModalOpen,
    setWithdrawModalOpen,
    balance,
    bankAccount,
    setBankAccountModalOpen,
    requestWithdrawal,
    investments,
    transactions,
    setDepositModalOpen,
  } = useApp();

  const [amount, setAmount] = useState<number>(SYSTEM_INFO.minWithdrawal);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!withdrawModalOpen) return null;

  const hasPackage = Boolean(investments && investments.length > 0);
  const meetsRequirements = hasPackage;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!meetsRequirements) {
      setFeedback({
        success: false,
        message: 'Withdrawal restricted: You must hold a product investment package to request a withdrawal.',
      });
      return;
    }

    setSubmitting(true);
    const res = await requestWithdrawal(amount);
    setFeedback(res);
    setSubmitting(false);

    if (res.success) {
      setTimeout(() => {
        setWithdrawModalOpen(false);
        setFeedback(null);
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Full Screen Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">Withdraw Funds</h3>
            <p className="text-xs text-gray-500 font-medium">Available Balance: ₦{balance.toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={() => setWithdrawModalOpen(false)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Full Screen Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Requirement Warning Banner if user hasn't deposited or bought package */}
        {!meetsRequirements && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-700 text-white p-4 rounded-3xl shadow-lg space-y-2">
            <div className="flex items-center gap-2 font-extrabold text-sm">
              <ShieldAlert className="w-5 h-5 text-yellow-300 shrink-0" />
              <span>Withdrawal Activation Required</span>
            </div>
            <p className="text-xs font-medium opacity-90 leading-relaxed">
              To unlock withdrawal requests, your account must have made at least 1 deposit and hold an active package investment.
            </p>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setWithdrawModalOpen(false);
                  setDepositModalOpen(true);
                }}
                className="bg-white text-purple-900 text-xs font-extrabold px-4 py-2.5 rounded-full shadow-sm hover:bg-purple-50 flex items-center gap-1.5"
              >
                <span>Deposit & Invest Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          {/* Linked Bank Card */}
          <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              {bankAccount ? (
                <div>
                  <div className="text-xs font-extrabold text-gray-900">{bankAccount.bankName}</div>
                  <div className="text-xs text-gray-500 font-medium">{bankAccount.accountNumber} • {bankAccount.accountName}</div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-gray-900">No Bank Linked</div>
                  <div className="text-xs text-pink-600 font-semibold">Tap to configure bank account</div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setBankAccountModalOpen(true)}
              className="text-xs font-bold text-purple-700 hover:underline bg-purple-50 px-3 py-1.5 rounded-xl"
            >
              {bankAccount ? 'Change' : 'Add Bank'}
            </button>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Withdrawal Amount (₦)</label>
              <button
                type="button"
                onClick={() => setAmount(Math.max(SYSTEM_INFO.minWithdrawal, balance))}
                className="text-xs text-purple-700 font-extrabold hover:underline cursor-pointer"
              >
                Max Amount
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₦</span>
              <input
                type="number"
                min={SYSTEM_INFO.minWithdrawal}
                max={balance}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="1000"
                className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-8 pr-4 text-base font-extrabold text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
              />
            </div>

            {/* Realtime 15% Charge Breakdown */}
            {amount > 0 && (
              <div className="mt-3 bg-purple-50/70 border border-purple-100 rounded-2xl p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Requested Amount:</span>
                  <span className="font-bold text-gray-900">₦{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-pink-600 font-semibold">
                  <span>Realtime Withdrawal Charge (15%):</span>
                  <span>- ₦{Math.round(amount * 0.15).toLocaleString()}</span>
                </div>
                <div className="border-t border-purple-200 pt-1.5 flex justify-between text-purple-950 font-black text-sm">
                  <span>Net Payout to Bank:</span>
                  <span className="text-emerald-700">₦{Math.max(0, amount - Math.round(amount * 0.15)).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines box */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/60 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Withdrawal Rules & Charges
            </div>
            <p className="text-xs text-amber-800 leading-tight">
              • Realtime withdrawal service charge: <span className="font-bold">15%</span>
            </p>
            <p className="text-xs text-amber-800 leading-tight">
              • Minimum withdrawal: <span className="font-bold">₦{SYSTEM_INFO.minWithdrawal.toLocaleString()}</span>
            </p>
            <p className="text-xs text-amber-800 leading-tight">
              • Processing hours: <span className="font-bold">{SYSTEM_INFO.withdrawalHours}</span>
            </p>
            <p className="text-xs text-amber-800 leading-tight">
              • Requires 1 deposit & active package before payout.
            </p>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                feedback.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-pink-50 text-pink-800 border border-pink-200'
              }`}
            >
              {feedback.success ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-pink-600 shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !bankAccount || amount < SYSTEM_INFO.minWithdrawal || amount > balance}
            className="w-full mt-4 bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-4 rounded-full shadow-lg shadow-purple-500/25 active:scale-98 disabled:opacity-50 transition-all text-sm"
          >
            {submitting ? 'Processing...' : 'Submit Withdrawal'}
          </button>
        </form>
      </div>
    </div>
  );
};
