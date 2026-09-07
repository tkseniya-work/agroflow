CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_uuid` text,
	`company_id` integer,
	`name` text,
	`legal_form` text,
	`phone_1` text,
	`address` text,
	`location` text,
	`email` text
);
--> statement-breakpoint
CREATE TABLE `fedstatRegion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text,
	`name` text,
	`companyId` text,
	FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
