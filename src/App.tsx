import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsPage } from './pages/AccountsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InsightsPage } from './pages/InsightsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BudgetPage } from './pages/BudgetPage';
import { AuthPage } from './pages/AuthPage';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useAccountStore } from './stores/accountStore';
import { useTransactionStore } from './stores/transactionStore';
import { useCategoryStore } from './stores/categoryStore';
import { useBudgetStore } from './stores/budgetStore';

const AppLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const userId = useAuthStore((s) => s.user?.id);
  const initializeAccounts = useAccountStore((s) => s.initializeAccounts);
  const initializeTransactions = useTransactionStore((s) => s.initializeTransactions);
  const initializeCategories = useCategoryStore((s) => s.initializeCategories);
  const initializeBudgets = useBudgetStore((s) => s.initializeBudgets);
  const resetAccounts = useAccountStore((s) => s.resetAccounts);
  const resetTransactions = useTransactionStore((s) => s.resetTransactions);
  const resetCategories = useCategoryStore((s) => s.resetCategories);
  const resetBudgets = useBudgetStore((s) => s.resetBudgets);

  useEffect(() => {
    let unsubscribe: (() => void) | void;

    void initialize().then((fn) => {
      unsubscribe = fn;
    });

    return () => {
      unsubscribe?.();
    };
  }, [initialize]);

  useEffect(() => {
    let cleanupAccounts: (() => void) | void;
    let cleanupTransactions: (() => void) | void;
    let cleanupCategories: (() => void) | void;
    let cleanupBudgets: (() => void) | void;

    if (!userId) {
      resetAccounts();
      resetTransactions();
      resetCategories();
      resetBudgets();
      return;
    }

    void (async () => {
      cleanupAccounts = await initializeAccounts();
      cleanupTransactions = await initializeTransactions();
      cleanupCategories = await initializeCategories();
      cleanupBudgets = await initializeBudgets();
    })();

    return () => {
      cleanupAccounts?.();
      cleanupTransactions?.();
      cleanupCategories?.();
      cleanupBudgets?.();
    };
  }, [
    userId,
    initializeAccounts,
    initializeTransactions,
    initializeCategories,
    initializeBudgets,
    resetAccounts,
    resetTransactions,
    resetCategories,
    resetBudgets,
  ]);

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        element={(
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/budget" element={<BudgetPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
