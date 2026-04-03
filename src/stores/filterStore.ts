import { create } from 'zustand';
export type DatePreset = 'all' | 'this_month' | 'last_month' | '3_months' | '6_months' | '9_months' | '1_year';

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense' | 'transfer';
  category: string;
  accountId: string;
  datePreset: DatePreset;
  sortBy: 'date' | 'amount' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface FilterStore extends FilterState {
  setSearch: (s: string) => void;
  setType: (t: FilterState['type']) => void;
  setCategory: (c: FilterState['category']) => void;
  setAccountId: (id: string) => void;
  setDatePreset: (preset: DatePreset) => void;
  setSortBy: (field: FilterState['sortBy']) => void;
  toggleSortOrder: () => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  search: '',
  type: 'all',
  category: 'all',
  accountId: 'all',
  datePreset: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setType: (type) => set({ type }),
  setCategory: (category) => set({ category }),
  setAccountId: (accountId) => set({ accountId }),
  setDatePreset: (datePreset) => set({ datePreset }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleSortOrder: () =>
    set((state) => ({
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
    })),
  resetFilters: () => set(initialState),
}));
