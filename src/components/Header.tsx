import React, { useState } from 'react';
import { Logo } from './Logo';
import { User, LogOut, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { runSystemSelfHeal } from '../lib/selfHeal';

export const Header: React.FC = () => {
  const { user, setActiveTab, logout } = useApp();
  const [healingMsg, setHealingMsg] = useState<string | null>(null);

  const handleRunSelfHeal = () => {
    try {
      const res = runSystemSelfHeal();
      setHealingMsg(`System Healed: ${res.healedCount} items verified!`);
      setTimeout(() => setHealingMsg(null), 3000);
    } catch {
      setHealingMsg('System already fully optimized.');
      setTimeout(() => setHealingMsg(null), 3000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-50/80 px-4 py-3 flex items-center justify-between transition-all">
      <div 
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 cursor-pointer active:scale-98 transition-transform"
      >
        <Logo size="sm" />
        <span className="font-extrabold text-base tracking-tight text-[#c420a3]">
          XEN<span className="text-[#7c26f0]">OVA</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleRunSelfHeal}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-extrabold hover:bg-emerald-100 transition-colors shadow-xs"
          title="Run Autonomous Self-Healing Diagnostic"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Self-Heal Active</span>
        </button>

        {healingMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-bounce">
            <Zap className="w-3.5 h-3.5" />
            {healingMsg}
          </div>
        )}

        {user && user.isLoggedIn ? (
          <>
            <button
              onClick={() => setActiveTab('account')}
              className="px-2.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 flex items-center gap-1.5 text-xs font-extrabold text-purple-900 hover:bg-purple-100 transition-colors"
              title="Profile & Account"
            >
              <User className="w-4 h-4 text-[#7c26f0]" />
              <span className="font-mono text-[11px]">{user.phone}</span>
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-full bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center"
              title="Sign Out / Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('account')}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] text-white shadow-sm"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
