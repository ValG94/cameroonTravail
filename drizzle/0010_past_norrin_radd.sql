CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`sujet` varchar(300),
	`contenu` text NOT NULL,
	`cvId` int,
	`lu` boolean NOT NULL DEFAULT false,
	`dateLecture` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profile_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatUserId` int NOT NULL,
	`viewerUserId` int,
	`cvId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profile_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_users_id_fk` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_receiverId_users_id_fk` FOREIGN KEY (`receiverId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profile_views` ADD CONSTRAINT `profile_views_candidatUserId_users_id_fk` FOREIGN KEY (`candidatUserId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;