import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || 'https://coswxlknpnfrrurlmosz.supabase.co';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvc3d4bGtucG5mcnJ1cmxtb3N6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMzQzMzIsImV4cCI6MjA5OTgxMDMzMn0.EVBqBoEmjKkn2PxXMAEkfNTMLVjg7OSpCZEWUI6i9sA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function normalizeSupabaseItem(item: any) {
  if (!item || typeof item !== 'object') return item;
  const normalized = { ...item };

  // Normalize ID and Phone references
  normalized.id = String(item.id || item.tx_id || item.txId || item.uid || item.user_id || item.phone || '');
  normalized.phone = String(item.phone || item.user_phone || item.user_id || item.userId || item.id || '');
  normalized.userId = String(item.userId || item.user_id || item.phone || item.id || '');
  normalized.userPhone = String(item.userPhone || item.user_phone || item.phone || item.id || '');

  // Normalize Boolean flags
  const frozenState = Boolean(item.isFrozen ?? item.is_frozen ?? item.frozen ?? false);
  normalized.isFrozen = frozenState;
  normalized.frozen = frozenState;
  normalized.is_frozen = frozenState;

  if (item.is_logged_in !== undefined || item.isLoggedIn !== undefined) {
    normalized.isLoggedIn = Boolean(item.isLoggedIn ?? item.is_logged_in);
  }

  // Normalize Bank Details
  let bank = item.bankAccount || item.bank_account;
  if (typeof bank === 'string') {
    try { bank = JSON.parse(bank); } catch { bank = null; }
  }
  if (!bank && (item.bank_name || item.bankName || item.account_number || item.accountNumber)) {
    bank = {
      bankName: item.bankName || item.bank_name || '',
      accountNumber: item.accountNumber || item.account_number || '',
      accountName: item.accountName || item.account_name || ''
    };
  }
  normalized.bankAccount = bank;
  normalized.bank_account = bank;
  normalized.bankName = bank?.bankName || item.bankName || item.bank_name || '';
  normalized.bank_name = normalized.bankName;
  normalized.accountNumber = bank?.accountNumber || item.accountNumber || item.account_number || '';
  normalized.account_number = normalized.accountNumber;
  normalized.accountName = bank?.accountName || item.accountName || item.account_name || '';
  normalized.account_name = normalized.accountName;

  // Normalize Dates & Timestamps
  const ts = item.createdAt || item.created_at || item.registeredAt || item.registered_at || item.date || item.timestamp || new Date().toISOString();
  normalized.createdAt = ts;
  normalized.created_at = ts;
  normalized.registeredAt = ts;
  normalized.registered_at = ts;
  normalized.date = ts;

  // Normalize Financial Amounts
  if (item.amount !== undefined) normalized.amount = Number(item.amount);
  if (item.balance !== undefined) normalized.balance = Number(item.balance);
  if (item.charge !== undefined) normalized.charge = Number(item.charge);
  if (item.netAmount !== undefined || item.net_amount !== undefined) {
    normalized.netAmount = Number(item.netAmount ?? item.net_amount);
    normalized.net_amount = normalized.netAmount;
  }
  if (item.vipLevel !== undefined || item.vip_level !== undefined) {
    normalized.vipLevel = Number(item.vipLevel ?? item.vip_level ?? 0);
    normalized.vip_level = normalized.vipLevel;
  }

  // Normalize Investment & Package properties
  normalized.packageId = item.packageId || item.package_id || item.planId || item.plan_id || '';
  normalized.package_id = normalized.packageId;
  normalized.packageName = item.packageName || item.package_name || item.planName || item.plan_name || '';
  normalized.package_name = normalized.packageName;
  normalized.dailyIncome = Number(item.dailyIncome ?? item.daily_income ?? item.dailyReturn ?? item.daily_return ?? 0);
  normalized.daily_income = normalized.dailyIncome;
  normalized.totalIncome = Number(item.totalIncome ?? item.total_income ?? 0);
  normalized.total_income = normalized.totalIncome;
  normalized.durationDays = Number(item.durationDays ?? item.duration_days ?? 90);
  normalized.duration_days = normalized.durationDays;
  normalized.startDate = item.startDate || item.start_date || ts;
  normalized.start_date = normalized.startDate;

  // Normalize Images & References
  normalized.proofImage = item.proofImage || item.proof_image || item.proof || '';
  normalized.proof_image = normalized.proofImage;
  normalized.reference = item.reference || item.ref || '';

  // Normalize Referral Codes
  normalized.invitationCode = item.invitationCode || item.invitation_code || item.referralCode || item.referral_code || '';
  normalized.invitation_code = normalized.invitationCode;
  normalized.referredBy = item.referredBy || item.referred_by || item.invitedBy || item.invited_by || '';
  normalized.referred_by = normalized.referredBy;
  normalized.invitedBy = normalized.referredBy;

  return normalized;
}

