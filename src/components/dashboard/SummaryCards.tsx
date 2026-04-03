import { useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useInsights } from '../../hooks/useInsights';
import { useAccountStore } from '../../stores/accountStore';
import { formatCurrency, formatPercentage } from '../../lib/formatters';

export const SummaryCards = () => {
  const { thisMonthIncome, thisMonthExpense, lastMonthIncome, lastMonthExpense, savingsRateThisMonth } = useInsights();
  const { accounts } = useAccountStore();
  
  const totalBalance = useMemo(() => accounts.reduce((acc, a) => acc + a.balance, 0), [accounts]);

  const incomeChange = lastMonthIncome ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;
  const expenseChange = lastMonthExpense ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
        <CardContent className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </div>
          <span className="text-3xl font-bold tabular-nums tracking-tight mt-2">{formatCurrency(totalBalance)}</span>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
        <CardContent className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Income</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <span className="text-3xl font-bold tabular-nums tracking-tight mt-2">{formatCurrency(thisMonthIncome)}</span>
          <div className="flex items-center gap-1 text-xs mt-1">
            {incomeChange > 0 ? (
              <span className="text-emerald-500 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1"/>{incomeChange.toFixed(1)}%</span>
            ) : (
              <span className="text-rose-500 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1"/>{Math.abs(incomeChange).toFixed(1)}%</span>
            )}
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
        <CardContent className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Expenses</span>
            <div className="h-8 w-8 rounded-full bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </div>
          </div>
          <span className="text-3xl font-bold tabular-nums tracking-tight mt-2">{formatCurrency(thisMonthExpense)}</span>
          <div className="flex items-center gap-1 text-xs mt-1">
            {expenseChange > 0 ? (
              <span className="text-rose-500 flex items-center"><ArrowUpRight className="h-3 w-3 mr-1"/>{expenseChange.toFixed(1)}%</span>
            ) : (
              <span className="text-emerald-500 flex items-center"><ArrowDownRight className="h-3 w-3 mr-1"/>{Math.abs(expenseChange).toFixed(1)}%</span>
            )}
            <span className="text-muted-foreground ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
        <CardContent className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Savings Rate</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <PiggyBank className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <span className="text-3xl font-bold tabular-nums tracking-tight mt-2">{formatPercentage(savingsRateThisMonth)}</span>
        </CardContent>
      </Card>
    </div>
  );
};
