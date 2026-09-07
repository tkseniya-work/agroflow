import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { productionTasks } from "./productionTask";

export const workStandards = sqliteTable("workStandard", {
  id: text("id").notNull().unique(),
  name: text("name"),
  company_id: text("company_id"),
  work_kind_id: integer("work_kind_id"),
  work_type_id: integer("work_type_id"),
  id_1c: text("iid_1cd"),
  productionTaskId: text().references(() => productionTasks.id),
});

export type WorkStandard = typeof workStandards.$inferSelect;
