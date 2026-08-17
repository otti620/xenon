import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ActivityItem {
  id: string;
  phone: string;
  type: 'deposit' | 'withdrawal' | 'investment';
  amount: number;
  timeAgo: string;
  detail: string;
}

const SAMPLE_PHONES = [
  '0813***8912', '0902***4410', '0706***1198', '0803***5521', 
  '0915***3309', '0812***7781', '0703***9910', '0908***1204',
  '0806***6632', '0708***2219', '0814***0056', '0901***4482',
  '0802***8891', '0705***1120', '0816***7743', '0903***5512'
];

const SAMPLE_AMOUNTS = [3000, 5000, 10000, 15000, 20000, 35000, 50000, 80000, 100000, 150000, 250000];

const BANKS = ['OPay', 'Palmpay', 'Moniepoint', 'Kuda', 'GTBank', 'Access Bank', 'First Bank'];
const PACKAGES = ['Package X3', 'Package X5', 'Package X10', 'Package X20', 'Package X50', 'Package X100'];

export const ActivitySimulator: React.FC = () => {
  const [currentToast, setCurrentToast] = useState<ActivityItem | null>(null);
  const [activityList, setActivityList] = useState<ActivityItem[]>([]);

  const generateRandomActivity = (): ActivityItem => {
    const types: ('deposit' | 'withdrawal' | 'investment')[] = ['deposit', 'withdrawal', 'investment', 'withdrawal', 'deposit'];
    const type = types[Math.floor(Math.random() * types.length)];
    const phone = SAMPLE_PHONES[Math.floor(Math.random() * SAMPLE_PHONES.length)];
    const amount = SAMPLE_AMOUNTS[Math.floor(Math.random() * SAMPLE_AMOUNTS.length)];
    const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
    const pkg = PACKAGES[Math.floor(Math.random() * PACKAGES.length)];

    let detail = '';
    if (type === 'deposit') detail = `via ${bank}`;
    if (type === 'withdrawal') detail = `to ${bank}`;
    if (type === 'investment') detail = `bought ${pkg}`;

    return {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      phone,
      type,
      amount,
      timeAgo: 'Just now',
      detail,
    };
  };

  // Initial seed items
  useEffect(() => {
    const seed: ActivityItem[] = [
      { id: 'act-1', phone: '0813***8912', type: 'withdrawal', amount: 45000, timeAgo: '1 min ago', detail: 'to OPay' },
      { id: 'act-2', phone: '0902***4410', type: 'deposit', amount: 20000, timeAgo: '2 mins ago', detail: 'via Moniepoint' },
      { id: 'act-3', phone: '0706***1198', type: 'investment', amount: 50000, timeAgo: '4 mins ago', detail: 'bought Package X50' },
      { id: 'act-4', phone: '0803***5521', type: 'withdrawal', amount: 15000, timeAgo: '5 mins ago', detail: 'to Palmpay' },
    ];
    setActivityList(seed);
  }, []);

  // Interval generator for live toasts and list feed
  useEffect(() => {
    let timeoutId: any = null;
    const interval = setInterval(() => {
      const newAct = generateRandomActivity();
      
      // Trigger toast popup
      setCurrentToast(newAct);

      // Add to list feed
      setActivityList((prev) => [newAct, ...prev.slice(0, 14)]);

      // Hide toast after 4 seconds
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setCurrentToast(null);
      }, 4200);

    }, 10000); // Trigger every 10s

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {/* Floating Popup Toast Toast Banner (Bottom Right / Mobile Bottom) */}
      <AnimatePresence>
        {currentToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-xs z-40 pointer-events-none"
          >
            <div className="bg-gray-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-purple-500/30 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  currentToast.type === 'deposit'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : currentToast.type === 'withdrawal'
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                }`}
              >
                {currentToast.type === 'deposit' ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : currentToast.type === 'withdrawal' ? (
                  <ArrowDownLeft className="w-4 h-4" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-300">
                  <span className="text-white truncate">{currentToast.phone}</span>
                  <span className="text-emerald-400 font-extrabold ml-1">
                    ₦{currentToast.amount.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                  <span className="capitalize font-semibold text-purple-300">
                    {currentToast.type === 'withdrawal' ? 'Withdrew' : currentToast.type === 'deposit' ? 'Deposited' : 'Invested'}
                  </span>
                  <span>{currentToast.detail}</span>
                </div>
              </div>

              <div className="text-[9px] bg-purple-900/80 text-purple-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 border border-purple-500/30">
                Live
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Component to render live activity stream ticker on Home tab
export const LiveActivityWidget: React.FC = () => {
  const [feed, setFeed] = useState<ActivityItem[]>([
    { id: '1', phone: '0813***8912', type: 'withdrawal', amount: 45000, timeAgo: 'Just now', detail: 'to OPay' },
    { id: '2', phone: '0902***4410', type: 'deposit', amount: 20000, timeAgo: '1m ago', detail: 'via Moniepoint' },
    { id: '3', phone: '0706***1198', type: 'investment', amount: 50000, timeAgo: '2m ago', detail: 'bought Package X50' },
    { id: '4', phone: '0803***5521', type: 'withdrawal', amount: 15000, timeAgo: '3m ago', detail: 'to Palmpay' },
    { id: '5', phone: '0915***3309', type: 'deposit', amount: 100000, timeAgo: '4m ago', detail: 'via GTBank' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const phones = ['0806***1192', '0901***4420', '0703***8819', '0812***3301', '0905***6621', '0814***9011'];
      const amounts = [5000, 10000, 20000, 50000, 100000, 150000];
      const types: ('deposit' | 'withdrawal' | 'investment')[] = ['deposit', 'withdrawal', 'investment', 'withdrawal'];
      const banks = ['OPay', 'Palmpay', 'Moniepoint', 'Kuda'];

      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomPhone = phones[Math.floor(Math.random() * phones.length)];
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
      const randomBank = banks[Math.floor(Math.random() * banks.length)];

      const newItem: ActivityItem = {
        id: 'feed-' + Date.now(),
        phone: randomPhone,
        type: randomType,
        amount: randomAmount,
        timeAgo: 'Just now',
        detail: randomType === 'withdrawal' ? `to ${randomBank}` : randomType === 'deposit' ? `via ${randomBank}` : 'Package Purchased',
      };

      setFeed((prev) => [newItem, ...prev.slice(0, 5)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-purple-50 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="font-extrabold text-xs text-gray-900 tracking-wide uppercase">
            Live Platform Transactions
          </h4>
        </div>
        <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-purple-600" />
          Real-Time
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
        {feed.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-[#f8f9fb] p-2.5 rounded-2xl border border-gray-100 text-xs"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  item.type === 'deposit'
                    ? 'bg-emerald-100 text-emerald-700'
                    : item.type === 'withdrawal'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {item.type === 'deposit' ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : item.type === 'withdrawal' ? (
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
              </div>
              <div>
                <div className="font-bold text-gray-900 leading-tight">{item.phone}</div>
                <div className="text-[10px] text-gray-400 font-medium">{item.detail} • {item.timeAgo}</div>
              </div>
            </div>

            <div
              className={`font-black text-xs ${
                item.type === 'withdrawal' ? 'text-pink-600' : 'text-emerald-600'
              }`}
            >
              {item.type === 'withdrawal' ? '-' : '+'}₦{item.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
