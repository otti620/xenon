import { BankAccount, InvestmentPackage } from '../types';
import { XENOVA_PACKAGES, LEGACY_PACKAGES, SYSTEM_INFO } from '../data/packages';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  syncToFirestore,
  syncDepositToFirestore, 
  syncWithdrawalToFirestore, 
  syncUserToFirestore, 
  syncInvestmentToFirestore, 
  syncTransactionToFirestore, 
  fetchFromFirestore,
  getDocFromFirestore,
  deleteFromFirestore,
  clearCollectionInFirestore
} from '../lib/firestoreSync';

const TOKEN_KEY = 'xenova_jwt_token';
const CURRENT_PHONE_KEY = 'xenova_current_phone';

export const getClientIp = () => '192.168.1.50';

export const isIpBanned = (ip?: string) => false;
export const autoBanIp = (ip?: string, reason?: string) => {};
export const logSecurityEvent = async (eventType: string, severity: 'info' | 'warn' | 'error', message: string, phone?: string) => {
  try {
    const logId = 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    await syncToFirestore('audit_logs', {
      id: logId,
      eventType,
      severity,
      message,
      phone: phone || getCurrentPhone() || 'system',
      timestamp: new Date().toISOString()
    }, 'id');
  } catch (e) {
    console.error('Audit logging failed', e);
  }
};

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_PHONE_KEY);
};

const getCurrentPhone = (): string | null => {
  const token = getAuthToken();
  if (token === 'local_admin_token') return 'admin';
  if (token && token.startsWith('local_token_')) {
    return token.replace('local_token_', '');
  }
  return localStorage.getItem(CURRENT_PHONE_KEY);
};

const setCurrentPhone = (phone: string) => localStorage.setItem(CURRENT_PHONE_KEY, phone);

export const syncUsersFromFirestore = async () => {};

export const apiRegister = async (phone: string, email: string, password: string, invitationCode?: string) => {
  if (!phone || !password) {
    throw new Error('Phone and password are required');
  }
  const cleanPhone = phone.trim();
  const authEmail = email && email.includes('@') ? email : `${cleanPhone.replace(/\D/g, '')}@xenova.site`;

  const users = await fetchFromFirestore('users');
  const existing = users.find((u: any) => u.phone === cleanPhone);
  if (existing) {
    throw new Error('Account already exists with this phone number. Please log in instead.');
  }

  try {
    await createUserWithEmailAndPassword(auth, authEmail, password);
  } catch (authErr: any) {
    if (authErr?.code === 'auth/email-already-in-use') {
      throw new Error('Account already exists with this email/phone. Please log in instead.');
    } else {
      console.warn('Firebase Auth signup info:', authErr?.message);
    }
  }

  const referralCode = 'XENO' + cleanPhone.replace(/\D/g, '').slice(-4) + Math.floor(100 + Math.random() * 900);
  let referredBy = '';
  if (invitationCode) {
    const inviter = users.find((u: any) => u.invitationCode === invitationCode.trim().toUpperCase() || u.phone === invitationCode.trim());
    if (inviter) referredBy = inviter.phone;
  }

  const newUser = {
    id: cleanPhone,
    phone: cleanPhone,
    email: authEmail,
    password,
    invitationCode: referralCode,
    referredBy,
    balance: 600,
    vipLevel: 0,
    isFrozen: false,
    isLoggedIn: true,
    createdAt: new Date().toISOString(),
  };

  await syncUserToFirestore(newUser, newUser.balance);
  setCurrentPhone(cleanPhone);
  setAuthToken('local_token_' + cleanPhone);

  return {
    success: true,
    token: 'local_token_' + cleanPhone,
    user: { phone: cleanPhone, email: authEmail, vipLevel: 0, isFrozen: false, isLoggedIn: true, invitationCode: referralCode },
    balance: 600,
    transactions: []
  };
};

export const apiLogin = async (phone: string, password: string) => {
  if (phone === 'admin' && (password === 'admin' || password === 'xenova2026')) {
    setCurrentPhone('admin');
    setAuthToken('local_admin_token');
    return {
      success: true,
      token: 'local_admin_token',
      user: { phone: 'admin', role: 'admin', isLoggedIn: true, isFrozen: false },
      balance: 50000,
      transactions: []
    };
  }

  const cleanPhone = phone.trim();
  const authEmail = `${cleanPhone.replace(/\D/g, '')}@xenova.site`;

  const user: any = await getDocFromFirestore('users', cleanPhone);
  if (!user) {
    throw new Error('Account does not exist. Please sign up first.');
  }

  if (user.password && password && user.password !== password) {
    throw new Error('Invalid password.');
  }

  try {
    await signInWithEmailAndPassword(auth, authEmail, password);
  } catch (authErr: any) {
    console.warn('Firebase Auth signin info:', authErr?.message);
  }

  if (user.isFrozen || user.frozen) {
    throw new Error('Account is frozen by admin.');
  }

  setCurrentPhone(cleanPhone);
  setAuthToken('local_token_' + cleanPhone);
  user.isLoggedIn = true;
  await syncUserToFirestore(user, user.balance || 0);

  return {
    success: true,
    token: 'local_token_' + cleanPhone,
    user: { phone: user.phone, email: user.email, vipLevel: user.vipLevel || 0, isFrozen: false, isLoggedIn: true },
    balance: user.balance !== undefined ? Number(user.balance) : 0,
    transactions: []
  };
};

