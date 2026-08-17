import React, { useState } from 'react';
import { X, Landmark, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BankAccountModal: React.FC = () => {
  const { bankAccountModalOpen, setBankAccountModalOpen, bankAccount, setBankAccount } = useApp();

  const NIGERIAN_BANKS = [
    'OPay',
    'Palmpay',
    'Moniepoint Microfinance Bank',
    'Kuda Bank',
    'Guaranty Trust Bank (GTBank)',
    'Access Bank',
    'Zenith Bank',
    'United Bank for Africa (UBA)',
    'First Bank of Nigeria',
    'Fidelity Bank',
    'Standard Chartered',
    'Sterling Bank',
    'Wema Bank / ALAT',
  ];

  const [bankName, setBankName] = useState(bankAccount?.bankName || NIGERIAN_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState(bankAccount?.accountNumber || '');
  const [accountName, setAccountName] = useState(bankAccount?.accountName || '');
  const [success, setSuccess] = useState(false);

  if (!bankAccountModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber || accountNumber.length < 10) return;

    setBankAccount({
      bankName,
      accountNumber,
      accountName: accountName || 'Verified User',
    });

    setSuccess(true);
    setTimeout(() => {
      setBankAccountModalOpen(false);
      setSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">Bank Account Details</h3>
            <p className="text-xs text-gray-500 font-medium">Link account for express withdrawals</p>
          </div>
        </div>
        <button
          onClick={() => setBankAccountModalOpen(false)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {success ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-gray-900">Bank Account Saved!</h4>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 ml-1">Select Bank</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full mt-1.5 bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
              >
                {NIGERIAN_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 ml-1">Account Number (10 digits)</label>
              <input
                type="text"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0123456789"
                className="w-full mt-1.5 bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-base font-extrabold text-gray-900 tracking-wider focus:outline-none focus:border-purple-500 shadow-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 ml-1">Account Name</label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter Full Name matching bank"
                className="w-full mt-1.5 bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:border-purple-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={accountNumber.length < 10}
              className="w-full mt-6 bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-4 rounded-full shadow-lg shadow-purple-500/25 active:scale-98 disabled:opacity-50 transition-all text-sm"
            >
              Save Bank Details
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
