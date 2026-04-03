import { LayoutDashboard, ReceiptText, WalletCards, LineChart, Tags } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ReceiptText, label: 'Transactions', path: '/transactions' },
  { icon: WalletCards, label: 'Accounts', path: '/accounts' },
  { icon: Tags, label: 'Categories', path: '/categories' },
  { icon: LineChart, label: 'Insights', path: '/insights' },
];

export const Sidebar = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-card text-card-foreground shadow-sm transition-transform duration-300 md:sticky md:top-0 md:h-screen md:overflow-y-auto md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center px-6 border-b">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground">Z</div>
            Zentrix Finance
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (sidebarOpen) toggleSidebar(); }}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
