'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import ERP from "../../page";

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

const ProfLoss = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenues, setRevenues] = useState<AccountSummary[]>([]);
  const [expenses, setExpenses] = useState<AccountSummary[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
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

        // Filter for Income Statement entries only
        const incomeStatementEntries = data.data.filter((entry: JournalEntry) =>
          entry.journalEntryLines.some(line => 
            line.chartOfAccount.financialStatement === 'Income Statement'
          )
        );

        processIncomeStatementData(incomeStatementEntries);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processIncomeStatementData = (entries: JournalEntry[]) => {
    const accountMap = new Map<string, AccountSummary>();

    entries.forEach(entry => {
      entry.journalEntryLines.forEach(line => {
        if (line.chartOfAccount.financialStatement !== 'Income Statement') return;

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
          balance: existing.balance + (credit - debit) // Revenue is credit - debit
        });
      });
    });

    // Categorize accounts
    const revenues: AccountSummary[] = [];
    const expenses: AccountSummary[] = [];

    accountMap.forEach(account => {
      if (account.accountType.includes('Revenue')) {
        revenues.push(account);
      } else if (account.accountType.includes('Expense')) {
        expenses.push(account);
      }
    });

    // Sort by account number
    revenues.sort((a, b) => a.accountNo.localeCompare(b.accountNo));
    expenses.sort((a, b) => a.accountNo.localeCompare(b.accountNo));

    // Calculate totals
    const revenueTotal = revenues.reduce((sum, acc) => sum + acc.balance, 0);
    const expenseTotal = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    const profit = revenueTotal - expenseTotal;

    setRevenues(revenues);
    setExpenses(expenses);
    setTotalRevenue(revenueTotal);
    setTotalExpense(expenseTotal);
    setNetProfit(profit);
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
            <h1 className="text-3xl font-bold text-gray-800">Profit & Loss Statement</h1>
            <p className="text-gray-600">For the period ending {new Date().toLocaleDateString()}</p>
          </div>
          <button 
            onClick={() => router.push('/ERP/Reports')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Reports</span>
          </button>
        </div>

        {/* Profit & Loss Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Revenue Section */}
          <div className="border-b border-gray-200">
            <div className="bg-green-50 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5" />
                Revenue
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {revenues.map((account) => (
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
                  <p className="font-bold text-gray-800">Total Revenue</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="border-b border-gray-200">
            <div className="bg-red-50 px-6 py-4">
              <h2 className="text-xl font-semibold text-red-800 flex items-center gap-2">
                <FiTrendingDown className="w-5 h-5" />
                Expenses
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {expenses.map((account) => (
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
                  <p className="font-bold text-gray-800">Total Expenses</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Net Profit Section */}
          <div className="bg-blue-50 px-6 py-4">
            <div className="flex justify-between items-center">
              <p className="font-bold text-gray-800">Net Profit</p>
              <p className={`font-bold text-2xl ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfLoss;