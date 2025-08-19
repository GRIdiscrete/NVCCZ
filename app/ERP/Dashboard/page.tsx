'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiCreditCard,
  FiActivity,
  FiPieChart,
  FiBarChart2,
} from 'react-icons/fi';
import { motion } from 'framer-motion';

// ---- Apex dynamic import ---------------------------------------------------
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-500">
      Loading chart…
    </div>
  ),
}) as any;

// ---- Types ----------------------------------------------------------------
type ApexOptions = {
  chart: {
    type: 'pie' | 'donut' | 'bar' | 'area' | 'line';
    width?: number | string;
    height?: number | string;
    stacked?: boolean;
    toolbar?: { show: boolean };
    animations?: {
      enabled: boolean;
      easing?: string;
      dynamicAnimation?: { speed?: number };
    };
  };
  labels?: string[];
  colors?: string[];
  legend?: { position: 'top' | 'right' | 'bottom' | 'left' };
  responsive?: {
    breakpoint: number;
    options: {
      chart?: { width?: number | string };
      legend?: { position?: 'top' | 'right' | 'bottom' | 'left' };
      xaxis?: { labels?: { formatter?: (value: string) => string } };
    };
  }[];
  dataLabels?: { enabled: boolean };
  plotOptions?: {
    pie?: {
      donut?: {
        size?: string;
        labels?: {
          show?: boolean;
          total?: { show?: boolean; label?: string; formatter?: () => string };
        };
      };
    };
  };
  stroke?: { curve: 'smooth' | 'straight' | 'stepline'; width: number };
  xaxis?: {
    categories?: string[];
    labels?: { formatter?: (value: string) => string };
  };
  yaxis?: { labels?: { formatter?: (value: number) => string } };
  tooltip?: { y?: { formatter?: (value: number) => string } };
  fill?: { type?: 'solid' | 'gradient'; gradient?: any };
  grid?: { strokeDashArray?: number };
};

type ApexSeries = { name?: string; data: number[] }[];

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

