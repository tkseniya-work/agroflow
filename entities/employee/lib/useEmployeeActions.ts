import { employeeApi } from "../api/employee.api";

export const useEmployeeActions = () => ({
  loadCompany: employeeApi.loadCompany,
  loadEmployee: employeeApi.loadEmployee,
  loadEmployeeList: employeeApi.loadEmployeeList,
  uploadProfilePicture: employeeApi.uploadProfilePicture,
});
