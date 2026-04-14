import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTransactionStore } from '../../stores/transactionStore';
import { format, subMonths, isAfter } from 'date-fns';
import { formatCurrency } from '../../lib/formatters';
import { EmptyState } from '../ui/EmptyState';
import { TrendingUp } from 'lucide-react';

export const BalanceTrendChart = () => {
  const { transactions } = useTransactionStore();

  const data = useMemo(() => {
    const result = Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return { monthStr: format(d, 'MMM'), yearMonth: format(d, 'yyyy-MM'), balance: 0 };
    });

    if (transactions.length === 0) {
      return result;
    }

    let cumulative = 0;

    const sorted = [...transactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const cutoff = subMonths(new Date(), 5);

    sorted.forEach((t) => {
      const isIncome = t.type === 'income';
      if (!isAfter(new Date(t.date), cutoff)) {
        cumulative += isIncome ? t.amount : -t.amount;
      }
    });

    result.forEach((r) => {
      const monthTransactions = sorted.filter((t) => format(new Date(t.date), 'yyyy-MM') === r.yearMonth);
      if (monthTransactions.length === 0) {
        r.balance = cumulative;
        return;
      }

      sorted.forEach((t) => {
        if (format(new Date(t.date), 'yyyy-MM') === r.yearMonth) {
          cumulative += t.type === 'income' ? t.amount : -t.amount;
        }
      });
      r.balance = cumulative;
    });

    return result;
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <Card className="col-span-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Balance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={TrendingUp}
            title="No balance history yet"
            description="Add your first income or expense transaction to see the trend chart."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Balance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="monthStr" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(val) => `₹${val / 1000}k`}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border rounded-lg shadow-sm p-3">
                        <span className="text-sm font-medium">{formatCurrency(payload[0].value as number)}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
