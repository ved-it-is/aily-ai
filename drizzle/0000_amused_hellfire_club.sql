CREATE TABLE `progress` (
	`user_id` text NOT NULL,
	`activity_id` text NOT NULL,
	`completed_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `activity_id`)
);
