import { useTransactionStore } from '../../stores/transactionStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CategoryIcon } from '../ui/CategoryIcon';
import { AmountBadge } from '../ui/AmountBadge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const RecentTransactions = () => {
  const { transactions } = useTransactionStore();
  
  // Get last 5 transactions sorted by date
  const recent = [...transactions]
    .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
      <CardHeader className="relative flex flex-row items-center justify-center pb-2">
        <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
        <Link to="/transactions" className="absolute right-6 text-sm text-primary hover:underline font-medium">
          View All
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {recent.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-4">No transactions yet.</div>
          ) : (
            recent.map(t => (
              <div key={t.id} className="grid grid-cols-3 items-center w-full group py-1">
                <div className="flex items-center justify-start">
                  <CategoryIcon category={t.category} />
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(t.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="flex justify-end">
                  <AmountBadge amount={t.amount} type={t.type} />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
