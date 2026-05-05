ALTER TABLE `cv_data` MODIFY COLUMN `prenom` varchar(100);--> statement-breakpoint
ALTER TABLE `cv_data` MODIFY COLUMN `nom` varchar(100);--> statement-breakpoint
ALTER TABLE `cv_data` MODIFY COLUMN `titre` varchar(200);--> statement-breakpoint
ALTER TABLE `cv_data` MODIFY COLUMN `email` varchar(200);--> statement-breakpoint
ALTER TABLE `cv_data` MODIFY COLUMN `telephone` varchar(50);--> statement-breakpoint
ALTER TABLE `cv_data` MODIFY COLUMN `adresse` varchar(300);--> statement-breakpoint
ALTER TABLE `cv_data` MODIFY COLUMN `siteWeb` varchar(200);--> statement-breakpoint
ALTER TABLE `cv_data` MODIFY COLUMN `couleurColonne` varchar(20) DEFAULT '#374151';