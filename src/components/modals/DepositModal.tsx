import React, { useState } from 'react';
import { X, Copy, Check, ArrowUpRight, ShieldCheck, ArrowRight, Building2, User, Landmark } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SYSTEM_INFO } from '../../data/packages';

export const DepositModal: React.FC = () => {
  const { depositModalOpen, setDepositModalOpen, addDeposit } = useApp();
  const [amount, setAmount] = useState<number>(3000);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [step, setStep] = useState<'amount' | 'bank' | 'proof' | 'success'>('amount');
  
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!depositModalOpen) return null;

  const presets = [3000, 5000, 10000, 20000, 50000, 100000];
  const popularBanks = ['OPay', 'PalmPay', 'Moniepoint', 'Kuda Bank', 'GTBank', 'Access Bank', 'Zenith Bank', 'First Bank', 'UBA'];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitDeposit = async () => {
    if (!senderName.trim()) {
      setError('Please enter the account name you used to make the transfer.');
      return;
    }
    if (!senderBank.trim()) {
      setError('Please enter or select the bank you transferred from.');
      return;
    }

    setLoading(true);
    setError('');

    const finalRef = refInput.trim() || 'DEP-' + Math.floor(100000 + Math.random() * 900000);

    try {
      await addDeposit(amount, finalRef, senderName.trim(), senderBank.trim());
      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to submit deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDepositModalOpen(false);
    setStep('amount');
    setSenderName('');
    setSenderBank('');
    setError('');
    setRefInput('');
  };

  const bankDetails = {
    bankName: 'Kuda Bank',
    accountNumber: '3004023147',
    accountName: 'Titan Digital Systems',
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Full Screen Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">Deposit Funds</h3>
            <p className="text-xs text-gray-500 font-medium">Minimum deposit ₦{SYSTEM_INFO.minDeposit.toLocaleString()}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Full Screen Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {SYSTEM_INFO.depositsPaused && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-extrabold text-sm text-amber-950">Deposits Temporarily Paused</div>
              <div className="text-xs text-amber-800 font-medium leading-relaxed">
                Deposit services are currently paused by administration. Please check back later.
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: AMOUNT SELECTION */}
        {step === 'amount' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-gray-700 ml-1">Select or Enter Amount (₦)</label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-3.5 text-gray-500 font-bold">₦</span>
                <input
                  type="number"
                  min={SYSTEM_INFO.minDeposit}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="3,000"
                  className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-8 pr-4 text-lg font-extrabold text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold text-gray-500 ml-1">Quick Select</label>
              <div className="grid grid-cols-3 gap-2.5 mt-1.5">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`py-3 px-3 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer ${
                      amount === p
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ₦{p.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={SYSTEM_INFO.depositsPaused || amount < SYSTEM_INFO.minDeposit}
              onClick={() => setStep('bank')}
              className="w-full mt-6 bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-4 rounded-full shadow-lg shadow-purple-500/25 active:scale-98 disabled:opacity-50 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{SYSTEM_INFO.depositsPaused ? 'Deposits Currently Paused' : 'Proceed to Payment'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: BANK DETAILS */}
        {step === 'bank' && (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <div className="text-xs font-semibold text-purple-700">Amount to Transfer</div>
              <div className="text-3xl font-black text-purple-950 mt-0.5">₦{amount.toLocaleString()}</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Bank Name</span>
                <span className="text-sm font-bold text-gray-900">{bankDetails.bankName}</span>
              </div>

              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Account Number</div>
                  <div className="text-lg font-black text-purple-700">{bankDetails.accountNumber}</div>
                </div>
                <button
                  onClick={() => handleCopy(bankDetails.accountNumber, 'acc')}
                  className="px-3.5 py-2 rounded-xl bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-200 transition-colors cursor-pointer"
                >
                  {copiedField === 'acc' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copiedField === 'acc' ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Account Name</span>
                <span className="text-xs font-bold text-gray-900">{bankDetails.accountName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-amber-900 bg-amber-50 p-3.5 rounded-2xl border border-amber-200/60 leading-snug">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Make transfer via your mobile bank app, then click "I Have Transferred" below to confirm your transfer sender details.</span>
            </div>

            <div className="flex gap-2.5 pt-4">
              <button
                onClick={() => setStep('amount')}
                className="flex-1 py-3.5 rounded-full border border-gray-200 text-gray-700 font-bold text-xs bg-white cursor-pointer hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep('proof')}
                className="flex-1 bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-bold py-3.5 rounded-full shadow-md shadow-purple-500/20 text-xs cursor-pointer hover:opacity-95"
              >
                I Have Transferred
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ENTER SENDER NAME & SENDER BANK (NO RECEIPT UPLOAD NEEDED) */}
        {step === 'proof' && (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
              <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-purple-600" />
                <span>Confirm Payment Transfer</span>
              </div>
              <p className="text-xs text-purple-800 mt-1 leading-snug">
                Enter the name on your bank account and your bank name. No receipt upload required.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3.5 rounded-2xl border border-red-200 font-medium">
                {error}
              </div>
            )}

            {/* Sender Account Name */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Sender Account Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. John Chukwuemeka"
                  className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1 ml-1">The exact account name you transferred from</p>
            </div>

            {/* Sender Bank */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Sender Bank Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  placeholder="e.g. OPay, PalmPay, Kuda, GTBank..."
                  className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
                />
              </div>

              {/* Quick Bank Select Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {popularBanks.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSenderBank(b)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                      senderBank === b
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Reference */}
            <div>
              <label className="text-xs font-semibold text-gray-700 ml-1">
                Session ID / Ref <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="Optional transfer reference or session ID"
                className="w-full mt-1 bg-white border border-gray-200 rounded-2xl py-2.5 px-3.5 text-xs font-medium text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
              />
            </div>

            <div className="flex gap-2.5 pt-4">
              <button
                onClick={() => setStep('bank')}
                disabled={loading}
                className="flex-1 py-3.5 rounded-full border border-gray-200 text-gray-700 font-bold text-xs bg-white cursor-pointer hover:bg-gray-50"
              >
                Back
              </button>
              <button
                disabled={SYSTEM_INFO.depositsPaused || !senderName.trim() || !senderBank.trim() || loading}
                onClick={handleSubmitDeposit}
                className="flex-2 w-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-3.5 rounded-full shadow-lg shadow-purple-500/20 text-xs disabled:opacity-50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95"
              >
                {SYSTEM_INFO.depositsPaused ? 'Deposits Currently Paused' : loading ? 'Submitting Details...' : 'Submit Payment Details'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center animate-bounce">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h4 className="text-2xl font-black text-gray-900">Payment Submitted!</h4>
            <p className="text-sm text-gray-600 font-medium max-w-sm mx-auto leading-relaxed">
              Your transfer details for <span className="font-extrabold text-purple-900">₦{amount.toLocaleString()}</span> have been recorded for Admin verification.
            </p>
            
            <div className="bg-white rounded-2xl p-4 border border-gray-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-medium">Amount:</span>
                <span className="font-black text-purple-900">₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-medium">Sender Name:</span>
                <span className="font-bold text-gray-900">{senderName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-medium">Sender Bank:</span>
                <span className="font-bold text-gray-900">{senderBank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Status:</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">Pending Verification</span>
              </div>
            </div>

            <div className="bg-purple-50 p-3.5 rounded-2xl text-xs text-purple-900 border border-purple-100 font-medium text-center">
              Your balance will be credited as soon as admin approves the transaction.
            </div>

            <button
              onClick={handleClose}
              className="w-full mt-4 bg-purple-900 text-white font-extrabold py-4 rounded-full shadow-md text-sm uppercase tracking-wider cursor-pointer hover:bg-purple-800 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
