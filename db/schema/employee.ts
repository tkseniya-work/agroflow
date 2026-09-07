import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const employees = sqliteTable("employees", {
  id: text("id").notNull(),
  email: text("email"),
  status: text("status"),
  erp_old_id: text("erp_old_id"),
  firstname: text("firstname"),
  surname: text("surname"),
  middlename: text("middlename"),
  company_id: text("company_id"),
  user_id: text("user_id"),
  role: text("role"),
  role_description: text("role_description"),
  image_url: text("image_url"),
  id_1c: text("id_1c"),
  hired_at: integer("hired_at"),
  birthday: integer("birthday"),
  date_of_dismissal: integer("date_of_dismissal"),
  phone: text("phone"),
});

export const positions = sqliteTable("position", {
  id: text("id"),
  name: text("name"),
  description: text("description"),
  id_1c: text("id_1c"),
  employeeId: text().references(() => employees.id),
});

export type Employee = typeof employees.$inferSelect;
export type Position = typeof positions.$inferSelect;
