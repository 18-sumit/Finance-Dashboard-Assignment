import { useInsights } from '../hooks/useInsights';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useTransactionStore } from '../stores/transactionStore';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
} from 'recharts';
import { formatCurrency, formatPercentage } from '../lib/formatters';
import { subDays, format, startOfMonth, getDay } from 'date-fns';
import { useMemo } from 'react';
import { useCategoryStore } from '../stores/categoryStore';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../stores/filterStore';
import { AlertTriangle, TrendingDown, Flame, CheckCircle } from 'lucide-react';

// ─── Expense Heatmap ──────────────────────────────────────────────────────────
const ExpenseHeatmap = () => {
  const { transactions } = useTransactionStore();
  const navigate = useNavigate();
  const { setSearch, resetFilters } = useFilterStore();

  const days = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => {
      const d = subDays(new Date(), 89 - i);
      const isExpense = (t: any) => t.type === 'expense';
      const dateStr = d.toISOString().split('T')[0];
      const items = transactions.filter(t => isExpense(t) && t.date.startsWith(dateStr));
      const spend = items.reduce((sum, t) => sum + t.amount, 0);
      return { date: d, spend, count: items.length };
    });
  }, [transactions]);

  const maxSpend = useMemo(() => Math.max(...days.map(d => d.spend), 1), [days]);

  const getColor = (spend: number) => {
    if (spend === 0) return 'bg-muted opacity-50 dark:opacity-30';
    const intensity = spend / maxSpend;
    if (intensity < 0.25) return 'bg-yellow-400 dark:bg-yellow-500';
    if (intensity < 0.5)  return 'bg-amber-500 dark:bg-amber-600';
    if (intensity < 0.75) return 'bg-orange-500 dark:bg-orange-600';
    return 'bg-red-500 dark:bg-red-600';
  };

  const handleDayClick = (dateStr: string) => {
    resetFilters();
    setSearch(dateStr);
    navigate('/transactions');
  };

  const monthLabels = useMemo(() => {
    const labels: { label: string, index: number }[] = [];
    let currentMonth = '';
    days.forEach((day, index) => {
      const month = format(day.date, 'MMM');
      if (month !== currentMonth) {
        labels.push({ label: month, index });
        currentMonth = month;
      }
    });
    return labels;
  }, [days]);

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Expense Heatmap (Last 90 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col overflow-x-auto">
          <div className="grid grid-rows-7 grid-flow-col gap-1 w-max relative group">
             {days.map((day, i) => (
              <div 
                 key={i}
                 onClick={() => handleDayClick(day.date.toISOString().split('T')[0])}
                 className={`group/box w-[10px] sm:w-[14px] h-[10px] sm:h-[14px] rounded-[2px] ${getColor(day.spend)} cursor-pointer hover:ring-2 ring-primary transition-all relative z-10 hover:z-50`}
               >
                  <div className="hidden group-hover/box:flex absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-background text-foreground text-xs rounded-md shadow-md border whitespace-nowrap z-50 flex-col gap-1 pointer-events-none font-medium">
                     <div>Date: <span className="font-semibold">{format(day.date, 'dd MMM yyyy')}</span></div>
                     <div>Spent: {formatCurrency(day.spend)}</div>
                     <div>Transactions: {day.count}</div>
                  </div>
               </div>
             ))}
          </div>

          <div className="relative h-6 mt-2 hidden sm:block">
            {monthLabels.map((lbl, i) => (
              <span 
                key={i} 
                className="absolute text-xs text-muted-foreground whitespace-nowrap"
                style={{ left: `calc(${Math.floor(lbl.index / 7)} * (14px + 0.25rem))` }}
              >
                {lbl.label}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-xs text-muted-foreground w-full flex-wrap gap-2">
          <span>Note: Hover over boxes to see details. Click a box to view that specific day's transactions.</span>
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-[2px] bg-muted opacity-50 dark:opacity-30" />
              <div className="w-3 h-3 rounded-[2px] bg-yellow-400 dark:bg-yellow-500" />
              <div className="w-3 h-3 rounded-[2px] bg-amber-500 dark:bg-amber-600" />
              <div className="w-3 h-3 rounded-[2px] bg-orange-500 dark:bg-orange-600" />
              <div className="w-3 h-3 rounded-[2px] bg-red-500 dark:bg-red-600" />
            </div>
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Day of Week Spending Radar ───────────────────────────────────────────────
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

const DayOfWeekChart = () => {
  const { transactions } = useTransactionStore();

  const { data, peakDay, peakPct } = useMemo(() => {
    const totals = Array(7).fill(0);
    const expenses = transactions.filter(t => t.type === 'expense');
    expenses.forEach(t => {
      const dow = getDay(new Date(t.date));
      totals[dow] += t.amount;
    });
    const grandTotal = totals.reduce((a, b) => a + b, 0) || 1;
    const data = DAY_NAMES.map((day, i) => ({
      day,
      amount: totals[i],
      pct: Math.round((totals[i] / grandTotal) * 100),
    }));
    const peak = data.reduce((a, b) => (a.amount > b.amount ? a : b));
    return { data, peakDay: peak.day, peakPct: peak.pct };
  }, [transactions]);

  return (
    <Card className="col-span-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Spending by Day of Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis tick={false} axisLine={false} />
              <Radar
                name="Spent"
                dataKey="amount"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.35}
                strokeWidth={2}
              />
              <Tooltip
                formatter={(val: any) => [formatCurrency(val), 'Spent']}
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <Flame className="h-4 w-4 text-indigo-400 shrink-0" />
          <p className="text-xs text-indigo-300">
            You spend <span className="font-bold text-indigo-200">{peakPct}%</span> of your weekly budget on <span className="font-bold text-indigo-200">{peakDay}</span>. Be mindful this {peakDay}!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Burn Rate & Forecast ─────────────────────────────────────────────────────
const BurnRateForecast = () => {
  const { transactions } = useTransactionStore();

  const { avgDailySpend, projectedSpend, income, daysInMonth, daysSoFar, status, statusLabel, overBy } = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const daysSoFar = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    let income = 0;
    let spent = 0;

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (d >= monthStart && d <= now) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') spent += t.amount;
      }
    });

    const avgDailySpend = daysSoFar > 0 ? spent / daysSoFar : 0;
    const projectedSpend = avgDailySpend * daysInMonth;
    const overBy = projectedSpend - income;
    const ratio = income > 0 ? projectedSpend / income : 0;

    let status: 'safe' | 'warning' | 'danger' = 'safe';
    if (ratio > 1) status = 'danger';
    else if (ratio > 0.8) status = 'warning';

    const statusLabel = status === 'safe' ? 'On Track' : status === 'warning' ? 'Warning' : 'Over Budget';

    return { avgDailySpend, projectedSpend, income, daysInMonth, daysSoFar, status, statusLabel, overBy };
  }, [transactions]);

  const progressPct = income > 0 ? Math.min((projectedSpend / income) * 100, 100) : 0;

  const barColor =
    status === 'safe' ? 'bg-emerald-500' :
    status === 'warning' ? 'bg-amber-500' : 'bg-rose-500';

  const textColor =
    status === 'safe' ? 'text-emerald-500' :
    status === 'warning' ? 'text-amber-500' : 'text-rose-500';

  const bgColor =
    status === 'safe' ? 'bg-emerald-500/10 border-emerald-500/20' :
    status === 'warning' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20';

  const Icon = status === 'safe' ? CheckCircle : status === 'warning' ? AlertTriangle : TrendingDown;

  return (
    <Card className="col-span-1 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Burn Rate & Forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col p-3 rounded-lg bg-muted/50">
            <span className="text-xs text-muted-foreground">Avg Daily Spend</span>
            <span className="text-lg font-bold tabular-nums mt-1">{formatCurrency(avgDailySpend)}</span>
            <span className="text-xs text-muted-foreground mt-0.5">{daysSoFar} days tracked</span>
          </div>
          <div className="flex flex-col p-3 rounded-lg bg-muted/50">
            <span className="text-xs text-muted-foreground">Projected This Month</span>
            <span className={`text-lg font-bold tabular-nums mt-1 ${textColor}`}>{formatCurrency(projectedSpend)}</span>
            <span className="text-xs text-muted-foreground mt-0.5">of {daysInMonth}-day month</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Projected vs Income</span>
            <span className={`font-semibold ${textColor}`}>{progressPct.toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹0</span>
            <span>Income: {formatCurrency(income)}</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 p-3 rounded-lg border ${bgColor}`}>
          <Icon className={`h-4 w-4 shrink-0 ${textColor}`} />
          <p className={`text-xs font-medium ${textColor}`}>
            {status === 'safe'
              ? `You're on track! Projected spend is ${formatPercentage(progressPct)} of income.`
              : status === 'warning'
              ? `Caution! You may use ${formatPercentage(progressPct)} of income this month.`
              : `Over budget by ${formatCurrency(overBy)} at current pace!`}
          </p>
        </div>

        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Income', value: income }, { name: 'Projected', value: projectedSpend }]} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis hide />
              <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                <Cell fill="#10B981" />
                <Cell fill={status === 'safe' ? '#6366F1' : status === 'warning' ? '#F59E0B' : '#EF4444'} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Need vs Want (Fixed vs Variable) ────────────────────────────────────────
const FIXED_CATEGORIES = ['rent', 'groceries', 'utilities', 'health', 'insurance', 'education', 'emi', 'loan'];
const VARIABLE_CATEGORIES = ['food-dining', 'entertainment', 'shopping', 'travel', 'subscriptions', 'personal', 'lifestyle'];

const NeedVsWant = () => {
  const { transactions } = useTransactionStore();
  const categories = useCategoryStore(s => s.categories);

  const { fixed, variable, other, total, fixedPct, variablePct, otherPct, needs50, wants30 } = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    let fixed = 0, variable = 0, other = 0;

    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      const d = new Date(t.date);
      if (d < monthStart || d > now) return;
      const catId = t.category.toLowerCase();
      if (FIXED_CATEGORIES.some(f => catId.includes(f))) fixed += t.amount;
      else if (VARIABLE_CATEGORIES.some(v => catId.includes(v))) variable += t.amount;
      else variable += t.amount; // default as variable
    });

    const total = fixed + variable + other || 1;
    const fixedPct = Math.round((fixed / total) * 100);
    const variablePct = Math.round((variable / total) * 100);
    const otherPct = 100 - fixedPct - variablePct;

    // 50/30/20 rule: Income not directly available here, estimate from expenses
    const needs50 = total * 0.5;
    const wants30 = total * 0.3;

    return { fixed, variable, other, total, fixedPct, variablePct, otherPct, needs50, wants30 };
  }, [transactions, categories]);

  const barSegments = [
    { label: 'Needs (Fixed)', pct: fixedPct, color: 'bg-indigo-500', textColor: 'text-indigo-400', amount: fixed },
    { label: 'Wants (Variable)', pct: variablePct, color: 'bg-rose-500', textColor: 'text-rose-400', amount: variable },
  ];

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Needs vs Wants — 50/30/20 Rule Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Stacked bar */}
        <div className="space-y-2">
          <div className="flex h-8 w-full rounded-lg overflow-hidden gap-0.5">
            {barSegments.map((seg, i) => (
              <div
                key={i}
                className={`${seg.color} flex items-center justify-center text-white text-xs font-semibold transition-all duration-700`}
                style={{ width: `${seg.pct}%` }}
                title={`${seg.label}: ${seg.pct}%`}
              >
                {seg.pct > 8 ? `${seg.pct}%` : ''}
              </div>
            ))}
            {otherPct > 0 && (
              <div
                className="bg-slate-500 flex items-center justify-center text-white text-xs"
                style={{ width: `${otherPct}%` }}
              />
            )}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Needs</span>
            <span>Wants</span>
          </div>
        </div>

        {/* Breakdown grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {barSegments.map((seg, i) => (
            <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${seg.color}`} />
                  <span className="text-sm font-semibold">{seg.label}</span>
                </div>
                <span className={`text-lg font-bold tabular-nums ${seg.textColor}`}>{formatCurrency(seg.amount)}</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${seg.color} rounded-full`} style={{ width: `${seg.pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {i === 0
                  ? `Ideal: ≤50% — You're at ${fixedPct}% ${fixedPct <= 50 ? '✅' : '⚠️'}`
                  : `Ideal: ≤30% — You're at ${variablePct}% ${variablePct <= 30 ? '✅' : '⚠️'}`}
              </p>
            </div>
          ))}
        </div>

        {/* 50/30/20 summary info */}
        <div className="p-3 rounded-lg bg-muted/50 border text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground text-sm">📐 50/30/20 Budget Rule</p>
          <p><span className="font-medium text-indigo-400">50% Needs:</span> Rent, bills, groceries, health — essentials you can't avoid.</p>
          <p><span className="font-medium text-rose-400">30% Wants:</span> Dining out, entertainment, shopping — lifestyle spending.</p>
          <p><span className="font-medium text-emerald-400">20% Savings:</span> Whatever stays after needs & wants — your future wealth.</p>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main InsightsPage ─────────────────────────────────────────────────────────
