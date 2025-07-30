import { GLEntry } from "@/utils/glUtils";

interface CompanyOverviewProps {
  glEntries: GLEntry[];
}

const CompanyOverview = ({ glEntries }: CompanyOverviewProps) => {
  // Calculate total revenue from GL entries
  const calculateTotalRevenue = () => {
    if (!glEntries || glEntries.length === 0) return 0;
    
    let totalRevenue = 0;
    glEntries.forEach(entry => {
      // Include all credit entries that represent income
      if (entry.credit > 0 && 
          (entry.account.includes("Sales") || 
           entry.account.includes("Revenue") ||
           entry.account.includes("Income"))) {
        totalRevenue += entry.credit;
      }
    });
    return totalRevenue;
  };

  // Calculate net profit from the GL entries
  const calculateNetProfit = () => {
    if (!glEntries || glEntries.length === 0) return 0;
    
    let totalRevenue = 0;
    let totalExpenses = 0;

    glEntries.forEach(entry => {
      if (entry.credit > 0 && 
          (entry.account.includes("Sales") || 
           entry.account.includes("Revenue") ||
           entry.account.includes("Income"))) {
        totalRevenue += entry.credit;
      }
      
      if (entry.debit > 0 && 
          !entry.account.includes("Asset") &&
          !entry.account.includes("Receivable") &&
          !entry.account.includes("Inventory")) {
        totalExpenses += entry.debit;
      }
    });

    return totalRevenue - totalExpenses;
  };

  // Calculate total investment from equity and liability accounts
  const calculateTotalInvestment = () => {
    if (!glEntries || glEntries.length === 0) return 0;
    
    let totalInvestment = 0;
    glEntries.forEach(entry => {
      if (entry.account.includes("Equity") || 
          entry.account.includes("Capital") ||
          entry.account.includes("Loan") ||
          entry.account.includes("Investment")) {
        totalInvestment += entry.credit;
      }
    });
    return totalInvestment || 100000; // Fallback to $100,000 if no investment found
  };

  const totalRevenue = calculateTotalRevenue();
  const netProfit = calculateNetProfit();
  const investment = calculateTotalInvestment();
  const roi = ((netProfit / investment) * 100).toFixed(2);
  
  // Calculate valuation based on revenue multiple (adjust based on industry)
  const getRevenueMultiple = () => {
    if (totalRevenue < 50000) return 5;  // Early stage
    if (totalRevenue < 500000) return 7; // Growth stage
    return 8;                            // Established
  };
  
  const revenueMultiple = getRevenueMultiple();
  const companyValuation = totalRevenue * revenueMultiple;

  if (!glEntries || glEntries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Financial Data Available</h2>
          <p className="text-gray-600">General ledger entries not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Financial Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ROI Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Return on Investment</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Investment Amount</p>
              <p className="text-2xl font-bold text-gray-800">${investment.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 mb-1">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(netProfit).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-600 mb-1">ROI</p>
            <p className={`text-3xl font-bold ${parseFloat(roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {roi}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {parseFloat(roi) >= 0 ? 'Positive' : 'Negative'} return on investment
            </p>
          </div>
        </div>

        {/* Valuation Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Company Valuation</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Annual Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600 mb-1">Multiple</p>
              <p className="text-2xl font-bold text-gray-800">{revenueMultiple}x</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 mb-1">Estimated Valuation</p>
            <p className="text-3xl font-bold text-blue-600">${companyValuation.toLocaleString()}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 mb-1">Valuation Method</p>
            <p className="text-sm text-gray-800">
              {revenueMultiple === 5 ? 'Early Stage' : 
               revenueMultiple === 7 ? 'Growth Stage' : 'Established'} SaaS Multiple
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Based on annual revenue and industry benchmarks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;