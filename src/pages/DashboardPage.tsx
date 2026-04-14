import { SummaryCards } from '../components/dashboard/SummaryCards';
import { BalanceTrendChart } from '../components/dashboard/BalanceTrendChart';
import { SpendingBreakdown } from '../components/dashboard/SpendingBreakdown';
import { AccountBalances } from '../components/dashboard/AccountBalances';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { BudgetSummaryWidget } from '../components/dashboard/BudgetSummaryWidget';
import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);

  const displayName = useMemo(() => {
    const rawName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email ||
      'there';

    const firstPart = rawName.split('@')[0].trim();
    return firstPart
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ') || 'there';
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Welcome, {displayName}</h2>
        <p className="text-muted-foreground">Your financial overview at a glance.</p>
      </div>

      <SummaryCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BalanceTrendChart />
        <SpendingBreakdown />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Accounts</h3>
        <AccountBalances />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <BudgetSummaryWidget />
      </div>
    </div>
  );
};
