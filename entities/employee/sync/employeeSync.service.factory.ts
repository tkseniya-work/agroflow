import type {
  CompanyDto,
  EmployeeDto,
} from "../model/employee.interface";

type EmployeeApi = {
  loadEmployee: (
    accessToken: string,
    userId: string,
  ) => Promise<EmployeeDto | null>;
  loadCompany: (
    accessToken: string,
    companyUuid: string,
  ) => Promise<CompanyDto | null>;
};

type RecordRepository<Item> = {
  create: (item: Item) => Promise<unknown> | unknown;
};

type EmployeeSyncDependencies = {
  employeeApi: EmployeeApi;
  employeeRepository: RecordRepository<EmployeeDto>;
  companyRepository: RecordRepository<CompanyDto>;
};

export const createEmployeeSyncService = ({
  employeeApi,
  employeeRepository,
  companyRepository,
}: EmployeeSyncDependencies) => ({
  async syncEmployee(accessToken: string, userId: string) {
    const employee = await employeeApi.loadEmployee(accessToken, userId);

    if (!employee) return null;

    return employeeRepository.create(employee);
  },

  async syncCompany(accessToken: string, companyUuid: string) {
    const company = await employeeApi.loadCompany(accessToken, companyUuid);

    if (!company) return null;

    return companyRepository.create(company);
  },
});
