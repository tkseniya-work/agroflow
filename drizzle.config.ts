import type { Config } from 'drizzle-kit';

export default {
  schema: [
    './db/schema/employee.ts',
    './db/schema/company.ts',
    './db/schema/techniqueStandard.ts',
    './db/schema/agriculturalMachinery.ts',
    './db/schema/productionWorkPlace.ts',
    './db/schema/season.ts',
    './db/schema/productionTask.ts',
    './db/schema/workStandard.ts',
    './db/schema/productionShift.ts',
    './db/schema/unitOfMeasure.ts',
    './db/schema/tariffsList.ts',
  ],
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;