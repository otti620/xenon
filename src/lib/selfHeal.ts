export const runSystemSelfHeal = (): { healedCount: number; report: string[] } => {
  const report: string[] = [];
  let healedCount = 0;

  // 1. Check and repair USERS_KEY
  try {
    const usersRaw = localStorage.getItem('xenova_all_users');
    if (!usersRaw) {
      localStorage.setItem('xenova_all_users', JSON.stringify({
        'admin': { phone: 'admin', role: 'admin', balance: 50000, isLoggedIn: true }
      }));
      report.push('Restored default admin user store.');
      healedCount++;
    } else {
      const users = JSON.parse(usersRaw);
      if (!users || typeof users !== 'object') {
        throw new Error('Invalid users format');
      }
      let modified = false;
      Object.keys(users).forEach(phone => {
        if (!users[phone].balance || isNaN(users[phone].balance)) {
          users[phone].balance = 0;
          modified = true;
          healedCount++;
        }
        // Ensure balance backup exists
        const balBackup = Number(localStorage.getItem('xenova_balance_' + phone));
        if (isNaN(balBackup) || balBackup < users[phone].balance) {
          localStorage.setItem('xenova_balance_' + phone, String(users[phone].balance));
        }
      });
      if (modified) {
        localStorage.setItem('xenova_all_users', JSON.stringify(users));
        report.push('Repaired corrupt user balances.');
      }
    }
  } catch (err) {
    localStorage.setItem('xenova_all_users', JSON.stringify({
      'admin': { phone: 'admin', role: 'admin', balance: 50000, isLoggedIn: true }
    }));
    report.push('Recovered from corrupted user storage.');
    healedCount++;
  }

  // 2. Check and repair TRANSACTIONS_KEY
  try {
    const txRaw = localStorage.getItem('xenova_transactions');
    if (txRaw) {
      const txs = JSON.parse(txRaw);
      if (!Array.isArray(txs)) {
        localStorage.setItem('xenova_transactions', JSON.stringify([]));
        report.push('Reset invalid transactions array.');
        healedCount++;
      }
    } else {
      localStorage.setItem('xenova_transactions', JSON.stringify([]));
    }
  } catch {
    localStorage.setItem('xenova_transactions', JSON.stringify([]));
    report.push('Recovered corrupted transaction records.');
    healedCount++;
  }

  // 3. Check and repair SYSTEM_CONFIG_KEY
  try {
    const cfgRaw = localStorage.getItem('xenova_system_config');
    if (!cfgRaw) {
      localStorage.setItem('xenova_system_config', JSON.stringify({
        minDeposit: 3000,
        minWithdrawal: 1000,
        withdrawalFeePercent: 5,
        maintenanceMode: false
      }));
      report.push('Initialized default system config.');
      healedCount++;
    }
  } catch {
    localStorage.setItem('xenova_system_config', JSON.stringify({
      minDeposit: 3000,
      minWithdrawal: 1000,
      withdrawalFeePercent: 5,
      maintenanceMode: false
    }));
    report.push('Reset system configuration due to corruption.');
    healedCount++;
  }

  console.log(`[SelfHeal] Completed self-healing sweep. Healed items: ${healedCount}`, report);
  return { healedCount, report };
};
