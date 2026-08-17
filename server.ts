import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db";
import { usersTable, depositsTable, withdrawalsTable, investmentsTable, transactionsTable } from "./src/db/schema";
import { eq } from "drizzle-orm";

const DATA_FILE = path.join(process.cwd(), "data.json");

interface AppData {
  users: Record<string, any>;
  deposits: any[];
  withdrawals: any[];
  investments: any[];
  transactions: any[];
}

function loadJsonData(): AppData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (e) {}
  return { users: {}, deposits: [], withdrawals: [], investments: [], transactions: [] };
}

function saveJsonData(data: AppData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {}
}

let useFallback = !process.env.DATABASE_URL;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: useFallback ? "JSON File Store (Fallback)" : "Cloud SQL PostgreSQL connected" });
  });

  // Users endpoints
  app.get("/api/users", async (req, res) => {
    if (!useFallback) {
      try {
        const allUsers = await db.select().from(usersTable);
        const userMap: Record<string, any> = {};
        allUsers.forEach((u) => {
          const key = u.phone || u.id;
          if (key) userMap[key] = u;
        });
        return res.json(userMap);
      } catch (err: any) {
        console.warn("PostgreSQL failed, switching to JSON fallback:", err.message);
        useFallback = true;
      }
    }
    const data = loadJsonData();
    res.json(data.users || {});
  });

  app.post("/api/users", async (req, res) => {
    const userData = req.body;
    const id = userData.phone || userData.id || 'user_' + Date.now();
    
    if (!useFallback) {
      try {
        const existing = await db.select().from(usersTable).where(eq(usersTable.id, id));
        if (existing.length > 0) {
          await db.update(usersTable)
            .set({ ...userData, balance: String(userData.balance ?? existing[0].balance) })
            .where(eq(usersTable.id, id));
        } else {
          await db.insert(usersTable).values({
            id,
            uid: userData.uid || id,
            phone: userData.phone || id,
            email: userData.email || '',
            name: userData.name || '',
            password: userData.password || '',
            balance: String(userData.balance || 0),
            role: userData.role || 'user',
            banned: Boolean(userData.banned),
            frozen: Boolean(userData.frozen),
          });
        }
        return res.json({ success: true });
      } catch (err: any) {
        console.warn("PostgreSQL save user failed, using JSON fallback:", err.message);
        useFallback = true;
      }
    }

    const data = loadJsonData();
    data.users[id] = { ...(data.users[id] || {}), ...userData };
    saveJsonData(data);
    res.json({ success: true });
  });

  // Deposits endpoints
  app.get("/api/deposits", async (req, res) => {
    if (!useFallback) {
      try {
        const deposits = await db.select().from(depositsTable);
        return res.json({ deposits });
      } catch (err) {
        useFallback = true;
      }
    }
    const data = loadJsonData();
    res.json({ deposits: data.deposits || [] });
  });

  app.post("/api/deposits", async (req, res) => {
    const deposit = req.body;
    const id = deposit.id || 'dep_' + Date.now();
    deposit.id = id;

    if (!useFallback) {
      try {
        await db.insert(depositsTable).values({
          id,
          userId: deposit.userId || deposit.phone,
          phone: deposit.phone || '',
          amount: String(deposit.amount || 0),
          bankName: deposit.bankName || '',
          accountNumber: deposit.accountNumber || '',
          accountName: deposit.accountName || '',
          proofImage: deposit.proofImage || '',
          status: deposit.status || 'pending',
        }).onConflictDoUpdate({
          target: depositsTable.id,
          set: { status: deposit.status, proofImage: deposit.proofImage }
        });
        return res.json({ success: true, id });
      } catch (err) {
        useFallback = true;
      }
    }

    const data = loadJsonData();
    const idx = data.deposits.findIndex((d: any) => d.id === id);
    if (idx >= 0) {
      data.deposits[idx] = { ...data.deposits[idx], ...deposit };
    } else {
      data.deposits.push(deposit);
    }
    saveJsonData(data);
    res.json({ success: true, id });
  });

  // Withdrawals endpoints
  app.get("/api/withdrawals", async (req, res) => {
    if (!useFallback) {
      try {
        const withdrawals = await db.select().from(withdrawalsTable);
        return res.json({ withdrawals });
      } catch (err) {
        useFallback = true;
      }
    }
    const data = loadJsonData();
    res.json({ withdrawals: data.withdrawals || [] });
  });

  app.post("/api/withdrawals", async (req, res) => {
    const withdrawal = req.body;
    const id = withdrawal.id || 'wd_' + Date.now();
    withdrawal.id = id;

    if (!useFallback) {
      try {
        await db.insert(withdrawalsTable).values({
          id,
          userId: withdrawal.userId || withdrawal.phone,
          phone: withdrawal.phone || '',
          amount: String(withdrawal.amount || 0),
          bankName: withdrawal.bankName || '',
          accountNumber: withdrawal.accountNumber || '',
          accountName: withdrawal.accountName || '',
          status: withdrawal.status || 'pending',
        }).onConflictDoUpdate({
          target: withdrawalsTable.id,
          set: { status: withdrawal.status }
        });
        return res.json({ success: true, id });
      } catch (err) {
        useFallback = true;
      }
    }

    const data = loadJsonData();
    const idx = data.withdrawals.findIndex((w: any) => w.id === id);
    if (idx >= 0) {
      data.withdrawals[idx] = { ...data.withdrawals[idx], ...withdrawal };
    } else {
      data.withdrawals.push(withdrawal);
    }
    saveJsonData(data);
    res.json({ success: true, id });
  });

  // Investments endpoints
  app.get("/api/investments", async (req, res) => {
    if (!useFallback) {
      try {
        const investments = await db.select().from(investmentsTable);
        return res.json({ investments });
      } catch (err) {
        useFallback = true;
      }
    }
    const data = loadJsonData();
    res.json({ investments: data.investments || [] });
  });

  app.post("/api/investments", async (req, res) => {
    const inv = req.body;
    const id = inv.id || 'inv_' + Date.now();
    inv.id = id;

    if (!useFallback) {
      try {
        await db.insert(investmentsTable).values({
          id,
          userId: inv.userId || inv.phone,
          planName: inv.planName || '',
          amount: String(inv.amount || 0),
          dailyReturn: String(inv.dailyReturn || 0),
          durationDays: String(inv.durationDays || 0),
          status: inv.status || 'active',
        }).onConflictDoUpdate({
          target: investmentsTable.id,
          set: { status: inv.status }
        });
        return res.json({ success: true, id });
      } catch (err) {
        useFallback = true;
      }
    }

    const data = loadJsonData();
    const idx = data.investments.findIndex((i: any) => i.id === id);
    if (idx >= 0) {
      data.investments[idx] = { ...data.investments[idx], ...inv };
    } else {
      data.investments.push(inv);
    }
    saveJsonData(data);
    res.json({ success: true, id });
  });

  // Transactions endpoints
  app.get("/api/transactions", async (req, res) => {
    if (!useFallback) {
      try {
        const transactions = await db.select().from(transactionsTable);
        return res.json({ transactions });
      } catch (err) {
        useFallback = true;
      }
    }
    const data = loadJsonData();
    res.json({ transactions: data.transactions || [] });
  });

  app.post("/api/transactions", async (req, res) => {
    const tx = req.body;
    const id = tx.id || 'tx_' + Date.now();
    tx.id = id;

    if (!useFallback) {
      try {
        await db.insert(transactionsTable).values({
          id,
          userId: tx.userId || tx.phone,
          type: tx.type || '',
          amount: String(tx.amount || 0),
          status: tx.status || 'completed',
          description: tx.description || '',
        }).onConflictDoUpdate({
          target: transactionsTable.id,
          set: { status: tx.status }
        });
        return res.json({ success: true, id });
      } catch (err) {
        useFallback = true;
      }
    }

    const data = loadJsonData();
    const idx = data.transactions.findIndex((t: any) => t.id === id);
    if (idx >= 0) {
      data.transactions[idx] = { ...data.transactions[idx], ...tx };
    } else {
      data.transactions.push(tx);
    }
    saveJsonData(data);
    res.json({ success: true, id });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
