import React from 'react';
import { X, History, ArrowUpRight, ArrowDownLeft, Gift, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HistoryModal: React.FC = () => {
  const { historyModalOpen, setHistoryModalOpen, historyType, setHistoryType, transactions } = useApp();

  if (!historyModalOpen) return null;

  const filtered = transactions.filter((tx) => {
    if (historyType === 'deposit') return tx.type === 'deposit';
    if (historyType === 'withdraw') return tx.type === 'withdrawal';
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowDownLeft className="w-4 h-4 text-pink-600" />;
      case 'sign_in_bonus':
      case 'daily_income':
        return <Gift className="w-4 h-4 text-purple-600" />;
      default:
        return <TrendingUp className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#faf8fc] flex flex-col w-full h-full sm:max-w-xl sm:mx-auto sm:my-auto sm:h-[92vh] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-purple-100 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">
              {historyType === 'deposit'
                ? 'Deposit History'
                : historyType === 'withdraw'
                ? 'Withdraw History'
                : 'Transaction History'}
            </h3>
            <p className="text-xs text-gray-500 font-medium">All recorded activity log</p>
          </div>
        </div>
        <button
          onClick={() => setHistoryModalOpen(false)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Pills Header */}
      <div className="flex gap-2 p-4 bg-white/60 border-b border-gray-100 shrink-0">
        <button
          onClick={() => setHistoryType('all')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
            historyType === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Logs
        </button>
        <button
          onClick={() => setHistoryType('deposit')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
            historyType === 'deposit'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Deposits
        </button>
        <button
          onClick={() => setHistoryType('withdraw')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
            historyType === 'withdraw'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Withdrawals
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs font-medium">
            No transactions recorded yet.
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  {getTypeIcon(tx.type)}
                </div>
                <div>
                  <div className="text-xs font-extrabold text-gray-900 leading-tight">
                    {tx.description}
                  </div>
                  {tx.senderName && (
                    <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
                      Payer: {tx.senderName} {tx.senderBank ? `(${tx.senderBank})` : ''}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {new Date((tx as any).createdAt || tx.date || Date.now()).toLocaleDateString()} • {new Date((tx as any).createdAt || tx.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-black ${
                    tx.type === 'withdrawal' || tx.type === 'investment'
                      ? 'text-pink-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {tx.type === 'withdrawal' || tx.type === 'investment' ? '-' : '+'}₦
                  {tx.amount.toLocaleString()}
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    tx.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
