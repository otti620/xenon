import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import {
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  LogOut,
  TrendingUp,
  Sliders,
  DollarSign,
  Clock,
  Send,
  Sparkles,
  AlertCircle,
  Eye,
  X,
  Ticket,
  Copy,
  ToggleLeft,
  ToggleRight,
  Zap,
  Lock,
  Unlock,
  KeyRound,
  PlusCircle,
  Trash2,
  Check,
  BarChart3,
  Shield,
  Menu,
  ChevronRight,
} from 'lucide-react';
import {
  apiAdminGetStats,
  apiAdminGetUsers,
  apiAdminAdjustBalance,
  apiAdminGetWithdrawals,
  apiAdminWithdrawalAction,
  apiAdminGetDeposits,
  apiAdminDepositAction,
  apiAdminGetGiftCodes,
  apiAdminGenerateGiftCode,
  apiAdminGiftCodeAction,
  apiAdminUpdateSystemConfig,
  apiAdminFreezeUser,
  apiAdminResetPassword,
  apiAdminGetAuditLogs,
  apiAdminClearAuditLogs,
  apiGetSystemConfig,
  apiAdminBanIp,
  apiAdminGetBannedIps,
  apiAdminUnbanAllIps,
  apiAdminActivateProduct,
  apiAdminGetUserActions,
  syncUsersFromFirestore,
} from '../services/api';
import { LEGACY_PACKAGES } from '../data/packages';

