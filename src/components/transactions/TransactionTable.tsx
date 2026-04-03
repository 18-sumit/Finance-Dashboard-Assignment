import { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useAccountStore } from '../../stores/accountStore';
import { useUIStore } from '../../stores/uiStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { useFilterStore } from '../../stores/filterStore';
import { CategoryIcon } from '../ui/CategoryIcon';
import { AmountBadge } from '../ui/AmountBadge';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { toast } from 'sonner';
import { EmptyState } from '../ui/EmptyState';
import { ReceiptText } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TransactionTable = ({ onEdit }: { onEdit: (tx: any) => void }) => {
  const transactions = useTransactions();
  const accounts = useAccountStore(s => s.accounts);
  const { deleteTransaction } = useTransactionStore();
  const role = useUIStore(s => s.role);
  const { sortBy, setSortBy, toggleSortOrder } = useFilterStore();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedData = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = () => {
    if (confirmDelete) {
      deleteTransaction(confirmDelete);
      toast.success('Transaction deleted');
      setConfirmDelete(null);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(confirmDelete); return n; });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size > 0 && role === 'admin') {
      selectedIds.forEach(id => deleteTransaction(id));
      toast.success(`${selectedIds.size} transactions deleted`);
      setConfirmBulkDelete(false);
      setSelectedIds(new Set());
    }
  };

  const handleSort = (col: 'date' | 'amount' | 'title') => {
    if (sortBy === col) {
      toggleSortOrder();
    } else {
      setSortBy(col);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedData.map(t => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  if (transactions.length === 0) {
    return (
      <EmptyState 
        icon={ReceiptText} 
        title="No transactions match your filters" 
        description="Try adjusting or clearing your filters."
      />
    );
  }

  return (
    <div className="space-y-4">
      {role === 'admin' && selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium text-primary">{selectedIds.size} selected</span>
          <Button variant="destructive" size="sm" onClick={() => setConfirmBulkDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
              <tr>
                {role === 'admin' && (
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-input rounded flex h-4 w-4" 
                      checked={paginatedData.length > 0 && paginatedData.every((t: any) => selectedIds.has(t.id))}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3"/></div>
                </th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-1">Title <ArrowUpDown className="h-3 w-3"/></div>
                </th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3 cursor-pointer hover:text-foreground text-right" onClick={() => handleSort('amount')}>
                  <div className="flex items-center justify-end gap-1">Amount <ArrowUpDown className="h-3 w-3"/></div>
                </th>
                <th className="px-4 py-3 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y relative">
              {paginatedData.map((t: any) => {
                const acc = accounts.find((a: any) => a.id === t.accountId);
                const isSelected = selectedIds.has(t.id);
                return (
                  <tr key={t.id} className={cn("transition-colors group hover:bg-muted/30", { "bg-muted/50": isSelected })}>
                    {role === 'admin' && (
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          className="rounded border-input rounded flex h-4 w-4"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(t.id, e.target.checked)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                    <td className="px-4 py-3 font-medium">{t.title}</td>
                    <td className="px-4 py-3"><CategoryIcon category={t.category} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{acc?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-right">
                      <AmountBadge amount={t.amount} type={t.type} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {role === 'admin' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(t)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setConfirmDelete(t.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} of {transactions.length}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(op) => !op && setConfirmDelete(null)}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
        title="Delete Multiple Transactions"
        description={`Are you sure you want to delete ${selectedIds.size} transactions? This action cannot be undone.`}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
};
