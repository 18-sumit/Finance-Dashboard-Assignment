import { useMemo } from 'react';
import { useBudgetStore } from '../../stores/budgetStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatCurrency } from '../../lib/formatters';
import { Link } from 'react-router-dom';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '../../lib/utils';
import { Target } from 'lucide-react';

export const BudgetSummaryWidget = () => {
  const { budgets } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { transactions } = useTransactionStore();

  const items = useMemo(() => {
    const now = new Date();
    const interval = { start: startOfMonth(now), end: endOfMonth(now) };
    const spendMap: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense' && isWithinInterval(new Date(t.date), interval))
        spendMap[t.category] = (spendMap[t.category] || 0) + t.amount;
    });
    return budgets.map(b => {
      const spent = spendMap[b.categoryId] || 0;
      const pct = b.limit > 0 ? Math.min((spent / b.limit) * 100, 100) : 0;
      return { ...b, spent, pct, label: categories[b.categoryId]?.label || b.categoryId };
    }).sort((a, b) => b.pct - a.pct).slice(0, 5);
  }, [budgets, transactions, categories]);

  if (budgets.length === 0) return null;

  return (
    <Card className="col-span-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
      <CardHeader className="relative flex flex-row items-center justify-center pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Budget Overview
        </CardTitle>
        <Link to="/budget" className="absolute right-6 text-sm text-primary hover:underline font-medium">
          Manage
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mt-1">
          {items.map(item => {
            const color = item.pct >= 100 ? 'bg-rose-500' : item.pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500';
            const textColor = item.pct >= 100 ? 'text-rose-500' : item.pct >= 80 ? 'text-amber-500' : 'text-emerald-500';
            return (
              <div key={item.categoryId} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium truncate max-w-[140px]">{item.label}</span>
                  <span className={cn('text-xs font-semibold tabular-nums', textColor)}>
                    {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
