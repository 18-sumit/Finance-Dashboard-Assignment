import { cn } from '../../lib/utils';
import { formatCurrency } from '../../lib/formatters';

interface AmountBadgeProps {
  amount: number;
  type: 'income' | 'expense';
  className?: string;
}

export const AmountBadge = ({ amount, type, className }: AmountBadgeProps) => {
  const isIncome = type === 'income';
  const prefix = isIncome ? '+' : '-';
  
  return (
    <span className={cn(
      'font-semibold tabular-nums text-right',
      isIncome ? 'text-emerald-500' : 'text-rose-500',
      className
    )}>
      {prefix}{formatCurrency(amount)}
    </span>
  );
};