// ---- UI bits ---------------------------------------------------------------
const TrendPill = ({ change }: { change: number }) => {
  const positive = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all ${
        positive
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      }`}
    >
      {positive ? <FiTrendingUp className="h-3.5 w-3.5" /> : <FiTrendingDown className="h-3.5 w-3.5" />}
      {Math.abs(change).toFixed(1)}%
    </span>
  );
};

const KpiCard = ({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}) => {
  const positive = change >= 0;
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 40px rgba(2,6,23,0.12)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_8px_30px_rgb(2,6,23,0.06)] backdrop-blur-xl hover:border-indigo-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <motion.span
          whileHover={{ rotate: positive ? 4 : -4, scale: 1.06 }}
          className={`grid h-10 w-10 place-items-center rounded-xl border text-slate-600 transition-colors ${
            positive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'
              : 'border-rose-200 bg-rose-50 text-rose-600 group-hover:bg-rose-100'
          }`}
        >
          {icon}
        </motion.span>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
        <TrendPill change={change} />
        <span className="text-slate-500">vs last period</span>
      </div>
      {/* subtle gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500/20 via-sky-400/20 to-emerald-500/20" />
      {/* hover shimmer */}
      <div
        className="pointer-events-none absolute -inset-8 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{
          background:
            'radial-gradient(600px circle at var(--x,50%) var(--y,50%), rgba(59,130,246,.15), transparent 40%)',
        }}
      />
    </motion.div>
  );
};

// ---- Helpers ---------------------------------------------------------------
const pctChange = (current: number, previous: number) => {
  if (!isFinite(previous) || previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const lastTwo = <T extends Record<string, any>>(obj: T) => {
  const keys = Object.keys(obj).sort(); // "YYYY-MM"
  if (keys.length < 2) return null;
  const prevKey = keys[keys.length - 2];
  const currKey = keys[keys.length - 1];
  return { prevKey, currKey };
};

// ---- Component -------------------------------------------------------------
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [revenues, setRevenues] = useState<AccountSummary[]>([]);
  const [expenses, setExpenses] = useState<AccountSummary[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [receivables, setReceivables] = useState(0);
  const [payables, setPayables] = useState(0);
  const [monthlyData, setMonthlyData] = useState<
    { month: string; revenue: number; expense: number; profit: number }[]
  >([]);
  const [changes, setChanges] = useState({
    revenue: 0,
    expense: 0,
    profit: 0,
    cash: 0,
  });
// com
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        console.log(token)
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(
          'https://nvccz-pi.vercel.app/api/accounting/journal-entries',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to fetch journal entries');

        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to retrieve journal entries');

        processDashboardData(data.data);
      } catch (err: any) {
        setError(err?.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processDashboardData = (entries: JournalEntry[]) => {
    const accountMap = new Map<string, AccountSummary>();
    const monthlyTotals: Record<string, { revenue: number; expense: number }> = {};
    const monthlyCashFlow: Record<string, number> = {}; // net cash flow by month
    let cash = 0;
    let receivablesTotal = 0;
    let payablesTotal = 0;

    entries.forEach((entry) => {
      if (!entry.transactionDate) return;
      const date = new Date(entry.transactionDate);
      if (isNaN(date.getTime())) return;

      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;

      if (!monthlyTotals[monthYear]) monthlyTotals[monthYear] = { revenue: 0, expense: 0 };
      if (monthlyCashFlow[monthYear] == null) monthlyCashFlow[monthYear] = 0;

      entry.journalEntryLines.forEach((line) => {
        if (!line.chartOfAccount) return;
        const name = line.chartOfAccount.accountName || '';
        const accountType = line.chartOfAccount.accountType;
        const financialStatement = line.chartOfAccount.financialStatement;
        const debit = parseFloat(line.debitAmount) || 0;
        const credit = parseFloat(line.creditAmount) || 0;
        const accountId = line.chartOfAccount.id;

        // Cash-like accounts (Cash & Bank)
        const isCashLike = /cash|bank/i.test(name);
        if (isCashLike) {
          cash += debit - credit;
          monthlyCashFlow[monthYear] += debit - credit;
        }
        if (/receivable/i.test(name)) {
          receivablesTotal += debit - credit;
        }
        if (/payable/i.test(name)) {
          payablesTotal += credit - debit;
        }

        if (financialStatement === 'Income Statement') {
          const existing =
            accountMap.get(accountId) || {
              accountName: name,
              accountNo: line.chartOfAccount.accountNo,
              accountType,
              totalDebit: 0,
              totalCredit: 0,
              balance: 0,
            };

          if (accountType.includes('Revenue')) {
            monthlyTotals[monthYear].revenue += credit;
            accountMap.set(accountId, {
              ...existing,
              totalDebit: existing.totalDebit + debit,
              totalCredit: existing.totalCredit + credit,
              balance: existing.balance + (credit - debit),
            });
          } else if (accountType.includes('Expense')) {
            monthlyTotals[monthYear].expense += debit;
            accountMap.set(accountId, {
              ...existing,
              totalDebit: existing.totalDebit + debit,
              totalCredit: existing.totalCredit + credit,
              balance: existing.balance + (debit - credit),
            });
          }
        }
      });
    });

    const revenues: AccountSummary[] = [];
    const expenses: AccountSummary[] = [];
    accountMap.forEach((a) => {
      if (a.accountType.includes('Revenue')) revenues.push(a);
      else if (a.accountType.includes('Expense')) expenses.push(a);
    });

    const revenueTotal = revenues.reduce((s, a) => s + Math.max(0, a.balance), 0);
    const expenseTotal = expenses.reduce((s, a) => s + Math.max(0, a.balance), 0);
    const profit = revenueTotal - expenseTotal;

    const monthlyDataArray = Object.entries(monthlyTotals)
      .map(([month, t]) => ({
        month,
        revenue: t.revenue || 0,
        expense: t.expense || 0,
        profit: (t.revenue || 0) - (t.expense || 0),
      }))
      .filter((i) => i.month)
      .sort((a, b) => a.month.localeCompare(b.month));

    // Compute changes vs last period (month-over-month)
    let revenueChange = 0,
      expenseChange = 0,
      profitChange = 0,
      cashChange = 0;

    const lt = lastTwo(monthlyTotals);
    if (lt) {
      const { prevKey, currKey } = lt;
      const prev = monthlyTotals[prevKey];
      const curr = monthlyTotals[currKey];

      revenueChange = pctChange(curr.revenue ?? 0, prev.revenue ?? 0);
      expenseChange = pctChange(curr.expense ?? 0, prev.expense ?? 0);

      const prevProfit = (prev.revenue ?? 0) - (prev.expense ?? 0);
      const currProfit = (curr.revenue ?? 0) - (curr.expense ?? 0);
      profitChange = pctChange(currProfit, prevProfit);

      const prevCashFlow = monthlyCashFlow[prevKey] ?? 0;
      const currCashFlow = monthlyCashFlow[currKey] ?? 0;
      cashChange = pctChange(currCashFlow, prevCashFlow);
    }

    setRevenues(revenues);
    setExpenses(expenses);
    setTotalRevenue(revenueTotal);
    setTotalExpense(expenseTotal);
    setNetProfit(profit);
    setCashBalance(cash);
    setReceivables(receivablesTotal);
    setPayables(payablesTotal);
    setMonthlyData(monthlyDataArray);
    setChanges({
      revenue: Number.isFinite(revenueChange) ? revenueChange : 0,
      // Show expense increase as negative (worse), decrease as positive (better)
      expense: Number.isFinite(expenseChange) ? -expenseChange : 0,
      profit: Number.isFinite(profitChange) ? profitChange : 0,
      cash: Number.isFinite(cashChange) ? cashChange : 0,
    });
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatShortCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
    return formatCurrency(amount);
  };

  const formatMonthLabel = (value?: string) => {
    if (!value) return '';
    try {
      const [year, month] = value.split('-');
      if (!year || !month) return value;
      const d = new Date(parseInt(year), parseInt(month) - 1);
      if (isNaN(d.getTime())) return value;
      return d.toLocaleString('default', { month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  };

  // ---- Chart options -------------------------------------------------------
  const revenueByCategorySeries: number[] = revenues.map((r) => Math.abs(r.balance));
  const expenseByCategorySeries: number[] = expenses.map((e) => Math.abs(e.balance));

  const donutCommon: Partial<ApexOptions> = {
    dataLabels: { enabled: true },
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: { show: true, label: 'Total', formatter: () => formatCurrency(totalRevenue) },
          },
        },
      },
    },
    chart: {
      type: 'donut',
      animations: { enabled: true, easing: 'easeinout', dynamicAnimation: { speed: 700 } },
      toolbar: { show: false },
    },
  };

  const revenueByCategoryOptions: ApexOptions = {
    ...donutCommon,
    labels: revenues.map((r) => r.accountName),
    colors: ['#10B981', '#22D3EE', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'],
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: { show: true, label: 'Revenue', formatter: () => formatCurrency(totalRevenue) },
          },
        },
      },
    },
  } as ApexOptions;

  const expenseByCategoryOptions: ApexOptions = {
    ...donutCommon,
    labels: expenses.map((e) => e.accountName),
    colors: ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#14B8A6', '#06B6D4'],
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: { show: true, label: 'Expenses', formatter: () => formatCurrency(totalExpense) },
          },
        },
      },
    },
  } as ApexOptions;

  const monthlyTrendsSeries: ApexSeries = useMemo(
    () => [
      { name: 'Revenue', data: monthlyData.map((d) => d.revenue) },
      { name: 'Expenses', data: monthlyData.map((d) => d.expense) },
      { name: 'Profit', data: monthlyData.map((d) => d.profit) },
    ],
    [monthlyData]
  );

  const monthlyTrendsOptions: ApexOptions = {
    chart: {
      type: 'area',
      stacked: false,
      toolbar: { show: false },
      animations: { enabled: true, easing: 'linear', dynamicAnimation: { speed: 900 } },
    },
    colors: ['#10B981', '#EF4444', '#3B82F6'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { strokeDashArray: 4 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.2,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 80, 100],
      },
    },
    xaxis: {
      categories: monthlyData.map((d) => d.month),
      labels: { formatter: (v: string) => formatMonthLabel(v) },
    },
    yaxis: { labels: { formatter: (v: number) => formatShortCurrency(v) } },
    tooltip: { y: { formatter: (v: number) => formatCurrency(v) } },
    responsive: [
      {
        breakpoint: 640,
        options: { chart: { width: '100%' } },
      },
    ],
  };

  // ---- Loading / Error -----------------------------------------------------
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 p-6">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
          <div className="h-96 animate-pulse rounded-2xl bg-white/70 ring-1 ring-slate-200/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 shadow-sm">
          <p className="text-sm font-semibold">Error</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // ---- View ---------------------------------------------------------------
  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Financial Dashboard
        </h1>
        <p className="text-sm text-slate-500">Overview of your financial performance</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={changes.revenue}
          icon={<FiTrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="Total Expenses"
          value={formatCurrency(totalExpense)}
          change={changes.expense} // negative when expenses increase (bad), positive when they decrease (good)
          icon={<FiTrendingDown className="h-5 w-5" />}
        />
        <KpiCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          change={changes.profit}
          icon={<FiDollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="Cash Balance"
          value={formatCurrency(cashBalance)}
          change={changes.cash}
          icon={<FiCreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_8px_30px_rgb(2,6,23,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-indigo-300 hover:shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <FiActivity className="h-5 w-5 text-indigo-600 transition-transform group-hover:rotate-6" /> Monthly Trends
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Revenue</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Expenses</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-sky-500" />Profit</span>
            </div>
          </div>
          <div className="h-80">
            {monthlyData.length > 0 ? (
              <Chart
                key={monthlyData.length}
                options={monthlyTrendsOptions}
                series={monthlyTrendsSeries}
                type="area"
                height="100%"
                width="100%"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No monthly data available</div>
            )}
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_8px_30px_rgb(2,6,23,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-emerald-300 hover:shadow-lg">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <FiPieChart className="h-5 w-5 text-emerald-600 transition-transform group-hover:rotate-6" /> Revenue by Category
          </h2>
          <div className="h-80">
            {revenueByCategorySeries.length > 0 ? (
              <Chart options={revenueByCategoryOptions} series={revenueByCategorySeries} type="donut" height="100%" width="100%" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No revenue data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="group rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_8px_30px_rgb(2,6,23,0.06)] backdrop-blur-xl transition-all duration-200 hover:border-rose-300 hover:shadow-lg">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <FiPieChart className="h-5 w-5 text-rose-600 transition-transform group-hover:rotate-6" /> Expenses by Category
          </h2>
          <div className="h-80">
            {expenseByCategorySeries.length > 0 ? (
              <Chart options={expenseByCategoryOptions} series={expenseByCategorySeries} type="donut" height="100%" width="100%" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No expense data available</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-[0_8px_30px_rgb(2,6,23,0.06)] backdrop-blur-xl">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-800">
            <FiBarChart2 className="h-5 w-5 text-violet-600" /> Quick Stats
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-sky-300">
              <p className="text-sm font-medium text-sky-700">Accounts Receivable</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(receivables)}</p>
              <p className="mt-1 text-xs text-sky-600">Total outstanding</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-violet-300">
              <p className="text-sm font-medium text-violet-700">Accounts Payable</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{formatCurrency(payables)}</p>
              <p className="mt-1 text-xs text-violet-600">Total outstanding</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-emerald-300">
              <p className="text-sm font-medium text-emerald-700">Profit Margin</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : '0%'}
              </p>
              <p className="mt-1 text-xs text-emerald-600">Net profit / Revenue</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:border-orange-300">
              <p className="text-sm font-medium text-orange-700">Expense Ratio</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {totalRevenue > 0 ? `${((totalExpense / totalRevenue) * 100).toFixed(1)}%` : '0%'}
              </p>
              <p className="mt-1 text-xs text-orange-600">Expenses / Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
