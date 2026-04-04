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
      budgets: [
        { categoryId: 'rent',          limit: 22000 },
        { categoryId: 'food',          limit: 12000 },
        { categoryId: 'utilities',     limit: 6000  },
        { categoryId: 'transport',     limit: 5000  },
        { categoryId: 'shopping',      limit: 8000  },
        { categoryId: 'entertainment', limit: 3000  },
        { categoryId: 'health',        limit: 4000  },
        { categoryId: 'travel',        limit: 6000  },
      ],
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
    {
      name: 'finance-budget-storage',
      version: 2,
      migrate: (_state: unknown, fromVersion: number) => {
        // v1 had no seed data — reset to defaults on upgrade
        if (fromVersion < 2) return {};
        return _state;
      },
    }
  )
);
