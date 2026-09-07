DELETE FROM `machineryModel`
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM `machineryModel`
  WHERE `id` IS NOT NULL
  GROUP BY `id`
);
--> statement-breakpoint
DELETE FROM `techniqueStandard`
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM `techniqueStandard`
  WHERE `id` IS NOT NULL
  GROUP BY `id`
);
--> statement-breakpoint
DELETE FROM `agriculturalMachineryModel`
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM `agriculturalMachineryModel`
  WHERE `id` IS NOT NULL
  GROUP BY `id`
);
--> statement-breakpoint
DELETE FROM `agriculturalMachineryStandard`
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM `agriculturalMachineryStandard`
  WHERE `id` IS NOT NULL
  GROUP BY `id`
);
--> statement-breakpoint
DELETE FROM `productionWorkPlace`
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM `productionWorkPlace`
  WHERE `id` IS NOT NULL
  GROUP BY `id`
);
--> statement-breakpoint
DELETE FROM `workStandard`
WHERE rowid NOT IN (
  SELECT MAX(rowid)
  FROM `workStandard`
  WHERE `id` IS NOT NULL
  GROUP BY `id`
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `techniqueStandard_id_unique` ON `techniqueStandard` (`id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `machineryModel_id_unique` ON `machineryModel` (`id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `agriculturalMachineryStandard_id_unique` ON `agriculturalMachineryStandard` (`id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `agriculturalMachineryModel_id_unique` ON `agriculturalMachineryModel` (`id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `productionWorkPlace_id_unique` ON `productionWorkPlace` (`id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `workStandard_id_unique` ON `workStandard` (`id`);
