import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Budget {
  categoryId: string;
  limit: number;     // monthly limit in rupees
}

interface BudgetStore {
  budgets: Budget[];
  setBudget: (categoryId: string, limit: number) => void;
  removeBudget: (categoryId: string) => void;
  getBudget: (categoryId: string) => Budget | undefined;
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set, get) => ({
      budgets: [],
      setBudget: (categoryId, limit) => {
        const existing = get().budgets.find(b => b.categoryId === categoryId);
        if (existing) {
          set(state => ({
            budgets: state.budgets.map(b =>
              b.categoryId === categoryId ? { ...b, limit } : b
            )
          }));
        } else {
          set(state => ({ budgets: [...state.budgets, { categoryId, limit }] }));
        }
      },
      removeBudget: (categoryId) =>
        set(state => ({ budgets: state.budgets.filter(b => b.categoryId !== categoryId) })),
      getBudget: (categoryId) =>
        get().budgets.find(b => b.categoryId === categoryId),
    }),
    { name: 'finance-budget-storage' }
  )
);
