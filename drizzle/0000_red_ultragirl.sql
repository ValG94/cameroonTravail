CREATE TYPE "public"."categorieArticle" AS ENUM('Entretien', 'CV', 'Marche', 'Negociation', 'Reconversion', 'Freelance');--> statement-breakpoint
CREATE TYPE "public"."cibleFormule" AS ENUM('candidat', 'employeur');--> statement-breakpoint
CREATE TYPE "public"."formuleAbonnement" AS ENUM('gratuit', 'professionnel', 'entreprise');--> statement-breakpoint
CREATE TYPE "public"."frequence" AS ENUM('immediate', 'quotidien', 'hebdomadaire');--> statement-breakpoint
CREATE TYPE "public"."langueCv" AS ENUM('fr', 'en');--> statement-breakpoint
CREATE TYPE "public"."niveau" AS ENUM('debutant', 'intermediaire', 'avance', 'expert');--> statement-breakpoint
CREATE TYPE "public"."niveauLangue" AS ENUM('debutant', 'intermediaire', 'courant', 'bilingue', 'langue_maternelle');--> statement-breakpoint
CREATE TYPE "public"."periodeFormule" AS ENUM('mensuel', 'annuel', 'unique');--> statement-breakpoint
CREATE TYPE "public"."profileType" AS ENUM('candidat', 'employeur');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."statutCandidature" AS ENUM('en_attente', 'vue', 'retenue', 'rejetee', 'entretien');--> statement-breakpoint
CREATE TYPE "public"."statutOffre" AS ENUM('brouillon', 'publiee', 'expiree', 'pourvue');--> statement-breakpoint
CREATE TYPE "public"."typeCv" AS ENUM('upload', 'classique', 'moderne', 'creatif');--> statement-breakpoint
CREATE TYPE "public"."typeOffreAlerte" AS ENUM('public', 'prive', 'tous');--> statement-breakpoint
CREATE TYPE "public"."typeOffre" AS ENUM('public', 'prive');--> statement-breakpoint
CREATE TABLE "alertes" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatId" serial NOT NULL,
	"nom" varchar(200) NOT NULL,
	"motsCles" text,
	"secteur" varchar(100),
	"metier" varchar(100),
	"typeContrat" varchar(50),
	"typeOffre" "typeOffreAlerte" DEFAULT 'tous',
	"ville" varchar(100),
	"region" varchar(100),
	"salaireMinimum" numeric(10, 2),
	"frequence" "frequence" DEFAULT 'quotidien' NOT NULL,
	"active" boolean DEFAULT true,
	"derniereNotification" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles_conseils" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(200) NOT NULL,
	"titre" varchar(300) NOT NULL,
	"description" text NOT NULL,
	"contenu" text NOT NULL,
	"categorie" "categorieArticle" NOT NULL,
	"auteur" varchar(150) NOT NULL,
	"tempsLecture" varchar(20) NOT NULL,
	"imageUrl" text,
	"featured" boolean DEFAULT false NOT NULL,
	"datePublication" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_conseils_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "candidats" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"prenom" varchar(100),
	"nom" varchar(100),
	"telephone" varchar(20),
	"adresse" text,
	"ville" varchar(100),
	"region" varchar(100),
	"codePostal" varchar(10),
	"dateNaissance" timestamp,
	"nationalite" varchar(100),
	"situationMatrimoniale" varchar(50),
	"cvUrl" text,
	"cvFileKey" text,
	"photoUrl" text,
	"photoFileKey" text,
	"secteurRecherche" text,
	"typeContratRecherche" text,
	"localisationRecherche" text,
	"salaireMinimum" numeric(10, 2),
	"disponibilite" varchar(50),
	"mobilite" boolean DEFAULT false,
	"profileComplete" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatId" serial NOT NULL,
	"offreId" serial NOT NULL,
	"statut" "statutCandidature" DEFAULT 'en_attente' NOT NULL,
	"lettreMotivation" text,
	"cvUrl" text,
	"cvFileKey" text,
	"documentsSupplementaires" text,
	"dateCandidature" timestamp DEFAULT now() NOT NULL,
	"dateReponse" timestamp,
	"commentaireEmployeur" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competences" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatId" serial NOT NULL,
	"nom" varchar(100) NOT NULL,
	"niveau" "niveau" NOT NULL,
	"categorie" varchar(100),
	"anneesExperience" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cv_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"cvId" serial NOT NULL,
	"prenom" varchar(100),
	"nom" varchar(100),
	"titre" varchar(200),
	"email" varchar(200),
	"telephone" varchar(50),
	"adresse" varchar(300),
	"siteWeb" varchar(200),
	"photoUrl" text,
	"photoKey" text,
	"couleurColonne" varchar(20) DEFAULT '#374151',
	"experiences" text,
	"formations" text,
	"competences" text,
	"languesCv" text,
	"certifications" text,
	"loisirs" text,
	"resume" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cv_data_cvId_unique" UNIQUE("cvId")
);
--> statement-breakpoint
CREATE TABLE "cv_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"nom" varchar(255) NOT NULL,
	"type" "typeCv" DEFAULT 'upload' NOT NULL,
	"fileUrl" text,
	"fileKey" text,
	"langue" "langueCv" DEFAULT 'fr' NOT NULL,
	"actif" boolean DEFAULT false NOT NULL,
	"visibleCVtheque" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employeurs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"nomEntreprise" varchar(200) NOT NULL,
	"secteurActivite" varchar(100),
	"taille" varchar(50),
	"siteWeb" varchar(255),
	"telephone" varchar(20),
	"adresse" text,
	"ville" varchar(100),
	"region" varchar(100),
	"codePostal" varchar(10),
	"description" text,
	"logoUrl" text,
	"logoFileKey" text,
	"nomContact" varchar(100),
	"prenomContact" varchar(100),
	"posteContact" varchar(100),
	"emailContact" varchar(320),
	"telephoneContact" varchar(20),
	"formuleAbonnement" "formuleAbonnement" DEFAULT 'gratuit' NOT NULL,
	"dateDebutAbonnement" timestamp,
	"dateFinAbonnement" timestamp,
	"nombreOffresRestantes" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatId" serial NOT NULL,
	"poste" varchar(200) NOT NULL,
	"entreprise" varchar(200) NOT NULL,
	"ville" varchar(100),
	"pays" varchar(100),
	"dateDebut" timestamp NOT NULL,
	"dateFin" timestamp,
	"enCours" boolean DEFAULT false,
	"description" text,
	"competencesAcquises" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favoris" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatId" serial NOT NULL,
	"offreId" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formations" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatId" serial NOT NULL,
	"diplome" varchar(200) NOT NULL,
	"etablissement" varchar(200) NOT NULL,
	"ville" varchar(100),
	"pays" varchar(100),
	"dateDebut" timestamp NOT NULL,
	"dateFin" timestamp,
	"enCours" boolean DEFAULT false,
	"domaine" varchar(200),
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formules_tarifaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"nom" varchar(100) NOT NULL,
	"cible" "cibleFormule" NOT NULL,
	"prix" numeric(10, 2) NOT NULL,
	"devise" varchar(10) DEFAULT 'XAF' NOT NULL,
	"periode" "periodeFormule" DEFAULT 'mensuel' NOT NULL,
	"description" text,
	"fonctionnalites" text,
	"actif" boolean DEFAULT true NOT NULL,
	"populaire" boolean DEFAULT false NOT NULL,
	"ordre" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "langues" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatId" serial NOT NULL,
	"nom" varchar(100) NOT NULL,
	"niveauOral" "niveauLangue" NOT NULL,
	"niveauEcrit" "niveauLangue" NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"senderId" serial NOT NULL,
	"receiverId" serial NOT NULL,
	"sujet" varchar(300),
	"contenu" text NOT NULL,
	"cvId" serial NOT NULL,
	"lu" boolean DEFAULT false NOT NULL,
	"dateLecture" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offresEmploi" (
	"id" serial PRIMARY KEY NOT NULL,
	"employeurId" serial NOT NULL,
	"titre" varchar(200) NOT NULL,
	"typeOffre" "typeOffre" NOT NULL,
	"description" text NOT NULL,
	"missions" text,
	"competencesRequises" text,
	"experienceRequise" text,
	"niveauEtude" varchar(100),
	"typeContrat" varchar(50) NOT NULL,
	"dureeContrat" varchar(100),
	"salaire" varchar(100),
	"avantages" text,
	"ville" varchar(100) NOT NULL,
	"region" varchar(100),
	"pays" varchar(100) DEFAULT 'Cameroun',
	"secteur" varchar(100),
	"metier" varchar(100),
	"datePublication" timestamp DEFAULT now() NOT NULL,
	"dateLimite" timestamp,
	"dateDebut" timestamp,
	"statut" "statutOffre" DEFAULT 'publiee' NOT NULL,
	"nombrePostes" serial NOT NULL,
	"nombreVues" serial NOT NULL,
	"nombreCandidatures" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "passwordResetTokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" serial NOT NULL,
	"token" varchar(255) NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "passwordResetTokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "profile_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"candidatUserId" serial NOT NULL,
	"viewerUserId" serial NOT NULL,
	"cvId" serial NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64),
	"name" text,
	"email" varchar(320),
	"password" varchar(255),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"profileType" "profileType",
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "alertes" ADD CONSTRAINT "alertes_candidatId_candidats_id_fk" FOREIGN KEY ("candidatId") REFERENCES "public"."candidats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidats" ADD CONSTRAINT "candidats_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_candidatId_candidats_id_fk" FOREIGN KEY ("candidatId") REFERENCES "public"."candidats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidatures" ADD CONSTRAINT "candidatures_offreId_offresEmploi_id_fk" FOREIGN KEY ("offreId") REFERENCES "public"."offresEmploi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competences" ADD CONSTRAINT "competences_candidatId_candidats_id_fk" FOREIGN KEY ("candidatId") REFERENCES "public"."candidats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employeurs" ADD CONSTRAINT "employeurs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_candidatId_candidats_id_fk" FOREIGN KEY ("candidatId") REFERENCES "public"."candidats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_candidatId_candidats_id_fk" FOREIGN KEY ("candidatId") REFERENCES "public"."candidats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favoris" ADD CONSTRAINT "favoris_offreId_offresEmploi_id_fk" FOREIGN KEY ("offreId") REFERENCES "public"."offresEmploi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formations" ADD CONSTRAINT "formations_candidatId_candidats_id_fk" FOREIGN KEY ("candidatId") REFERENCES "public"."candidats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "langues" ADD CONSTRAINT "langues_candidatId_candidats_id_fk" FOREIGN KEY ("candidatId") REFERENCES "public"."candidats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_users_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_users_id_fk" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offresEmploi" ADD CONSTRAINT "offresEmploi_employeurId_employeurs_id_fk" FOREIGN KEY ("employeurId") REFERENCES "public"."employeurs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passwordResetTokens" ADD CONSTRAINT "passwordResetTokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_candidatUserId_users_id_fk" FOREIGN KEY ("candidatUserId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;