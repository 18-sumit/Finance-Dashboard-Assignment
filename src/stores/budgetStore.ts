import { create } from 'zustand';
import { startOfMonth } from 'date-fns';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface Budget {
  categoryId: string;
  limit: number;
}

type BudgetRow = {
  id: string;
  user_id: string;
  category_id: string;
  monthly_limit: number | string;
  month: string;
  created_at: string;
  updated_at: string;
};

const mapBudgetRow = (row: BudgetRow): Budget => ({
  categoryId: row.category_id,
  limit: Number(row.monthly_limit),
});

const getUserId = () => useAuthStore.getState().user?.id;
const getCurrentMonth = () => startOfMonth(new Date()).toISOString().slice(0, 10);

interface BudgetStore {
  budgets: Budget[];
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initializeBudgets: () => Promise<(() => void) | void>;
  setBudget: (categoryId: string, limit: number) => Promise<{ error?: string }>;
  removeBudget: (categoryId: string) => Promise<{ error?: string }>;
  getBudget: (categoryId: string) => Budget | undefined;
  resetBudgets: () => void;
}

export const useBudgetStore = create<BudgetStore>()((set, get) => ({
  budgets: [],
  initialized: false,
  loading: false,
  error: null,

  initializeBudgets: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ budgets: [], initialized: true, loading: false, error: 'Supabase env vars are missing.' });
      return;
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      set({ budgets: [], initialized: true, loading: false, error: null });
      return;
    }

    const loadBudgets = async () => {
      const currentMonth = getCurrentMonth();
      const { data, error } = await client
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .order('created_at', { ascending: true });

      if (error) {
        set({ error: error.message });
        return;
      }

      set({ budgets: ((data as BudgetRow[] | null) ?? []).map(mapBudgetRow), initialized: true, loading: false, error: null });
    };

    set({ loading: true, error: null });
    await loadBudgets();

    const channel = client
      .channel(`budgets:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` }, () => {
        void loadBudgets();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  },

  setBudget: async (categoryId, limit) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      const error = 'You must be signed in to set a budget.';
      set({ error });
      return { error };
    }

    const currentMonth = getCurrentMonth();
    set({ loading: true, error: null });
    const { data, error } = await client
      .from('budgets')
      .upsert(
        {
          user_id: userId,
          category_id: categoryId,
          monthly_limit: limit,
          month: currentMonth,
        },
        { onConflict: 'user_id,category_id,month' }
      )
      .select('*')
      .single();

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => {
      const next = state.budgets.filter((budget) => budget.categoryId !== categoryId);
      next.push(mapBudgetRow(data as BudgetRow));
      return { budgets: next, loading: false, error: null };
    });

    return {};
  },

  removeBudget: async (categoryId) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      const error = 'You must be signed in to remove a budget.';
      set({ error });
      return { error };
    }

    const currentMonth = getCurrentMonth();
    set({ loading: true, error: null });
    const { error } = await client
      .from('budgets')
      .delete()
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('month', currentMonth);

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      budgets: state.budgets.filter((budget) => budget.categoryId !== categoryId),
      loading: false,
      error: null,
    }));

    return {};
  },

  getBudget: (categoryId) => get().budgets.find((budget) => budget.categoryId === categoryId),

  resetBudgets: () => set({ budgets: [], initialized: false, loading: false, error: null }),
}));
