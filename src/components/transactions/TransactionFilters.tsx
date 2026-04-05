import { useFilterStore } from '../../stores/filterStore';
import { useAccountStore } from '../../stores/accountStore';
import { Search, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TransactionType } from '../../types';
import { useCategoryStore } from '../../stores/categoryStore';
import { Button } from '../ui/button';

export const TransactionFilters = () => {
  const accountStore = useAccountStore();
  const filterStore = useFilterStore();
  const categories = useCategoryStore((s) => s.categories);

  const handleReset = () => filterStore.resetFilters();
  const hasFilters = filterStore.search !== '' || filterStore.type !== 'all' || filterStore.category !== 'all' || filterStore.accountId !== 'all';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-card p-4 rounded-xl border shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search transactions..."
          value={filterStore.search}
          onChange={(e) => filterStore.setSearch(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors pl-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterStore.accountId} onValueChange={filterStore.setAccountId}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accountStore.accounts.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStore.type} onValueChange={(v) => filterStore.setType(v as TransactionType | 'all')}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStore.datePreset} onValueChange={(v) => filterStore.setDatePreset(v as any)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
            <SelectItem value="3_months">Last 3 Months</SelectItem>
            <SelectItem value="6_months">Last 6 Months</SelectItem>
            <SelectItem value="9_months">Last 9 Months</SelectItem>
            <SelectItem value="1_year">Last 1 Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStore.category} onValueChange={(v) => filterStore.setCategory(v as any)}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.values(categories).map(c => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-9 px-2 text-muted-foreground">
            <X className="h-4 w-4 mr-1" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
};
