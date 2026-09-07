CREATE TABLE `tariffsList` (
	`id` integer NOT NULL,
	`work_standard_tariff_id` text NOT NULL,
	`work_standard_id` text,
	`tariff_type` integer,
	`tariff_discriminator` integer,
	`overtime_ratio` real,
	`workload_type` integer,
	`comment` text,
	`technique_model_id` text,
	`agricultural_machinery_model_id` text,
	`unit_code` text,
	`norm_value` real,
	`norm_value_ha` real,
	`norm_fuel_value_per_hour` real,
	`norm_fuel_value_per_unit` real,
	`norm_fuel_per_ha` real,
	`tariff_ranked_parameters` text,
	`tariff_price_parameters` text,
	`is_deleted` integer DEFAULT false,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tariffsList_work_standard_tariff_id_unique` ON `tariffsList` (`work_standard_tariff_id`);