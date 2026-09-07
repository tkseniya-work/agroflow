CREATE TABLE `productsTransportationTask` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`production_task_id` text,
	`work_standard_id` text,
	`comment` text,
	`season_year` integer,
	`date_start` text,
	`calculated_date_end` text,
	`payment_value` integer,
	`exp_bonus_amount` integer,
	`open_at_parts_time` text,
	`closed_at_parts_time` text,
	`shift_id` text,
	FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `transportationTask`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tariffs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`area_fact` real,
	`exp_bonus_amount_total` integer,
	`overtime_bonus_amount_total` integer,
	`long_stops_duration` real,
	`small_stops_duration` real,
	`max_speed` real,
	`avg_speed` real,
	`output_value_total` real,
	`parts_duration` real,
	`open_at_parts_time` text,
	`closed_at_parts_time` text,
	`field_id` text,
	`aggregate_id` text,
	`stationary_tasks_id` text,
	FOREIGN KEY (`field_id`) REFERENCES `field`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`aggregate_id`) REFERENCES `aggregate`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stationary_tasks_id`) REFERENCES `stationaryTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_tariffs`("id", "area_fact", "exp_bonus_amount_total", "overtime_bonus_amount_total", "long_stops_duration", "small_stops_duration", "max_speed", "avg_speed", "output_value_total", "parts_duration", "open_at_parts_time", "closed_at_parts_time", "field_id", "aggregate_id", "stationary_tasks_id") SELECT "id", "area_fact", "exp_bonus_amount_total", "overtime_bonus_amount_total", "long_stops_duration", "small_stops_duration", "max_speed", "avg_speed", "output_value_total", "parts_duration", "open_at_parts_time", "closed_at_parts_time", "field_id", "aggregate_id", "stationary_tasks_id" FROM `tariffs`;--> statement-breakpoint
DROP TABLE `tariffs`;--> statement-breakpoint
ALTER TABLE `__new_tariffs` RENAME TO `tariffs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `aggregate` ADD `fuel_per_100_km` text;--> statement-breakpoint
ALTER TABLE `aggregate` ADD `transport_tasks_id` text REFERENCES transportTask(id);--> statement-breakpoint
ALTER TABLE `aggregate` ADD `products_transportation_tasks_id` text REFERENCES transportTask(id);--> statement-breakpoint
ALTER TABLE `field` ADD `fuel_per_ha` text;--> statement-breakpoint
ALTER TABLE `payments` ADD `tariffs_id` text REFERENCES tariff(id);--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `production_task_id` text;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `work_standard_id` text;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `comment` text;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `season_year` integer;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `date_start` text;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `calculated_date_end` text;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `work_place_id` text;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `exp_bonus_amount` integer;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `open_at_parts_time` text;--> statement-breakpoint
ALTER TABLE `stationaryTask` ADD `closed_at_parts_time` text;--> statement-breakpoint
ALTER TABLE `tariff` ADD `norm_value` text;--> statement-breakpoint
ALTER TABLE `tariff` ADD `norm_value_ha` text;--> statement-breakpoint
ALTER TABLE `tariff` ADD `norm_fuel_value_per_hour` text;--> statement-breakpoint
ALTER TABLE `tariff` ADD `norm_fuel_per_ha` text;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `production_task_id` text;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `work_standard_id` text;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `comment` text;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `season_year` integer;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `date_start` text;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `calculated_date_end` text;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `payment_value` integer;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `exp_bonus_amount` integer;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `open_at_parts_time` text;--> statement-breakpoint
ALTER TABLE `transportTask` ADD `closed_at_parts_time` text;