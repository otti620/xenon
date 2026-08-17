import React, { useState } from 'react';
import { X, ShieldCheck, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { apiAdminLogin } from '../../services/api';
import { useApp } from '../../context/AppContext';

export const AdminAuthModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdminAuthenticated: () => void }> = ({
  isOpen,
  onClose,
  onAdminAuthenticated,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, triggerConfetti } = useApp();

  if (!isOpen) return null;

  const allowedAdminPhones = ['07077599057', '09011711470', '08000000000'];
  const isUserAuthorizedAdmin = user && (allowedAdminPhones.includes(user.phone) || user.role === 'admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUserAuthorizedAdmin) {
      setError('Access Restricted: Only registered admin numbers (07077599057 and 09011711470) are authorized.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await apiAdminLogin(pin);
      triggerConfetti();
      onAdminAuthenticated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Invalid Master Admin PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#190822] text-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl border border-pink-500/30 relative overflow-hidden text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:bg-white/20 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ea2cb6] to-[#7b24f2] mx-auto flex items-center justify-center shadow-lg shadow-purple-900/50 mb-3">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>

        <h3 className="text-xl font-black tracking-wide text-white">Xenova Admin Portal</h3>
        <p className="text-xs text-purple-200/80 mt-1 font-medium">
          Authorized Admin Access (07077599057 / 09011711470)
        </p>

        {!isUserAuthorizedAdmin ? (
          <div className="mt-4 bg-red-500/20 text-red-300 text-xs p-4 rounded-2xl border border-red-500/30 font-medium space-y-2">
            <Lock className="w-6 h-6 text-red-400 mx-auto" />
            <div className="font-bold text-sm text-red-200">Access Restricted</div>
            <div>Your account ({user?.phone || 'Guest'}) is not authorized to access the Admin Control Center.</div>
            <div className="text-[10px] text-gray-400">Admin portal is restricted to 07077599057 and 09011711470.</div>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-3 bg-red-500/20 text-red-300 text-xs p-2.5 rounded-2xl border border-red-500/30 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-pink-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  placeholder="Admin PIN (e.g. xenova2026)"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-[#100316] border border-pink-500/30 rounded-2xl pl-11 pr-4 py-3 text-sm text-center font-mono font-black text-pink-300 tracking-widest focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] text-white font-extrabold py-3.5 rounded-full shadow-lg shadow-purple-950 active:scale-98 hover:brightness-110 transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2"
              >
                {loading ? 'Authenticating...' : 'Unlock Admin Portal'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-4 text-[10px] text-gray-400 font-mono">
              Master Admin PIN: <span className="text-pink-400 font-bold">xenova2026</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
