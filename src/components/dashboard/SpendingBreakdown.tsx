import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTransactionStore } from '../../stores/transactionStore';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatCurrency } from '../../lib/formatters';
import { useCategoryStore } from '../../stores/categoryStore';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

export const SpendingBreakdown = () => {
  const { transactions } = useTransactionStore();
  const categories = useCategoryStore((s) => s.categories);

  const { data, total } = useMemo(() => {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    const spendMap: Record<string, number> = {};
    let totalSpend = 0;

    transactions.forEach(t => {
      if (t.type === 'expense' && isWithinInterval(new Date(t.date), { start: thisMonthStart, end: thisMonthEnd })) {
        spendMap[t.category] = (spendMap[t.category] || 0) + t.amount;
        totalSpend += t.amount;
      }
    });

    const chartData = Object.entries(spendMap)
      .map(([cat, amount]) => {
         const cLabel = categories[cat]?.label || 'Unknown';
         return { name: cLabel, amount, cat };
      })
      .sort((a, b) => b.amount - a.amount);

    return { data: chartData, total: totalSpend };
  }, [transactions, categories]);

  return (
    <Card className="col-span-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="amount"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatCurrency(value as number)}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-muted-foreground">Total Spent</span>
            <span className="text-lg font-bold tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
