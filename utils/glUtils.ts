// types.ts
export interface GLEntry {
    company: string;
    account: string;
    posting_date: string;
    debit: number;
    credit: number;
    voucher_type: string;
    voucher_no: string;
  }
  
  // Calculate monthly net cash flow (debits - credits)
  export const getMonthlyBurnRate = (entries: GLEntry[]): { month: string; netCashFlow: number }[] => {
    const monthlyData: Record<string, number> = {};
  
    entries.forEach(entry => {
      if (entry.account.includes("Bank Account")) { // Focus on bank transactions
        const month = entry.posting_date.slice(0, 7); // "YYYY-MM"
        monthlyData[month] = (monthlyData[month] || 0) + entry.debit - entry.credit;
      }
    });
  
    return Object.entries(monthlyData)
      .map(([month, netCashFlow]) => ({ month, netCashFlow }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };
  
  // Calculate runway (months until cash runs out)
  export const calculateRunway = (currentCash: number, avgBurnRate: number): number => {
    return avgBurnRate < 0 ? currentCash / Math.abs(avgBurnRate) : 0;
  };