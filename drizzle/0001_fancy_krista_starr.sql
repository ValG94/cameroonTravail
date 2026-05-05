CREATE TABLE `alertes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatId` int NOT NULL,
	`nom` varchar(200) NOT NULL,
	`motsCles` text,
	`secteur` varchar(100),
	`metier` varchar(100),
	`typeContrat` varchar(50),
	`typeOffre` enum('public','prive','tous') DEFAULT 'tous',
	`ville` varchar(100),
	`region` varchar(100),
	`salaireMinimum` decimal(10,2),
	`frequence` enum('immediate','quotidien','hebdomadaire') NOT NULL DEFAULT 'quotidien',
	`active` boolean DEFAULT true,
	`derniereNotification` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `alertes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`prenom` varchar(100),
	`nom` varchar(100),
	`telephone` varchar(20),
	`adresse` text,
	`ville` varchar(100),
	`region` varchar(100),
	`codePostal` varchar(10),
	`dateNaissance` timestamp,
	`nationalite` varchar(100),
	`situationMatrimoniale` varchar(50),
	`cvUrl` text,
	`cvFileKey` text,
	`photoUrl` text,
	`photoFileKey` text,
	`secteurRecherche` text,
	`typeContratRecherche` text,
	`localisationRecherche` text,
	`salaireMinimum` decimal(10,2),
	`disponibilite` varchar(50),
	`mobilite` boolean DEFAULT false,
	`profileComplete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `candidatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatId` int NOT NULL,
	`offreId` int NOT NULL,
	`statut` enum('en_attente','vue','retenue','rejetee','entretien') NOT NULL DEFAULT 'en_attente',
	`lettreMotivation` text,
	`cvUrl` text,
	`cvFileKey` text,
	`documentsSupplementaires` text,
	`dateCandidature` timestamp NOT NULL DEFAULT (now()),
	`dateReponse` timestamp,
	`commentaireEmployeur` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatId` int NOT NULL,
	`nom` varchar(100) NOT NULL,
	`niveau` enum('debutant','intermediaire','avance','expert') NOT NULL,
	`categorie` varchar(100),
	`anneesExperience` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `competences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employeurs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nomEntreprise` varchar(200) NOT NULL,
	`secteurActivite` varchar(100),
	`taille` varchar(50),
	`siteWeb` varchar(255),
	`telephone` varchar(20),
	`adresse` text,
	`ville` varchar(100),
	`region` varchar(100),
	`codePostal` varchar(10),
	`description` text,
	`logoUrl` text,
	`logoFileKey` text,
	`nomContact` varchar(100),
	`prenomContact` varchar(100),
	`posteContact` varchar(100),
	`emailContact` varchar(320),
	`telephoneContact` varchar(20),
	`formuleAbonnement` enum('gratuit','professionnel','entreprise') NOT NULL DEFAULT 'gratuit',
	`dateDebutAbonnement` timestamp,
	`dateFinAbonnement` timestamp,
	`nombreOffresRestantes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employeurs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatId` int NOT NULL,
	`poste` varchar(200) NOT NULL,
	`entreprise` varchar(200) NOT NULL,
	`ville` varchar(100),
	`pays` varchar(100),
	`dateDebut` timestamp NOT NULL,
	`dateFin` timestamp,
	`enCours` boolean DEFAULT false,
	`description` text,
	`competencesAcquises` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `experiences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favoris` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatId` int NOT NULL,
	`offreId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoris_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatId` int NOT NULL,
	`diplome` varchar(200) NOT NULL,
	`etablissement` varchar(200) NOT NULL,
	`ville` varchar(100),
	`pays` varchar(100),
	`dateDebut` timestamp NOT NULL,
	`dateFin` timestamp,
	`enCours` boolean DEFAULT false,
	`domaine` varchar(200),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `formations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `langues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`candidatId` int NOT NULL,
	`nom` varchar(100) NOT NULL,
	`niveauOral` enum('debutant','intermediaire','courant','bilingue','langue_maternelle') NOT NULL,
	`niveauEcrit` enum('debutant','intermediaire','courant','bilingue','langue_maternelle') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `langues_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `offresEmploi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeurId` int NOT NULL,
	`titre` varchar(200) NOT NULL,
	`typeOffre` enum('public','prive') NOT NULL,
	`description` text NOT NULL,
	`missions` text,
	`competencesRequises` text,
	`experienceRequise` varchar(100),
	`niveauEtude` varchar(100),
	`typeContrat` varchar(50) NOT NULL,
	`dureeContrat` varchar(100),
	`salaire` varchar(100),
	`avantages` text,
	`ville` varchar(100) NOT NULL,
	`region` varchar(100),
	`pays` varchar(100) DEFAULT 'Cameroun',
	`secteur` varchar(100),
	`metier` varchar(100),
	`datePublication` timestamp NOT NULL DEFAULT (now()),
	`dateLimite` timestamp,
	`dateDebut` timestamp,
	`statut` enum('brouillon','publiee','expiree','pourvue') NOT NULL DEFAULT 'publiee',
	`nombrePostes` int DEFAULT 1,
	`nombreVues` int DEFAULT 0,
	`nombreCandidatures` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offresEmploi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `profileType` enum('candidat','employeur') NOT NULL;--> statement-breakpoint
ALTER TABLE `alertes` ADD CONSTRAINT `alertes_candidatId_candidats_id_fk` FOREIGN KEY (`candidatId`) REFERENCES `candidats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidats` ADD CONSTRAINT `candidats_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidatures` ADD CONSTRAINT `candidatures_candidatId_candidats_id_fk` FOREIGN KEY (`candidatId`) REFERENCES `candidats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `candidatures` ADD CONSTRAINT `candidatures_offreId_offresEmploi_id_fk` FOREIGN KEY (`offreId`) REFERENCES `offresEmploi`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `competences` ADD CONSTRAINT `competences_candidatId_candidats_id_fk` FOREIGN KEY (`candidatId`) REFERENCES `candidats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `employeurs` ADD CONSTRAINT `employeurs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `experiences` ADD CONSTRAINT `experiences_candidatId_candidats_id_fk` FOREIGN KEY (`candidatId`) REFERENCES `candidats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoris` ADD CONSTRAINT `favoris_candidatId_candidats_id_fk` FOREIGN KEY (`candidatId`) REFERENCES `candidats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoris` ADD CONSTRAINT `favoris_offreId_offresEmploi_id_fk` FOREIGN KEY (`offreId`) REFERENCES `offresEmploi`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `formations` ADD CONSTRAINT `formations_candidatId_candidats_id_fk` FOREIGN KEY (`candidatId`) REFERENCES `candidats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `langues` ADD CONSTRAINT `langues_candidatId_candidats_id_fk` FOREIGN KEY (`candidatId`) REFERENCES `candidats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `offresEmploi` ADD CONSTRAINT `offresEmploi_employeurId_employeurs_id_fk` FOREIGN KEY (`employeurId`) REFERENCES `employeurs`(`id`) ON DELETE cascade ON UPDATE no action;