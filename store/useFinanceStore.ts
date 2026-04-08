import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, getDaysInMonth, getDate, parseISO, isAfter, isBefore, startOfDay } from 'date-fns';
import {
  User,
  Transaction,
  MonthlyBudget,
  Bill,
  BillStatus,
  CategoryStat,
  MonthlyStats,
  AppSettings,
  CategoryBudget,
} from './types';

// ─── Seed data (2 household users) ──────────────────────────────────────────

const SEED_USERS: User[] = [
  { id: 'user1', name: 'Alex',  avatarColor: '#4A9EFF' },
  { id: 'user2', name: 'Jordan', avatarColor: '#C9FF2F' },
];

// ─── Store interface ─────────────────────────────────────────────────────────

interface FinanceStore {
  // ── State ──────────────────────────────────────────────────────────────────
  users: User[];
  activeUserId: string;
  transactions: Transaction[];
  budgets: Record<string, MonthlyBudget>;   // key: "YYYY-MM"
  bills: Bill[];
  currentMonth: string;                      // "YYYY-MM"
  settings: AppSettings;

  // ── User actions ───────────────────────────────────────────────────────────
  setActiveUser: (userId: string) => void;
  updateUser: (userId: string, partial: Partial<User>) => void;

  // ── Transaction actions ────────────────────────────────────────────────────
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, partial: Partial<Omit<Transaction, 'id'>>) => void;
  deleteTransaction: (id: string) => void;

  // ── Budget actions ─────────────────────────────────────────────────────────
  setBudget: (month: string, totalBudget: number, income: number, categories: CategoryBudget[]) => void;

  // ── Bill actions ───────────────────────────────────────────────────────────
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, partial: Partial<Omit<Bill, 'id'>>) => void;
  deleteBill: (id: string) => void;
  markBillPaid: (id: string) => void;

  // ── Navigation ─────────────────────────────────────────────────────────────
  setCurrentMonth: (month: string) => void;

  // ── Settings ───────────────────────────────────────────────────────────────
  updateSettings: (partial: Partial<AppSettings>) => void;

  // ── Selectors ─────────────────────────────────────────────────────────────
  getMonthlyStats: (month: string) => MonthlyStats;
  getMonthTransactions: (month: string) => Transaction[];
  getUpcomingBills: () => Bill[];
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function currentMonthKey(): string {
  return format(new Date(), 'yyyy-MM');
}

// ─── Store implementation ─────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ────────────────────────────────────────────────────────
      users: SEED_USERS,
      activeUserId: 'user1',
      transactions: [],
      budgets: {},
      bills: [],
      currentMonth: currentMonthKey(),
      settings: {
        currency: '$',
        currencyCode: 'USD',
        hideIncome: false,
      },

      // ── User actions ─────────────────────────────────────────────────────────
      setActiveUser: (userId) => set({ activeUserId: userId }),

      updateUser: (userId, partial) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, ...partial } : u)),
        })),

      // ── Transaction actions ───────────────────────────────────────────────────
      addTransaction: (tx) =>
        set((s) => ({
          transactions: [{ ...tx, id: uuid() }, ...s.transactions],
        })),

      updateTransaction: (id, partial) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...partial } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      // ── Budget actions ────────────────────────────────────────────────────────
      setBudget: (month, totalBudget, income, categories) =>
        set((s) => ({
          budgets: {
            ...s.budgets,
            [month]: { month, totalBudget, income, categories },
          },
        })),

      // ── Bill actions ──────────────────────────────────────────────────────────
      addBill: (bill) =>
        set((s) => ({
          bills: [{ ...bill, id: uuid() }, ...s.bills],
        })),

      updateBill: (id, partial) =>
        set((s) => ({
          bills: s.bills.map((b) => (b.id === id ? { ...b, ...partial } : b)),
        })),

      deleteBill: (id) =>
        set((s) => ({ bills: s.bills.filter((b) => b.id !== id) })),

      markBillPaid: (id) =>
        set((s) => ({
          bills: s.bills.map((b) => (b.id === id ? { ...b, status: 'paid' as BillStatus } : b)),
        })),

      // ── Navigation ────────────────────────────────────────────────────────────
      setCurrentMonth: (month) => set({ currentMonth: month }),

      // ── Settings ──────────────────────────────────────────────────────────────
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      // ── Selectors ────────────────────────────────────────────────────────────
      getMonthTransactions: (month) => {
        const { transactions } = get();
        return transactions.filter((t) => t.date.startsWith(month));
      },

      getMonthlyStats: (month): MonthlyStats => {
        const { transactions, budgets } = get();
        const monthTxs = transactions.filter((t) => t.date.startsWith(month));

        const totalIncome = monthTxs
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const totalExpense = monthTxs
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        const budget = budgets[month];
        const budgetTotal = budget?.totalBudget ?? 0;

        // Safe to spend = (budget - spent) / days remaining in month
        const today = new Date();
        const daysInMonth = getDaysInMonth(today);
        const dayOfMonth = getDate(today);
        const daysLeft = Math.max(daysInMonth - dayOfMonth + 1, 1);
        const remaining = Math.max(budgetTotal - totalExpense, 0);
        const safeToSpendPerDay = budgetTotal > 0 ? remaining / daysLeft : 0;

        // Category stats (expenses only)
        const expenseTxs = monthTxs.filter((t) => t.type === 'expense');
        const categoryMap: Record<string, number> = {};
        for (const tx of expenseTxs) {
          categoryMap[tx.category] = (categoryMap[tx.category] ?? 0) + tx.amount;
        }

        const categoryStats: CategoryStat[] = Object.entries(categoryMap).map(
          ([categoryId, spent]) => {
            const catBudget = budget?.categories.find((c) => c.categoryId === categoryId);
            return {
              categoryId,
              spent,
              budget: catBudget?.budget ?? 0,
              percentage: totalExpense > 0 ? (spent / totalExpense) * 100 : 0,
            };
          }
        ).sort((a, b) => b.spent - a.spent);

        return {
          month,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          budgetTotal,
          safeToSpendPerDay,
          categoryStats,
        };
      },

      getUpcomingBills: () => {
        const { bills } = get();
        const today = startOfDay(new Date());
        return bills
          .filter((b) => b.status !== 'paid')
          .map((b) => {
            const due = startOfDay(parseISO(b.dueDate));
            let status: BillStatus = 'pending';
            if (isBefore(due, today)) status = 'overdue';
            else if (format(due, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) status = 'pending';
            return { ...b, status };
          })
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      },
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ─── Convenience selectors (use outside of components too) ────────────────────

export const selectActiveUser = (s: FinanceStore) =>
  s.users.find((u) => u.id === s.activeUserId) ?? s.users[0];

export const selectOtherUser = (s: FinanceStore) =>
  s.users.find((u) => u.id !== s.activeUserId) ?? s.users[1];
