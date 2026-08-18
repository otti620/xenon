import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, UserInvestment, BankAccount, Transaction, TeamMember } from '../types';
import { LEGACY_PACKAGES, SYSTEM_INFO } from '../data/packages';
import confetti from 'canvas-confetti';
import {
  apiLogin,
  apiGetMe,
  apiSaveBank,
  apiClaimDailySignIn,
  apiRedeemGiftCode,
  apiGetSystemConfig,
  apiDeposit,
  apiWithdraw,
  apiInvest,
  apiCollectInvestmentIncome,
  apiCollectAllInvestmentsIncome,
  apiGetTeam,
  apiRegister,
  removeAuthToken,
} from '../services/api';

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  activeTab: 'home' | 'products' | 'team' | 'account' | 'admin';
  setActiveTab: (tab: 'home' | 'products' | 'team' | 'account' | 'admin') => void;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  investments: UserInvestment[];
  transactions: Transaction[];
  bankAccount: BankAccount | null;
  setBankAccount: (account: BankAccount) => void;
  teamMembers: TeamMember[];

  // Notification system
  notification: { title: string; message: string; type: 'deposit' | 'withdrawal' | 'info' } | null;
  clearNotification: () => void;

  // Modals state
  welcomeModalOpen: boolean;
  setWelcomeModalOpen: (open: boolean) => void;
  depositModalOpen: boolean;
  setDepositModalOpen: (open: boolean) => void;
  withdrawModalOpen: boolean;
  setWithdrawModalOpen: (open: boolean) => void;
  dailySignInModalOpen: boolean;
  setDailySignInModalOpen: (open: boolean) => void;
  giftCodeModalOpen: boolean;
  setGiftCodeModalOpen: (open: boolean) => void;
  bankAccountModalOpen: boolean;
  setBankAccountModalOpen: (open: boolean) => void;
  historyModalOpen: boolean;
  setHistoryModalOpen: (open: boolean) => void;
  historyType: 'all' | 'deposit' | 'withdraw';
  setHistoryType: (type: 'all' | 'deposit' | 'withdraw') => void;
  inviteModalOpen: boolean;
  setInviteModalOpen: (open: boolean) => void;
  myInvestmentsModalOpen: boolean;
  setMyInvestmentsModalOpen: (open: boolean) => void;
  selectedPackageForInvest: typeof LEGACY_PACKAGES[0] | null;
  setSelectedPackageForInvest: (pkg: typeof LEGACY_PACKAGES[0] | null) => void;

  // System Config
  gatewayEnabled: boolean;
  setGatewayEnabled: (enabled: boolean) => void;

  // Actions
  login: (phone: string, password: string) => Promise<boolean>;
  signup: (phone: string, email: string, password: string, invitationCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  claimDailySignIn: () => Promise<boolean>;
  redeemGiftCode: (code: string) => Promise<{ success: boolean; message: string; reward?: number }>;
  isDailyClaimedToday: boolean;
  investInPackage: (pkg: typeof LEGACY_PACKAGES[0]) => Promise<boolean>;
  collectInvestmentIncome: (investmentId: string) => Promise<{ success: boolean; message?: string; reward?: number }>;
  collectAllInvestmentsIncome: () => Promise<{ success: boolean; message?: string; totalReward?: number }>;
  addDeposit: (amount: number, reference: string, senderName?: string, senderBank?: string, proofImage?: string) => Promise<void>;
  requestWithdrawal: (amount: number) => Promise<{ success: boolean; message: string }>;
  triggerConfetti: () => void;
  refreshTeamData: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'team' | 'account' | 'admin'>('home');
  const [balance, setBalance] = useState<number>(0);
  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccount, setBankAccountState] = useState<BankAccount | null>(null);
  const [isDailyClaimedToday, setIsDailyClaimedToday] = useState<boolean>(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [notification, setNotification] = useState<{ title: string; message: string; type: 'deposit' | 'withdrawal' | 'info' } | null>(null);

  const prevTransactionsRef = useRef<Transaction[]>([]);

  const clearNotification = () => setNotification(null);

  // Modal controls
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [dailySignInModalOpen, setDailySignInModalOpen] = useState(false);
  const [giftCodeModalOpen, setGiftCodeModalOpen] = useState(false);
  const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyType, setHistoryType] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [myInvestmentsModalOpen, setMyInvestmentsModalOpen] = useState(false);
  const [selectedPackageForInvest, setSelectedPackageForInvest] = useState<typeof LEGACY_PACKAGES[0] | null>(null);

  // System config
  const [gatewayEnabled, setGatewayEnabled] = useState(false);

  const fetchSystemConfig = async () => {
    try {
      const res = await apiGetSystemConfig();
      if (res.config) {
        setGatewayEnabled(Boolean(res.config.gatewayEnabled));
      }
    } catch (e) {
      /* ignore */
    }
  };

  const refreshTeamData = async () => {
    try {
      const data = await apiGetTeam();
      if (data.teamMembers) {
        setTeamMembers(data.teamMembers);
      }
    } catch (e) {
      // Silent catch
    }
  };

  const refreshUserData = async () => {
    try {
      const data = await apiGetMe();
      if (data && data.user) setUser(data.user);
      if (data && typeof data.balance === 'number') setBalance(data.balance);
      if (data && data.bankAccount) setBankAccountState(data.bankAccount);
      if (data && data.investments) setInvestments(data.investments);
      if (data && data.transactions) {
        const newTxs: Transaction[] = data.transactions;
        if (prevTransactionsRef.current.length > 0) {
          newTxs.forEach((newTx) => {
            const oldTx = prevTransactionsRef.current.find((t) => t.id === newTx.id);
            if (oldTx && oldTx.status === 'pending' && newTx.status === 'completed') {
              if (newTx.type === 'deposit') {
                setNotification({
                  title: 'Deposit Approved! 🎉',
                  message: `Your deposit of ₦${newTx.amount.toLocaleString()} has been approved by admin and credited to your account balance.`,
                  type: 'deposit',
                });
                triggerConfetti();
              } else if (newTx.type === 'withdrawal') {
                setNotification({
                  title: 'Withdrawal Approved! 💸',
                  message: `Your withdrawal request of ₦${newTx.amount.toLocaleString()} has been approved and processed to your bank account.`,
                  type: 'withdrawal',
                });
                triggerConfetti();
              }
            }
          });
        }
        prevTransactionsRef.current = newTxs;
        setTransactions(newTxs);
      }
      if (data && typeof data.isDailyClaimedToday === 'boolean') setIsDailyClaimedToday(data.isDailyClaimedToday);
      await refreshTeamData();
    } catch (err) {
      // Silent catch
    }
  };

  const hasPoppedWelcomeRef = useRef(false);

  useEffect(() => {
    fetchSystemConfig();
    refreshUserData().then(() => {
      if (user && !hasPoppedWelcomeRef.current) {
        hasPoppedWelcomeRef.current = true;
        setWelcomeModalOpen(true);
      }
    });

    const interval = setInterval(() => {
      refreshUserData();
      fetchSystemConfig();
    }, 8000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const redeemGiftCode = async (code: string): Promise<{ success: boolean; message: string; reward?: number }> => {
    try {
      const res = await apiRedeemGiftCode(code);
      if (typeof res.balance === 'number') setBalance(res.balance);
      if (res.transactions) setTransactions(res.transactions);
      triggerConfetti();
      return { success: true, message: res.message || 'Gift code redeemed successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to redeem gift code' };
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ea2cb6', '#7b24f2', '#f02aa6', '#ffd700'],
      });
    } catch (e) {
      /* fallback */
    }
  };

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      await apiLogin(phone, password);
      await refreshUserData();
      setWelcomeModalOpen(true);
      triggerConfetti();
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const signup = async (phone: string, emailInput: string, password: string, invitationCode?: string): Promise<boolean> => {
    try {
      const email = emailInput && emailInput.includes('@') ? emailInput : `${phone}@xenova-auth.com`;
      await apiRegister(phone, email, password, invitationCode);
      await apiLogin(phone, password);
      await refreshUserData();
      setWelcomeModalOpen(true);
      triggerConfetti();
      return true;
    } catch (err: any) {
      throw err;
    }
  };

  const logout = async () => {
    removeAuthToken();
    setUser(null);
    setBalance(0);
    setInvestments([]);
    setTransactions([]);
    setBankAccountState(null);
    setTeamMembers([]);
    setIsDailyClaimedToday(false);
    setActiveTab('home');
  };

  const setBankAccount = async (account: BankAccount) => {
    setBankAccountState(account);
    try {
      await apiSaveBank(account);
    } catch (e) {
      /* fallback */
    }
  };

  const claimDailySignIn = async (): Promise<boolean> => {
    if (isDailyClaimedToday) return false;
    try {
      const res = await apiClaimDailySignIn();
      if (typeof res.balance === 'number') setBalance(res.balance);
      setIsDailyClaimedToday(true);
      if (res.transactions) setTransactions(res.transactions);
      await refreshUserData();
      triggerConfetti();
      return true;
    } catch (e: any) {
      await refreshUserData();
      return false;
    }
  };

  const investInPackage = async (pkg: typeof LEGACY_PACKAGES[0]): Promise<boolean> => {
    if (balance < pkg.price) {
      setDepositModalOpen(true);
      return false;
    }
    try {
      const res = await apiInvest(pkg);
      if (typeof res.balance === 'number') setBalance(res.balance);
      if (res.investments) setInvestments(res.investments);
      if (res.transactions) setTransactions(res.transactions);
      await refreshTeamData();
      await refreshUserData();
      triggerConfetti();
      return true;
    } catch (e: any) {
      await refreshUserData();
      throw e;
    }
  };

  const collectInvestmentIncome = async (investmentId: string): Promise<{ success: boolean; message?: string; reward?: number }> => {
    try {
      const res = await apiCollectInvestmentIncome(investmentId);
      if (typeof res.balance === 'number') setBalance(res.balance);
      if (res.investments) setInvestments(res.investments);
      await refreshUserData();
      triggerConfetti();
      return { success: true, message: res.message, reward: res.reward };
    } catch (err: any) {
      await refreshUserData();
      return { success: false, message: err.message || 'Failed to collect daily product income' };
    }
  };

  const collectAllInvestmentsIncome = async (): Promise<{ success: boolean; message?: string; totalReward?: number }> => {
    try {
      const res = await apiCollectAllInvestmentsIncome();
      if (typeof res.balance === 'number') setBalance(res.balance);
      if (res.investments) setInvestments(res.investments);
      await refreshUserData();
      triggerConfetti();
      return { success: true, message: res.message, totalReward: res.totalReward };
    } catch (err: any) {
      await refreshUserData();
      return { success: false, message: err.message || 'Failed to collect all products income' };
    }
  };

  const addDeposit = async (amount: number, reference: string, senderName?: string, senderBank?: string, proofImage?: string) => {
    try {
      const res = await apiDeposit(amount, reference, senderName, senderBank, proofImage);
      if (typeof res.balance === 'number') setBalance(res.balance);
      if (res.transactions) setTransactions(res.transactions);
      await refreshUserData();
      triggerConfetti();
    } catch (e) {
      await refreshUserData();
      throw e;
    }
  };

  const requestWithdrawal = async (amount: number): Promise<{ success: boolean; message: string }> => {
    if (amount < SYSTEM_INFO.minWithdrawal) {
      return { success: false, message: `Minimum withdrawal is ₦${SYSTEM_INFO.minWithdrawal.toLocaleString()}` };
    }
    if (amount > balance) {
      return { success: false, message: 'Insufficient available balance' };
    }
    if (!bankAccount || !bankAccount.accountNumber) {
      setBankAccountModalOpen(true);
      return { success: false, message: 'Please link your bank account first' };
    }

    const hasPackage = investments && investments.length > 0;
    if (!hasPackage) {
      return { 
        success: false, 
        message: 'Withdrawal restricted: You must hold a product investment package to request a withdrawal.' 
      };
    }

    try {
      const res = await apiWithdraw(amount, bankAccount);
      if (typeof res.balance === 'number') setBalance(res.balance);
      if (res.transactions) setTransactions(res.transactions);
      await refreshUserData();
      return { success: true, message: res.message };
    } catch (err: any) {
      await refreshUserData();
      return { success: false, message: err.message || 'Failed to submit withdrawal request' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeTab,
        setActiveTab,
        balance,
        setBalance,
        investments,
        transactions,
        bankAccount,
        setBankAccount,
        teamMembers,
        notification,
        clearNotification,
        welcomeModalOpen,
        setWelcomeModalOpen,
        depositModalOpen,
        setDepositModalOpen,
        withdrawModalOpen,
        setWithdrawModalOpen,
        dailySignInModalOpen,
        setDailySignInModalOpen,
        giftCodeModalOpen,
        setGiftCodeModalOpen,
        bankAccountModalOpen,
        setBankAccountModalOpen,
        historyModalOpen,
        setHistoryModalOpen,
        historyType,
        setHistoryType,
        inviteModalOpen,
        setInviteModalOpen,
        myInvestmentsModalOpen,
        setMyInvestmentsModalOpen,
        selectedPackageForInvest,
        setSelectedPackageForInvest,
        gatewayEnabled,
        setGatewayEnabled,
        login,
        signup,
        logout,
        claimDailySignIn,
        redeemGiftCode,
        isDailyClaimedToday,
        investInPackage,
        collectInvestmentIncome,
        collectAllInvestmentsIncome,
        addDeposit,
        requestWithdrawal,
        triggerConfetti,
        refreshTeamData,
        refreshUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
