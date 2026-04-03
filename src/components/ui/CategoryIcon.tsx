import { useCategoryStore } from '../../stores/categoryStore';
import { cn } from '../../lib/utils';
import * as Icons from 'lucide-react';

export const CategoryIcon = ({ category, className }: { category: string; className?: string }) => {
  const categories = useCategoryStore(s => s.categories);
  const spec = categories[category] || categories['other'] || { iconName: 'HelpCircle', label: 'Unknown', color: 'text-slate-500 bg-slate-100' };
  
  // Dynamic icon resolution
  const IconComponent = (Icons as any)[spec.iconName] || Icons.HelpCircle;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', spec.color)}>
        <IconComponent className="h-4 w-4" />
      </div>
      <span className="font-medium text-sm text-foreground whitespace-nowrap">{spec.label}</span>
    </div>
  );
};
