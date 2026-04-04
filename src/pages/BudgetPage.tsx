import { useState, useMemo } from 'react';
import { useBudgetStore } from '../stores/budgetStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useUIStore } from '../stores/uiStore';
import { formatCurrency } from '../lib/formatters';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Target, Pencil, Trash2, Plus, CheckCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { cn } from '../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface BudgetFormState {
  categoryId: string;
  limit: string;
}

// ─── Budget Status Helper ─────────────────────────────────────────────────────
const getStatus = (spent: number, limit: number) => {
  const pct = limit > 0 ? (spent / limit) * 100 : 0;
  if (pct >= 100) return { label: 'Over Budget', color: 'text-rose-500', barColor: 'bg-rose-500', bgColor: 'bg-rose-500/10 border-rose-500/20', Icon: TrendingDown };
  if (pct >= 80)  return { label: 'Warning',     color: 'text-amber-500', barColor: 'bg-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20', Icon: AlertTriangle };
  return              { label: 'On Track',    color: 'text-emerald-500', barColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20', Icon: CheckCircle };
};

// ─── BudgetPage ───────────────────────────────────────────────────────────────
export const BudgetPage = () => {
  const { budgets, setBudget, removeBudget } = useBudgetStore();
  const { categories } = useCategoryStore();
  const { transactions } = useTransactionStore();
  const role = useUIStore(s => s.role);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<BudgetFormState>({ categoryId: '', limit: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Calculate this month's actual spend per category
  const spendMap = useMemo(() => {
    const now = new Date();
    const interval = { start: startOfMonth(now), end: endOfMonth(now) };
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense' && isWithinInterval(new Date(t.date), interval)) {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });
    return map;
  }, [transactions]);

  // Summary stats
  const summary = useMemo(() => {
    let totalLimit = 0, totalSpent = 0, overCount = 0;
    budgets.forEach(b => {
      totalLimit += b.limit;
      const spent = spendMap[b.categoryId] || 0;
      totalSpent += spent;
      if (spent > b.limit) overCount++;
    });
    return { totalLimit, totalSpent, overCount, healthPct: totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0 };
  }, [budgets, spendMap]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ categoryId: Object.keys(categories)[0] || '', limit: '' });
    setModalOpen(true);
  };

  const openEdit = (categoryId: string, limit: number) => {
    setEditingId(categoryId);
    setForm({ categoryId, limit: limit.toString() });
    setModalOpen(true);
  };

  const handleSave = () => {
    const lim = parseFloat(form.limit);
    if (!form.categoryId || isNaN(lim) || lim <= 0) return;
    setBudget(form.categoryId, lim);
    setModalOpen(false);
  };

  // Categories not yet budgeted (for Add modal)
  const unbudgetedCategories = Object.values(categories).filter(
    c => !budgets.some(b => b.categoryId === c.id) || c.id === editingId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budget Planner</h2>
          <p className="text-muted-foreground">Set monthly spending limits per category and track your progress.</p>
        </div>
        {role === 'admin' && (
          <Button onClick={openAdd} disabled={unbudgetedCategories.filter(c => !budgets.some(b => b.categoryId === c.id)).length === 0}>
            <Plus className="mr-2 h-4 w-4" /> Set Budget
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Total Budget</span>
              <span className="text-2xl font-bold tabular-nums text-primary">{formatCurrency(summary.totalLimit)}</span>
              <span className="text-xs text-muted-foreground">{budgets.length} categories</span>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Spent This Month</span>
              <span className={cn('text-2xl font-bold tabular-nums', summary.healthPct >= 100 ? 'text-rose-500' : summary.healthPct >= 80 ? 'text-amber-500' : 'text-emerald-500')}>
                {formatCurrency(summary.totalSpent)}
              </span>
              <span className="text-xs text-muted-foreground">{summary.healthPct.toFixed(0)}% of total budget</span>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
            <CardContent className="p-5 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Remaining</span>
              <span className="text-2xl font-bold tabular-nums text-foreground">{formatCurrency(Math.max(summary.totalLimit - summary.totalSpent, 0))}</span>
              {summary.overCount > 0 && (
                <span className="text-xs text-rose-500">{summary.overCount} categor{summary.overCount > 1 ? 'ies' : 'y'} over limit ⚠️</span>
              )}
              {summary.overCount === 0 && <span className="text-xs text-emerald-500">All categories within limits ✅</span>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overall budget health bar */}
      {budgets.length > 0 && (
        <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Overall Budget Health</span>
              <span className={cn('font-semibold', summary.healthPct >= 100 ? 'text-rose-500' : summary.healthPct >= 80 ? 'text-amber-500' : 'text-emerald-500')}>
                {summary.healthPct.toFixed(1)}% used
              </span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-700', summary.healthPct >= 100 ? 'bg-rose-500' : summary.healthPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500')}
                style={{ width: `${summary.healthPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₹0</span>
              <span>Total Limit: {formatCurrency(summary.totalLimit)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget cards grid */}
      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">No Budgets Set Yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Set monthly spending limits for your categories to track how much you've spent vs. your goal.
          </p>
          {role === 'admin' && (
            <Button onClick={openAdd} className="mt-2"><Plus className="mr-2 h-4 w-4" /> Set Your First Budget</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const spent = spendMap[budget.categoryId] || 0;
            const pct = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
            const remaining = Math.max(budget.limit - spent, 0);
            const { label, color, barColor, bgColor, Icon } = getStatus(spent, budget.limit);

            return (
              <Card
                key={budget.categoryId}
                className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Category + actions */}
                  <div className="flex items-center justify-between">
                    <CategoryIcon category={budget.categoryId} />
                    {role === 'admin' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(budget.categoryId, budget.limit)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBudget(budget.categoryId)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Spent vs Limit */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Spent</p>
                      <p className={cn('text-xl font-bold tabular-nums', color)}>{formatCurrency(spent)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-0.5">Limit</p>
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(budget.limit)}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', barColor)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{pct.toFixed(0)}% used</span>
                      <span>{spent > budget.limit ? `${formatCurrency(spent - budget.limit)} over` : `${formatCurrency(remaining)} left`}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium', bgColor, color)}>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                    {spent > budget.limit && ` — over by ${formatCurrency(spent - budget.limit)}`}
                    {spent <= budget.limit && spent / budget.limit >= 0.8 && ` — nearing limit`}
                    {spent / budget.limit < 0.8 && ` — looking good!`}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Budget Limit' : 'Set Budget for Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                style={{ colorScheme: 'inherit' }}
                value={form.categoryId}
                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                disabled={!!editingId}
              >
                {(editingId
                  ? Object.values(categories).filter(c => c.id === editingId)
                  : unbudgetedCategories.filter(c => !budgets.some(b => b.categoryId === c.id))
                ).map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            {/* Limit amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Limit (₹)</label>
              <input
                type="number"
                min="1"
                step="100"
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. 5000"
                value={form.limit}
                onChange={e => setForm({ ...form, limit: e.target.value })}
              />
            </div>
            {/* Preview bar */}
            {form.limit && parseFloat(form.limit) > 0 && form.categoryId && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current spend this month</span>
                  <span className="font-medium">{formatCurrency(spendMap[form.categoryId] || 0)} / {formatCurrency(parseFloat(form.limit))}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', getStatus(spendMap[form.categoryId] || 0, parseFloat(form.limit)).barColor)}
                    style={{ width: `${Math.min(((spendMap[form.categoryId] || 0) / parseFloat(form.limit)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.categoryId || !form.limit || parseFloat(form.limit) <= 0}>
              {editingId ? 'Update Budget' : 'Set Budget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
