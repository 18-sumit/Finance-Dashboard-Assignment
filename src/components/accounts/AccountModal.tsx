import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Account, AccountType } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  onSave: (data: Partial<Account>) => void;
}

const COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-purple-500', 'bg-sky-400', 'bg-teal-500'];

export const AccountModal = ({ open, onOpenChange, account, onSave }: AccountModalProps) => {
  const [name, setName] = useState(account?.name || '');
  const [type, setType] = useState<AccountType>(account?.type || 'bank');
  // Edit mode shouldn't easily change initial balance without transaction logic, but keeping it simple
  const [balance, setBalance] = useState(account?.balance.toString() || '0');
  const [color, setColor] = useState(account?.color || COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Naively mapping type to an icon for this demo
    const iconMap: Record<AccountType, string> = {
      bank: 'building', wallet: 'wallet', upi: 'smartphone', credit: 'credit-card', savings: 'building'
    };

    onSave({
      name,
      type,
      balance: parseFloat(balance) || 0,
      color,
      icon: iconMap[type],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{account ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Name</label>
            <input 
              required
              value={name} onChange={e => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="e.g. ICICI Bank"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(val: AccountType) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Balance (₹)</label>
              <input 
                type="number" required min="0" step="0.01"
                value={balance} onChange={e => setBalance(e.target.value)}
                disabled={!!account} // Prevent changing balance of existing account manually
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color Accent</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <div 
                  key={c} onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full cursor-pointer border-2 transition-all ${c} ${color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{account ? 'Save Changes' : 'Create Account'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
