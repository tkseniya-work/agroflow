import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company_uuid: text("company_uuid"),
  company_id: integer("company_id"),
  name: text("name"),
  legal_form: text("legal_form"),
  phone_1: text("phone_1"),
  address: text("address"),
  location: text("location"),
  email: text("email"),
});

export const fedstatRegion = sqliteTable("fedstatRegion", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code"),
  name: text("name"),
  companyId: text().references(() => companies.id),
});

export type Company = typeof companies.$inferSelect;
