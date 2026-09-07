import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const agriculturalMachineryStandards = sqliteTable(
  "agriculturalMachineryStandard",
  {
    id: text("id").notNull().unique(),
    name: text("name"),
    width: integer("width"),
    minimal_power: integer("minimal_power"),
    company_id: text("company_id"),
    type: integer("type"),
    id_1c: text("id_1c"),
  },
);

export const agriculturalMachineryModels = sqliteTable(
  "agriculturalMachineryModel",
  {
    id: text("id").notNull().unique(),
    external_id: text("external_id"),
    company_id: text("company_id"),
    name: text("name"),
    source: text("source"),
    agriculturalMachineryId: text().references(
      () => agriculturalMachineryStandards.id,
    ),
  },
);

export type AgriculturalMachineryStandards =
  typeof agriculturalMachineryStandards.$inferSelect;
export type AgriculturalMachineryModel =
  typeof agriculturalMachineryModels.$inferSelect;
