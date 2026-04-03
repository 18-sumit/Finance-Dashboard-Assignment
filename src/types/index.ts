export type Role = 'admin' | 'viewer';

export type AccountType = 'bank' | 'wallet' | 'upi' | 'credit' | 'savings';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export type Category = string;

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  accountId: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface FilterState {
  search: string;
  type: TransactionType | 'all';
  category: Category | 'all';
  accountId: string | 'all';
  dateRange: { from: string | null; to: string | null };
  sortBy: 'date' | 'amount' | 'title';
  sortOrder: 'asc' | 'desc';
}
