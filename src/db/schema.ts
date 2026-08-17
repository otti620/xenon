import { pgTable, text, timestamp, numeric, boolean, jsonb } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid').unique(),
  phone: text('phone').unique(),
  email: text('email'),
  name: text('name'),
  password: text('password'),
  balance: numeric('balance').default('0'),
  role: text('role').default('user'),
  banned: boolean('banned').default(false),
  frozen: boolean('frozen').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactionsTable = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  type: text('type'),
  amount: numeric('amount'),
  status: text('status'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const investmentsTable = pgTable('investments', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  planName: text('plan_name'),
  amount: numeric('amount'),
  dailyReturn: numeric('daily_return'),
  durationDays: numeric('duration_days'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const depositsTable = pgTable('deposits', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  phone: text('phone'),
  amount: numeric('amount'),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  accountName: text('account_name'),
  proofImage: text('proof_image'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const withdrawalsTable = pgTable('withdrawals', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  phone: text('phone'),
  amount: numeric('amount'),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  accountName: text('account_name'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

