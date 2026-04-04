import { useState } from 'react';
import { LayoutDashboard, ReceiptText, WalletCards, LineChart, Tags, Target, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/' },
  { icon: ReceiptText,     label: 'Transactions', path: '/transactions' },
  { icon: WalletCards,     label: 'Accounts',     path: '/accounts' },
  { icon: Tags,            label: 'Categories',   path: '/categories' },
  { icon: Target,          label: 'Budget',       path: '/budget' },
  { icon: LineChart,       label: 'Insights',     path: '/insights' },
];

export const Sidebar = () => {
  const { sidebarOpen, toggleSidebar, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // Full sidebar shown when: explicitly expanded  OR  user is hovering over the icon strip
  const showFull = !sidebarCollapsed || hovered;

  return (
    <>
      {/* ── Mobile backdrop ──────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        onMouseEnter={() => sidebarCollapsed && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card text-card-foreground shadow-sm',
          'transition-[width] duration-300 ease-in-out overflow-hidden',
          // Width: full when expanded or hovered; icon-only when collapsed
          showFull ? 'w-64' : 'w-[60px]',
          // Mobile: slide in/out
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        )}
      >
        {/* ── Logo ───────────────────────────────────────────────── */}
        <div className={cn(
          'flex h-16 shrink-0 items-center border-b',
          showFull ? 'px-4 gap-3' : 'justify-center px-0'
        )}>
          <div className="h-7 w-7 shrink-0 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            Z
          </div>
          {showFull && (
            <span className="font-bold text-lg text-primary whitespace-nowrap overflow-hidden flex-1">
              Zentrix Finance
            </span>
          )}
          {/* Collapse button — only visible in expanded state */}
          {showFull && (
            <button
              onClick={toggleSidebarCollapsed}
              className="hidden md:flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button row — only visible in collapsed state on desktop */}
        {!showFull && (
          <div className="hidden md:flex justify-center py-2 border-b">
            <button
              onClick={toggleSidebarCollapsed}
              className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Nav links ──────────────────────────── */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5 mt-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (sidebarOpen) toggleSidebar(); }}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition-all duration-150 group',
                  showFull ? 'px-3' : 'px-0 justify-center',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
                )}

                <Icon className="h-5 w-5 shrink-0" />

                {showFull && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}

                {/* Tooltip shown only in icon-only/collapsed mode */}
                {!showFull && (
                  <span className="pointer-events-none absolute left-full ml-3 hidden group-hover:flex px-2 py-1.5 text-xs font-medium bg-popover text-popover-foreground border rounded-md shadow-lg whitespace-nowrap z-[60]">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom brand strip (icon-only mode) ── */}
        {!showFull && (
          <div className="py-4 flex justify-center border-t text-[10px] text-muted-foreground">
            Zx
          </div>
        )}
      </aside>
    </>
  );
};
