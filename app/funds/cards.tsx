import React from 'react';

interface FinancialData {
  total_outgoing_bills: number;
  total_incoming_bills: number;
  total_incoming_payments: number;
  total_outgoing_payments: number;
  profit_and_loss: {
    total_income_this_year: number;
    total_expenses_this_year: number;
    profit_this_year: number;
  };
  previous_period?: {
    total_outgoing_bills: number;
    total_incoming_bills: number;
    total_incoming_payments: number;
    total_outgoing_payments: number;
    profit_and_loss: {
      total_income_this_year: number;
      total_expenses_this_year: number;
      profit_this_year: number;
    };
  };
}

interface CardsProps {
  financialData: FinancialData;
}

const Cards = ({ financialData }: CardsProps) => {
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate percentage change between current and previous period
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return { value: '0.0', isPositive: true }; // Avoid division by zero
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  // Get percentage change for each metric
  const getPercentageChange = () => {
    const prev = financialData.previous_period;
    
    return {
      revenue: prev ? calculatePercentageChange(
        financialData.total_incoming_bills, 
        prev.total_incoming_bills
      ) : { value: '0.0', isPositive: true },
      
      expenses: prev ? calculatePercentageChange(
        financialData.total_outgoing_bills, 
        prev.total_outgoing_bills
      ) : { value: '0.0', isPositive: true },
      
      profit: prev ? calculatePercentageChange(
        financialData.profit_and_loss.profit_this_year, 
        prev.profit_and_loss.profit_this_year
      ) : { value: '0.0', isPositive: financialData.profit_and_loss.profit_this_year >= 0 },
      
      cashFlow: prev ? calculatePercentageChange(
        financialData.total_incoming_payments - financialData.total_outgoing_payments,
        prev.total_incoming_payments - prev.total_outgoing_payments
      ) : { 
        value: '0.0', 
        isPositive: (financialData.total_incoming_payments - financialData.total_outgoing_payments) >= 0 
      }
    };
  };

  const percentageChanges = getPercentageChange();
  const netCashFlow = financialData.total_incoming_payments - financialData.total_outgoing_payments;
  const roiPercentage = (financialData.profit_and_loss.profit_this_year / financialData.profit_and_loss.total_income_this_year) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Revenue Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {formatCurrency(financialData.total_incoming_bills)}
            </h3>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            percentageChanges.revenue.isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {percentageChanges.revenue.isPositive ? '↑' : '↓'}
            {percentageChanges.revenue.value}% vs last period
          </span>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {formatCurrency(financialData.total_outgoing_bills)}
            </h3>
          </div>
          <div className="bg-red-50 p-2 rounded-lg">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            percentageChanges.expenses.isPositive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {percentageChanges.expenses.isPositive ? '↑' : '↓'}
            {percentageChanges.expenses.value}% vs last period
          </span>
        </div>
      </div>

      {/* Profit Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Return On Investments</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {formatCurrency(financialData.profit_and_loss.profit_this_year)}
            </h3>
          </div>
          <div className="bg-green-50 p-2 rounded-lg">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            percentageChanges.profit.isPositive
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {percentageChanges.profit.isPositive ? '↑' : '↓'}
            {percentageChanges.profit.value}% vs last period
          </span>
          <p className="text-xs text-gray-500 mt-2">
            {roiPercentage.toFixed(1)}% ROI
          </p>
        </div>
      </div>

      {/* Cash Flow Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {formatCurrency(netCashFlow)}
            </h3>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="mt-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            percentageChanges.cashFlow.isPositive
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {percentageChanges.cashFlow.isPositive ? '↑' : '↓'}
            {percentageChanges.cashFlow.value}% vs last period
          </span>
          <p className="text-xs text-gray-500 mt-2">
            In: {formatCurrency(financialData.total_incoming_payments)} | Out: {formatCurrency(financialData.total_outgoing_payments)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cards;