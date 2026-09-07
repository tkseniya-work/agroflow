import {
  companyRepository,
  employeeRepository,
  type CompanyRow,
  type EmployeeRow,
} from "./repo/employee.repository";
import type {
  CompanyDto,
  EmployeeDto,
} from "./model/employee.interface";
import { createLocalRecordAtoms } from "../../shared/lib/jotaiUtils";

type InsertResult = {
  lastInsertRowId: number;
};

type RecordAddResult = {
  success: true;
  insertedCount: 1;
  insertedIds: number;
};

const employeeAtoms = createLocalRecordAtoms<
  EmployeeRow,
  InsertResult,
  RecordAddResult,
  EmployeeDto
>({
  name: "employye",
  repository: employeeRepository,
  addResult: (insertedEmployee) => ({
    success: true,
    insertedCount: 1,
    insertedIds: insertedEmployee.lastInsertRowId,
  }),
});

const companyAtoms = createLocalRecordAtoms<
  CompanyRow,
  InsertResult,
  RecordAddResult,
  CompanyDto
>({
  name: "company",
  repository: companyRepository,
  addResult: (insertedCompany) => ({
    success: true,
    insertedCount: 1,
    insertedIds: insertedCompany.lastInsertRowId,
  }),
});

export const employyeDataAtom = employeeAtoms.dataAtom;
export const employyeLoadingAtom = employeeAtoms.loadingAtom;
export const employyeErrorAtom = employeeAtoms.errorAtom;
export const loadEmployyeAtom = employeeAtoms.loadAtom;
export const addEmployeeAtom = employeeAtoms.addAtom;
export const deleteEmployeeAtom = employeeAtoms.deleteAtom;

export const companyDataAtom = companyAtoms.dataAtom;
export const companyLoadingAtom = companyAtoms.loadingAtom;
export const companyErrorAtom = companyAtoms.errorAtom;
export const loadCompanyAtom = companyAtoms.loadAtom;
export const addCompanyAtom = companyAtoms.addAtom;
export const deleteCompanyAtom = companyAtoms.deleteAtom;
