import { Menu, Sun, Moon } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Role } from '../../types';
import { toast } from 'sonner';

export const Header = () => {
  const { role, setRole, toggleSidebar, theme, toggleTheme } = useUIStore();

  const handleRoleChange = (r: Role) => {
    setRole(r);
    toast.info(`Switched to ${r === 'admin' ? 'Admin' : 'Viewer'} mode`, {
      description: r === 'viewer' ? 'Write actions disabled' : 'All permissions granted'
    });
  };

  return (  
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 shadow-sm z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="md:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <Select value={role} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <button onClick={toggleTheme} className="h-9 w-9 flex items-center justify-center rounded-md border text-muted-foreground hover:bg-muted">
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm cursor-pointer shadow-sm">
          A
        </div>
      </div>
    </header>
  );
};
