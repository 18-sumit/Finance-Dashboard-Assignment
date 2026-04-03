import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account } from '../types';
import { mockAccounts } from '../lib/mockData';

interface AccountStore {
  accounts: Account[];
  addAccount: (a: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateBalance: (id: string, amountChange: number) => void;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      accounts: mockAccounts,
      addAccount: (a) =>
        set((state) => ({
          accounts: [
            ...state.accounts,
            { ...a, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
          ]
        })),
      updateAccount: (id, updates) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a))
        })),
      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id)
        })),
      updateBalance: (id, amountChange) =>
        set((state) => ({
          accounts: state.accounts.map((a) => 
            a.id === id ? { ...a, balance: a.balance + amountChange } : a
          )
        }))
    }),
    { name: 'finance-account-storage' }
  )
);
