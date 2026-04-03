import Papa from 'papaparse';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAccountStore } from '../stores/accountStore';
import { useTransactions } from './useTransactions';

export const useExport = () => {
  const transactions = useTransactions();
  const { accounts } = useAccountStore();

  const downloadFile = (data: string, filename: string, type: string) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const rows = transactions.map((t: any) => ({
      Date: format(new Date(t.date), 'yyyy-MM-dd'),
      Title: t.title,
      Amount: t.type === 'expense' ? -t.amount : t.amount,
      Type: t.type,
      Category: t.category,
      Account: accounts.find(a => a.id === t.accountId)?.name ?? 'Unknown',
      Note: t.note ?? '',
    }));
    const csv = Papa.unparse(rows);
    downloadFile(csv, 'transactions.csv', 'text/csv');
    toast.success('Transactions exported as CSV');
  };

  const exportJSON = () => {
    const json = JSON.stringify({ transactions, accounts }, null, 2);
    downloadFile(json, 'finance-data.json', 'application/json');
    toast.success('Data exported as JSON');
  };

  return { exportCSV, exportJSON };
};
