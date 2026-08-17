import React from 'react';
import { X, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const InvestModal: React.FC = () => {
  const {
    selectedPackageForInvest,
    setSelectedPackageForInvest,
    investInPackage,
    balance,
  } = useApp();

  const [investing, setInvesting] = React.useState(false);

  if (!selectedPackageForInvest) return null;

  const pkg = selectedPackageForInvest;
  const isBalanceSufficient = balance >= pkg.price;

  const handleConfirm = async () => {
    setInvesting(true);
    const success = await investInPackage(pkg);
    setInvesting(false);
    if (success) {
      setSelectedPackageForInvest(null);
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
            <h3 className="font-extrabold text-lg text-gray-900">Invest in {pkg.name}</h3>
            <p className="text-xs text-gray-500 font-medium">90 Days High Yield Package</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedPackageForInvest(null)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Price Header Banner */}
        <div className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] p-6 rounded-3xl text-white shadow-md">
          <div className="text-xs font-medium opacity-80">Investment Price</div>
          <div className="text-4xl font-black mt-1">₦{pkg.price.toLocaleString()}</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-bold bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit">
            <Zap className="w-4 h-4 fill-current text-yellow-300" />
            DAILY INCOME FOR 90 DAYS
          </div>
        </div>

        {/* Package Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs space-y-3.5 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Daily Income</span>
            <span className="font-extrabold text-purple-700 text-base">₦{pkg.dailyIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-gray-500 font-medium">Total Income (90 Days)</span>
            <span className="font-extrabold text-emerald-600 text-base">₦{pkg.totalIncome.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Your Available Balance</span>
            <span className={`font-black text-sm ${isBalanceSufficient ? 'text-gray-900' : 'text-pink-600'}`}>
              ₦{balance.toLocaleString()}
            </span>
          </div>
        </div>

        {!isBalanceSufficient && (
          <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-pink-800 text-xs font-semibold">
            Insufficient balance! Tapping invest will redirect to Deposit Funds page.
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={investing}
          className="w-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white font-extrabold py-4 rounded-full shadow-lg shadow-purple-500/25 active:scale-98 transition-all text-sm"
        >
          {investing ? 'Processing Investment...' : isBalanceSufficient ? 'Confirm Investment' : 'Deposit & Invest'}
        </button>
      </div>
    </div>
  );
};
