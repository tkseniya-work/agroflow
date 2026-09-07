CREATE TABLE `agriculturalMachineryModel` (
	`id` text NOT NULL,
	`external_id` text,
	`company_id` text,
	`name` text,
	`source` text,
	`agriculturalMachineryId` text,
	FOREIGN KEY (`agriculturalMachineryId`) REFERENCES `agriculturalMachineryStandard`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `agriculturalMachineryStandard` (
	`id` text NOT NULL,
	`name` text,
	`width` integer,
	`minimal_power` integer,
	`company_id` text,
	`type` integer,
	`id_1c` text
);
--> statement-breakpoint
CREATE TABLE `coordinates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`coordinates` text,
	`workplaceZoneId` text,
	FOREIGN KEY (`workplaceZoneId`) REFERENCES `workplaceZone`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lastCreatedBy` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`fullname` text,
	`productionTaskId` text,
	FOREIGN KEY (`productionTaskId`) REFERENCES `productionTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lastModifiedBy` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`fullname` text,
	`productionTaskId` text,
	FOREIGN KEY (`productionTaskId`) REFERENCES `productionTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `machineryModel` (
	`id` text NOT NULL,
	`name` text,
	`power` integer,
	`fuel_consumption` integer,
	`external_id` text,
	`company_id` text,
	`source` text,
	`fuel_type` integer,
	`fuel_consumption_per_distance` integer,
	`load_capacity` integer,
	`type` integer,
	`techniqueStandardId` text,
	FOREIGN KEY (`techniqueStandardId`) REFERENCES `techniqueStandard`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parts` (
	`id` text NOT NULL,
	`production_shift_id` text,
	`production_task_id` text,
	`production_task_name` text,
	`tariff_id` text,
	`tariff_name` text,
	`work_place_id` text,
	`work_place_name` text,
	`start_at` integer,
	`end_at` integer,
	`output_value` integer
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` text NOT NULL,
	`production_shift_part_id` text,
	`value` integer,
	`exp_bonus_amount` integer,
	`overtime_bonus_amount` integer,
	`partId` text,
	FOREIGN KEY (`partId`) REFERENCES `parts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment2` (
	`id` text NOT NULL,
	`production_shift_id` text,
	`value` integer,
	`exp_bonus_amount` integer,
	`overtime_bonus_amount` integer,
	`fixed_bonus_amount` integer,
	`productionShiftId` text,
	FOREIGN KEY (`productionShiftId`) REFERENCES `productionShift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `position` (
	`id` text,
	`name` text,
	`description` text,
	`id_1c` text,
	`employeeId` text,
	FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `productionShift` (
	`id` text NOT NULL,
	`employee_id` text,
	`date` text
);
--> statement-breakpoint
CREATE TABLE `productionTask` (
	`id` text NOT NULL,
	`season_year` integer,
	`comment` text,
	`date_start` text,
	`calculated_date_end` text
);
--> statement-breakpoint
CREATE TABLE `productionWorkPlace` (
	`id` text NOT NULL,
	`name` text,
	`comapny_id` text,
	`code` text,
	`is_deleted` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `shiftType` (
	`id` text NOT NULL,
	`description` text,
	`productionShiftId` text,
	FOREIGN KEY (`productionShiftId`) REFERENCES `productionShift`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `status` (
	`id` text,
	`description` text,
	`productionTaskId` text,
	FOREIGN KEY (`productionTaskId`) REFERENCES `productionTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `techniqueStandard` (
	`id` text NOT NULL,
	`name` text,
	`company_id` text,
	`state_number` text,
	`id_1c` text,
	`wianlon_id` text,
	`autograph_id` text,
	`fuel_tank_capacity` integer,
	`engine_power` integer,
	`purchase_price` integer,
	`residual_value` integer,
	`photo_link` text,
	`icon_link` text,
	`track_color` text
);
--> statement-breakpoint
CREATE TABLE `workStandard` (
	`id` text NOT NULL,
	`name` text,
	`company_id` text,
	`work_kind_id` integer,
	`work_type_id` integer,
	`iid_1cd` text,
	`productionTaskId` text,
	FOREIGN KEY (`productionTaskId`) REFERENCES `productionTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workplaceType` (
	`id` text NOT NULL,
	`description` text,
	`productionWorkPlaceId` text,
	FOREIGN KEY (`productionWorkPlaceId`) REFERENCES `productionWorkPlace`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workplaceZone` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`productionWorkPlaceId` text,
	FOREIGN KEY (`productionWorkPlaceId`) REFERENCES `productionWorkPlace`(`id`) ON UPDATE no action ON DELETE no action
);
