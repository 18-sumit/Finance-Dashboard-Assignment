import { Card, CardContent } from '../ui/card';
import { useAccountStore } from '../../stores/accountStore';
import { formatCurrency } from '../../lib/formatters';
import { CreditCard, Smartphone, Wallet, Building } from 'lucide-react';
import { AccountType } from '../../types';

const typeIcons: Record<AccountType, any> = {
  bank: Building,
  wallet: Wallet,
  upi: Smartphone,
  credit: CreditCard,
  savings: Building
};

export const AccountBalances = () => {
  const { accounts } = useAccountStore();

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
      {accounts.map(acc => {
        const Icon = typeIcons[acc.type];
        return (
          <Card key={acc.id} className="min-w-[240px] snap-start shadow-sm border-l-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group" style={{ borderLeftColor: acc.color }}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-sm">{acc.name}</h4>
                  <p className="text-xs text-muted-foreground capitalize">{acc.type}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-2 text-xl font-bold tabular-nums">
                {formatCurrency(acc.balance)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
