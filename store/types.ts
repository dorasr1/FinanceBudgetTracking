// ─── Core domain types ──────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  avatarColor: string; // hex, shown as avatar background
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;     // categoryDef.id
  merchant: string;     // free text merchant / source name
  note?: string;
  date: string;         // ISO date string (YYYY-MM-DD)
  isShared: boolean;    // split between both household members
  splitRatio: number;   // 0–1 (this user's share when isShared=true)
}

export interface CategoryBudget {
  categoryId: string;
  budget: number;
}

export interface MonthlyBudget {
  month: string;          // "YYYY-MM"
  totalBudget: number;
  income: number;         // expected / actual income for the month
  categories: CategoryBudget[];
}

export type BillStatus = 'pending' | 'paid' | 'overdue';
export type BillFrequency = 'once' | 'monthly' | 'quarterly' | 'yearly';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;            // ISO date string (YYYY-MM-DD)
  status: BillStatus;
  isRecurring: boolean;
  frequency: BillFrequency;
  category: string;
  merchantIcon?: string;      // optional emoji or icon name
  autoDebit: boolean;         // show "AUTO DEBIT IN X DAYS" banner
  linkedAccountLast4?: string; // e.g. "2233"
}

// ─── Derived / computed types ─────────────────────────────────────────────

export interface CategoryStat {
  categoryId: string;
  spent: number;
  budget: number;       // 0 if no budget set
  percentage: number;   // of total spending
}

export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgetTotal: number;
  safeToSpendPerDay: number;
  categoryStats: CategoryStat[];
}

// ─── App settings ─────────────────────────────────────────────────────────

export type CurrencySymbol = '$' | '€' | '£' | '₹' | '¥' | '₩' | 'A$' | 'C$';

export interface AppSettings {
  currency: CurrencySymbol;
  currencyCode: string;    // ISO 4217 e.g. "USD"
  hideIncome: boolean;     // privacy: mask income on dashboard
}