export const InsightsPage = () => {
  const { topCategory, lastMonthIncome, lastMonthExpense, thisMonthIncome, thisMonthExpense, savingsRateThisMonth } = useInsights();
  const categories = useCategoryStore(s => s.categories);
  
  const compData = [
    { name: 'Last Month', income: lastMonthIncome, expense: lastMonthExpense },
    { name: 'This Month', income: thisMonthIncome, expense: thisMonthExpense }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Insights</h2>
        <p className="text-muted-foreground">Analyze your spending patterns and habits.</p>
      </div>

      {/* Row 1: Original Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Category */}
        <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
          <CardHeader>
             <CardTitle className="text-base font-semibold">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="flex flex-col items-center justify-center py-4">
               {topCategory.name !== 'None' ? (
                 <>
                   <CategoryIcon category={topCategory.name as any} className="mb-2 scale-150" />
                   <h3 className="text-xl font-bold mt-4">{categories[topCategory.name]?.label || 'Unknown'}</h3>
                   <span className="text-muted-foreground mt-1 text-sm">Most spent this month</span>
                   <span className="text-2xl font-bold tabular-nums mt-4 text-rose-500">{formatCurrency(topCategory.amount)}</span>
                 </>
               ) : (
                 <span className="text-muted-foreground">No spending yet</span>
               )}
             </div>
          </CardContent>
        </Card>

        {/* Savings Rate Tracker */}
        <Card className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
          <CardHeader>
             <CardTitle className="text-base font-semibold">Savings Rate Tracker</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-4 relative">
             <div className="w-40 h-40 rounded-full border-[16px] border-muted flex items-center justify-center relative">
                <span className="text-3xl font-bold text-amber-500">{formatPercentage(savingsRateThisMonth)}</span>
             </div>
             <p className="mt-4 text-sm font-medium">{savingsRateThisMonth > 20 ? 'On Track ✅' : 'Needs attention ⚠️'}</p>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card className="shadow-sm md:col-span-2 lg:col-span-1 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-primary/40 group">
          <CardHeader>
             <CardTitle className="text-base font-semibold">Month Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }} />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sm text-emerald-500"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Income</div>
              <div className="flex items-center gap-1 text-sm text-rose-500"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Expense</div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Heatmap */}
        <ExpenseHeatmap />
      </div>

      {/* Row 2: New Advanced Insights */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Advanced Analytics</h3>
        <p className="text-sm text-muted-foreground mb-4">Deeper behavioral insights to improve your financial habits.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <DayOfWeekChart />
          <BurnRateForecast />
        </div>
      </div>

      {/* Row 3: Need vs Want */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <NeedVsWant />
      </div>
    </div>
  );
};
