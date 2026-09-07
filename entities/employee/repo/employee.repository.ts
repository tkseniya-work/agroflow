import { eq } from "drizzle-orm";

import { db } from "../../../db/client";
import { companies, employees, fedstatRegion, positions } from "../../../db/schema";
import type {
  CompanyDto,
  EmployeeDto,
} from "../model/employee.interface";

const toTimestamp = (value: string | null | undefined) => {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

const toNumberOrNull = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
};

const mapEmployeeToDb = (employee: EmployeeDto) => ({
  id: employee.id,
  email: employee.email,
  status: employee.status,
  erp_old_id: employee.erp_old_id ?? null,
  firstname: employee.firstname,
  surname: employee.surname,
  middlename: employee.middlename,
  company_id: employee.company_id,
  user_id: employee.user_id,
  role: employee.role,
  role_description: employee.role_description,
  image_url: employee.image_url,
  id_1c: employee.id_1c,
  hired_at: toTimestamp(employee.hired_at),
  birthday: toTimestamp(employee.birthday),
  date_of_dismissal: toTimestamp(employee.date_of_dismissal),
  phone: employee.phone,
});

const mapCompanyToDb = (company: CompanyDto) => ({
  company_uuid: company.company_uuid,
  company_id: toNumberOrNull(company.company_id),
  name: company.name,
  legal_form: company.legal_form,
  phone_1: company.phone_1,
  address: company.address,
  location: company.location,
  email: company.email,
});

export const employeeRepository = {
  async findFirst() {
    const rows = await db
      .select()
      .from(employees)
      .leftJoin(positions, eq(employees.id, positions.employeeId));

    return rows[0] ?? null;
  },

  async create(employee: EmployeeDto) {
    return db.transaction(async (tx) => {
      await tx.delete(positions).where(eq(positions.employeeId, employee.id));
      await tx.delete(employees).where(eq(employees.id, employee.id));

      const insertedEmployee = await tx
        .insert(employees)
        .values(mapEmployeeToDb(employee));

      if (employee.position) {
        await tx.insert(positions).values({
          ...employee.position,
          employeeId: employee.id,
        });
      }

      return insertedEmployee;
    });
  },

  async clear() {
    await db.transaction(async (tx) => {
      await tx.delete(employees);
      await tx.delete(positions);
    });
  },
};

export const companyRepository = {
  async findFirst() {
    const rows = await db.select().from(companies);
    return rows[0] ?? null;
  },

  async create(company: CompanyDto) {
    return db.transaction(async (tx) => {
      const existingCompanies = await tx
        .select()
        .from(companies)
        .where(eq(companies.company_uuid, company.company_uuid));

      for (const existingCompany of existingCompanies) {
        await tx
          .delete(fedstatRegion)
          .where(eq(fedstatRegion.companyId, String(existingCompany.id)));
      }

      await tx
        .delete(companies)
        .where(eq(companies.company_uuid, company.company_uuid));

      const insertedCompany = await tx
        .insert(companies)
        .values(mapCompanyToDb(company));

      if (company.fedstat_region) {
        await tx.insert(fedstatRegion).values({
          code: company.fedstat_region.code,
          name: company.fedstat_region.name,
          companyId: String(insertedCompany.lastInsertRowId),
        });
      }

      return insertedCompany;
    });
  },

  async clear() {
    await db.transaction(async (tx) => {
      await tx.delete(companies);
      await tx.delete(fedstatRegion);
    });
  },
};

export type EmployeeRow = NonNullable<
  Awaited<ReturnType<typeof employeeRepository.findFirst>>
>;
export type CompanyRow = NonNullable<
  Awaited<ReturnType<typeof companyRepository.findFirst>>
>;