export const AdminPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { triggerConfetti } = useApp();

  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'giftcodes' | 'gateway' | 'users' | 'credit' | 'stats' | 'auditlogs' | 'ipbans'>('deposits');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // IP Bans State
  const [bannedIps, setBannedIps] = useState<string[]>([]);
  const [manualIpInput, setManualIpInput] = useState('');

  // Product Activation Modal State
  const [activateProductModalUser, setActivateProductModalUser] = useState<string | null>(null);
  const [selectedPackageForActivation, setSelectedPackageForActivation] = useState<string>('');
  const [activatingProduct, setActivatingProduct] = useState(false);

  // User Actions Modal State
  const [selectedUserForActions, setSelectedUserForActions] = useState<any | null>(null);
  const [userActionsList, setUserActionsList] = useState<any[]>([]);
  const [loadingUserActions, setLoadingUserActions] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [auditEventType, setAuditEventType] = useState<string>('all');
  const [auditSeverity, setAuditSeverity] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditLoading, setAuditLoading] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<any>(null);

  // Users List
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Withdrawals
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // Deposits
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  // Deposits & Withdrawals Processing Locks
  const [processingActionIds, setProcessingActionIds] = useState<Record<string, boolean>>({});

  // Gift Codes
  const [giftCodes, setGiftCodes] = useState<any[]>([]);
  const [customCode, setCustomCode] = useState('');
  const [giftCodeAmount, setGiftCodeAmount] = useState<number>(100);
  const [giftCodeMaxClaims, setGiftCodeMaxClaims] = useState<number>(500);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // System Gateway & Config
  const [config, setConfig] = useState<{
    gatewayEnabled: boolean;
    minDeposit: number;
    minWithdrawal: number;
    signUpBonus: number;
    dailySignInBonus: number;
  }>({
    gatewayEnabled: false,
    minDeposit: 3000,
    minWithdrawal: 1000,
    signUpBonus: 600,
    dailySignInBonus: 100,
  });
  const [updatingConfig, setUpdatingConfig] = useState(false);

  // User Actions (Freeze & Password Reset)
  const [resetPassPhone, setResetPassPhone] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resettingPass, setResettingPass] = useState(false);

  // Modal Lightbox for Proof Screenshot
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Balance Adjustment Form State
  const [selectedUserPhone, setSelectedUserPhone] = useState('');
  const [adjustAmount, setAdjustAmount] = useState<number>(1000);
  const [adjustMode, setAdjustMode] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Fetch all data
  const fetchData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError('');
    try {
      await syncUsersFromFirestore().catch(() => {});
      const [sData, uData, wData, dData, gCodes, sysConfig, auditRes, banRes] = await Promise.all([
        apiAdminGetStats().catch(() => null),
        apiAdminGetUsers().catch(() => ({ users: [] })),
        apiAdminGetWithdrawals().catch(() => ({ withdrawals: [] })),
        apiAdminGetDeposits().catch(() => ({ deposits: [] })),
        apiAdminGetGiftCodes().catch(() => ({ giftCodes: [] })),
        apiGetSystemConfig().catch(() => null),
        apiAdminGetAuditLogs({ eventType: auditEventType, severity: auditSeverity, search: auditSearch }).catch(() => null),
        apiAdminGetBannedIps().catch(() => ({ bannedIps: [] })),
      ]);

      if (sData) setStats(sData);
      if (uData?.users) setUsers(uData.users);
      if (wData?.withdrawals) setWithdrawals(wData.withdrawals);
      if (dData?.deposits) setDeposits(dData.deposits);
      if (gCodes?.giftCodes) setGiftCodes(gCodes.giftCodes);
      if (sysConfig) setConfig(sysConfig);
      if (auditRes) {
        setAuditLogs(auditRes.auditLogs || []);
        setAuditStats(auditRes.stats || null);
      }
      if (banRes?.bannedIps) setBannedIps(banRes.bannedIps);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      if (!isBackground) setError(err?.message || 'Failed to load admin control center data.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);

    // Auto refresh every 5s for real-time deposit/withdrawal requests without UI lockup
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);

    const handleStorageChange = () => {
      fetchData(true);
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'auditlogs') {
      fetchAuditLogs();
    }
  }, [auditEventType, auditSeverity, auditSearch, activeTab]);

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await apiAdminGetAuditLogs({
        eventType: auditEventType,
        severity: auditSeverity,
        search: auditSearch,
      });
      setAuditLogs(res.auditLogs || []);
      setAuditStats(res.stats || null);
    } catch (err: any) {
      console.error('Audit logs fetch failed', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleClearAuditLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all security audit logs? This action is irreversible.')) return;
    try {
      await apiAdminClearAuditLogs();
      setSuccessMsg('Security audit logs cleared successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchAuditLogs();
    } catch (err: any) {
      setError(err?.message || 'Failed to clear audit logs');
    }
  };

  const handleBanIp = async (ip: string, ban: boolean) => {
    try {
      await apiAdminBanIp(ip, ban);
      setSuccessMsg(`IP address ${ip} successfully ${ban ? 'banned' : 'unbanned'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      const res = await apiAdminGetBannedIps();
      setBannedIps(res.bannedIps || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to update IP ban status');
    }
  };

  const handleUnbanAllIps = async () => {
    try {
      await apiAdminUnbanAllIps();
      setSuccessMsg('All banned IPs removed and rate-limit counters reset successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setBannedIps([]);
    } catch (err: any) {
      setError(err?.message || 'Failed to unban all IPs');
    }
  };

  const handleWithdrawalAction = async (item: any, status: 'completed' | 'failed') => {
    if (!item?.id) return;
    if (processingActionIds[item.id]) return;
    if (['completed', 'approved', 'failed', 'rejected'].includes((item.status || '').toLowerCase())) {
      return;
    }

    setProcessingActionIds((prev) => ({ ...prev, [item.id]: true }));

    // Optimistic UI update: immediately switch status so buttons disappear and cannot be tapped twice
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === item.id ? { ...w, status } : w))
    );

    try {
      const action = status === 'completed' ? 'approve' : 'reject';
      const targetPhone = item.phone || item.userId || item.userPhone || '';
      const res = await apiAdminWithdrawalAction(targetPhone, item.id, action);
      setSuccessMsg(res?.message || `Withdrawal request marked as ${status}!`);
      triggerConfetti();
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update withdrawal');
      await fetchData(true);
    } finally {
      setProcessingActionIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  const handleDepositAction = async (item: any, status: 'completed' | 'failed') => {
    if (!item?.id) return;
    if (processingActionIds[item.id]) return;
    if (['completed', 'approved', 'failed', 'rejected'].includes((item.status || '').toLowerCase())) {
      return;
    }

    setProcessingActionIds((prev) => ({ ...prev, [item.id]: true }));

    // Optimistic UI update: immediately switch status so buttons disappear and cannot be tapped twice
    setDeposits((prev) =>
      prev.map((d) => (d.id === item.id ? { ...d, status } : d))
    );

    try {
      const action = status === 'completed' ? 'approve' : 'reject';
      const targetPhone = item.phone || item.userId || item.userPhone || '';
      const res = await apiAdminDepositAction(targetPhone, item.id, action);
      setSuccessMsg(res?.message || `Deposit request marked as ${status}!`);
      triggerConfetti();
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchData(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to update deposit');
      await fetchData(true);
    } finally {
      setProcessingActionIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  const handleGiftCodeAction = async (codeId: string, action: 'toggle' | 'delete') => {
    try {
      await apiAdminGiftCodeAction(codeId, action);
      setSuccessMsg(`Gift code successfully ${action === 'delete' ? 'deleted' : 'updated'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to modify gift code');
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftCodeAmount || giftCodeAmount <= 0) {
      setError('Please enter a valid gift code amount');
      return;
    }
    setGeneratingCode(true);
    setError('');
    try {
      await apiAdminGenerateGiftCode(
        Number(giftCodeAmount),
        Number(giftCodeMaxClaims),
        customCode.trim() || undefined
      );
      setCustomCode('');
      setSuccessMsg('Active gift code generated successfully!');
      triggerConfetti();
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to generate gift code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingConfig(true);
    setError('');
    try {
      await apiAdminUpdateSystemConfig(config);
      setSuccessMsg('System configurations updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update system config');
    } finally {
      setUpdatingConfig(false);
    }
  };

  const handleFreezeUser = async (phone: string, currentFrozen: boolean) => {
    try {
      await apiAdminFreezeUser(phone, !currentFrozen);
      setSuccessMsg(`User ${phone} successfully ${!currentFrozen ? 'frozen' : 'unfrozen'}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update user freeze status');
    }
  };

  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassPhone || !newPasswordInput || newPasswordInput.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setResettingPass(true);
    setError('');
    try {
      await apiAdminResetPassword(resetPassPhone, newPasswordInput);
      setSuccessMsg(`Password successfully reset for ${resetPassPhone}!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setResetPassPhone(null);
      setNewPasswordInput('');
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setResettingPass(false);
    }
  };

  const handleBalanceAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserPhone) {
      setError('Please select a user phone number.');
      return;
    }
    setAdjusting(true);
    setError('');
    try {
      await apiAdminAdjustBalance(
        selectedUserPhone,
        Number(adjustAmount),
        adjustMode,
        adjustNote.trim() || 'Admin manual balance adjustment'
      );
      setSuccessMsg(`Successfully adjusted balance for user ${selectedUserPhone}!`);
      triggerConfetti();
      setTimeout(() => setSuccessMsg(''), 3000);
      setSelectedUserPhone('');
      setAdjustNote('');
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust balance');
    } finally {
      setAdjusting(false);
    }
  };

  const handleActivateProductForUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activateProductModalUser || !selectedPackageForActivation) return;
    setActivatingProduct(true);
    setError('');
    try {
      const res = await apiAdminActivateProduct(activateProductModalUser, selectedPackageForActivation);
      setSuccessMsg(res.message || 'Product successfully activated!');
      triggerConfetti();
      setTimeout(() => setSuccessMsg(''), 3000);
      setActivateProductModalUser(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to activate product');
    } finally {
      setActivatingProduct(false);
    }
  };

  const handleOpenUserActions = async (u: any) => {
    setSelectedUserForActions(u);
    setLoadingUserActions(true);
    try {
      const res = await apiAdminGetUserActions(u.phone);
      setUserActionsList(res.actions || []);
    } catch (err) {
      console.error('Failed to fetch user actions', err);
      setUserActionsList([]);
    } finally {
      setLoadingUserActions(false);
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter === 'all') return true;
    const st = (w.status || 'pending').toLowerCase();
    const isCompleted = st === 'completed' || st === 'approved';
    const isFailed = st === 'failed' || st === 'rejected';
    const isPending = st === 'pending' || st === 'processing';
    if (withdrawalFilter === 'completed') return isCompleted;
    if (withdrawalFilter === 'failed') return isFailed;
    if (withdrawalFilter === 'pending') return isPending;
    return st === withdrawalFilter;
  });

  const filteredDeposits = deposits.filter((d) => {
    if (depositFilter === 'all') return true;
    const st = (d.status || 'pending').toLowerCase();
    const isCompleted = st === 'completed' || st === 'approved';
    const isFailed = st === 'failed' || st === 'rejected';
    const isPending = st === 'pending' || st === 'processing';
    if (depositFilter === 'completed') return isCompleted;
    if (depositFilter === 'failed') return isFailed;
    if (depositFilter === 'pending') return isPending;
    return st === depositFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.phone && u.phone.toLowerCase().includes(q)) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const navItems = [
    { id: 'stats', label: 'Overview Stats', icon: BarChart3 },
    { id: 'deposits', label: `Deposits (${deposits.filter(d => ['pending', 'processing'].includes((d.status || '').toLowerCase())).length})`, icon: ArrowDownLeft },
    { id: 'withdrawals', label: `Withdrawals (${withdrawals.filter(w => ['pending', 'processing'].includes((w.status || '').toLowerCase())).length})`, icon: ArrowUpRight },
    { id: 'users', label: `Users (${users.length})`, icon: Users },
    { id: 'credit', label: 'Balance Adjust', icon: DollarSign },
    { id: 'giftcodes', label: `Gift Codes (${giftCodes.length})`, icon: Ticket },
    { id: 'gateway', label: 'Gateway Settings', icon: Sliders },
    { id: 'ipbans', label: `IP Firewall (${bannedIps.length})`, icon: ShieldAlert },
    { id: 'auditlogs', label: `Audit Logs (${auditStats?.totalLogs ?? auditLogs.length})`, icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col lg:flex-row">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col shrink-0 sticky top-0 h-screen z-30">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-900 tracking-tight">Admin Control</h1>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Management Suite</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-gray-400'}`} />
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Exit Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-black text-gray-900">Admin Control</h1>
            <span className="text-[10px] text-purple-600 font-bold capitalize">{activeTab}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200"
          >
            Exit
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
        {/* Top bar on desktop */}
        <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-black text-gray-900 capitalize flex items-center gap-2.5">
              <span>{activeTab.replace(/([A-Z])/g, ' $1')} Management</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage deposits, withdrawals, users, firewall security and system configuration.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>

        {/* Alerts / Feedback */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-700"><X className="w-4 h-4" /></button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-700"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">{stats?.totalUsers ?? users.length}</div>
                <div className="text-[11px] text-emerald-600 font-bold">Active Platform Registrations</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Deposits</span>
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">₦{(stats?.totalDepositsAmount ?? 0).toLocaleString()}</div>
                <div className="text-[11px] text-gray-500">{deposits.length} total deposit requests</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Withdrawals</span>
                  <ArrowUpRight className="w-4 h-4 text-pink-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">₦{(stats?.totalWithdrawalsAmount ?? 0).toLocaleString()}</div>
                <div className="text-[11px] text-gray-500">{withdrawals.length} total payout requests</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-gray-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Security Threats</span>
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-black text-gray-900">{auditStats?.criticalThreats ?? 0}</div>
                <div className="text-[11px] text-red-600 font-bold">{bannedIps.length} IPs currently blocked</div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" /> Quick Management Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setActiveTab('deposits')}
                  className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-purple-600">Review Deposits</div>
                  <div className="text-lg font-black mt-1">{deposits.filter(d => ['pending', 'processing'].includes((d.status || '').toLowerCase())).length} Pending</div>
                </button>
                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className="p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-900 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-pink-600">Review Withdrawals</div>
                  <div className="text-lg font-black mt-1">{withdrawals.filter(w => ['pending', 'processing'].includes((w.status || '').toLowerCase())).length} Pending</div>
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 text-left transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-blue-600">Manage Users</div>
                  <div className="text-lg font-black mt-1">{users.length} Total Users</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEPOSITS MANAGEMENT */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                Deposit Requests ({filteredDeposits.length})
              </h2>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {(['pending', 'completed', 'failed', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDepositFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                      depositFilter === f
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredDeposits.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 text-gray-400 text-xs font-medium">
                  No deposit requests found matching filter "{depositFilter}".
                </div>
              ) : (
                filteredDeposits.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-gray-900">₦{Number(item.amount || 0).toLocaleString()}</span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          ['completed', 'approved'].includes((item.status || '').toLowerCase()) ? 'bg-emerald-100 text-emerald-700' :
                          ['pending', 'processing'].includes((item.status || '').toLowerCase()) ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        User: <strong className="text-purple-600 font-bold">{item.phone || item.userId || 'User'}</strong> &bull; Ref: <span className="text-gray-700 font-bold">{item.reference || item.id}</span>
                      </div>
                      
                      {/* Payer Sender Details & Proof Card */}
                      <div className="bg-purple-50/90 p-3 rounded-2xl border border-purple-200/80 text-xs text-purple-950 space-y-1">
                        <div className="font-extrabold text-purple-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Payer Proof & Bank Transfer Sender Details</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          <div>Sender Account Name: <strong className="text-purple-900 font-extrabold">{item.senderName || item.accountName || 'Not specified'}</strong></div>
                          <div>Sender Bank: <strong className="text-purple-900 font-extrabold">{item.senderBank || item.bankName || 'Not specified'}</strong></div>
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-400">
                        Submitted On: {new Date(item.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {item.proofImage && (
                        <button
                          onClick={() => setPreviewImage(item.proofImage)}
                          className="px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Proof
                        </button>
                      )}

                      {['pending', 'processing'].includes((item.status || '').toLowerCase()) && (
                        <>
                          <button
                            onClick={() => handleDepositAction(item, 'completed')}
                            disabled={Boolean(processingActionIds[item.id])}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {processingActionIds[item.id] ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleDepositAction(item, 'failed')}
                            disabled={Boolean(processingActionIds[item.id])}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            {processingActionIds[item.id] ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WITHDRAWALS MANAGEMENT */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-pink-600" />
                Withdrawal Requests ({filteredWithdrawals.length})
              </h2>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                {(['pending', 'completed', 'failed', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setWithdrawalFilter(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                      withdrawalFilter === f
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredWithdrawals.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 text-gray-400 text-xs font-medium">
                  No withdrawal requests found matching filter "{withdrawalFilter}".
                </div>
              ) : (
                filteredWithdrawals.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs text-gray-500 font-bold">Gross Requested:</span>
                          <span className="text-sm font-black text-gray-400 line-through">₦{Number(item.amount || 0).toLocaleString()}</span>
                        </div>

                        {/* Automatic 15% Net Payout Calculation */}
                        <div className="bg-emerald-100 text-emerald-950 px-3 py-1 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                          <span className="text-[10px] font-extrabold uppercase text-emerald-800">Net Payout to Bank (After 15% Fee):</span>
                          <span className="text-base font-black text-emerald-700">
                            ₦{Math.max(0, Number(item.amount || 0) - Math.round(Number(item.amount || 0) * 0.15)).toLocaleString()}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          ['completed', 'approved'].includes((item.status || '').toLowerCase()) ? 'bg-emerald-100 text-emerald-700' :
                          ['pending', 'processing'].includes((item.status || '').toLowerCase()) ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 font-mono flex items-center gap-3 flex-wrap">
                        <span>User: <strong className="text-purple-600 font-bold">{item.phone || item.userId || 'User'}</strong></span>
                        <span>15% Service Fee: <strong className="text-pink-600 font-bold">-₦{Math.round(Number(item.amount || 0) * 0.15).toLocaleString()}</strong></span>
                      </div>

                      {item.bankAccount ? (
                        <div className="text-xs text-purple-950 font-mono bg-purple-50/80 p-2.5 rounded-xl border border-purple-200/80 space-y-0.5">
                          <div className="font-extrabold text-purple-900 text-[11px] uppercase tracking-wide">Linked Bank Account for Payout:</div>
                          <div>Bank: <strong className="text-purple-900">{item.bankAccount.bankName}</strong> | Account No: <strong className="text-purple-700 text-sm font-black">{item.bankAccount.accountNumber}</strong> ({item.bankAccount.accountName})</div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-red-600 font-bold bg-red-50 p-2 rounded-xl border border-red-100">
                          ⚠ Warning: No linked bank account details attached to request
                        </div>
                      )}

                      <div className="text-[11px] text-gray-400">
                        Requested On: {new Date(item.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {['pending', 'processing'].includes((item.status || '').toLowerCase()) && (
                        <>
                          <button
                            onClick={() => handleWithdrawalAction(item, 'completed')}
                            disabled={Boolean(processingActionIds[item.id])}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {processingActionIds[item.id] ? 'Processing...' : 'Approve Payout'}
                          </button>
                          <button
                            onClick={() => handleWithdrawalAction(item, 'failed')}
                            disabled={Boolean(processingActionIds[item.id])}
                            className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            {processingActionIds[item.id] ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Registered User Directory ({filteredUsers.length}) — Click any user to inspect their last 30 actions
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search phone or name..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((u, index) => (
                <div
                  key={u.id || u.phone || index}
                  className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs hover:border-purple-300 transition-all"
                >
                  <div className="space-y-1 cursor-pointer flex-1" onClick={() => handleOpenUserActions(u)}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-gray-900 hover:text-purple-600 transition-colors">
                        {u.name || 'User'}
                      </span>
                      <span className="text-xs font-bold text-purple-700 font-mono bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {u.phone}
                      </span>
                      {u.role === 'admin' && (
                        <span className="text-[10px] font-black uppercase bg-purple-600 text-white px-2 py-0.5 rounded-full">
                          ADMIN
                        </span>
                      )}
                      {(u.frozen || u.isFrozen) && (
                        <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-full">
                          FROZEN
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-3 flex-wrap">
                      <span>Code: <strong className="text-purple-600 font-mono">{u.invitationCode}</strong></span>
                      <span>•</span>
                      <span>Investments: <strong className="text-gray-900">{u.investmentsCount || 0}</strong></span>
                      <span>•</span>
                      <span>Registered: {new Date(u.registeredAt || Date.now()).toLocaleDateString()}</span>
                    </div>

                    {u.bankAccount ? (
                      <div className="text-[11px] text-gray-600 font-mono">
                        Bank: {u.bankAccount.bankName} | {u.bankAccount.accountNumber} ({u.bankAccount.accountName})
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 italic">No bank account linked</div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-600">₦{(u.balance || 0).toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        onClick={() => handleOpenUserActions(u)}
                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="View Last 30 Actions"
                      >
                        <Eye className="w-3.5 h-3.5 text-purple-600" />
                        <span>Actions (30)</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUserPhone(u.phone);
                          setActiveTab('credit');
                        }}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors"
                      >
                        Adjust
                      </button>

                      <button
                        onClick={() => {
                          setActivateProductModalUser(u.phone);
                          setSelectedPackageForActivation(LEGACY_PACKAGES[0].id);
                        }}
                        className="px-2.5 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs rounded-xl border border-pink-200 transition-colors flex items-center gap-1"
                        title="Activate Product for User"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                        <span>Grant Product</span>
                      </button>

                      {(() => {
                        const isUserFrozen = Boolean(u.isFrozen || u.frozen);
                        return (
                          <button
                            onClick={() => {
                              if (!isUserFrozen && (u.phone === 'admin' || u.role === 'admin')) {
                                setError('Admin accounts cannot be frozen.');
                                return;
                              }
                              handleFreezeUser(u.phone, isUserFrozen);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              isUserFrozen
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-xs'
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                            }`}
                            title={isUserFrozen ? 'Click to Unfreeze Account' : 'Click to Freeze Account'}
                          >
                            {isUserFrozen ? (
                              <>
                                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Unfreeze</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5 text-red-600" />
                                <span>Freeze</span>
                              </>
                            )}
                          </button>
                        );
                      })()}

                      <button
                        onClick={() => {
                          setResetPassPhone(u.phone);
                          setNewPasswordInput('');
                        }}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BALANCE ADJUSTMENT */}
        {activeTab === 'credit' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-xs max-w-2xl mx-auto">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Direct User Balance Adjustment
            </h2>

            <form onSubmit={handleBalanceAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Select User Phone Number</label>
                <select
                  value={selectedUserPhone}
                  onChange={(e) => setSelectedUserPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">-- Choose User from Database --</option>
                  {users.map((u, index) => (
                    <option key={u.id || u.phone || index} value={u.phone}>
                      {u.phone} ({u.name || 'User'}) — Current: ₦{(u.balance || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Adjustment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['add', 'subtract', 'set'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setAdjustMode(mode)}
                        className={`py-2.5 rounded-xl font-bold text-xs capitalize border transition-all ${
                          adjustMode === mode
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Amount (₦)</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    min={0}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Adjustment Reason / Note</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Manual Deposit Bonus / Promo Credit"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  {adjusting ? 'Processing Adjustment...' : 'Apply Balance Adjustment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 6: GIFT CODES */}
        {activeTab === 'giftcodes' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-xs">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-purple-600" /> Generate New Gift Code
              </h3>

              <form onSubmit={handleGenerateCode} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Custom Code (Optional)</label>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="e.g. WELCOME100"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    value={giftCodeAmount}
                    onChange={(e) => setGiftCodeAmount(Number(e.target.value))}
                    min={50}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Max Claims</label>
                  <input
                    type="number"
                    value={giftCodeMaxClaims}
                    onChange={(e) => setGiftCodeMaxClaims(Number(e.target.value))}
                    min={1}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={generatingCode}
                  className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer h-10"
                >
                  {generatingCode ? 'Generating...' : 'Create Code'}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Active Gift Codes ({giftCodes.length})</h3>
              {giftCodes.map((gc) => (
                <div key={gc.id || gc.code} className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-purple-700 font-mono bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                        {gc.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">₦{(gc.amount || 0).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Claims: <strong className="text-gray-900">{gc.timesClaimed || 0} / {gc.maxClaims || 0}</strong> users
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(gc.code);
                        setCopiedCodeId(gc.id);
                        setTimeout(() => setCopiedCodeId(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                    >
                      {copiedCodeId === gc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCodeId === gc.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleGiftCodeAction(gc.id, 'delete')}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 transition-colors"
                      title="Delete Gift Code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: GATEWAY SETTINGS */}
        {activeTab === 'gateway' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-6 shadow-xs max-w-2xl mx-auto">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" /> System Gateway & Limits Configuration
            </h2>

            <form onSubmit={handleUpdateConfig} className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div>
                  <div className="text-xs font-bold text-gray-900">Automated Payment Gateway</div>
                  <div className="text-[11px] text-gray-500">Enable automatic bank transfer verification & webhook sync</div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, gatewayEnabled: !config.gatewayEnabled })}
                  className="text-purple-600 transition-colors cursor-pointer"
                >
                  {config.gatewayEnabled ? <ToggleRight className="w-8 h-8 text-emerald-600" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Minimum Deposit (₦)</label>
                  <input
                    type="number"
                    value={config.minDeposit}
                    onChange={(e) => setConfig({ ...config, minDeposit: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Minimum Withdrawal (₦)</label>
                  <input
                    type="number"
                    value={config.minWithdrawal}
                    onChange={(e) => setConfig({ ...config, minWithdrawal: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Sign-up Bonus (₦)</label>
                  <input
                    type="number"
                    value={config.signUpBonus}
                    onChange={(e) => setConfig({ ...config, signUpBonus: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Daily Check-in Bonus (₦)</label>
                  <input
                    type="number"
                    value={config.dailySignInBonus}
                    onChange={(e) => setConfig({ ...config, dailySignInBonus: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingConfig}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  {updatingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 8: IP FIREWALL */}
        {activeTab === 'ipbans' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    IP Banning & Auto-Defense Security Firewall
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage blocked IP addresses, rate-limiting rules, and testing immunity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUnbanAllIps}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unban All IPs & Clear Limits</span>
                </button>
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 font-medium">
                🛡️ <strong>Admin Testing Immunity Active:</strong> Admin account and active admin sessions are permanently excluded from IP bans and rate-limit locks.
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={manualIpInput}
                  onChange={(e) => setManualIpInput(e.target.value)}
                  placeholder="e.g. 192.168.1.55"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!manualIpInput) return;
                    await handleBanIp(manualIpInput.trim(), true);
                    setManualIpInput('');
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Ban IP
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Currently Banned IPs ({bannedIps.length})</h3>
                {bannedIps.length > 0 && (
                  <button
                    onClick={handleUnbanAllIps}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                  >
                    Unban All
                  </button>
                )}
              </div>

              {bannedIps.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 text-gray-400 text-xs font-medium">
                  No IP addresses are currently banned. Auto-defense firewall active.
                </div>
              ) : (
                bannedIps.map((ip) => (
                  <div key={ip} className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-sm font-mono font-bold text-gray-900">{ip}</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md border border-red-200">
                        BLOCKED
                      </span>
                    </div>

                    <button
                      onClick={() => handleBanIp(ip, false)}
                      className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Unban IP
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 9: AUDIT LOGS */}
        {activeTab === 'auditlogs' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-200 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" /> Security Audit & Threat Logs
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Real-time telemetry of failed logins, multi-registration spam, and gift code abuse.</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={fetchAuditLogs}
                    disabled={auditLoading}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin text-purple-600' : ''}`} />
                    <span>Sync</span>
                  </button>

                  <button
                    onClick={handleClearAuditLogs}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Logs</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search logs by phone or message..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <select
                  value={auditEventType}
                  onChange={(e) => setAuditEventType(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Event Types</option>
                  <option value="failed_login">Failed Logins</option>
                  <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
                  <option value="gift_code_abuse">Gift Code Abuse</option>
                  <option value="ip_auto_ban">IP Auto Bans</option>
                </select>

                <select
                  value={auditSeverity}
                  onChange={(e) => setAuditSeverity(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="all">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error / Threat</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {auditLoading ? (
                <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-200">
                  Loading audit logs feed...
                </div>
              ) : auditLogs.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-500 border border-gray-200">
                  No security audit logs found matching current filters.
                </div>
              ) : (
                auditLogs.map((log: any, idx: number) => (
                  <div key={log.id || idx} className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          log.severity === 'error' ? 'bg-red-100 text-red-700' :
                          log.severity === 'warn' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {log.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-gray-900">{log.eventType}</span>
                        {log.phone && <span className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded">Phone: {log.phone}</span>}
                      </div>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {new Date(log.timestamp || Date.now()).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100 font-mono">
                      {log.message || log.details}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around shadow-lg">
        {[
          { id: 'stats', label: 'Stats', icon: BarChart3 },
          { id: 'deposits', label: 'Deposits', icon: ArrowDownLeft },
          { id: 'withdrawals', label: 'Payouts', icon: ArrowUpRight },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'auditlogs', label: 'Audit', icon: Shield },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-purple-600 font-black' : 'text-gray-500 font-medium hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* USER ACTIONS MODAL (LAST 30 ACTIONS) */}
      {selectedUserForActions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[130] flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  User Activity Feed: {selectedUserForActions.name || 'User'}
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  Phone: {selectedUserForActions.phone} | Balance: ₦{(selectedUserForActions.balance || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForActions(null)}
                className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Last 30 Recorded Actions & Events
              </div>
              {loadingUserActions ? (
                <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
                  Loading user actions history...
                </div>
              ) : userActionsList.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-8 text-center text-xs text-gray-500 border border-gray-100">
                  No recorded actions found for this user.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                  {userActionsList.map((action, idx) => (
                    <div
                      key={action.id || idx}
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-3.5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase ${
                            action.type === 'transaction' ? 'bg-purple-100 text-purple-700' :
                            action.type === 'investment' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {action.actionType}
                          </span>
                          <span className="font-bold text-gray-900">{action.title}</span>
                        </div>
                        <p className="text-gray-600 text-xs">{action.description}</p>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(action.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {action.amount !== undefined && action.amount !== 0 && (
                          <div className="font-black text-gray-900">₦{Number(action.amount).toLocaleString()}</div>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          action.status === 'completed' || action.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          action.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {action.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUserForActions(null)}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Close Feed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREENSHOT PROOF LIGHTBOX */}
      {previewImage && (
        <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden border border-gray-200 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-600" /> Payment Slip Proof
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
              <img src={previewImage} alt="Payment Slip Proof" className="max-h-[70vh] object-contain w-full" />
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {resetPassPhone && (
        <div className="fixed inset-0 z-[140] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-blue-600" /> Reset User Password
              </h3>
              <button onClick={() => setResetPassPhone(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Resetting login password for phone: <strong className="text-purple-700 font-mono">{resetPassPhone}</strong>
            </p>

            <form onSubmit={handleExecutePasswordReset} className="space-y-3">
              <input
                type="text"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setResetPassPhone(null)}
                  className="w-1/2 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingPass || !newPasswordInput}
                  className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {resettingPass ? 'Saving...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ACTIVATION MODAL */}
      {activateProductModalUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[140] flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                Grant Product for {activateProductModalUser}
              </h3>
              <button
                onClick={() => setActivateProductModalUser(null)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Select an investment package to assign directly to this user. The product will be activated immediately without payment.
            </p>
            <form onSubmit={handleActivateProductForUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Select Investment Package</label>
                <select
                  value={selectedPackageForActivation}
                  onChange={(e) => setSelectedPackageForActivation(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                >
                  {LEGACY_PACKAGES.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ₦{pkg.price.toLocaleString()} (Daily: ₦{pkg.dailyIncome.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActivateProductModalUser(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activatingProduct}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {activatingProduct ? 'Activating...' : 'Confirm Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
