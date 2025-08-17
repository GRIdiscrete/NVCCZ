'use client'

import ERP from "@/app/ERP/page";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from "react-icons/fi";

interface JournalEntry {
  id: string;
  transactionDate: string;
  referenceNumber: string;
  description: string;
  totalAmount: string;
  currencyId: string;
  status: string;
  journalEntryLines: JournalEntryLine[];
}

interface JournalEntryLine {
    id: string;
    journalEntryId: string;
    chartOfAccountId: string;
    debitAmount: string;
    creditAmount: string;
    description: string;
    vatAmount: string;
    createdAt: string;
    chartOfAccount: {
      id: string;
      accountNo: string;
      accountName: string;
      accountType: string;
      financialStatement: string;
      notes: string | null;
      parentId: string | null;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }

const SingleAccount = () => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{name: string, number: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accountId = sessionStorage.getItem('account');
        if (!accountId) {
          setError('No account selected. Please select an account first.');
          setLoading(false);
          return;
        }

        const token = sessionStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/journal-entries', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        if (!response.ok) {
          throw new Error('Failed to fetch journal entries');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || 'Failed to retrieve journal entries');
        }

        // Filter entries that have lines matching the account ID
        const filteredEntries = data.data.filter((entry: JournalEntry) => 
            entry.journalEntryLines.some((line: JournalEntryLine) => line.chartOfAccount.id === accountId)
          );

        // Get account info from the first matching line
        if (filteredEntries.length > 0) {
            const firstLine = filteredEntries[0].journalEntryLines.find(
              (line: JournalEntryLine) => line.chartOfAccount.id === accountId
            );
            if (firstLine) {
              setAccountInfo({
                name: firstLine.chartOfAccount.accountName,
                number: firstLine.chartOfAccount.accountNo
              });
            }
          }

        setJournalEntries(filteredEntries);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">

      <button 
      onClick={() => router.push('/ERP/Reports/ChartofAccounts')}
      className="flex items-center gap-2 mb-6 text-blue-600 hover:text-blue-800 transition-colors duration-200"
    >
      <FiArrowLeft className="w-5 h-5" />
      <span className="font-medium">Back to Reports</span>
    </button>
        {accountInfo && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Account: {accountInfo.number} - {accountInfo.name}
            </h1>
            <p className="text-gray-600">
              Journal Entry Transactions
            </p>
          </div>
        )}

        {journalEntries.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            No journal entries found for the selected account.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {journalEntries.map((entry) => {
                    // Find the line that matches our account
                    const accountLine = entry.journalEntryLines.find(
                      line => line.chartOfAccount.id === sessionStorage.getItem('account')
                    );

                    if (!accountLine) return null;

                    return (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(entry.transactionDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {entry.referenceNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {entry.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {accountLine.debitAmount !== "0" ? (
                            <span className="text-green-600 font-medium">
                              {formatCurrency(accountLine.debitAmount)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {accountLine.creditAmount !== "0" ? (
                            <span className="text-red-600 font-medium">
                              {formatCurrency(accountLine.creditAmount)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${entry.status === 'POSTED' ? 'bg-green-100 text-green-800' : 
                              entry.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SingleAccount;