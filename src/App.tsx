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

const AppLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    let unsubscribe: (() => void) | void;

    void initialize().then((fn) => {
      unsubscribe = fn;
    });

    return () => {
      unsubscribe?.();
    };
  }, [initialize]);

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
