import { useState } from 'react';
import { useAccountStore } from '../stores/accountStore';
import { AccountCard } from '../components/accounts/AccountCard';
import { AccountModal } from '../components/accounts/AccountModal';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Plus, WalletCards } from 'lucide-react';
import { useUIStore } from '../stores/uiStore';
import { useTransactionStore } from '../stores/transactionStore';
import { Account } from '../types';
import { toast } from 'sonner';

export const AccountsPage = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccountStore();
  const { transactions } = useTransactionStore();
  const role = useUIStore((s) => s.role);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setModalOpen(true);
  };

  const handleOpenDelete = (acc: Account) => {
    setDeletingAccount(acc);
    setConfirmOpen(true);
  };

  const handleSave = (data: Partial<Account>) => {
    if (editingAccount) {
      updateAccount(editingAccount.id, data);
      toast.success('Account updated successfully');
    } else {
      addAccount(data as Omit<Account, 'id'|'createdAt'>);
      toast.success('Account created successfully');
    }
  };

  const handleConfirmDelete = () => {
    if (deletingAccount) {
      deleteAccount(deletingAccount.id);
      toast.success('Account deleted');
      setDeletingAccount(null);
    }
  };

  const txCountForDeleting = deletingAccount 
    ? transactions.filter(t => t.accountId === deletingAccount.id).length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Manage your wallets, bank accounts, and credit cards.</p>
        </div>
        {role === 'admin' && (
          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Account
          </Button>
        )}
      </div>

      {accounts.length === 0 ? (
        <EmptyState 
          icon={WalletCards} 
          title="No accounts added" 
          description="Add an account to start tracking your finances."
          action={role === 'admin' ? { label: 'Add Account', onClick: handleOpenAdd } : undefined}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map(acc => (
            <AccountCard 
              key={acc.id} 
              account={acc} 
              onEdit={handleOpenEdit} 
              onDelete={handleOpenDelete} 
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AccountModal 
          open={modalOpen} 
          onOpenChange={setModalOpen} 
          account={editingAccount} 
          onSave={handleSave} 
        />
      )}

      {confirmOpen && (
         <ConfirmDialog
           open={confirmOpen}
           onOpenChange={setConfirmOpen}
           title="Delete Account"
           description={
             txCountForDeleting > 0 
               ? `This account has ${txCountForDeleting} associated transactions. Deleting it will permanently remove them (functionality not implemented, but warning). Are you sure?`
               : "Are you sure you want to delete this account? This action cannot be undone."
           }
           onConfirm={handleConfirmDelete}
         />
      )}
    </div>
  );
};
