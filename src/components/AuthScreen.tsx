import React, { useState } from 'react';
import { Phone, Lock, Mail, Eye, EyeOff, Ticket } from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const { login, signup } = useApp();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code') || params.get('ref') || params.get('invite');
      if (code) {
        setInviteCode(code.trim());
        setMode('signup');
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  const isValidNigerianPhone = (phoneStr: string): boolean => {
    let digits = phoneStr.replace(/\D/g, '');
    if (digits.startsWith('234') && digits.length === 13) {
      digits = '0' + digits.substring(3);
    } else if (digits.length === 10 && !digits.startsWith('0')) {
      digits = '0' + digits;
    }
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;
    if (digits === '01234567890') return false;

    const validPrefixes = ['070', '080', '081', '090', '091', '071'];
    return validPrefixes.some((prefix) => digits.startsWith(prefix));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim();
    if (!cleanPhone || !isValidNigerianPhone(cleanPhone)) {
      setError('Please enter a valid 11-digit Nigerian phone number (e.g. 08012345678, 07012345678, 09012345678)');
      return;
    }

    if (!password.trim() || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await signup(cleanPhone, email || `${cleanPhone}@xenova.site`, password, inviteCode);
      } else {
        await login(cleanPhone, password);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8fc] pb-12 flex flex-col items-center">
      {/* Top Gradient Banner */}
      <div className="w-full bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7c26f0] pt-12 pb-20 px-4 rounded-b-[48px] shadow-lg flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:16px_16px]" />

        {/* Logo Card */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="bg-white p-2 rounded-3xl shadow-xl shadow-purple-950/20 border border-white/60 mb-3">
            <Logo size="xl" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide text-center drop-shadow-md">
            Xenova
          </h1>
        </motion.div>
      </div>

      {/* Floating Auth Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md px-4 -mt-10 relative z-20"
      >
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-purple-900/10 border border-purple-50">
          {/* Segmented Control Pill Toggle */}
          <div className="bg-[#f4f2f8] p-1.5 rounded-full flex mb-6 relative">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all relative z-10 ${
                mode === 'signin' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-full transition-all relative z-10 ${
                mode === 'signup' ? 'text-white' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>

            {/* Active Pill animation background */}
            <motion.div
              className="absolute top-1.5 bottom-1.5 rounded-full bg-gradient-to-r from-[#ea2cb6] to-[#7b24f2] shadow-md shadow-purple-500/20"
              animate={{
                left: mode === 'signin' ? '0.375rem' : 'calc(50% + 0.1875rem)',
                width: 'calc(50% - 0.5625rem)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          </div>

          {/* Form Titles */}
          <div className="mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {mode === 'signin' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {mode === 'signin'
                ? 'Please sign in to continue'
                : 'Sign up to get started with Xenova'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Phone Number Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">
                Phone Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 w-9 h-9 rounded-xl bg-[#fdebf6] text-[#ea2cb6] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full bg-[#f8f9fb] border border-gray-100 rounded-2xl py-3.5 pl-14 pr-4 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-2.5 w-9 h-9 rounded-xl bg-[#fdebf6] text-[#ea2cb6] flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signin' ? 'Enter your password' : 'Create your password'}
                  className="w-full bg-[#f8f9fb] border border-gray-100 rounded-2xl py-3.5 pl-14 pr-12 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 w-9 h-9 rounded-xl bg-[#fdebf6] text-[#ea2cb6] flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full bg-[#f8f9fb] border border-gray-100 rounded-2xl py-3.5 pl-14 pr-4 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Invitation Code (Sign Up) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">
                  Invitation Code (Optional)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-2.5 w-9 h-9 rounded-xl bg-[#fdebf6] text-[#ea2cb6] flex items-center justify-center shrink-0">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invitation code"
                    className="w-full bg-[#f8f9fb] border border-gray-100 rounded-2xl py-3.5 pl-14 pr-4 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:border-purple-300 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-[#ea2cb6] via-[#ba28d4] to-[#7b24f2] text-white font-bold py-4 rounded-full shadow-lg shadow-purple-500/25 active:scale-98 hover:brightness-105 disabled:opacity-70 transition-all text-base tracking-wide flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
