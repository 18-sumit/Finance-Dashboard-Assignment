import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
// using standard html input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Transaction, TransactionType, Category } from '../../types';
import { useAccountStore } from '../../stores/accountStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { format } from 'date-fns';
import { useState } from 'react';

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  transaction?: Transaction | null;
  onSave: (data: Partial<Transaction>) => void;
}

export const TransactionModal = ({ open, onOpenChange, transaction, onSave }: TransactionModalProps) => {
  const accounts = useAccountStore(s => s.accounts);
  const categories = useCategoryStore(s => s.categories);
  
  const [title, setTitle] = useState(transaction?.title || '');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [category, setCategory] = useState<Category>(transaction?.category || 'food');
  const [accountId, setAccountId] = useState(transaction?.accountId || accounts[0]?.id || '');
  const [dateStr, setDateStr] = useState(transaction?.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !accountId || !dateStr) return;
    
    onSave({
      title,
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      date: new Date(dateStr).toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" placeholder="e.g., Groceries" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <input required type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" placeholder="₹0.00" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <input required type="date" value={dateStr} onChange={e => setDateStr(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Object.values(categories).map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Account</label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
