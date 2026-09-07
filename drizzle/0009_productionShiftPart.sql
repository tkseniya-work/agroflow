CREATE TABLE `part` (
	`id` text NOT NULL,
	`is_initial` integer,
	`stationary_tasks_id` text,
	`field_tasks_id` text,
	`transport_tasks_id` text,
	`products_transportation_tasks_id` text,
	FOREIGN KEY (`stationary_tasks_id`) REFERENCES `stationaryTask`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`field_tasks_id`) REFERENCES `fieldTask`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transport_tasks_id`) REFERENCES `transportTask`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`products_transportation_tasks_id`) REFERENCES `productsTransportationTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`value` integer,
	`exp_bonus_amount` integer,
	`overtime_bonus_amount` integer,
	`fixed_bonus_amount` integer,
	`stationary_tasks_id` text,
	`field_tasks_id` text,
	`transport_tasks_id` text,
	`products_transportation_tasks_id` text,
	FOREIGN KEY (`stationary_tasks_id`) REFERENCES `stationaryTask`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`field_tasks_id`) REFERENCES `fieldTask`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`transport_tasks_id`) REFERENCES `transportTask`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`products_transportation_tasks_id`) REFERENCES `productsTransportationTask`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_payments`("id", "value", "exp_bonus_amount", "overtime_bonus_amount", "fixed_bonus_amount", "stationary_tasks_id", "field_tasks_id", "transport_tasks_id", "products_transportation_tasks_id") SELECT "id", "value", "exp_bonus_amount", "overtime_bonus_amount", "fixed_bonus_amount", "stationary_tasks_id", "field_tasks_id", "transport_tasks_id", "products_transportation_tasks_id" FROM `payments`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
ALTER TABLE `__new_payments` RENAME TO `payments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;