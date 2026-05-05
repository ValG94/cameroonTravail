import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Schéma de base de données pour Cameroon Travail
 * Plateforme de recrutement avec profils candidats et employeurs
 */

// Table des utilisateurs avec type de profil
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }), // Mot de passe haché
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Type de profil: candidat ou employeur
  profileType: mysqlEnum("profileType", ["candidat", "employeur"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Profil candidat détaillé
export const candidats = mysqlTable("candidats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  prenom: varchar("prenom", { length: 100 }),
  nom: varchar("nom", { length: 100 }),
  telephone: varchar("telephone", { length: 20 }),
  adresse: text("adresse"),
  ville: varchar("ville", { length: 100 }),
  region: varchar("region", { length: 100 }),
  codePostal: varchar("codePostal", { length: 10 }),
  dateNaissance: timestamp("dateNaissance"),
  nationalite: varchar("nationalite", { length: 100 }),
  situationMatrimoniale: varchar("situationMatrimoniale", { length: 50 }),
  // CV et documents
  cvUrl: text("cvUrl"),
  cvFileKey: text("cvFileKey"),
  photoUrl: text("photoUrl"),
  photoFileKey: text("photoFileKey"),
  // Préférences de recherche
  secteurRecherche: text("secteurRecherche"),
  typeContratRecherche: text("typeContratRecherche"),
  localisationRecherche: text("localisationRecherche"),
  salaireMinimum: decimal("salaireMinimum", { precision: 10, scale: 2 }),
  disponibilite: varchar("disponibilite", { length: 50 }),
  mobilite: boolean("mobilite").default(false),
  // Profil complété
  profileComplete: boolean("profileComplete").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Expériences professionnelles
export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  candidatId: int("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  poste: varchar("poste", { length: 200 }).notNull(),
  entreprise: varchar("entreprise", { length: 200 }).notNull(),
  ville: varchar("ville", { length: 100 }),
  pays: varchar("pays", { length: 100 }),
  dateDebut: timestamp("dateDebut").notNull(),
  dateFin: timestamp("dateFin"),
  enCours: boolean("enCours").default(false),
  description: text("description"),
  competencesAcquises: text("competencesAcquises"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Formations et diplômes
export const formations = mysqlTable("formations", {
  id: int("id").autoincrement().primaryKey(),
  candidatId: int("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  diplome: varchar("diplome", { length: 200 }).notNull(),
  etablissement: varchar("etablissement", { length: 200 }).notNull(),
  ville: varchar("ville", { length: 100 }),
  pays: varchar("pays", { length: 100 }),
  dateDebut: timestamp("dateDebut").notNull(),
  dateFin: timestamp("dateFin"),
  enCours: boolean("enCours").default(false),
  domaine: varchar("domaine", { length: 200 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Compétences
export const competences = mysqlTable("competences", {
  id: int("id").autoincrement().primaryKey(),
  candidatId: int("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 100 }).notNull(),
  niveau: mysqlEnum("niveau", ["debutant", "intermediaire", "avance", "expert"]).notNull(),
  categorie: varchar("categorie", { length: 100 }),
  anneesExperience: int("anneesExperience"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Langues
export const langues = mysqlTable("langues", {
  id: int("id").autoincrement().primaryKey(),
  candidatId: int("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 100 }).notNull(),
  niveauOral: mysqlEnum("niveauOral", ["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"]).notNull(),
  niveauEcrit: mysqlEnum("niveauEcrit", ["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Profil employeur
export const employeurs = mysqlTable("employeurs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nomEntreprise: varchar("nomEntreprise", { length: 200 }).notNull(),
  secteurActivite: varchar("secteurActivite", { length: 100 }),
  taille: varchar("taille", { length: 50 }),
  siteWeb: varchar("siteWeb", { length: 255 }),
  telephone: varchar("telephone", { length: 20 }),
  adresse: text("adresse"),
  ville: varchar("ville", { length: 100 }),
  region: varchar("region", { length: 100 }),
  codePostal: varchar("codePostal", { length: 10 }),
  description: text("description"),
  logoUrl: text("logoUrl"),
  logoFileKey: text("logoFileKey"),
  // Informations de contact
  nomContact: varchar("nomContact", { length: 100 }),
  prenomContact: varchar("prenomContact", { length: 100 }),
  posteContact: varchar("posteContact", { length: 100 }),
  emailContact: varchar("emailContact", { length: 320 }),
  telephoneContact: varchar("telephoneContact", { length: 20 }),
  // Abonnement
  formuleAbonnement: mysqlEnum("formuleAbonnement", ["gratuit", "professionnel", "entreprise"]).default("gratuit").notNull(),
  dateDebutAbonnement: timestamp("dateDebutAbonnement"),
  dateFinAbonnement: timestamp("dateFinAbonnement"),
  nombreOffresRestantes: int("nombreOffresRestantes").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Offres d'emploi
export const offresEmploi = mysqlTable("offresEmploi", {
  id: int("id").autoincrement().primaryKey(),
  employeurId: int("employeurId").notNull().references(() => employeurs.id, { onDelete: "cascade" }),
  titre: varchar("titre", { length: 200 }).notNull(),
  typeOffre: mysqlEnum("typeOffre", ["public", "prive"]).notNull(),
  description: text("description").notNull(),
  missions: text("missions"),
  competencesRequises: text("competencesRequises"),
  experienceRequise: text("experienceRequise"),
  niveauEtude: varchar("niveauEtude", { length: 100 }),
  typeContrat: varchar("typeContrat", { length: 50 }).notNull(),
  dureeContrat: varchar("dureeContrat", { length: 100 }),
  salaire: varchar("salaire", { length: 100 }),
  avantages: text("avantages"),
  // Localisation
  ville: varchar("ville", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }),
  pays: varchar("pays", { length: 100 }).default("Cameroun"),
  // Catégorisation
  secteur: varchar("secteur", { length: 100 }),
  metier: varchar("metier", { length: 100 }),
  // Dates
  datePublication: timestamp("datePublication").defaultNow().notNull(),
  dateLimite: timestamp("dateLimite"),
  dateDebut: timestamp("dateDebut"),
  // Statut
  statut: mysqlEnum("statut", ["brouillon", "publiee", "expiree", "pourvue"]).default("publiee").notNull(),
  nombrePostes: int("nombrePostes").default(1),
  nombreVues: int("nombreVues").default(0),
  nombreCandidatures: int("nombreCandidatures").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Candidatures
export const candidatures = mysqlTable("candidatures", {
  id: int("id").autoincrement().primaryKey(),
  candidatId: int("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  offreId: int("offreId").notNull().references(() => offresEmploi.id, { onDelete: "cascade" }),
  statut: mysqlEnum("statut", ["en_attente", "vue", "retenue", "rejetee", "entretien"]).default("en_attente").notNull(),
  lettreMotivation: text("lettreMotivation"),
  cvUrl: text("cvUrl"),
  cvFileKey: text("cvFileKey"),
  documentsSupplementaires: text("documentsSupplementaires"),
  dateCandidature: timestamp("dateCandidature").defaultNow().notNull(),
  dateReponse: timestamp("dateReponse"),
  commentaireEmployeur: text("commentaireEmployeur"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Alertes d'emploi
export const alertes = mysqlTable("alertes", {
  id: int("id").autoincrement().primaryKey(),
  candidatId: int("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 200 }).notNull(),
  // Critères de recherche
  motsCles: text("motsCles"),
  secteur: varchar("secteur", { length: 100 }),
  metier: varchar("metier", { length: 100 }),
  typeContrat: varchar("typeContrat", { length: 50 }),
  typeOffre: mysqlEnum("typeOffre", ["public", "prive", "tous"]).default("tous"),
  ville: varchar("ville", { length: 100 }),
  region: varchar("region", { length: 100 }),
  salaireMinimum: decimal("salaireMinimum", { precision: 10, scale: 2 }),
  // Fréquence
  frequence: mysqlEnum("frequence", ["immediate", "quotidien", "hebdomadaire"]).default("quotidien").notNull(),
  active: boolean("active").default(true),
  derniereNotification: timestamp("derniereNotification"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Offres favorites
export const favoris = mysqlTable("favoris", {
  id: int("id").autoincrement().primaryKey(),
  candidatId: int("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  offreId: int("offreId").notNull().references(() => offresEmploi.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Tokens de réinitialisation de mot de passe
export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Export des types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Candidat = typeof candidats.$inferSelect;
export type InsertCandidat = typeof candidats.$inferInsert;

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

export type Formation = typeof formations.$inferSelect;
export type InsertFormation = typeof formations.$inferInsert;

export type Competence = typeof competences.$inferSelect;
export type InsertCompetence = typeof competences.$inferInsert;

export type Langue = typeof langues.$inferSelect;
export type InsertLangue = typeof langues.$inferInsert;

export type Employeur = typeof employeurs.$inferSelect;
export type InsertEmployeur = typeof employeurs.$inferInsert;

export type OffreEmploi = typeof offresEmploi.$inferSelect;
export type InsertOffreEmploi = typeof offresEmploi.$inferInsert;

export type Candidature = typeof candidatures.$inferSelect;
export type InsertCandidature = typeof candidatures.$inferInsert;

export type Alerte = typeof alertes.$inferSelect;
export type InsertAlerte = typeof alertes.$inferInsert;

export type Favori = typeof favoris.$inferSelect;
export type InsertFavori = typeof favoris.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// ─── Articles de conseils emploi ──────────────────────────────────────────────
export const articlesConseils = mysqlTable("articles_conseils", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).unique().notNull(),
  titre: varchar("titre", { length: 300 }).notNull(),
  description: text("description").notNull(),
  contenu: text("contenu").notNull(),
  categorie: mysqlEnum("categorie", ["Entretien", "CV", "Marché", "Négociation", "Reconversion", "Freelance"]).notNull(),
  auteur: varchar("auteur", { length: 150 }).notNull(),
  tempsLecture: varchar("tempsLecture", { length: 20 }).notNull(),
  imageUrl: text("imageUrl"),
  featured: boolean("featured").default(false).notNull(),
  datePublication: timestamp("datePublication").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ArticleConseil = typeof articlesConseils.$inferSelect;
export type InsertArticleConseil = typeof articlesConseils.$inferInsert;

// ─── CV Documents ─────────────────────────────────────────────────────────────
export const cvDocuments = mysqlTable("cv_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nom: varchar("nom", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["upload", "classique", "moderne", "creatif"]).notNull().default("upload"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  langue: mysqlEnum("langue", ["fr", "en"]).notNull().default("fr"),
  actif: boolean("actif").default(false).notNull(),
  visibleCVtheque: boolean("visibleCVtheque").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── CV Data (contenu structuré pour les modèles Classique et Moderne) ────────
export const cvData = mysqlTable("cv_data", {
  id: int("id").autoincrement().primaryKey(),
  cvId: int("cvId").notNull().unique(),
  prenom: varchar("prenom", { length: 100 }),
  nom: varchar("nom", { length: 100 }),
  titre: varchar("titre", { length: 200 }),
  email: varchar("email", { length: 200 }),
  telephone: varchar("telephone", { length: 50 }),
  adresse: varchar("adresse", { length: 300 }),
  siteWeb: varchar("siteWeb", { length: 200 }),
  photoUrl: text("photoUrl"),
  photoKey: text("photoKey"),
  couleurColonne: varchar("couleurColonne", { length: 20 }).default("#374151"),
  experiences: text("experiences"),
  formations: text("formations"),
  competences: text("competences"),
  languesCv: text("languesCv"),
  certifications: text("certifications"),
  loisirs: text("loisirs"),
  resume: text("resume"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CvDocument = typeof cvDocuments.$inferSelect;
export type InsertCvDocument = typeof cvDocuments.$inferInsert;
export type CvData = typeof cvData.$inferSelect;
export type InsertCvData = typeof cvData.$inferInsert;

// ─── Messages internes (recruteur → candidat) ────────────────────────────────────────────
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  // Expéditeur et destinataire (userId)
  senderId: int("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: int("receiverId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Sujet et contenu
  sujet: varchar("sujet", { length: 300 }),
  contenu: text("contenu").notNull(),
  // Référence optionnelle au CV consulté
  cvId: int("cvId"),
  // Statut
  lu: boolean("lu").default(false).notNull(),
  dateLecture: timestamp("dateLecture"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Vues de profil CVthèque ─────────────────────────────────────────────────────────────────────
export const profileViews = mysqlTable("profile_views", {
  id: int("id").autoincrement().primaryKey(),
  // Candidat dont le profil a été consulté
  candidatUserId: int("candidatUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Visiteur (recruteur) - nullable si non connecté
  viewerUserId: int("viewerUserId"),
  // CV spécifique consulté
  cvId: int("cvId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProfileView = typeof profileViews.$inferSelect;
export type InsertProfileView = typeof profileViews.$inferInsert;

// ─── Formules Tarifaires ──────────────────────────────────────────────────────
export const formulesTarifaires = mysqlTable("formules_tarifaires", {
  id: int("id").autoincrement().primaryKey(),
  nom: varchar("nom", { length: 100 }).notNull(),
  cible: mysqlEnum("cible", ["candidat", "employeur"]).notNull(),
  prix: decimal("prix", { precision: 10, scale: 2 }).notNull(),
  devise: varchar("devise", { length: 10 }).notNull().default("XAF"),
  periode: mysqlEnum("periode", ["mensuel", "annuel", "unique"]).notNull().default("mensuel"),
  description: text("description"),
  fonctionnalites: text("fonctionnalites"),
  actif: boolean("actif").default(true).notNull(),
  populaire: boolean("populaire").default(false).notNull(),
  ordre: int("ordre").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormuleTarifaire = typeof formulesTarifaires.$inferSelect;
export type InsertFormuleTarifaire = typeof formulesTarifaires.$inferInsert;
