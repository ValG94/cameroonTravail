CREATE TABLE `articles_conseils` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`titre` varchar(300) NOT NULL,
	`description` text NOT NULL,
	`contenu` text NOT NULL,
	`categorie` enum('Entretien','CV','Marché','Négociation','Reconversion','Freelance') NOT NULL,
	`auteur` varchar(150) NOT NULL,
	`tempsLecture` varchar(20) NOT NULL,
	`imageUrl` text,
	`featured` boolean NOT NULL DEFAULT false,
	`datePublication` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_conseils_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_conseils_slug_unique` UNIQUE(`slug`)
);
