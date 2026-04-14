import { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, UserCircle2, Shield, Eye, LogOut } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Role } from '../../types';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';

export const Header = () => {
  const { role, setRole, toggleSidebar, theme, toggleTheme } = useUIStore();
  const { user, signOut } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleRoleChange = (r: Role) => {
    setRole(r);
    toast.info(`Switched to ${r === 'admin' ? 'Admin' : 'Viewer'} mode`, {
      description: r === 'viewer' ? 'Write actions disabled' : 'All permissions granted'
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin = role === 'admin';
  const displayName = user?.email?.split('@')[0] || (isAdmin ? 'Admin' : 'Viewer');
  const displayEmail = user?.email || (isAdmin ? 'admin@zentrix.com' : 'viewer@zentrix.com');
  const avatarLetter = (displayName[0] || 'U').toUpperCase();

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.error) {
      toast.error('Sign out failed', { description: result.error });
      return;
    }

    setProfileOpen(false);
    toast.success('Signed out successfully');
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

        <button onClick={toggleTheme} className="h-9 w-9 flex items-center justify-center rounded-md border text-muted-foreground hover:bg-muted transition-colors">
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Profile Avatar + Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm cursor-pointer shadow-sm transition-all',
              isAdmin
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 border'
            )}
          >
            {avatarLetter}
          </button>

          {/* Dropdown Card */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border bg-card shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User info section */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0',
                    isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border'
                  )}>
                    {avatarLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
                  </div>
                </div>
              </div>

              {/* Role badge */}
              <div className="px-4 py-3 border-b">
                <div className={cn(
                  'flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-md w-fit',
                  isAdmin
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {isAdmin
                    ? <><Shield className="h-3.5 w-3.5" /> Admin — Full Access</>
                    : <><Eye className="h-3.5 w-3.5" /> Viewer — Read Only</>
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isAdmin
                    ? 'You can add, edit and delete transactions, accounts, and categories.'
                    : 'You can view all data but cannot make any changes.'}
                </p>
              </div>

              {/* Switch role shortcut */}
              <div className="p-2">
                <button
                  onClick={() => {
                    handleRoleChange(isAdmin ? 'viewer' : 'admin');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <UserCircle2 className="h-4 w-4" />
                  Switch to {isAdmin ? 'Viewer' : 'Admin'} mode
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
