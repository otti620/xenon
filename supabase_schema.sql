-- ========================================================
-- Supabase SQL Schema & RLS Setup for Blink Investment App
-- Copy and paste this script into your Supabase SQL Editor!
-- ========================================================

-- 1. Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  user_phone TEXT,
  email TEXT,
  name TEXT,
  password TEXT,
  balance NUMERIC DEFAULT 0,
  vip_level INTEGER DEFAULT 0,
  is_frozen BOOLEAN DEFAULT FALSE,
  is_logged_in BOOLEAN DEFAULT FALSE,
  invitation_code TEXT,
  referred_by TEXT,
  invited_by TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  bank_account JSONB,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Deposits Table
CREATE TABLE IF NOT EXISTS public.deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  phone TEXT,
  user_phone TEXT,
  amount NUMERIC DEFAULT 0,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  proof_image TEXT,
  reference TEXT,
  status TEXT DEFAULT 'pending',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  phone TEXT,
  user_phone TEXT,
  amount NUMERIC DEFAULT 0,
  charge NUMERIC DEFAULT 0,
  net_amount NUMERIC DEFAULT 0,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  bank_account JSONB,
  status TEXT DEFAULT 'pending',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Investments Table
CREATE TABLE IF NOT EXISTS public.investments (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  phone TEXT,
  user_phone TEXT,
  package_id TEXT,
  package_name TEXT,
  plan_name TEXT,
  price NUMERIC DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  daily_income NUMERIC DEFAULT 0,
  daily_return NUMERIC DEFAULT 0,
  total_income NUMERIC DEFAULT 0,
  duration_days INTEGER DEFAULT 90,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_claimed_date TEXT,
  total_earned NUMERIC DEFAULT 0,
  days_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  phone TEXT,
  user_phone TEXT,
  type TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'completed',
  description TEXT,
  reference TEXT,
  proof_image TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  bank_account JSONB,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and Permissive Policies for Web Client Access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow All Users" ON public.users;
CREATE POLICY "Allow All Users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Deposits" ON public.deposits;
CREATE POLICY "Allow All Deposits" ON public.deposits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Withdrawals" ON public.withdrawals;
CREATE POLICY "Allow All Withdrawals" ON public.withdrawals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Investments" ON public.investments;
CREATE POLICY "Allow All Investments" ON public.investments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow All Transactions" ON public.transactions;
CREATE POLICY "Allow All Transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
