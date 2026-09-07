CREATE TABLE `crop` (
	`id` text NOT NULL,
	`name` text,
	`id_1c` text,
	`color` text,
	`croprotationsId` text,
	FOREIGN KEY (`croprotationsId`) REFERENCES `Croprotation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Croprotation` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clean_fallow` integer,
	`seasonFieldsId` text,
	FOREIGN KEY (`seasonFieldsId`) REFERENCES `seasonFields`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `seasonFields` (
	`id` text NOT NULL,
	`company_id` text,
	`id_1c` text,
	`number` text,
	`name` text,
	`area` integer,
	`map_area` integer,
	`srid` integer,
	`ground_type` integer,
	`origin_field_id` text,
	`taskFieldsId` text,
	FOREIGN KEY (`taskFieldsId`) REFERENCES `taskField`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `taskField` (
	`id` text NOT NULL,
	`id_1c` text,
	`season` integer,
	`number` text,
	`name` text,
	`area` integer,
	`map_area` integer,
	`srid` integer,
	`ground_type` integer
);
--> statement-breakpoint
DROP TABLE `payment2`;--> statement-breakpoint
ALTER TABLE `coordinates` ADD `seasonFieldsId` text REFERENCES seasonFields(id);--> statement-breakpoint
ALTER TABLE `coordinates` ADD `taskFieldsId` text REFERENCES taskField(id);--> statement-breakpoint
ALTER TABLE `parts` ADD `agricultural_machinery_id` text;--> statement-breakpoint
ALTER TABLE `parts` ADD `threshed` integer;--> statement-breakpoint
ALTER TABLE `parts` ADD `number_of_bins` integer;--> statement-breakpoint
ALTER TABLE `parts` ADD `number_of_trips` integer;--> statement-breakpoint
ALTER TABLE `parts` ADD `transported_weight` integer;--> statement-breakpoint
ALTER TABLE `payment` ADD `productionShiftId` text REFERENCES productionShift(id);