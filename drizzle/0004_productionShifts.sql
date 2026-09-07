CREATE TABLE `aggregate` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`technique_id` text,
	`agricultural_machinery_id` text,
	`output_value_total` real,
	`parts_duration` real,
	`open_at_parts_time` text,
	`closed_at_parts_time` text,
	`field_task_id` text,
	FOREIGN KEY (`field_task_id`) REFERENCES `fieldTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `closeProductionShift` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`closed_at` text,
	`shift_id` text
);
--> statement-breakpoint
CREATE TABLE `fieldTask` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`production_task_id` text,
	`work_standard_id` text,
	`comment` text,
	`season_year` integer,
	`date_start` text,
	`calculated_date_end` text,
	`status_id` integer,
	`status_description` text,
	`payment_value` integer,
	`exp_bonus_amount` integer,
	`overtime_bonus_amount` integer,
	`output_value_total` real,
	`parts_duration` real,
	`open_at_parts_time` text,
	`closed_at_parts_time` text,
	`shift_id` text,
	FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `field` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_field_id` text,
	`task_field_name` text,
	`area_fact` real,
	`transported_weight` real,
	`threshed` real,
	`number_of_bins` integer,
	`number_of_trips` integer,
	`long_stops_duration` real,
	`small_stops_duration` real,
	`max_speed` real,
	`avg_speed` real,
	`output_value_total` real,
	`parts_duration` real,
	`open_at_parts_time` text,
	`closed_at_parts_time` text,
	`output_id` text,
	FOREIGN KEY (`output_id`) REFERENCES `output`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `openProductionShift` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shift_type` integer,
	`employee_id` text,
	`scanned_at` text,
	`scanned_place` text
);
--> statement-breakpoint
CREATE TABLE `output` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`output_value_total` real,
	`parts_duration` real,
	`open_at_parts_time` text,
	`closed_at_parts_time` text,
	`aggregate_id` text,
	FOREIGN KEY (`aggregate_id`) REFERENCES `aggregate`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`value` integer,
	`exp_bonus_amount` integer,
	`overtime_bonus_amount` integer,
	`fixed_bonus_amount` integer,
	`fieldTask_id` text,
	`transfer_id` text,
	FOREIGN KEY (`fieldTask_id`) REFERENCES `fieldTask`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transfer_id`) REFERENCES `transfer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settingsProductionShifts` (
	`id` text NOT NULL,
	`time_offset` text,
	`first_shift_start` text,
	`first_shift_end` text,
	`second_shift_start` text,
	`second_shift_end` text
);
--> statement-breakpoint
CREATE TABLE `shift` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`production_shift_id` text,
	`employee_id` text,
	`date` text,
	`open_at` text,
	`closed_at` text,
	`qr_code_scanned_at` text,
	`exp_bonus_amount` integer,
	`overtime_bonus_amount` integer,
	`fixed_bonus_amount` integer,
	`output_value_total` real,
	`parts_duration` real,
	`open_at_parts_time` text,
	`closed_at_parts_time` text
);
--> statement-breakpoint
CREATE TABLE `stationaryTask` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shift_id` text,
	FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tariff` (
	`id` text NOT NULL,
	`work_standard_id` text,
	`unit_code` text,
	`tariffs_id` text,
	FOREIGN KEY (`tariffs_id`) REFERENCES `tariffs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tariffPriceParameter` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shift` integer,
	`unit` real,
	`tariff_id` text,
	FOREIGN KEY (`tariff_id`) REFERENCES `tariff`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tariffs` (
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
	`transfer_id` text,
	FOREIGN KEY (`field_id`) REFERENCES `field`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transfer_id`) REFERENCES `transfer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transfer` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`long_stops_duration` real,
	`small_stops_duration` real,
	`max_speed` real,
	`avg_speed` real,
	`output_value_total` real,
	`parts_duration` real,
	`open_at_parts_time` text,
	`closed_at_parts_time` text,
	`aggregate_id` text,
	FOREIGN KEY (`aggregate_id`) REFERENCES `aggregate`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transportTask` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shift_id` text,
	FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transportationTask` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shift_id` text,
	FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `parts`;--> statement-breakpoint
DROP TABLE `payment`;--> statement-breakpoint
DROP TABLE `productionShift`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_shiftType` (
	`id` integer,
	`description` text,
	`shift_id` text,
	FOREIGN KEY (`shift_id`) REFERENCES `shift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_shiftType`("id", "description", "shift_id") SELECT "id", "description", "shift_id" FROM `shiftType`;--> statement-breakpoint
DROP TABLE `shiftType`;--> statement-breakpoint
ALTER TABLE `__new_shiftType` RENAME TO `shiftType`;--> statement-breakpoint
PRAGMA foreign_keys=ON;