import React from 'react';
import { Home, TrendingUp, Users, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: TrendingUp },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'account', label: 'Account', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-3 left-4 right-4 max-w-md mx-auto z-50">
      <div className="bg-white/95 backdrop-blur-lg border border-purple-100/90 rounded-[26px] p-2 shadow-[0_10px_35px_rgba(124,38,240,0.12)] flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex-1 py-1 flex flex-col items-center justify-center transition-all cursor-pointer select-none"
            >
              {isActive ? (
                <motion.div
                  layoutId="activeTabPill"
                  className="bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7c26f0] text-white rounded-2xl px-4 py-2 flex items-center gap-2 shadow-md shadow-purple-500/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 hover:text-purple-600 transition-colors py-1">
                  <Icon className="w-5 h-5 stroke-[1.8]" />
                  <span className="text-[11px] font-medium tracking-tight">
                    {item.label}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
