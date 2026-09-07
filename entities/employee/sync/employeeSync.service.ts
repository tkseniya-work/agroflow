import { employeeApi } from "../api/employee.api";
import {
  companyRepository,
  employeeRepository,
} from "../repo/employee.repository";
import { createEmployeeSyncService } from "./employeeSync.service.factory";

export const employeeSyncService = createEmployeeSyncService({
  employeeApi,
  employeeRepository,
  companyRepository,
});
