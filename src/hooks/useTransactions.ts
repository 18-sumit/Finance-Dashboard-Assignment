import { useTransactionStore } from '../stores/transactionStore';
import { useFilterStore } from '../stores/filterStore';
import { isWithinInterval, parseISO, subMonths, subYears, startOfMonth, endOfMonth, endOfDay } from 'date-fns';
export const useTransactions = () => {
  const { transactions } = useTransactionStore();
  const { search, type, category, accountId, datePreset, sortBy, sortOrder } = useFilterStore();

  const filtered = transactions.filter((t: any) => {
    // 1. Search filter
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.date.includes(search)) {
      return false;
    }
    // 2. Type filter
    if (type !== 'all' && t.type !== type) {
      return false;
    }
    // 3. Category filter
    if (category !== 'all' && t.category !== category) {
      return false;
    }
    // 4. Account filter
    if (accountId !== 'all' && t.accountId !== accountId) {
      return false;
    }
    // 5. Date Preset filter
    if (datePreset !== 'all') {
      const d = parseISO(t.date);
      const now = new Date();
      let start, end;
      
      switch (datePreset) {
        case 'this_month':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case 'last_month': {
          const l = subMonths(now, 1);
          start = startOfMonth(l);
          end = endOfMonth(l);
          break;
        }
        case '3_months':
          start = subMonths(now, 3);
          end = endOfDay(now);
          break;
        case '6_months':
          start = subMonths(now, 6);
          end = endOfDay(now);
          break;
        case '9_months':
          start = subMonths(now, 9);
          end = endOfDay(now);
          break;
        case '1_year':
          start = subYears(now, 1);
          end = endOfDay(now);
          break;
        default:
          start = new Date(0);
          end = now;
      }
      
      if (!isWithinInterval(d, { start, end })) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date') {
      comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'amount') {
      comparison = b.amount - a.amount;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  return sorted;
};
