CREATE TABLE `formules_tarifaires` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nom` varchar(100) NOT NULL,
	`cible` enum('candidat','employeur') NOT NULL,
	`prix` decimal(10,2) NOT NULL,
	`devise` varchar(10) NOT NULL DEFAULT 'XAF',
	`periode` enum('mensuel','annuel','unique') NOT NULL DEFAULT 'mensuel',
	`description` text,
	`fonctionnalites` text,
	`actif` boolean NOT NULL DEFAULT true,
	`populaire` boolean NOT NULL DEFAULT false,
	`ordre` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `formules_tarifaires_id` PRIMARY KEY(`id`)
);
