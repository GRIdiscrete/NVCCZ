"use client"
import { Download, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
  Filler,
} from 'chart.js';
import { motion } from 'framer-motion';
import CompanyOverview from './OpExpenses';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GLEntry {
  posting_date: string;
  account: string;
  debit: number;
  credit: number;
  voucher_type: string;
  voucher_no: string;
  company: string;
}

interface CompanyData {
  company_name: string;
  company_abbr: string;
  default_bank_account: string;
  total_revenue: number;
  total_valuation: number;
  total_income_this_year: number;
  total_expenses_this_year: number;
  profit_this_year: number;
  total_incoming_payments: number;
  total_outgoing_payments: number;
  net_cash_flow: number;
  bank_balance: number;
  gl_entries: GLEntry[];
}

interface CardsProps {
  companies: CompanyData[];
  error?: string;
}

const ComCards = ({ companies, error }: CardsProps) => {
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  // Navy color palette
  const colors = {
    navy: '#001f3f',
    navyLight: '#2c3e50',
    navyLighter: '#3d566e',
    teal: '#39CCCC',
    tealLight: '#7FDBFF',
    white: '#ffffff',
    grayLight: '#f8f9fa',
    gray: '#e9ecef',
    grayDark: '#adb5bd',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
  };

  useEffect(() => {
    if (companies && companies.length > 0) {
      setSelectedCompany(companies[0]);
      setIsLoading(false);
    } else if (error) {
      setIsLoading(false);
    }
  }, [companies, error]);

  const monthlyData = useMemo(() => {
    if (!selectedCompany || !selectedCompany.gl_entries) return [];
    
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    const targetCompanyName = selectedCompany.company_name;
    const companyEntries = selectedCompany.gl_entries.filter(entry => {
      const entryCompanyName = entry.company.split('(')[0].trim();
      return entryCompanyName === targetCompanyName;
    });
  
    companyEntries.forEach(entry => {
      try {
        const date = new Date(entry.posting_date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { income: 0, expenses: 0 };
        }
  
        if (entry.credit > 0 && (
          entry.account.includes('Sales') || 
          entry.account.includes('Revenue') ||
          entry.account.includes('Income') ||
          entry.voucher_type.includes('Invoice')
        )) {
          monthlyData[monthYear].income += entry.credit;
        }
  
        if (entry.debit > 0 && !(
          entry.account.includes('Asset') ||
          entry.account.includes('Receivable') ||
          entry.account.includes('Inventory') ||
          entry.account.includes('Bank')
        )) {
          monthlyData[monthYear].expenses += entry.debit;
        }
      } catch (e) {
        console.error('Error processing entry:', entry, e);
      }
    });
  
    setChartKey(prev => prev + 1);
  
    const sortedData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: data.income,
        expenses: data.expenses,
        profit: data.income - data.expenses
      }));
  
    console.log(`Processed ${companyEntries.length} entries for ${targetCompanyName}`);
    return sortedData;
  }, [selectedCompany]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          color: colors.navy
        }
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'> | TooltipItem<'line'>) => {
            const value = context.parsed.y ?? context.parsed;
            return `$${value?.toLocaleString() ?? '0'}`;
          }
        },
        backgroundColor: colors.navy,
        titleFont: {
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { 
          color: colors.gray,
          drawBorder: false
        },
        ticks: { 
          color: colors.navyLighter,
          callback: (value: string | number) => `$${Number(value).toLocaleString()}`,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      },
      x: { 
        grid: { 
          display: false,
          drawBorder: false
        },
        ticks: {
          color: colors.navyLighter,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 4,
        hoverRadius: 6,
        hoverBorderWidth: 2
      },
      bar: {
        borderRadius: 6,
        borderSkipped: 'bottom' as const
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#001f3f]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-[#dc3545] bg-[#f8d7da] rounded-lg border border-[#f5c6cb]">
        Error loading data: {error}
      </div>
    );
  }

  if (!selectedCompany) {
    return (
      <div className="p-4 text-[#6c757d] bg-[#e9ecef] rounded-lg">
        No company data available
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-[#f8f9fa]">
      {/* Company Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between w-full md:w-64 px-4 py-3 bg-white border border-[#e9ecef] rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-[#001f3f] hover:border-[#2c3e50] transition-colors"
        >
          <span className="truncate font-medium text-[#001f3f]">{selectedCompany.company_name}</span>
          <ChevronDown className={`h-5 w-5 text-[#2c3e50] transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full md:w-64 bg-white border border-[#e9ecef] rounded-lg shadow-lg max-h-60 overflow-auto">
            {companies.map((company) => (
              <div
                key={company.company_name}
                className={`px-4 py-2 hover:bg-[#f1f5f9] cursor-pointer transition-colors ${
                  selectedCompany.company_name === company.company_name ? 'bg-[#e9ecef]' : ''
                }`}
                onClick={() => {
                  setSelectedCompany(company);
                  setIsDropdownOpen(false);
                }}
              >
                <p className="text-[#001f3f] font-medium">{company.company_name}</p>
                <p className="text-xs text-[#6c757d]">{company.company_abbr}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-[#e9ecef] hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#6c757d] uppercase tracking-wider">Total Revenue</h3>
            <div className="h-8 w-8 rounded-full bg-[#e6f7ff] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 15.39 15.24 18.15 12 19.13V12H5V6.3L12 3.19V11.99Z" fill="#39CCCC"/>
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold mt-3 text-[#001f3f]">
            ${selectedCompany.total_revenue.toLocaleString()}
          </p>
          <div className="mt-4 pt-3 border-t border-[#e9ecef]">
            <p className="text-xs text-[#6c757d]">
              From {monthlyData.length} months
            </p>
          </div>
        </motion.div>

        {/* Expenses Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-[#e9ecef] hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#6c757d] uppercase tracking-wider">Total Expenses</h3>
            <div className="h-8 w-8 rounded-full bg-[#fff2f0] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 7H13V9H11V7ZM11 11H13V17H11V11ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#dc3545"/>
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold mt-3 text-[#001f3f]">
            ${selectedCompany.total_expenses_this_year.toLocaleString()}
          </p>
          <div className="mt-4 pt-3 border-t border-[#e9ecef]">
            <p className="text-xs text-[#6c757d]">
              Avg ${(selectedCompany.total_expenses_this_year / monthlyData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
            </p>
          </div>
        </motion.div>

        {/* Profit Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-[#e9ecef] hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#6c757d] uppercase tracking-wider">Profit</h3>
            <div className="h-8 w-8 rounded-full bg-[#e6f7e6] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#28a745"/>
              </svg>
            </div>
          </div>
          <p className={`text-2xl font-bold mt-3 ${
            selectedCompany.profit_this_year >= 0 ? 'text-[#28a745]' : 'text-[#dc3545]'
          }`}>
            ${Math.abs(selectedCompany.profit_this_year).toLocaleString()}
          </p>
          <div className="mt-4 pt-3 border-t border-[#e9ecef]">
            <p className="text-xs text-[#6c757d]">
              {selectedCompany.profit_this_year >= 0 ? 'Profit' : 'Loss'} margin: {Math.abs(selectedCompany.profit_this_year / selectedCompany.total_revenue * 100).toFixed(1)}%
            </p>
          </div>
        </motion.div>

        {/* Bank Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-[#e9ecef] hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[#6c757d] uppercase tracking-wider">Bank Balance</h3>
            <div className="h-8 w-8 rounded-full bg-[#fff8e6] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 8H19V16H5V8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM7 5H17V6H7V5ZM7 17H17V18H7V17Z" fill="#ffc107"/>
              </svg>
            </div>
          </div>
          <p className={`text-2xl font-bold mt-3 ${
            selectedCompany.bank_balance >= 0 ? 'text-[#28a745]' : 'text-[#dc3545]'
          }`}>
            ${Math.abs(selectedCompany.bank_balance).toLocaleString()}
          </p>
          <div className="mt-4 pt-3 border-t border-[#e9ecef]">
            <p className="text-xs text-[#6c757d] truncate" title={selectedCompany.default_bank_account}>
              {selectedCompany.default_bank_account}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit & Loss Trend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-[#e9ecef] hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-[#001f3f]">Profit & Loss Trend</h3>
            <button 
              className="text-[#2c3e50] hover:text-[#001f3f] transition-colors"
              onClick={() => {
                console.log("Exporting P&L data...");
              }}
            >
              <Download size={18} />
            </button>
          </div>
          <div className="h-80">
            <Line 
              key={`profit-loss-${chartKey}`} 
              data={{
                labels: monthlyData.map(data => data.month),
                datasets: [
                  {
                    label: 'Income',
                    data: monthlyData.map(data => data.income),
                    borderColor: colors.teal,
                    backgroundColor: `${colors.teal}20`,
                    fill: true,
                    pointBackgroundColor: colors.teal,
                    pointBorderColor: colors.white,
                    pointHoverBackgroundColor: colors.white,
                    pointHoverBorderColor: colors.teal,
                  },
                  {
                    label: 'Expenses',
                    data: monthlyData.map(data => data.expenses),
                    borderColor: colors.danger,
                    backgroundColor: `${colors.danger}20`,
                    fill: true,
                    pointBackgroundColor: colors.danger,
                    pointBorderColor: colors.white,
                    pointHoverBackgroundColor: colors.white,
                    pointHoverBorderColor: colors.danger,
                  },
                  {
                    label: 'Profit',
                    data: monthlyData.map(data => data.profit),
                    borderColor: colors.navy,
                    backgroundColor: `${colors.navy}20`,
                    fill: true,
                    pointBackgroundColor: colors.navy,
                    pointBorderColor: colors.white,
                    pointHoverBackgroundColor: colors.white,
                    pointHoverBorderColor: colors.navy,
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
          <div className="mt-3 pt-3 border-t border-[#e9ecef] text-xs text-[#6c757d] text-center">
            Data calculated from {selectedCompany.gl_entries.length} GL entries
          </div>
        </motion.div>

        {/* Cash Flow */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-5 rounded-xl shadow-sm border border-[#e9ecef] hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-[#001f3f]">Cash Flow</h3>
            <button 
              className="text-[#2c3e50] hover:text-[#001f3f] transition-colors"
              onClick={() => {
                console.log("Exporting cash flow data...");
              }}
            >
              <Download size={18} />
            </button>
          </div>
          <div className="h-80">
            <Bar 
              key={`cash-flow-${chartKey}`}
              data={{
                labels: ['Incoming', 'Outgoing', 'Net Flow'],
                datasets: [{
                  label: 'Cash Flow',
                  data: [
                    selectedCompany.total_incoming_payments,
                    selectedCompany.total_outgoing_payments,
                    selectedCompany.net_cash_flow
                  ],
                  backgroundColor: [
                    `${colors.teal}cc`,
                    `${colors.danger}cc`,
                    selectedCompany.net_cash_flow >= 0 
                      ? `${colors.navy}cc` 
                      : `${colors.warning}cc`
                  ],
                  borderColor: [
                    colors.teal,
                    colors.danger,
                    selectedCompany.net_cash_flow >= 0 
                      ? colors.navy 
                      : colors.warning
                  ],
                  borderWidth: 2,
                  borderRadius: 6
                }]
              }}
              options={chartOptions}
            />
          </div>
        </motion.div>
      </div>

      {/* GL Entries Overview */}
      <CompanyOverview glEntries={selectedCompany.gl_entries} />
    </div>
  );
};

export default ComCards;