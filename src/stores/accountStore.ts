import { create } from 'zustand';
import { Account, AccountType } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

type AccountRow = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number | string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

const mapAccountRow = (row: AccountRow): Account => ({
  id: row.id,
  name: row.name,
  type: row.type,
  balance: Number(row.balance),
  color: row.color,
  icon: row.icon,
  createdAt: row.created_at,
});

const getUserId = () => useAuthStore.getState().user?.id;

interface AccountStore {
  accounts: Account[];
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initializeAccounts: () => Promise<(() => void) | void>;
  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => Promise<{ error?: string }>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<{ error?: string }>;
  deleteAccount: (id: string) => Promise<{ error?: string }>;
  updateBalance: (id: string, amountChange: number) => Promise<{ error?: string }>;
  resetAccounts: () => void;
}

export const useAccountStore = create<AccountStore>()((set, get) => ({
  accounts: [],
  initialized: false,
  loading: false,
  error: null,

  initializeAccounts: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ accounts: [], initialized: true, loading: false, error: 'Supabase env vars are missing.' });
      return;
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      set({ accounts: [], initialized: true, loading: false, error: null });
      return;
    }

    const loadAccounts = async () => {
      const { data, error } = await client
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        set({ error: error.message });
        return;
      }

      set({ accounts: ((data as AccountRow[] | null) ?? []).map(mapAccountRow), initialized: true, loading: false, error: null });
    };

    set({ loading: true, error: null });
    await loadAccounts();

    const channel = client
      .channel(`accounts:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts', filter: `user_id=eq.${userId}` }, () => {
        void loadAccounts();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  },

  addAccount: async (a) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      const error = 'You must be signed in to create an account.';
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });
    const { data, error } = await client
      .from('accounts')
      .insert({
        user_id: userId,
        name: a.name,
        type: a.type,
        balance: a.balance,
        color: a.color,
        icon: a.icon,
      })
      .select('*')
      .single();

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      accounts: [...state.accounts, mapAccountRow(data as AccountRow)],
      loading: false,
      error: null,
    }));

    return {};
  },

  updateAccount: async (id, updates) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    set({ loading: true, error: null });
    const { data, error } = await client
      .from('accounts')
      .update({
        name: updates.name,
        type: updates.type,
        balance: updates.balance,
        color: updates.color,
        icon: updates.icon,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      accounts: state.accounts.map((account) => (account.id === id ? mapAccountRow(data as AccountRow) : account)),
      loading: false,
      error: null,
    }));

    return {};
  },

  deleteAccount: async (id) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    set({ loading: true, error: null });
    const { error } = await client.from('accounts').delete().eq('id', id);
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
      loading: false,
      error: null,
    }));

    return {};
  },

  updateBalance: async (id, amountChange) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const current = get().accounts.find((account) => account.id === id);
    if (!current) {
      return { error: 'Account not found.' };
    }

    const nextBalance = Number((current.balance + amountChange).toFixed(2));
    const { data, error } = await client
      .from('accounts')
      .update({ balance: nextBalance })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      set({ error: error.message });
      return { error: error.message };
    }

    set((state) => ({
      accounts: state.accounts.map((account) => (account.id === id ? mapAccountRow(data as AccountRow) : account)),
      error: null,
    }));

    return {};
  },

  resetAccounts: () => set({ accounts: [], initialized: false, loading: false, error: null }),
}));
