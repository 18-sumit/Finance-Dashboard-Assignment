import { useUIStore } from '../stores/uiStore';
import { useTransactionStore } from '../stores/transactionStore';
import { useExport } from '../hooks/useExport';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Download, AlertOctagon, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { toast } from 'sonner';

export const SettingsPage = () => {
  const { role, setRole, theme, toggleTheme } = useUIStore();
  const resetTransactions = useTransactionStore((s) => s.resetTransactions);
  const { exportCSV, exportJSON } = useExport();

  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    resetTransactions();
    toast.success('All app data has been reset to seed values');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage preferences and data for Zorvyn Finance.</p>
      </div>

      <div className="grid gap-6">
        
        {/* Profile & Role */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Profile & Role</CardTitle>
            <CardDescription>Switch between Admin and Viewer modes to test RBAC features.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
             <div className="space-y-1">
               <p className="font-medium">Current Role: {role === 'admin' ? 'Administrator' : 'Viewer'}</p>
               <p className="text-sm text-muted-foreground max-w-[300px]">
                 {role === 'admin' 
                   ? 'You have full read and write access to all modules.' 
                   : 'You have read-only access. Write buttons are disabled.'}
               </p>
             </div>
             <Select value={role} onValueChange={(r: any) => setRole(r)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
             </Select>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customize how the dashboard looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
               <p className="font-medium">Dark Mode</p>
             </div>
             <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Data Management</CardTitle>
            <CardDescription>Export your transactions, or start fresh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-wrap gap-3">
               <Button onClick={exportCSV} variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
               <Button onClick={exportJSON} variant="outline"><Download className="mr-2 h-4 w-4" /> Export JSON</Button>
             </div>
             
             {role === 'admin' && (
               <div className="pt-4 border-t mt-4 text-destructive space-y-2">
                 <p className="font-medium flex items-center"><AlertOctagon className="mr-2 h-4 w-4" /> Danger Zone</p>
                 <Button variant="destructive" onClick={() => setConfirmReset(true)}>Factory Reset Data</Button>
                 <p className="text-sm opacity-80">This will wipe your changes and reload the seed mock data.</p>
               </div>
             )}
          </CardContent>
        </Card>

        {/* About */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
             <p>Zorvyn Finance Dashboard Version 1.0.0</p>
             <p>Built as a premium fintech simulation using React, Vite, Tailwind CSS, shadcn/ui, Zustand, and Recharts.</p>
          </CardContent>
        </Card>

      </div>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset All Data"
        description="Are you sure you want to reset the app? All local changes will be lost and seed data will be restored."
        onConfirm={handleReset}
      />
    </div>
  );
};
