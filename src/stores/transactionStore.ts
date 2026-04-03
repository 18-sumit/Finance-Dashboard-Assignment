import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction } from '../types';
import { mockTransactions } from '../lib/mockData';
import { useAccountStore } from './accountStore';

interface TransactionStore {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  resetAll: () => void;
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: mockTransactions,
      addTransaction: (t) => {
        const newTx = { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
        set((state) => ({
          transactions: [newTx, ...state.transactions]
        }));
        // Update account balance
        const balanceChange = t.type === 'income' ? t.amount : -t.amount;
        useAccountStore.getState().updateBalance(t.accountId, balanceChange);
      },
      updateTransaction: (id, updates) => {
        const oldTx = get().transactions.find(tx => tx.id === id);
        if(!oldTx) return;

        // If amount/type/accountId changes, we must adjust balance.
        // For simplicity, we reverse the old transaction effect and apply the new one.
        if (updates.amount !== undefined || updates.type !== undefined || updates.accountId !== undefined) {
          const oldBalanceChange = oldTx.type === 'income' ? -oldTx.amount : oldTx.amount;
          useAccountStore.getState().updateBalance(oldTx.accountId, oldBalanceChange);
          
          const newAmount = updates.amount ?? oldTx.amount;
          const newType = updates.type ?? oldTx.type;
          const newAccountId = updates.accountId ?? oldTx.accountId;
          
          const newBalanceChange = newType === 'income' ? newAmount : -newAmount;
          useAccountStore.getState().updateBalance(newAccountId, newBalanceChange);
        }

        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
        }));
      },
      deleteTransaction: (id) => {
        const tx = get().transactions.find(t => t.id === id);
        if(tx) {
          const revertChange = tx.type === 'income' ? -tx.amount : tx.amount;
          useAccountStore.getState().updateBalance(tx.accountId, revertChange);
        }
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },
      resetAll: () => {
        set({ transactions: mockTransactions });
      }
    }),
    { name: 'finance-transaction-storage' }
  )
);
