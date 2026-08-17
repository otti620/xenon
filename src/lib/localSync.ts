// Local storage synchronization utility (Zero external cloud dependencies)

export async function syncToLocal(tableName: string, data: any, matchKey = 'id') {
  try {
    const key = `local_table_${tableName}`;
    const raw = localStorage.getItem(key);
    let items: any[] = raw ? JSON.parse(raw) : [];
    const id = String(data[matchKey] || data.id || data.phone || 'doc_' + Date.now());
    if (id.includes('seed')) return; // do not store seed data
    const index = items.findIndex(item => String(item[matchKey] || item.id || item.phone) === id);
    if (index >= 0) {
      items[index] = { ...items[index], ...data };
    } else {
      items.push({ id, ...data });
    }
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error('Local sync error:', e);
  }
}

export async function fetchFromLocal(tableName: string) {
  try {
    const key = `local_table_${tableName}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      let items = JSON.parse(raw);
      if (Array.isArray(items)) {
        items = items.filter((item: any) => {
          const idStr = String(item.id || item.phone || item.reference || '');
          const nameStr = String(item.name || item.accountName || '');
          if (idStr.includes('seed') || nameStr.includes('Sarah Johnson') || nameStr.includes('Michael Chen') || item.phone === '07033445566' || item.phone === '09087654321') {
            return false;
          }
          return true;
        });
      }
      return items;
    }
    return [];
  } catch (e) {
    console.error('Local fetch error:', e);
    return [];
  }
}

export const syncDepositToLocal = (data: any, opt?: any) => syncToLocal('deposits', data);
export const syncWithdrawalToLocal = (data: any, opt?: any) => syncToLocal('withdrawals', data);
export const syncUserToLocal = (data: any, balance?: any) => syncToLocal('users', data, 'phone');
export const syncInvestmentToLocal = (data: any, opt?: any) => syncToLocal('investments', data);
export const syncTransactionToLocal = (data: any, opt?: any) => syncToLocal('transactions', data);
