// app/single_fund/page.tsx
import { createFund, getFunds } from "../actions/actions";
import DashboardLayout from "../dlayout";
import FundMaker from "./fundMaker";
import FundsTable from "./fundsTable";


export default async function SingleFund() {
  const fundsData = await getFunds();
  const funds = fundsData.data || [];

  return (
    <DashboardLayout>
      <FundMaker createFundAction={createFund} />
      <FundsTable funds={funds} />
    </DashboardLayout>
  );
}