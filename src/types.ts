export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  name: string;
  invitationCode: string;
  invitedBy?: string;
  isLoggedIn: boolean;
  registeredAt: string;
  role?: 'user' | 'admin';
}

export interface InvestmentPackage {
  id: string;
  level: number;
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  durationDays: number;
  popular?: boolean;
}

export interface UserInvestment {
  id: string;
  packageId: string;
  packageName: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  durationDays: number;
  startDate: string;
  lastClaimedDate?: string;
  lastClaimDate?: string;
  totalEarned: number;
  daysCompleted: number;
  status: 'active' | 'completed';
  canClaimToday?: boolean;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'daily_income' | 'sign_in_bonus' | 'referral_bonus' | 'admin_adjustment';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  reference?: string;
  senderName?: string;
  senderBank?: string;
  proofImage?: string;
}

export interface TeamMember {
  id: string;
  phone: string;
  level: 1 | 2;
  joinedDate: string;
  totalInvested: number;
  commissionEarned: number;
}

export interface StreakDay {
  day: number;
  reward: number;
  claimed: boolean;
}
