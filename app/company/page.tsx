import { GLEntry } from "@/utils/glUtils";
import DashboardLayout from "../dlayout";
import ComCards from "./cards";
import BurnRateChart from "./additionalCard";
import CompanyOverview from "./OpExpenses";
import axios from "axios";


export default async function Company() {
    const response = await axios.get('http://34.59.74.22/api/method/companies', {
        headers: {
          Authorization: 'Basic ' + btoa('911d30d72104ac4:6ae9a0b0eb015e1')
        }
      });
      console.log(response)

    return (
  <>
  <DashboardLayout>

    <ComCards companies={response.data.data.company_financial_data}/>

    <BurnRateChart glEntries={response.data.data.company_financial_data[0].gl_entries} />
  </DashboardLayout>
  </>
    );
  }
  