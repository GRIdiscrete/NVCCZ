'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import ERP from "@/app/ERP/page";

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

interface AccountSummary {
  accountName: string;
  accountNo: string;
  accountType: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

const BalanceSheet = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assets, setAssets] = useState<AccountSummary[]>([]);
  const [liabilities, setLiabilities] = useState<AccountSummary[]>([]);
  const [equity, setEquity] = useState<AccountSummary[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [totalEquity, setTotalEquity] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch('https://nvccz-pi.vercel.app/api/accounting/journal-entries', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch journal entries');

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to retrieve journal entries');

        // Filter for Balance Sheet entries only
        const balanceSheetEntries = data.data.filter((entry: JournalEntry) =>
          entry.journalEntryLines.some(line => 
            line.chartOfAccount.financialStatement === 'Balance Sheet'
          )
        );

        processBalanceSheetData(balanceSheetEntries);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processBalanceSheetData = (entries: JournalEntry[]) => {
    const accountMap = new Map<string, AccountSummary>();

    entries.forEach(entry => {
      entry.journalEntryLines.forEach(line => {
        if (line.chartOfAccount.financialStatement !== 'Balance Sheet') return;

        const accountId = line.chartOfAccount.id;
        const existing = accountMap.get(accountId) || {
          accountName: line.chartOfAccount.accountName,
          accountNo: line.chartOfAccount.accountNo,
          accountType: line.chartOfAccount.accountType,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0
        };

        const debit = parseFloat(line.debitAmount) || 0;
        const credit = parseFloat(line.creditAmount) || 0;

        accountMap.set(accountId, {
          ...existing,
          totalDebit: existing.totalDebit + debit,
          totalCredit: existing.totalCredit + credit,
          balance: existing.balance + (debit - credit)
        });
      });
    });

    // Categorize accounts
    const assets: AccountSummary[] = [];
    const liabilities: AccountSummary[] = [];
    const equity: AccountSummary[] = [];

    accountMap.forEach(account => {
      if (account.accountType.includes('Asset')) {
        assets.push(account);
      } else if (account.accountType.includes('Liability')) {
        liabilities.push(account);
      } else if (account.accountType.includes('Equity')) {
        equity.push(account);
      }
    });

    // Sort by account number
    assets.sort((a, b) => a.accountNo.localeCompare(b.accountNo));
    liabilities.sort((a, b) => a.accountNo.localeCompare(b.accountNo));
    equity.sort((a, b) => a.accountNo.localeCompare(b.accountNo));

    // Calculate totals
    const assetsTotal = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const liabilitiesTotal = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const equityTotal = equity.reduce((sum, acc) => sum + acc.balance, 0);

    setAssets(assets);
    setLiabilities(liabilities);
    setEquity(equity);
    setTotalAssets(assetsTotal);
    setTotalLiabilities(liabilitiesTotal);
    setTotalEquity(equityTotal);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
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
        {/* Header and Back Button */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Balance Sheet</h1>
            <p className="text-gray-600">As of {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={() => router.push('/reports')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Reports</span>
          </button>
        </div>

        {/* Balance Sheet Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Assets Section */}
          <div className="border-b border-gray-200">
            <div className="bg-blue-50 px-6 py-4">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5" />
                Assets
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {assets.map((account) => (
                <div key={account.accountNo} className="px-6 py-4 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <p className="font-medium text-gray-800">{account.accountName}</p>
                    <p className="text-sm text-gray-500">Account #{account.accountNo}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 bg-gray-50 grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <p className="font-bold text-gray-800">Total Assets</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatCurrency(totalAssets)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Liabilities Section */}
          <div className="border-b border-gray-200">
            <div className="bg-purple-50 px-6 py-4">
              <h2 className="text-xl font-semibold text-purple-800 flex items-center gap-2">
                <FiTrendingDown className="w-5 h-5" />
                Liabilities
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {liabilities.map((account) => (
                <div key={account.accountNo} className="px-6 py-4 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <p className="font-medium text-gray-800">{account.accountName}</p>
                    <p className="text-sm text-gray-500">Account #{account.accountNo}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 bg-gray-50 grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <p className="font-bold text-gray-800">Total Liabilities</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{formatCurrency(totalLiabilities)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Equity Section */}
          <div>
            <div className="bg-green-50 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                <FiDollarSign className="w-5 h-5" />
                Equity
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {equity.map((account) => (
                <div key={account.accountNo} className="px-6 py-4 grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <p className="font-medium text-gray-800">{account.accountName}</p>
                    <p className="text-sm text-gray-500">Account #{account.accountNo}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="px-6 py-4 bg-gray-50 grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <p className="font-bold text-gray-800">Total Equity</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(totalEquity)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Summary */}
          <div className="bg-gray-100 px-6 py-4">
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-800">Total Liabilities & Equity</p>
              <p className="font-bold text-gray-800">
                {formatCurrency(totalLiabilities + totalEquity)}
              </p>
            </div>
            <div className={`mt-2 p-3 rounded-lg ${
              Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? 
              'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? (
                <p className="font-medium">✓ Balance Sheet is balanced</p>
              ) : (
                <p className="font-medium">⚠️ Balance Sheet is out of balance by {formatCurrency(Math.abs(totalAssets - (totalLiabilities + totalEquity)))}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BalanceSheet;