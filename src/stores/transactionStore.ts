import { create } from 'zustand';
import { Transaction, TransactionType } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useAccountStore } from './accountStore';
import { useAuthStore } from './authStore';

type TransactionRow = {
  id: string;
  user_id: string;
  title: string;
  amount: number | string;
  type: TransactionType;
  category_id: string;
  account_id: string;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

const mapTransactionRow = (row: TransactionRow): Transaction => ({
  id: row.id,
  title: row.title,
  amount: Number(row.amount),
  type: row.type,
  category: row.category_id,
  accountId: row.account_id,
  date: new Date(row.date).toISOString(),
  note: row.note ?? undefined,
  createdAt: row.created_at,
});

const getUserId = () => useAuthStore.getState().user?.id;

interface TransactionStore {
  transactions: Transaction[];
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initializeTransactions: () => Promise<(() => void) | void>;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<{ error?: string }>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<{ error?: string }>;
  deleteTransaction: (id: string) => Promise<{ error?: string }>;
  resetTransactions: () => void;
}

export const useTransactionStore = create<TransactionStore>()((set, get) => ({
  transactions: [],
  initialized: false,
  loading: false,
  error: null,

  initializeTransactions: async () => {
    if (!isSupabaseConfigured || !supabase) {
      set({ transactions: [], initialized: true, loading: false, error: 'Supabase env vars are missing.' });
      return;
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      set({ transactions: [], initialized: true, loading: false, error: null });
      return;
    }

    const loadTransactions = async () => {
      const { data, error } = await client
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        set({ error: error.message });
        return;
      }

      set({ transactions: ((data as TransactionRow[] | null) ?? []).map(mapTransactionRow), initialized: true, loading: false, error: null });
    };

    set({ loading: true, error: null });
    await loadTransactions();

    const channel = client
      .channel(`transactions:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, () => {
        void loadTransactions();
      })
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  },

  addTransaction: async (t) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const userId = getUserId();
    if (!userId) {
      const error = 'You must be signed in to add a transaction.';
      set({ error });
      return { error };
    }

    set({ loading: true, error: null });
    const { data, error } = await client
      .from('transactions')
      .insert({
        user_id: userId,
        title: t.title,
        amount: t.amount,
        type: t.type,
        category_id: t.category,
        account_id: t.accountId,
        date: new Date(t.date).toISOString().slice(0, 10),
        note: t.note ?? null,
      })
      .select('*')
      .single();

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    const createdTx = mapTransactionRow(data as TransactionRow);
    set((state) => ({
      transactions: [createdTx, ...state.transactions],
      loading: false,
      error: null,
    }));

    const balanceChange = t.type === 'income' ? t.amount : -t.amount;
    await useAccountStore.getState().updateBalance(t.accountId, balanceChange);
    return {};
  },

  updateTransaction: async (id, updates) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const oldTx = get().transactions.find((tx) => tx.id === id);
    if (!oldTx) {
      return { error: 'Transaction not found.' };
    }

    const nextAmount = updates.amount ?? oldTx.amount;
    const nextType = updates.type ?? oldTx.type;
    const nextAccountId = updates.accountId ?? oldTx.accountId;
    const nextCategory = updates.category ?? oldTx.category;
    const nextDate = updates.date ?? oldTx.date;
    const nextNote = updates.note ?? oldTx.note;
    const nextTitle = updates.title ?? oldTx.title;

    set({ loading: true, error: null });
    const { data, error } = await client
      .from('transactions')
      .update({
        title: nextTitle,
        amount: nextAmount,
        type: nextType,
        category_id: nextCategory,
        account_id: nextAccountId,
        date: new Date(nextDate).toISOString().slice(0, 10),
        note: nextNote ?? null,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    if (updates.amount !== undefined || updates.type !== undefined || updates.accountId !== undefined) {
      const oldBalanceChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
      await useAccountStore.getState().updateBalance(oldTx.accountId, oldBalanceChange);

      const newBalanceChange = nextType === 'income' ? nextAmount : -nextAmount;
      await useAccountStore.getState().updateBalance(nextAccountId, newBalanceChange);
    }

    set((state) => ({
      transactions: state.transactions.map((tx) => (tx.id === id ? mapTransactionRow(data as TransactionRow) : tx)),
      loading: false,
      error: null,
    }));

    return {};
  },

  deleteTransaction: async (id) => {
    if (!isSupabaseConfigured || !supabase) {
      const error = 'Supabase env vars are missing.';
      set({ error });
      return { error };
    }

    const client = supabase;

    const tx = get().transactions.find((transaction) => transaction.id === id);
    if (!tx) {
      return { error: 'Transaction not found.' };
    }

    set({ loading: true, error: null });
    const { error } = await client.from('transactions').delete().eq('id', id);
    if (error) {
      set({ loading: false, error: error.message });
      return { error: error.message };
    }

    const revertChange = tx.type === 'income' ? -tx.amount : tx.amount;
    await useAccountStore.getState().updateBalance(tx.accountId, revertChange);

    set((state) => ({
      transactions: state.transactions.filter((transaction) => transaction.id !== id),
      loading: false,
      error: null,
    }));

    return {};
  },

  resetTransactions: () => set({ transactions: [], initialized: false, loading: false, error: null }),
}));
