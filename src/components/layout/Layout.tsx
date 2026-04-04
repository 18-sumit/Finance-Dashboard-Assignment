import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export const Layout = ({ children }: { children: ReactNode }) => {
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex">
      <Sidebar />
      {/* Main content shifts based on collapsed state — NOT hover state, so hover is a true overlay */}
      <div
        className={cn(
          'flex flex-col flex-1 min-w-0 transition-[margin] duration-300 ease-in-out',
          sidebarCollapsed ? 'md:ml-[60px]' : 'md:ml-64',
        )}
      >
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
