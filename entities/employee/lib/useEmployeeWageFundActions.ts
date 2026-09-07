import { employeeWageFundApi } from "../api/employeeWageFund.api";

export const useEmployeeWageFundActions = () => ({
  loadEmployeeMonthlyWageFund: employeeWageFundApi.loadMonthly,
});
