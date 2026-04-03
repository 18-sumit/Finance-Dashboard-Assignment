import { useState } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useTransactionStore } from '../stores/transactionStore';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { Button } from '../components/ui/button';
import { Plus, Download } from 'lucide-react';
import { Transaction } from '../types';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { useExport } from '../hooks/useExport';

export const TransactionsPage = () => {
  const role = useUIStore(s => s.role);
  const { addTransaction, updateTransaction } = useTransactionStore();
  const { exportCSV, exportJSON } = useExport();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleOpenAdd = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<Transaction>) => {
    if (editingTx) {
      updateTransaction(editingTx.id, data);
      toast.success('Transaction updated');
    } else {
      addTransaction(data as Omit<Transaction, 'id'|'createdAt'>);
      toast.success('Transaction added');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">View and filter all your historical transactions.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="outline">
                 <Download className="mr-2 h-4 w-4" /> Export Data
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
               <DropdownMenuItem onClick={exportJSON}>Export as JSON</DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>

          {role === 'admin' && (
            <Button onClick={handleOpenAdd}>
              <Plus className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
          )}
        </div>
      </div>

      <TransactionFilters />
      
      <TransactionTable onEdit={handleOpenEdit} />

      {modalOpen && (
        <TransactionModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          transaction={editingTx} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};
