import { useMemo } from 'react';
import { useTransactionStore } from '../stores/transactionStore';
import { startOfMonth, endOfMonth, subMonths, isWithinInterval } from 'date-fns';

export const useInsights = () => {
  const { transactions } = useTransactionStore();

  return useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    let thisMonthIncome = 0;
    let thisMonthExpense = 0;
    let lastMonthIncome = 0;
    let lastMonthExpense = 0;

    const categorySpend: Record<string, number> = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const isThisMonth = isWithinInterval(date, { start: thisMonthStart, end: thisMonthEnd });
      const isLastMonth = isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd });

      if (isThisMonth) {
        if (t.type === 'income') thisMonthIncome += t.amount;
        if (t.type === 'expense') {
          thisMonthExpense += t.amount;
          categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
        }
      }

      if (isLastMonth) {
        if (t.type === 'income') lastMonthIncome += t.amount;
        if (t.type === 'expense') lastMonthExpense += t.amount;
      }
    });

    const savingsRateThisMonth = thisMonthIncome > 0 ? ((thisMonthIncome - thisMonthExpense) / thisMonthIncome) * 100 : 0;
    
    let topCategory = { name: 'None', amount: 0 };
    for (const [cat, amt] of Object.entries(categorySpend)) {
      if (amt > topCategory.amount) {
        topCategory = { name: cat, amount: amt };
      }
    }

    return {
      thisMonthIncome,
      thisMonthExpense,
      lastMonthIncome,
      lastMonthExpense,
      savingsRateThisMonth: Math.max(0, savingsRateThisMonth),
      topCategory,
      totalBalance: 0, // This is usually derived from Accounts
    };
  }, [transactions]);
};
