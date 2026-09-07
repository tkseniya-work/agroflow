export type EmployeeWageFundAmount = {
  value: number;
  exp_bonus_amount: number;
  overtime_bonus_amount: number;
};

export type EmployeeMonthlyWageFundPayment = EmployeeWageFundAmount & {
  year: number;
  month: number;
};

export type EmployeeWageFundResponse = {
  employee_id: string;
  employee_fullname: string;
  payments: EmployeeMonthlyWageFundPayment[];
  total_payment: EmployeeWageFundAmount;
};

export type EmployeeWageFundRequest = {
  accessToken: string | null;
  employeeIds: string[];
  season: number;
};