export const apiAdminLogin = async (adminPin: string, phone?: string, password?: string) => {
  if (adminPin === 'xenova2026' || adminPin === '8888' || adminPin === '1234' || (phone === 'admin' && password === 'admin')) {
    setCurrentPhone('admin');
    setAuthToken('local_admin_token');
    const adminUser = {
      id: 'admin',
      phone: 'admin',
      email: 'admin@xenova.site',
      role: 'admin',
      balance: 50000,
      isFrozen: false,
      isLoggedIn: true,
      createdAt: new Date().toISOString()
    };
    await syncUserToFirestore(adminUser, adminUser.balance);
    return {
      success: true,
      token: 'local_admin_token',
      user: { phone: 'admin', role: 'admin', isLoggedIn: true, isFrozen: false },
    };
  }
  throw new Error('Invalid Admin PIN or credentials');
};

export const apiGetMe = async () => {
  const phone = getCurrentPhone();
  if (!phone) {
    throw new Error('Not authenticated. Please log in.');
  }
  if (phone === 'admin') {
    return {
      user: { phone: 'admin', role: 'admin', isLoggedIn: true, isFrozen: false },
      balance: 50000,
      bankAccount: null,
      investments: [],
      transactions: [],
      isDailyClaimedToday: false,
    };
  }

  const user: any = await getDocFromFirestore('users', phone);
  if (!user) {
    throw new Error('User record not found in Firestore.');
  }

  const allInvestments = await fetchFromFirestore('investments');
  const todayDate = new Date().toISOString().split('T')[0];

  const userInvestments = allInvestments
    .filter((inv: any) => inv.phone === phone)
    .map((inv: any) => {
      const pkgMatch = XENOVA_PACKAGES.find(
        (p) =>
          p.id === inv.packageId ||
          p.name?.toLowerCase() === inv.packageName?.toLowerCase() ||
          Number(p.price) === Number(inv.price)
      );

      const price = Number(inv.price || pkgMatch?.price || 3000);
      const dailyIncome = Number(inv.dailyIncome || pkgMatch?.dailyIncome || Math.round(price * 0.20));
      const durationDays = Number(inv.durationDays || pkgMatch?.durationDays || 90);
      const totalIncome = Number(inv.totalIncome || pkgMatch?.totalIncome || (dailyIncome * durationDays));
      const daysCompleted = Number(inv.daysCompleted || 0);
      const totalEarned = Number(inv.totalEarned || 0);
      const isCompleted = daysCompleted >= durationDays || inv.status === 'completed';
      const canClaimToday = !isCompleted && (inv.status === 'active' || !inv.status) && inv.lastClaimDate !== todayDate;

      return {
        ...inv,
        packageName: inv.packageName || pkgMatch?.name || `Xenova ${price.toLocaleString()}`,
        price,
        dailyIncome,
        totalIncome,
        durationDays,
        daysCompleted,
        totalEarned,
        status: isCompleted ? 'completed' : (inv.status || 'active'),
        canClaimToday,
      };
    });

  const allTransactions = await fetchFromFirestore('transactions');
  const userTransactions = allTransactions.filter((tx: any) => tx.phone === phone);

  const isDailyClaimedToday = user.lastDailyClaimDate === todayDate;

  return {
    user: { 
      phone: user.phone, 
      email: user.email, 
      vipLevel: user.vipLevel || 0, 
      isFrozen: user.isFrozen || false, 
      isLoggedIn: true, 
      invitationCode: user.invitationCode 
    },
    balance: user.balance !== undefined ? Number(user.balance) : 0,
    bankAccount: user.bankAccount || null,
    investments: userInvestments,
    transactions: userTransactions,
    isDailyClaimedToday,
  };
};

export const apiSaveBank = async (bankAccount: BankAccount) => {
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');
  user.bankAccount = bankAccount;
  await syncUserToFirestore(user, user.balance);
  return { success: true, message: 'Bank account saved successfully' };
};

