import { Account, Transaction } from '../types';
import { subDays, subMonths } from 'date-fns';

export const mockAccounts: Account[] = [
  { id: 'acc_1', name: 'HDFC Savings', type: 'bank', balance: 125000, color: 'bg-blue-500', icon: 'building', createdAt: new Date().toISOString() },
  { id: 'acc_2', name: 'Paytm Wallet', type: 'wallet', balance: 5400, color: 'bg-sky-400', icon: 'wallet', createdAt: new Date().toISOString() },
  { id: 'acc_3', name: 'GPay UPI', type: 'upi', balance: 18500, color: 'bg-emerald-500', icon: 'smartphone', createdAt: new Date().toISOString() },
  { id: 'acc_4', name: 'ICICI Credit', type: 'credit', balance: 45000, color: 'bg-rose-500', icon: 'credit-card', createdAt: new Date().toISOString() }
];

// Helper to generate a date offset from today (within this month)
const d = (days: number) => subDays(new Date(), days).toISOString();
const dm = (months: number) => subMonths(new Date(), months).toISOString();

export const mockTransactions: Transaction[] = [
  // ───────────────────────────────────────────────────────────────────────────
  // THIS MONTH — Income
  // ───────────────────────────────────────────────────────────────────────────
  { id: 't_1',  title: 'Monthly Salary',    amount: 85000, type: 'income',  category: 'salary',     accountId: 'acc_1', date: d(2),  createdAt: d(2)  },
  { id: 't_4',  title: 'Freelance IT',      amount: 25000, type: 'income',  category: 'freelance',  accountId: 'acc_1', date: d(5),  createdAt: d(5)  },
  { id: 't_20', title: 'Dividends',         amount: 3200,  type: 'income',  category: 'investment', accountId: 'acc_1', date: d(8),  createdAt: d(8)  },
  { id: 't_26', title: 'Side Project',      amount: 12000, type: 'income',  category: 'freelance',  accountId: 'acc_1', date: d(12), createdAt: d(12) },
  { id: 't_31', title: 'Interest Earned',   amount: 1100,  type: 'income',  category: 'investment', accountId: 'acc_1', date: d(16), createdAt: d(16) },
  { id: 't_35', title: 'Cashback Reward',   amount: 600,   type: 'income',  category: 'other',      accountId: 'acc_2', date: d(17), createdAt: d(17) },

  // ───────────────────────────────────────────────────────────────────────────
  // THIS MONTH — NEEDS (Rent + Food + Utilities + Transport + Health)
  // Target ≈ 50% of ₹85k = ₹42,500
  // ───────────────────────────────────────────────────────────────────────────
  { id: 't_9',  title: 'House Rent',        amount: 22000, type: 'expense', category: 'rent',       accountId: 'acc_1', date: d(1),  createdAt: d(1)  },
  { id: 't_2',  title: 'Groceries',         amount: 3500,  type: 'expense', category: 'food',       accountId: 'acc_3', date: d(3),  createdAt: d(3)  },
  { id: 't_7',  title: 'Dinner Out',        amount: 2400,  type: 'expense', category: 'food',       accountId: 'acc_3', date: d(8),  createdAt: d(8)  },
  { id: 't_12', title: 'Coffee & Snacks',   amount: 850,   type: 'expense', category: 'food',       accountId: 'acc_2', date: d(1),  createdAt: d(1)  },
  { id: 't_16', title: 'Swiggy Order',      amount: 780,   type: 'expense', category: 'food',       accountId: 'acc_2', date: d(9),  createdAt: d(9)  },
  { id: 't_23', title: 'Weekend Brunch',    amount: 1800,  type: 'expense', category: 'food',       accountId: 'acc_3', date: d(2),  createdAt: d(2)  },
  { id: 't_47', title: 'Supermarket Run',   amount: 2700,  type: 'expense', category: 'food',       accountId: 'acc_3', date: d(4),  createdAt: d(4)  },
  { id: 't_6',  title: 'Internet Bill',     amount: 1500,  type: 'expense', category: 'utilities',  accountId: 'acc_4', date: d(7),  createdAt: d(7)  },
  { id: 't_13', title: 'Electric Bill',     amount: 2100,  type: 'expense', category: 'utilities',  accountId: 'acc_3', date: d(6),  createdAt: d(6)  },
  { id: 't_21', title: 'Water Bill',        amount: 900,   type: 'expense', category: 'utilities',  accountId: 'acc_3', date: d(8),  createdAt: d(8)  },
  { id: 't_25', title: 'Phone Recharge',    amount: 799,   type: 'expense', category: 'utilities',  accountId: 'acc_2', date: d(11), createdAt: d(11) },
  { id: 't_33', title: 'Gas Bill',          amount: 700,   type: 'expense', category: 'utilities',  accountId: 'acc_3', date: d(13), createdAt: d(13) },
  { id: 't_3',  title: 'Uber',              amount: 450,   type: 'expense', category: 'transport',  accountId: 'acc_2', date: d(4),  createdAt: d(4)  },
  { id: 't_17', title: 'Petrol',            amount: 2500,  type: 'expense', category: 'transport',  accountId: 'acc_3', date: d(7),  createdAt: d(7)  },
  { id: 't_22', title: 'Auto Rickshaw',     amount: 220,   type: 'expense', category: 'transport',  accountId: 'acc_2', date: d(9),  createdAt: d(9)  },
  { id: 't_29', title: 'Metro Pass',        amount: 500,   type: 'expense', category: 'transport',  accountId: 'acc_2', date: d(10), createdAt: d(10) },
  { id: 't_10', title: 'Gym Membership',    amount: 3000,  type: 'expense', category: 'health',     accountId: 'acc_4', date: d(5),  createdAt: d(5)  },
  { id: 't_28', title: 'Doctor Visit',      amount: 1200,  type: 'expense', category: 'health',     accountId: 'acc_4', date: d(14), createdAt: d(14) },

  // ───────────────────────────────────────────────────────────────────────────
  // THIS MONTH — WANTS (Shopping + Entertainment + Travel)
  // Target ≈ 30% of ₹85k = ₹25,500
  // ───────────────────────────────────────────────────────────────────────────
  { id: 't_5',  title: 'Amazon Shopping',    amount: 5800,  type: 'expense', category: 'shopping',      accountId: 'acc_4', date: d(6),  createdAt: d(6)  },
  { id: 't_14', title: 'Zara Clothing',      amount: 5600,  type: 'expense', category: 'shopping',      accountId: 'acc_4', date: d(10), createdAt: d(10) },
  { id: 't_27', title: 'Home Decor',         amount: 3400,  type: 'expense', category: 'shopping',      accountId: 'acc_4', date: d(13), createdAt: d(13) },
  { id: 't_45', title: 'Sports Gear',        amount: 3200,  type: 'expense', category: 'shopping',      accountId: 'acc_4', date: d(11), createdAt: d(11) },
  { id: 't_18', title: 'Movie Night',        amount: 1200,  type: 'expense', category: 'entertainment', accountId: 'acc_4', date: d(4),  createdAt: d(4)  },
  { id: 't_24', title: 'Netflix Subscription', amount: 649, type: 'expense', category: 'entertainment', accountId: 'acc_4', date: d(3),  createdAt: d(3)  },
  { id: 't_34', title: 'Spotify Premium',    amount: 199,   type: 'expense', category: 'entertainment', accountId: 'acc_2', date: d(5),  createdAt: d(5)  },
  { id: 't_44', title: 'BookMyShow Tickets', amount: 800,   type: 'expense', category: 'entertainment', accountId: 'acc_4', date: d(6),  createdAt: d(6)  },
  { id: 't_32', title: 'Weekend Getaway',    amount: 4800,  type: 'expense', category: 'travel',        accountId: 'acc_4', date: d(12), createdAt: d(12) },
  { id: 't_46', title: 'Day Trip',           amount: 1800,  type: 'expense', category: 'travel',        accountId: 'acc_3', date: d(9),  createdAt: d(9)  },

  // ───────────────────────────────────────────────────────────────────────────
  // THIS MONTH — Other / Investments / Education
  // ───────────────────────────────────────────────────────────────────────────
  { id: 't_11', title: 'Mutual Fund SIP',   amount: 10000, type: 'expense', category: 'investment', accountId: 'acc_1', date: d(3),  createdAt: d(3)  },
  { id: 't_19', title: 'Stock SIP',         amount: 5000,  type: 'expense', category: 'investment', accountId: 'acc_1', date: d(4),  createdAt: d(4)  },
  { id: 't_30', title: 'Online Course',     amount: 2999,  type: 'expense', category: 'education',  accountId: 'acc_3', date: d(15), createdAt: d(15) },

  // ───────────────────────────────────────────────────────────────────────────
  // LAST MONTH — for comparison charts & heatmap coverage
  // ───────────────────────────────────────────────────────────────────────────
  { id: 't_L1',  title: 'Salary',             amount: 85000, type: 'income',  category: 'salary',     accountId: 'acc_1', date: dm(1), createdAt: dm(1) },
  { id: 't_L2',  title: 'Freelance',          amount: 18000, type: 'income',  category: 'freelance',  accountId: 'acc_1', date: dm(1), createdAt: dm(1) },
  { id: 't_L3',  title: 'Rent',               amount: 22000, type: 'expense', category: 'rent',       accountId: 'acc_1', date: dm(1), createdAt: dm(1) },
  { id: 't_L4',  title: 'Groceries',          amount: 4200,  type: 'expense', category: 'food',       accountId: 'acc_3', date: dm(1), createdAt: dm(1) },
  { id: 't_L5',  title: 'Shopping',           amount: 9800,  type: 'expense', category: 'shopping',   accountId: 'acc_4', date: dm(1), createdAt: dm(1) },
  { id: 't_L6',  title: 'Utilities',          amount: 5600,  type: 'expense', category: 'utilities',  accountId: 'acc_3', date: dm(1), createdAt: dm(1) },
  { id: 't_L7',  title: 'Gym',                amount: 3000,  type: 'expense', category: 'health',     accountId: 'acc_4', date: dm(1), createdAt: dm(1) },
  { id: 't_L8',  title: 'Flight Tickets',     amount: 12000, type: 'expense', category: 'travel',     accountId: 'acc_4', date: dm(1), createdAt: dm(1) },
  { id: 't_L9',  title: 'Entertainment',      amount: 3500,  type: 'expense', category: 'entertainment', accountId: 'acc_4', date: dm(1), createdAt: dm(1) },
  { id: 't_L10', title: 'Gym Trainer',        amount: 2000,  type: 'expense', category: 'health',     accountId: 'acc_4', date: dm(1), createdAt: dm(1) },
];