const withTimeout = <T>(promise: PromiseLike<T>, ms = 1500): Promise<T> => {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Supabase request timeout')), ms);
  });
  return Promise.race([
    Promise.resolve(promise).finally(() => clearTimeout(timer)),
    timeoutPromise,
  ]);
};

export async function syncToSupabase(table: string, data: any, matchKey = 'id') {
  if (!supabase) return;

  let payloadData = { ...data };

  // Convert object fields to JSON strings if needed for Postgres text column compatibility
  if (payloadData.bankAccount && typeof payloadData.bankAccount === 'object') {
    payloadData.bankAccount = JSON.stringify(payloadData.bankAccount);
  }
  if (payloadData.bank_account && typeof payloadData.bank_account === 'object') {
    payloadData.bank_account = JSON.stringify(payloadData.bank_account);
  }

  // Support both plural and singular table name variations
  const tableCandidates = [table];
  if (table.endsWith('s')) {
    tableCandidates.push(table.slice(0, -1));
  } else {
    tableCandidates.push(table + 's');
  }
  if (table === 'users') tableCandidates.push('profiles', 'user_profiles');

  for (const tName of tableCandidates) {
    let currentPayload = { ...payloadData };
    let attempts = 0;
    let synced = false;

    while (attempts < 2) {
      attempts++;
      try {
        const key = matchKey || (currentPayload.id ? 'id' : (currentPayload.phone ? 'phone' : ''));
        let res: any;
        if (key && currentPayload[key]) {
          res = await withTimeout(supabase.from(tName).upsert(currentPayload, { onConflict: key }), 1500);
        } else {
          res = await withTimeout(supabase.from(tName).insert(currentPayload), 1500);
        }

        if (res && !res.error) {
          synced = true;
          break;
        }

        const errMsg = res?.error?.message || '';

        // If onConflict failed due to missing constraint or conflict rule, try update or direct insert
        if (errMsg.includes('on conflict') || errMsg.includes('ON CONFLICT') || errMsg.includes('constraint') || errMsg.includes('unique')) {
          const filterCol = currentPayload.phone ? 'phone' : (currentPayload.id ? 'id' : '');
          if (filterCol && currentPayload[filterCol]) {
            const updateRes = await withTimeout(supabase.from(tName).update(currentPayload).eq(filterCol, currentPayload[filterCol]), 1500).catch(() => null);
            if (updateRes && !updateRes.error) {
              synced = true;
              break;
            }
          }
          const insertRes = await withTimeout(supabase.from(tName).insert(currentPayload), 1500).catch(() => null);
          if (insertRes && !insertRes.error) {
            synced = true;
            break;
          }
        }

        // Handle missing column in Supabase schema cache dynamically
        const match = errMsg.match(/Could not find the '([^']+)' column/i) || errMsg.match(/column "([^"]+)" of relation/i);
        if (match && match[1] && currentPayload.hasOwnProperty(match[1])) {
          delete currentPayload[match[1]];
          continue;
        }

        break;
      } catch (e: any) {
        break;
      }
    }
    if (synced) break;
  }
}

export async function fetchFromSupabase(table: string, filterColumn?: string, filterValue?: any) {
  if (!supabase) return [];

  const tableCandidates = [table];
  if (table.endsWith('s')) {
    tableCandidates.push(table.slice(0, -1));
  } else {
    tableCandidates.push(table + 's');
  }
  if (table === 'users') tableCandidates.push('profiles', 'user_profiles');

  for (const tName of tableCandidates) {
    try {
      let query = supabase.from(tName).select('*');
      if (filterColumn && filterValue !== undefined) {
        query = query.eq(filterColumn, filterValue);
      }
      const res: any = await withTimeout(query, 1500);
      if (res && !res.error && res.data && Array.isArray(res.data)) {
        if (res.data.length > 0) {
          return res.data.map((item: any) => normalizeSupabaseItem(item));
        }
      }
    } catch (e: any) {
      console.warn(`Supabase fetch notice on ${tName}:`, e?.message || e);
    }
  }
  return [];
}

