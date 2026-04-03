import { Account } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { MoreHorizontal, Trash2, Pencil, Wallet, Building, Smartphone, CreditCard } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useUIStore } from '../../stores/uiStore';
import { formatCurrency } from '../../lib/formatters';

const iconMap: Record<string, any> = {
  wallet: Wallet,
  building: Building,
  smartphone: Smartphone,
  'credit-card': CreditCard
};

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export const AccountCard = ({ account, onEdit, onDelete }: AccountCardProps) => {
  const role = useUIStore(s => s.role);
  const Icon = iconMap[account.icon] || Wallet;

  return (
    <Card className="shadow-sm relative overflow-hidden border-l-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200" style={{ borderLeftColor: account.color, borderRightColor: 'hsl(var(--primary) / 0.4)', borderTopColor: 'hsl(var(--primary) / 0.4)', borderBottomColor: 'hsl(var(--primary) / 0.4)' }}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{account.name}</h3>
              <p className="text-xs text-muted-foreground capitalize">{account.type} Account</p>
            </div>
          </div>
          {role === 'admin' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(account)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(account)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Current Balance</span>
          <span className="text-2xl font-bold tabular-nums">{formatCurrency(account.balance)}</span>
        </div>
      </CardContent>
    </Card>
  );
};