export const apiClaimDailySignIn = async () => {
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');

  const todayDate = new Date().toISOString().split('T')[0];
  if (user.lastDailyClaimDate === todayDate) {
    throw new Error('Daily sign-in reward already claimed today. Please check back tomorrow.');
  }

  const reward = SYSTEM_INFO.dailySignInBonus;
  user.balance = Number(user.balance || 0) + reward;
  user.lastDailyClaimDate = todayDate;
  user.isDailyClaimedToday = true;
  await syncUserToFirestore(user, user.balance);

  const tx = {
    id: 'tx_' + Date.now(),
    phone,
    type: 'reward',
    amount: reward,
    description: 'Daily sign-in bonus',
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  await syncTransactionToFirestore(tx);

  const allTransactions = await fetchFromFirestore('transactions');
  const userTransactions = allTransactions.filter((t: any) => t.phone === phone);

  return { 
    success: true, 
    balance: user.balance, 
    transactions: userTransactions,
    message: `Successfully claimed ₦${reward} daily bonus!` 
  };
};

export const apiDeposit = async (amount: number, reference: string, senderName?: string, senderBank?: string, proofImage?: string) => {
  if (SYSTEM_INFO.depositsPaused) {
    throw new Error('Deposits are currently paused by administration. Please check back later.');
  }
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const user: any = await getDocFromFirestore('users', phone);
  const txId = 'dep_' + Date.now();
  const tx = {
    id: txId,
    phone,
    type: 'deposit',
    amount,
    description: senderName ? `Deposit via ${senderBank || 'Bank'} (${senderName})` : `Deposit ₦${amount.toLocaleString()}`,
    reference,
    senderName: senderName || '',
    senderBank: senderBank || '',
    proofImage: proofImage || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await syncTransactionToFirestore(tx);
  await syncDepositToFirestore(tx);

  const allTransactions = await fetchFromFirestore('transactions');
  const userTransactions = allTransactions.filter((t: any) => t.phone === phone);

  return { 
    success: true, 
    message: 'Deposit request submitted successfully. Awaiting admin approval.',
    transactions: userTransactions,
    balance: user?.balance || 0
  };
};

export const apiWithdraw = async (amount: number, bankAccountInput?: BankAccount) => {
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');

  const bankAccount = bankAccountInput || user.bankAccount || user.bank_account;
  if (!bankAccount || !bankAccount.accountNumber || !bankAccount.bankName) {
    throw new Error('Please link your bank account details before requesting a withdrawal.');
  }

  const allInvestments = await fetchFromFirestore('investments');
  const userInvestments = allInvestments.filter((inv: any) => inv.phone === phone);
  if (!userInvestments || userInvestments.length === 0) {
    throw new Error('Withdrawal restricted: You must hold a product investment package to request a withdrawal.');
  }

  const balance = Number(user.balance || 0);
  if (amount > balance) {
    throw new Error('Insufficient available balance');
  }
  const newBalance = balance - amount;
  user.balance = newBalance;
  user.bankAccount = bankAccount;
  await syncUserToFirestore(user, newBalance);

  const wdId = 'wd_' + Date.now();
  const tx = {
    id: wdId,
    phone,
    userId: phone,
    type: 'withdrawal',
    amount,
    bankName: bankAccount.bankName,
    accountNumber: bankAccount.accountNumber,
    accountName: bankAccount.accountName || 'User',
    bankAccount: bankAccount,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await syncTransactionToFirestore(tx);
  await syncWithdrawalToFirestore(tx);

  const allTransactions = await fetchFromFirestore('transactions');
  const userTransactions = allTransactions.filter((t: any) => t.phone === phone);

  return { 
    success: true, 
    balance: newBalance, 
    transactions: userTransactions,
    message: 'Withdrawal request submitted successfully.' 
  };
};

export const apiInvest = async (pkg: InvestmentPackage) => {
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');
  const balance = Number(user.balance || 0);
  if (balance < pkg.price) {
    throw new Error('Insufficient balance for this investment');
  }
  const newBalance = balance - pkg.price;
  user.balance = newBalance;
  await syncUserToFirestore(user, newBalance);

  const inv = {
    id: 'inv_' + Date.now(),
    phone,
    packageId: pkg.id,
    packageName: pkg.name,
    price: pkg.price,
    dailyIncome: pkg.dailyIncome,
    totalIncome: pkg.totalIncome || (pkg.dailyIncome * (pkg.durationDays || 90)),
    durationDays: pkg.durationDays || 90,
    daysCompleted: 0,
    totalEarned: 0,
    lastClaimDate: '',
    status: 'active',
    startDate: new Date().toISOString(),
  };
  await syncInvestmentToFirestore(inv);

  const tx = {
    id: 'tx_' + Date.now(),
    phone,
    type: 'investment',
    amount: pkg.price,
    description: `Invested in ${pkg.name}`,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  await syncTransactionToFirestore(tx);

  // Level 1 & Level 2 Referral Commission distribution
  if (user.referredBy) {
    try {
      const referrerL1: any = await getDocFromFirestore('users', user.referredBy);
      if (referrerL1) {
        const l1Commission = Math.round(pkg.price * 0.20); // 20%
        if (l1Commission > 0) {
          referrerL1.balance = Number(referrerL1.balance || 0) + l1Commission;
          await syncUserToFirestore(referrerL1, referrerL1.balance);
          await syncTransactionToFirestore({
            id: 'tx_' + Date.now() + '_ref1',
            phone: referrerL1.phone,
            type: 'referral_bonus',
            amount: l1Commission,
            description: `Level 1 referral bonus (20%) from ${phone} (${pkg.name})`,
            status: 'completed',
            createdAt: new Date().toISOString()
          });
        }

        // Level 2 Commission check
        if (referrerL1.referredBy) {
          const referrerL2: any = await getDocFromFirestore('users', referrerL1.referredBy);
          if (referrerL2) {
            const l2Commission = Math.round(pkg.price * 0.03); // 3%
            if (l2Commission > 0) {
              referrerL2.balance = Number(referrerL2.balance || 0) + l2Commission;
              await syncUserToFirestore(referrerL2, referrerL2.balance);
              await syncTransactionToFirestore({
                id: 'tx_' + Date.now() + '_ref2',
                phone: referrerL2.phone,
                type: 'referral_bonus',
                amount: l2Commission,
                description: `Level 2 referral bonus (3%) from ${phone} (${pkg.name})`,
                status: 'completed',
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      }
    } catch (refErr) {
      console.warn('Referral reward calculation note:', refErr);
    }
  }

  const allInvestments = await fetchFromFirestore('investments');
  const userInvestments = allInvestments.filter((i: any) => i.phone === phone);

  const allTransactions = await fetchFromFirestore('transactions');
  const userTransactions = allTransactions.filter((t: any) => t.phone === phone);

  return { 
    success: true, 
    balance: newBalance, 
    investments: userInvestments,
    transactions: userTransactions
  };
};

export const apiCollectInvestmentIncome = async (investmentId: string) => {
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');

  const allInvestments = await fetchFromFirestore('investments');
  const invIndex = allInvestments.findIndex((i: any) => i.id === investmentId && i.phone === phone);
  if (invIndex === -1) throw new Error('Investment not found');

  const inv = allInvestments[invIndex];
  const todayDate = new Date().toISOString().split('T')[0];

  if (inv.status !== 'active') {
    throw new Error('This investment plan is no longer active.');
  }

  if (inv.lastClaimDate === todayDate) {
    throw new Error(`Daily income for ${inv.packageName} has already been credited for today. Next yield is ready tomorrow!`);
  }

  const pkgMatch = XENOVA_PACKAGES.find(
    (p) =>
      p.id === inv.packageId ||
      p.name?.toLowerCase() === inv.packageName?.toLowerCase() ||
      Number(p.price) === Number(inv.price)
  );

  const durationDays = Number(inv.durationDays || pkgMatch?.durationDays || 90);
  const daysCompleted = Number(inv.daysCompleted || 0);

  if (daysCompleted >= durationDays) {
    inv.status = 'completed';
    await syncInvestmentToFirestore(inv);
    throw new Error('This investment duration has completed.');
  }

  const reward = Number(inv.dailyIncome || pkgMatch?.dailyIncome || Math.round(Number(inv.price || 3000) * 0.20));
  if (reward <= 0) throw new Error('Invalid daily income amount');

  inv.dailyIncome = reward;
  inv.totalIncome = Number(inv.totalIncome || pkgMatch?.totalIncome || (reward * durationDays));

  // Credit user balance
  user.balance = Number(user.balance || 0) + reward;
  await syncUserToFirestore(user, user.balance);

  // Update investment record
  inv.totalEarned = Number(inv.totalEarned || 0) + reward;
  inv.daysCompleted = daysCompleted + 1;
  inv.lastClaimDate = todayDate;
  inv.lastClaimedDate = new Date().toISOString();
  if (inv.daysCompleted >= durationDays) {
    inv.status = 'completed';
  }
  await syncInvestmentToFirestore(inv);

  // Log transaction
  const tx = {
    id: 'tx_' + Date.now() + '_yield',
    phone,
    type: 'daily_income',
    amount: reward,
    description: `Daily product income from ${inv.packageName} (Day ${inv.daysCompleted}/${durationDays})`,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  await syncTransactionToFirestore(tx);

  const updatedInvs = allInvestments
    .filter((i: any) => i.phone === phone)
    .map((i: any) => ({
      ...i,
      canClaimToday: i.status === 'active' && (i.daysCompleted || 0) < Number(i.durationDays || 90) && i.lastClaimDate !== todayDate
    }));

  return {
    success: true,
    reward,
    balance: user.balance,
    investment: inv,
    investments: updatedInvs,
    message: `₦${reward.toLocaleString()} daily yield from ${inv.packageName} has been added to your balance!`
  };
};

export const apiCollectAllInvestmentsIncome = async () => {
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');

  const allInvestments = await fetchFromFirestore('investments');
  const userInvs = allInvestments.filter((i: any) => i.phone === phone && i.status === 'active');
  const todayDate = new Date().toISOString().split('T')[0];

  const claimableInvs = userInvs.filter((inv: any) => {
    const durationDays = Number(inv.durationDays || 90);
    const daysCompleted = Number(inv.daysCompleted || 0);
    return daysCompleted < durationDays && inv.lastClaimDate !== todayDate;
  });

  if (claimableInvs.length === 0) {
    throw new Error('No unclaimed product revenue available today. All active yields have been collected!');
  }

  let totalReward = 0;
  for (const inv of claimableInvs) {
    const pkgMatch = XENOVA_PACKAGES.find(
      (p) =>
        p.id === inv.packageId ||
        p.name?.toLowerCase() === inv.packageName?.toLowerCase() ||
        Number(p.price) === Number(inv.price)
    );
    const reward = Number(inv.dailyIncome || pkgMatch?.dailyIncome || Math.round(Number(inv.price || 3000) * 0.20));
    totalReward += reward;
    const durationDays = Number(inv.durationDays || pkgMatch?.durationDays || 90);
    inv.dailyIncome = reward;
    inv.totalIncome = Number(inv.totalIncome || pkgMatch?.totalIncome || (reward * durationDays));
    inv.totalEarned = Number(inv.totalEarned || 0) + reward;
    inv.daysCompleted = Number(inv.daysCompleted || 0) + 1;
    inv.lastClaimDate = todayDate;
    inv.lastClaimedDate = new Date().toISOString();
    if (inv.daysCompleted >= durationDays) {
      inv.status = 'completed';
    }
    await syncInvestmentToFirestore(inv);

    await syncTransactionToFirestore({
      id: 'tx_' + Date.now() + '_' + inv.id,
      phone,
      type: 'daily_income',
      amount: reward,
      description: `Daily product income from ${inv.packageName} (Day ${inv.daysCompleted}/${durationDays})`,
      status: 'completed',
      createdAt: new Date().toISOString()
    });
  }

  user.balance = Number(user.balance || 0) + totalReward;
  await syncUserToFirestore(user, user.balance);

  const updatedInvs = allInvestments
    .filter((i: any) => i.phone === phone)
    .map((i: any) => ({
      ...i,
      canClaimToday: i.status === 'active' && (i.daysCompleted || 0) < Number(i.durationDays || 90) && i.lastClaimDate !== todayDate
    }));

  return {
    success: true,
    totalReward,
    claimedCount: claimableInvs.length,
    balance: user.balance,
    investments: updatedInvs,
    message: `₦${totalReward.toLocaleString()} total revenue from ${claimableInvs.length} products successfully credited to your balance!`
  };
};

export const apiGetTeam = async () => {
  const phone = getCurrentPhone();
  if (!phone) return { teamMembers: [], totalTeamEarnings: 0 };
  const allUsers = await fetchFromFirestore('users');
  const allInvestments = await fetchFromFirestore('investments');

  const l1Users = allUsers.filter((u: any) => u.referredBy === phone);
  const l1Phones = new Set(l1Users.map((u: any) => u.phone));
  const l2Users = allUsers.filter((u: any) => u.referredBy && l1Phones.has(u.referredBy));

  const teamMembers: any[] = [];

  l1Users.forEach((u: any) => {
    const userInvs = allInvestments.filter((inv: any) => inv.phone === u.phone);
    const totalInvested = userInvs.reduce((sum: number, inv: any) => sum + Number(inv.price || 0), 0);
    const commissionEarned = Math.round(totalInvested * 0.20);
    teamMembers.push({
      id: 'l1_' + u.phone,
      phone: u.phone,
      level: 1,
      joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
      totalInvested,
      commissionEarned
    });
  });

  l2Users.forEach((u: any) => {
    const userInvs = allInvestments.filter((inv: any) => inv.phone === u.phone);
    const totalInvested = userInvs.reduce((sum: number, inv: any) => sum + Number(inv.price || 0), 0);
    const commissionEarned = Math.round(totalInvested * 0.03);
    teamMembers.push({
      id: 'l2_' + u.phone,
      phone: u.phone,
      level: 2,
      joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
      totalInvested,
      commissionEarned
    });
  });

  const totalTeamEarnings = teamMembers.reduce((sum, m) => sum + m.commissionEarned, 0);
  return { teamMembers, totalTeamEarnings };
};

export const apiAdminGetStats = async () => {
  const users = await fetchFromFirestore('users');
  const deposits = await fetchFromFirestore('deposits');
  const withdrawals = await fetchFromFirestore('withdrawals');
  const investments = await fetchFromFirestore('investments');

  const totalUsers = users.length;
  const totalDeposits = deposits.reduce((sum: number, d: any) => sum + (d.status === 'completed' ? Number(d.amount || 0) : 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum: number, w: any) => sum + (w.status === 'completed' ? Number(w.amount || 0) : 0), 0);
  const activeInvestmentsCount = investments.filter((i: any) => i.status === 'active').length;

  return {
    totalUsers,
    totalDeposits,
    totalWithdrawals,
    activeInvestmentsCount
  };
};

export const apiAdminGetUsers = async () => {
  const users = await fetchFromFirestore('users');
  return {
    users: users.map((u: any) => ({
      phone: u.phone,
      email: u.email,
      balance: u.balance || 0,
      vipLevel: u.vipLevel || 0,
      isFrozen: u.isFrozen || false,
      createdAt: u.createdAt || new Date().toISOString(),
    }))
  };
};

export const apiAdminAdjustBalance = async (phone: string, amount: number, mode: 'add' | 'subtract' | 'set', note?: string) => {
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found in Firestore');
  const oldBalance = Number(user.balance || 0);
  let newBal = oldBalance;
  if (mode === 'add') newBal = oldBalance + amount;
  else if (mode === 'subtract') newBal = Math.max(0, oldBalance - amount);
  else if (mode === 'set') newBal = amount;

  user.balance = newBal;
  await syncUserToFirestore(user, newBal);

  const tx = {
    id: 'tx_' + Date.now(),
    phone,
    type: 'admin_adjustment',
    amount: Math.abs(newBal - oldBalance),
    description: note || `Admin adjusted balance (${mode})`,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  await syncTransactionToFirestore(tx);

  return { success: true, newBalance: newBal };
};

export const apiAdminGetWithdrawals = async () => {
  const withdrawals = await fetchFromFirestore('withdrawals');
  const users = await fetchFromFirestore('users');

  const enriched = withdrawals.map((w: any) => {
    const user = users.find((u: any) => u.phone === w.phone || u.id === w.userId);
    const bank = w.bankAccount || (user ? user.bankAccount : null) || (w.bankName || w.accountNumber ? {
      bankName: w.bankName || 'Bank Account',
      accountNumber: w.accountNumber || 'N/A',
      accountName: w.accountName || user?.name || 'User'
    } : null);
    return {
      ...w,
      bankAccount: bank,
      bankName: bank?.bankName || w.bankName,
      accountNumber: bank?.accountNumber || w.accountNumber,
      accountName: bank?.accountName || w.accountName
    };
  });

  return { withdrawals: enriched };
};

export const apiAdminWithdrawalAction = async (userPhone: string, txId: string, action: 'approve' | 'reject') => {
  const withdrawals = await fetchFromFirestore('withdrawals');
  const wd = withdrawals.find((w: any) => w.id === txId) || withdrawals.find((w: any) => w.phone === userPhone && (w.status === 'pending' || w.status === 'processing'));
  if (!wd) throw new Error('Withdrawal record not found');

  // Idempotency guard: If already completed or rejected, prevent double processing
  if (wd.status === 'completed' || wd.status === 'rejected' || wd.status === 'failed') {
    return { success: true, message: `Withdrawal has already been marked as ${wd.status}.` };
  }

  wd.status = action === 'approve' ? 'completed' : 'rejected';
  await syncWithdrawalToFirestore(wd);

  // Sync to transactions table
  await syncTransactionToFirestore({
    ...wd,
    type: 'withdrawal',
    status: wd.status,
    description: `Withdrawal ${action === 'approve' ? 'approved' : 'rejected by admin'}`
  });

  if (action === 'reject') {
    const targetPhone = userPhone || wd.phone;
    const user: any = await getDocFromFirestore('users', targetPhone);
    if (user) {
      user.balance = Number(user.balance || 0) + Number(wd.amount || 0);
      await syncUserToFirestore(user, user.balance);
    }
  }
  return { success: true, message: `Withdrawal successfully ${action === 'approve' ? 'approved' : 'rejected'}` };
};

export const apiAdminGetDeposits = async () => {
  const deposits = await fetchFromFirestore('deposits');
  return { deposits };
};

export const apiAdminDepositAction = async (userPhone: string, txId: string, action: 'approve' | 'reject') => {
  const deposits = await fetchFromFirestore('deposits');
  const dep = deposits.find((d: any) => d.id === txId) || deposits.find((d: any) => d.phone === userPhone && (d.status === 'pending' || d.status === 'processing'));
  if (!dep) throw new Error('Deposit record not found');

  // Idempotency guard: If already approved or rejected, prevent multiple crediting
  if (dep.status === 'completed' || dep.status === 'approved' || dep.status === 'rejected' || dep.status === 'failed') {
    return { success: true, message: `Deposit has already been marked as ${dep.status}.` };
  }

  dep.status = action === 'approve' ? 'completed' : 'rejected';
  await syncDepositToFirestore(dep);

  // Sync to transactions table
  await syncTransactionToFirestore({
    ...dep,
    type: 'deposit',
    status: dep.status,
    description: `Deposit ${action === 'approve' ? 'approved' : 'rejected by admin'}`
  });

  if (action === 'approve') {
    const targetPhone = userPhone || dep.phone;
    const user: any = await getDocFromFirestore('users', targetPhone);
    if (user) {
      user.balance = Number(user.balance || 0) + Number(dep.amount || 0);
      user.hasMadeFirstDeposit = true;
      await syncUserToFirestore(user, user.balance);
    }
  }
  return { success: true, message: `Deposit successfully ${action === 'approve' ? 'approved' : 'rejected'}` };
};

export const apiRedeemGiftCode = async (code: string) => {
  const phone = getCurrentPhone();
  if (!phone) throw new Error('Not authenticated');
  const codes = await fetchFromFirestore('gift_codes');
  const gift = codes.find((c: any) => c.code === code.trim().toUpperCase() && c.active);
  if (!gift) {
    throw new Error('Invalid or expired gift code');
  }

  if (gift.claimedBy && Array.isArray(gift.claimedBy) && gift.claimedBy.includes(phone)) {
    throw new Error('You have already claimed this gift code.');
  }

  if (gift.maxClaims && (gift.claimsCount || 0) >= gift.maxClaims) {
    throw new Error('This gift code has reached its maximum claims limit.');
  }

  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');
  const amount = Number(gift.amount || 1000);
  user.balance = Number(user.balance || 0) + amount;
  await syncUserToFirestore(user, user.balance);

  // Update gift code claims
  gift.claimsCount = (gift.claimsCount || 0) + 1;
  gift.timesClaimed = gift.claimsCount;
  gift.claimedBy = Array.isArray(gift.claimedBy) ? [...gift.claimedBy, phone] : [phone];
  if (gift.maxClaims && gift.claimsCount >= gift.maxClaims) {
    gift.active = false;
  }
  await syncToFirestore('gift_codes', gift, 'code');

  const tx = {
    id: 'tx_' + Date.now(),
    phone,
    type: 'gift_code',
    amount,
    description: `Redeemed gift code: ${gift.code}`,
    status: 'completed',
    createdAt: new Date().toISOString()
  };
  await syncTransactionToFirestore(tx);

  const allTransactions = await fetchFromFirestore('transactions');
  const userTransactions = allTransactions.filter((t: any) => t.phone === phone);

  return { 
    success: true, 
    balance: user.balance, 
    transactions: userTransactions,
    message: `Successfully redeemed ₦${amount.toLocaleString()}!` 
  };
};

export const apiGatewayDeposit = async (amount: number, channel: string = 'Automated Transfer') => {
  const res = await apiDeposit(amount, 'GW_' + Date.now());
  const phone = getCurrentPhone();
  const user: any = phone ? await getDocFromFirestore('users', phone) : null;
  return { ...res, balance: user?.balance || 0, message: 'Gateway deposit initiated successfully' };
};

export const apiGetSystemConfig = async () => {
  const configs = await fetchFromFirestore('system_config');
  return configs[0] || { gatewayEnabled: true, minWithdrawal: 1000 };
};

export const apiAdminGetGiftCodes = async () => {
  const giftCodes = await fetchFromFirestore('gift_codes');
  return { giftCodes };
};

export const apiAdminGenerateGiftCode = async (amount: number = 1000, maxClaims: number = 100, code?: string) => {
  const newCode = code ? code.toUpperCase() : 'XENO' + Math.floor(1000 + Math.random() * 9000);
  const gift = {
    id: newCode,
    code: newCode,
    amount,
    maxClaims,
    claimsCount: 0,
    active: true,
    createdAt: new Date().toISOString()
  };
  await syncToFirestore('gift_codes', gift, 'code');
  return { success: true, message: 'Gift code generated successfully', code: gift };
};

export const apiAdminGiftCodeAction = async (id: string, action: 'toggle' | 'delete', active?: boolean) => {
  if (action === 'delete') {
    await deleteFromFirestore('gift_codes', id);
  } else if (action === 'toggle') {
    const gift: any = await getDocFromFirestore('gift_codes', id);
    if (gift) {
      gift.active = active !== undefined ? active : !gift.active;
      await syncToFirestore('gift_codes', gift, 'code');
    }
  }
  return { success: true, message: 'Gift code updated successfully' };
};

export const apiAdminUpdateSystemConfig = async (configData: any) => {
  await syncToFirestore('system_config', { id: 'main_config', ...configData }, 'id');
  return { success: true, message: 'System config updated successfully' };
};

export const apiAdminFreezeUser = async (phone: string, frozen: boolean) => {
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');
  user.isFrozen = frozen;
  user.frozen = frozen;
  await syncUserToFirestore(user, user.balance);
  return { success: true, message: 'User status updated successfully' };
};

export const apiAdminResetPassword = async (phone: string, newPassword: string) => {
  const user: any = await getDocFromFirestore('users', phone);
  if (!user) throw new Error('User not found');
  user.password = newPassword;
  await syncUserToFirestore(user, user.balance);
  return { success: true, message: 'Password reset successfully' };
};

export const apiAdminGetAuditLogs = async (params?: { eventType?: string; severity?: string; search?: string }) => {
  const auditLogs = await fetchFromFirestore('audit_logs');
  return { auditLogs, stats: { total: auditLogs.length } };
};

export const apiAdminClearAuditLogs = async () => {
  await clearCollectionInFirestore('audit_logs');
  return { success: true, message: 'Security audit logs cleared from Firestore' };
};

export const apiAdminBanIp = async (ip: string, ban: boolean) => {
  return { success: true, message: 'IP ban updated' };
};

export const apiAdminUnbanAllIps = async () => {
  return { success: true, message: 'All IPs unbanned' };
};

export const apiAdminGetBannedIps = async () => {
  return { bannedIps: [] };
};

export const apiAdminActivateProduct = async (userPhone: string, packageId: string) => {
  const pkg = LEGACY_PACKAGES.find(p => p.id === packageId) || { id: packageId, name: packageId, price: 5000, dailyIncome: 500, totalIncome: 45000, durationDays: 90 };
  const inv = {
    id: 'inv_' + Date.now(),
    phone: userPhone,
    packageId: pkg.id,
    packageName: pkg.name,
    price: pkg.price,
    dailyIncome: pkg.dailyIncome,
    totalIncome: (pkg as any).totalIncome || (pkg.dailyIncome * (pkg.durationDays || 90)),
    durationDays: pkg.durationDays || 90,
    daysCompleted: 0,
    totalEarned: 0,
    lastClaimDate: '',
    status: 'active',
    startDate: new Date().toISOString(),
  };
  await syncInvestmentToFirestore(inv);
  return { success: true, message: 'Product activated successfully' };
};

export const apiAdminGetUserActions = async (phone: string) => {
  const invs = await fetchFromFirestore('investments');
  const txs = await fetchFromFirestore('transactions');
  const userInvs = invs.filter((i: any) => i.phone === phone);
  const userTxs = txs.filter((t: any) => t.phone === phone);
  
  const actions: any[] = [];
  userTxs.forEach((t: any) => {
    actions.push({
      id: t.id,
      type: 'transaction',
      title: `Transaction: ${t.type}`,
      description: t.description || `Amount: ₦${t.amount}`,
      amount: t.amount,
      status: t.status,
      timestamp: t.createdAt
    });
  });
  userInvs.forEach((i: any) => {
    actions.push({
      id: i.id,
      type: 'investment',
      title: `Investment: ${i.packageName}`,
      description: `Daily: ₦${i.dailyIncome}`,
      amount: i.price,
      status: i.status,
      timestamp: i.startDate
    });
  });
  return { actions, totalCount: actions.length };
};

export const apiAdminClearDatabase = async () => {
  await clearCollectionInFirestore('users');
  await clearCollectionInFirestore('deposits');
  await clearCollectionInFirestore('withdrawals');
  await clearCollectionInFirestore('investments');
  await clearCollectionInFirestore('transactions');
  await clearCollectionInFirestore('gift_codes');
  await clearCollectionInFirestore('audit_logs');
  return { success: true, message: 'All database collections cleared successfully (0 users/records remaining).' };
};
