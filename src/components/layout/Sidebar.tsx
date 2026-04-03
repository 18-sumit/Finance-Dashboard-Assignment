import { useState } from 'react';
import { LayoutDashboard, ReceiptText, WalletCards, LineChart, Tags, ChevronLeft, ChevronRight, Target } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/' },
  { icon: ReceiptText,    label: 'Transactions',  path: '/transactions' },
  { icon: WalletCards,    label: 'Accounts',      path: '/accounts' },
  { icon: Tags,           label: 'Categories',    path: '/categories' },
  { icon: Target,         label: 'Budget',        path: '/budget' },
  { icon: LineChart,      label: 'Insights',      path: '/insights' },
];

export const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // On desktop: show full sidebar if not collapsed OR if user is hovering over icon-only bar
  const isExpanded = !sidebarCollapsed || hovered;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        onMouseEnter={() => sidebarCollapsed && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          // base
          'fixed inset-y-0 left-0 z-50 border-r bg-card text-card-foreground shadow-sm',
          'transition-all duration-300 ease-in-out',
          // mobile: slide in/out
          'md:sticky md:top-0 md:h-screen md:overflow-y-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          // desktop width
          isExpanded ? 'w-64' : 'w-[68px]'
        )}
      >
        {/* Logo row */}
        <div className="flex h-16 items-center border-b px-4 justify-between">
          {isExpanded ? (
            <div className="flex items-center gap-2 text-primary font-bold text-xl overflow-hidden whitespace-nowrap">
              <div className="h-6 w-6 shrink-0 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-sm">Z</div>
              <span className="transition-opacity duration-200">Zentrix Finance</span>
            </div>
          ) : (
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground text-sm mx-auto">Z</div>
          )}
        </div>

        {/* Nav links */}
        <nav className="p-2 space-y-1 mt-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (sidebarOpen) toggleSidebar(); }}
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative group',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent',
                  !isExpanded && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {isExpanded && (
                  <span className="whitespace-nowrap overflow-hidden transition-all duration-200">
                    {item.label}
                  </span>
                )}
                {/* Tooltip when icon-only */}
                {!isExpanded && (
                  <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-popover text-popover-foreground border rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop collapse toggle button */}
        <button
          onClick={toggleSidebarCollapsed}
          className={cn(
            'hidden md:flex absolute bottom-4 items-center justify-center w-7 h-7 rounded-full bg-muted border shadow-sm hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground z-10',
            isExpanded ? 'right-3' : 'left-1/2 -translate-x-1/2'
          )}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed && !hovered
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft className="h-3.5 w-3.5" />
          }
        </button>
      </aside>
    </>
  );
};
