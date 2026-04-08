import { Colors } from './colors';

export interface CategoryDef {
  id: string;
  label: string;
  icon: string;        // MaterialCommunityIcons name
  color: string;
  type: 'expense' | 'income' | 'both';
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: 'shopping',       label: 'Shopping',       icon: 'shopping',            color: Colors.categoryColors.shopping,      type: 'expense' },
  { id: 'travel',         label: 'Travel',         icon: 'car',                 color: Colors.categoryColors.travel,        type: 'expense' },
  { id: 'grocery',        label: 'Grocery',        icon: 'leaf',                color: Colors.categoryColors.grocery,       type: 'expense' },
  { id: 'entertainment',  label: 'Entertainment',  icon: 'music-note',          color: Colors.categoryColors.entertainment, type: 'expense' },
  { id: 'food',           label: 'Food & Dining',  icon: 'food-fork-drink',     color: Colors.categoryColors.food,          type: 'expense' },
  { id: 'health',         label: 'Health',         icon: 'heart-pulse',         color: Colors.categoryColors.health,        type: 'expense' },
  { id: 'utilities',      label: 'Utilities',      icon: 'lightning-bolt',      color: Colors.categoryColors.utilities,     type: 'expense' },
  { id: 'other',          label: 'Other',          icon: 'dots-horizontal',     color: Colors.categoryColors.other,         type: 'expense' },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'salary',     label: 'Salary',     icon: 'briefcase-outline',   color: Colors.categoryColors.salary,     type: 'income' },
  { id: 'freelance',  label: 'Freelance',  icon: 'laptop',              color: Colors.categoryColors.freelance,  type: 'income' },
  { id: 'investment', label: 'Investment', icon: 'chart-line',          color: Colors.categoryColors.investment, type: 'income' },
  { id: 'other',      label: 'Other',      icon: 'dots-horizontal',     color: Colors.categoryColors.other,      type: 'income' },
];

export const ALL_CATEGORIES: CategoryDef[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryDef(id: string): CategoryDef {
  return (
    ALL_CATEGORIES.find((c) => c.id === id) ?? {
      id: 'other',
      label: 'Other',
      icon: 'dots-horizontal',
      color: Colors.categoryColors.other,
      type: 'both',
    }
  );
}
