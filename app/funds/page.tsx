import axios from "axios";
import DashboardLayout from "../dlayout";
import Cards from "./cards";
import FundClient from "./fundClient";
import ValuationTable from "./valuation";

export default async function Funds() {
  try {
    const response = await axios.get('http://34.59.74.22/api/method/companies', {
      headers: {
        Authorization: 'Basic ' + Buffer.from('911d30d72104ac4:6ae9a0b0eb015e1').toString('base64')
      }
    });

    // Process the data before passing it down
    const data = response.data.data.company_financial_data;
    const companies = Array.isArray(data) ? data : [data];
    console.log(companies)

    return (
      <DashboardLayout>
        <Cards financialData={response.data.data.overview} />
        <FundClient />
        <ValuationTable companies={companies} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Error fetching companies:', error);
    return (
      <DashboardLayout>
        {/* <Cards />
        <FundClient /> */}
        <ValuationTable companies={[]} error="Failed to load companies data" />
      </DashboardLayout>
    );
  }
}