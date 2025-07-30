// types/company.ts
export interface GLEntry {
    company: string;
    account: string;
    posting_date: string;  // Could be Date if you want to parse it
    debit: number;
    credit: number;
    voucher_type: string;
    voucher_no: string;
  }
  
  export interface Company {
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
  
  // Optional: If you want to parse dates and format numbers
  export interface ProcessedCompany extends Omit<Company, 'gl_entries' | 'posting_date'> {
    formatted_valuation?: string;
    formatted_balance?: string;
    gl_entries: Array<GLEntry & {
      formatted_debit?: string;
      formatted_credit?: string;
      posting_date_obj?: Date;
    }>;
  }