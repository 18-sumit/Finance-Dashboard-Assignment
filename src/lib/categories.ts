// No imports needed here

export interface CategorySpec {
  id: string;
  label: string;
  iconName: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Record<string, CategorySpec> = {
  food: { id: 'food', label: 'Food & Dining', iconName: 'Coffee', color: 'text-orange-500 bg-orange-100 dark:bg-orange-500/20' },
  transport: { id: 'transport', label: 'Transportation', iconName: 'Car', color: 'text-blue-500 bg-blue-100 dark:bg-blue-500/20' },
  shopping: { id: 'shopping', label: 'Shopping', iconName: 'ShoppingBag', color: 'text-pink-500 bg-pink-100 dark:bg-pink-500/20' },
  entertainment: { id: 'entertainment', label: 'Entertainment', iconName: 'Film', color: 'text-purple-500 bg-purple-100 dark:bg-purple-500/20' },
  health: { id: 'health', label: 'Health & Fitness', iconName: 'HeartPulse', color: 'text-rose-500 bg-rose-100 dark:bg-rose-500/20' },
  utilities: { id: 'utilities', label: 'Bills & Utilities', iconName: 'Zap', color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-500/20' },
  salary: { id: 'salary', label: 'Salary', iconName: 'Briefcase', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20' },
  freelance: { id: 'freelance', label: 'Freelance', iconName: 'Laptop', color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-500/20' },
  investment: { id: 'investment', label: 'Investments', iconName: 'TrendingUp', color: 'text-teal-500 bg-teal-100 dark:bg-teal-500/20' },
  rent: { id: 'rent', label: 'Rent', iconName: 'Home', color: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-500/20' },
  education: { id: 'education', label: 'Education', iconName: 'GraduationCap', color: 'text-sky-500 bg-sky-100 dark:bg-sky-500/20' },
  travel: { id: 'travel', label: 'Travel', iconName: 'Plane', color: 'text-violet-500 bg-violet-100 dark:bg-violet-500/20' },
  other: { id: 'other', label: 'Other', iconName: 'HelpCircle', color: 'text-slate-500 bg-slate-100 dark:bg-slate-500/20' },
};
