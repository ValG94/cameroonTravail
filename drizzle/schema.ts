import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── Enums PostgreSQL ─────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const profileTypeEnum = pgEnum("profileType", ["candidat", "employeur"]);
export const niveauEnum = pgEnum("niveau", ["debutant", "intermediaire", "avance", "expert"]);
export const niveauLangueEnum = pgEnum("niveauLangue", ["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"]);
export const typeOffreEnum = pgEnum("typeOffre", ["public", "prive"]);
export const typeOffreAlerteEnum = pgEnum("typeOffreAlerte", ["public", "prive", "tous"]);
export const statutOffreEnum = pgEnum("statutOffre", ["brouillon", "publiee", "expiree", "pourvue"]);
export const statutCandidatureEnum = pgEnum("statutCandidature", ["en_attente", "vue", "retenue", "rejetee", "entretien"]);
export const frequenceEnum = pgEnum("frequence", ["immediate", "quotidien", "hebdomadaire"]);
export const formuleAbonnementEnum = pgEnum("formuleAbonnement", ["gratuit", "professionnel", "entreprise"]);
export const categorieArticleEnum = pgEnum("categorieArticle", ["Entretien", "CV", "Marche", "Negociation", "Reconversion", "Freelance"]);
export const typeCvEnum = pgEnum("typeCv", ["upload", "classique", "moderne", "creatif", "premium"]);
export const langueCvEnum = pgEnum("langueCv", ["fr", "en"]);
export const cibleFormuleEnum = pgEnum("cibleFormule", ["candidat", "employeur"]);
export const periodeFormuleEnum = pgEnum("periodeFormule", ["mensuel", "annuel", "unique"]);

// ─── Utilisateurs ─────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  profileType: profileTypeEnum("profileType"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── Profil candidat ──────────────────────────────────────────────────────────
export const candidats = pgTable("candidats", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  cvUrl: text("cvUrl"),
  cvFileKey: text("cvFileKey"),
  photoUrl: text("photoUrl"),
  photoFileKey: text("photoFileKey"),
  secteurRecherche: text("secteurRecherche"),
  typeContratRecherche: text("typeContratRecherche"),
  localisationRecherche: text("localisationRecherche"),
  salaireMinimum: decimal("salaireMinimum", { precision: 10, scale: 2 }),
  disponibilite: varchar("disponibilite", { length: 50 }),
  mobilite: boolean("mobilite").default(false),
  profileComplete: boolean("profileComplete").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Expériences ──────────────────────────────────────────────────────────────
export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  candidatId: serial("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Formations ───────────────────────────────────────────────────────────────
export const formations = pgTable("formations", {
  id: serial("id").primaryKey(),
  candidatId: serial("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Compétences ──────────────────────────────────────────────────────────────
export const competences = pgTable("competences", {
  id: serial("id").primaryKey(),
  candidatId: serial("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 100 }).notNull(),
  niveau: niveauEnum("niveau").notNull(),
  categorie: varchar("categorie", { length: 100 }),
  anneesExperience: serial("anneesExperience"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Langues ──────────────────────────────────────────────────────────────────
export const langues = pgTable("langues", {
  id: serial("id").primaryKey(),
  candidatId: serial("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 100 }).notNull(),
  niveauOral: niveauLangueEnum("niveauOral").notNull(),
  niveauEcrit: niveauLangueEnum("niveauEcrit").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Employeurs ───────────────────────────────────────────────────────────────
export const employeurs = pgTable("employeurs", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
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
  nomContact: varchar("nomContact", { length: 100 }),
  prenomContact: varchar("prenomContact", { length: 100 }),
  posteContact: varchar("posteContact", { length: 100 }),
  emailContact: varchar("emailContact", { length: 320 }),
  telephoneContact: varchar("telephoneContact", { length: 20 }),
  formuleAbonnement: formuleAbonnementEnum("formuleAbonnement").default("gratuit").notNull(),
  dateDebutAbonnement: timestamp("dateDebutAbonnement"),
  dateFinAbonnement: timestamp("dateFinAbonnement"),
  nombreOffresRestantes: serial("nombreOffresRestantes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Offres d'emploi ──────────────────────────────────────────────────────────
export const offresEmploi = pgTable("offresEmploi", {
  id: serial("id").primaryKey(),
  employeurId: serial("employeurId").notNull().references(() => employeurs.id, { onDelete: "cascade" }),
  titre: varchar("titre", { length: 200 }).notNull(),
  typeOffre: typeOffreEnum("typeOffre").notNull(),
  description: text("description").notNull(),
  missions: text("missions"),
  competencesRequises: text("competencesRequises"),
  experienceRequise: text("experienceRequise"),
  niveauEtude: varchar("niveauEtude", { length: 100 }),
  typeContrat: varchar("typeContrat", { length: 50 }).notNull(),
  dureeContrat: varchar("dureeContrat", { length: 100 }),
  salaire: varchar("salaire", { length: 100 }),
  avantages: text("avantages"),
  ville: varchar("ville", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }),
  pays: varchar("pays", { length: 100 }).default("Cameroun"),
  secteur: varchar("secteur", { length: 100 }),
  metier: varchar("metier", { length: 100 }),
  datePublication: timestamp("datePublication").defaultNow().notNull(),
  dateLimite: timestamp("dateLimite"),
  dateDebut: timestamp("dateDebut"),
  statut: statutOffreEnum("statut").default("publiee").notNull(),
  nombrePostes: serial("nombrePostes"),
  nombreVues: serial("nombreVues"),
  nombreCandidatures: serial("nombreCandidatures"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Candidatures ─────────────────────────────────────────────────────────────
export const candidatures = pgTable("candidatures", {
  id: serial("id").primaryKey(),
  candidatId: serial("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  offreId: serial("offreId").notNull().references(() => offresEmploi.id, { onDelete: "cascade" }),
  statut: statutCandidatureEnum("statut").default("en_attente").notNull(),
  lettreMotivation: text("lettreMotivation"),
  cvUrl: text("cvUrl"),
  cvFileKey: text("cvFileKey"),
  documentsSupplementaires: text("documentsSupplementaires"),
  dateCandidature: timestamp("dateCandidature").defaultNow().notNull(),
  dateReponse: timestamp("dateReponse"),
  commentaireEmployeur: text("commentaireEmployeur"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Alertes emploi ───────────────────────────────────────────────────────────
export const alertes = pgTable("alertes", {
  id: serial("id").primaryKey(),
  candidatId: serial("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  nom: varchar("nom", { length: 200 }).notNull(),
  motsCles: text("motsCles"),
  secteur: varchar("secteur", { length: 100 }),
  metier: varchar("metier", { length: 100 }),
  typeContrat: varchar("typeContrat", { length: 50 }),
  typeOffre: typeOffreAlerteEnum("typeOffre").default("tous"),
  ville: varchar("ville", { length: 100 }),
  region: varchar("region", { length: 100 }),
  salaireMinimum: decimal("salaireMinimum", { precision: 10, scale: 2 }),
  frequence: frequenceEnum("frequence").default("quotidien").notNull(),
  active: boolean("active").default(true),
  derniereNotification: timestamp("derniereNotification"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Favoris ──────────────────────────────────────────────────────────────────
export const favoris = pgTable("favoris", {
  id: serial("id").primaryKey(),
  candidatId: serial("candidatId").notNull().references(() => candidats.id, { onDelete: "cascade" }),
  offreId: serial("offreId").notNull().references(() => offresEmploi.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Réinitialisation de mot de passe ─────────────────────────────────────────
export const passwordResetTokens = pgTable("passwordResetTokens", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Articles de conseils ─────────────────────────────────────────────────────
export const articlesConseils = pgTable("articles_conseils", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 200 }).unique().notNull(),
  titre: varchar("titre", { length: 300 }).notNull(),
  description: text("description").notNull(),
  contenu: text("contenu").notNull(),
  categorie: categorieArticleEnum("categorie").notNull(),
  auteur: varchar("auteur", { length: 150 }).notNull(),
  tempsLecture: varchar("tempsLecture", { length: 20 }).notNull(),
  imageUrl: text("imageUrl"),
  featured: boolean("featured").default(false).notNull(),
  datePublication: timestamp("datePublication").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Documents CV ─────────────────────────────────────────────────────────────
export const cvDocuments = pgTable("cv_documents", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull(),
  nom: varchar("nom", { length: 255 }).notNull(),
  type: typeCvEnum("type").notNull().default("upload"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  langue: langueCvEnum("langue").notNull().default("fr"),
  actif: boolean("actif").default(false).notNull(),
  visibleCVtheque: boolean("visibleCVtheque").default(true).notNull(),
  // Slug du template premium si type === "premium" (null sinon)
  premiumTemplateSlug: varchar("premiumTemplateSlug", { length: 80 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Données CV structurées ───────────────────────────────────────────────────
export const cvData = pgTable("cv_data", {
  id: serial("id").primaryKey(),
  cvId: serial("cvId").notNull().unique(),
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Messages internes ────────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: serial("senderId").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: serial("receiverId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sujet: varchar("sujet", { length: 300 }),
  contenu: text("contenu").notNull(),
  cvId: serial("cvId"),
  lu: boolean("lu").default(false).notNull(),
  dateLecture: timestamp("dateLecture"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Vues de profil CVthèque ──────────────────────────────────────────────────
export const profileViews = pgTable("profile_views", {
  id: serial("id").primaryKey(),
  candidatUserId: serial("candidatUserId").notNull().references(() => users.id, { onDelete: "cascade" }),
  viewerUserId: serial("viewerUserId"),
  cvId: serial("cvId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Formules tarifaires ──────────────────────────────────────────────────────
export const formulesTarifaires = pgTable("formules_tarifaires", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 100 }).notNull(),
  cible: cibleFormuleEnum("cible").notNull(),
  prix: decimal("prix", { precision: 10, scale: 2 }).notNull(),
  devise: varchar("devise", { length: 10 }).notNull().default("XAF"),
  periode: periodeFormuleEnum("periode").notNull().default("mensuel"),
  description: text("description"),
  fonctionnalites: text("fonctionnalites"),
  actif: boolean("actif").default(true).notNull(),
  populaire: boolean("populaire").default(false).notNull(),
  ordre: serial("ordre"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Templates CV premium ─────────────────────────────────────────────────────
// Catalogue des modèles premium proposés au candidat. Les composants React des
// templates vivent en code (client/src/cv-templates), mais on stocke ici les
// métadonnées + visibilité/prix pour pouvoir piloter sans redéployer.
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "pending",
  "success",
  "failed",
  "refunded",
]);

export const paymentProviderEnum = pgEnum("paymentProvider", [
  "mtn_momo",
  "orange_money",
  "manual", // back-office (admin valide à la main si besoin)
]);

export const cvTemplates = pgTable("cv_templates", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  nom: varchar("nom", { length: 100 }).notNull(),
  description: text("description"),
  categorie: varchar("categorie", { length: 50 }),
  prix: decimal("prix", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  devise: varchar("devise", { length: 10 }).notNull().default("XAF"),
  thumbnailUrl: text("thumbnailUrl"),
  previewUrl: text("previewUrl"),
  isPremium: boolean("isPremium").notNull().default(true),
  isActive: boolean("isActive").notNull().default(true),
  ordre: serial("ordre"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Achat one-shot d'un template par un user. Pay-per-template :
// 1 entrée success = accès permanent à CE template seulement.
export const cvTemplatePurchases = pgTable("cv_template_purchases", {
  id: serial("id").primaryKey(),
  userId: serial("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: serial("templateId").notNull().references(() => cvTemplates.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("XAF"),
  provider: paymentProviderEnum("provider").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  // Référence externe (ID transaction MoMo/Orange) — null en pending
  paymentReference: varchar("paymentReference", { length: 200 }),
  // Numéro de téléphone utilisé pour le paiement (snapshot)
  payerPhone: varchar("payerPhone", { length: 20 }),
  // Détail brut renvoyé par le provider (debug / audit)
  providerPayload: text("providerPayload"),
  unlockedAt: timestamp("unlockedAt"),
  // Expiration de l'accès (6 mois par défaut à partir de unlockedAt).
  // Si NULL → accès permanent (cas legacy / admin).
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Types exportés ───────────────────────────────────────────────────────────
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
export type ArticleConseil = typeof articlesConseils.$inferSelect;
export type InsertArticleConseil = typeof articlesConseils.$inferInsert;
export type CvDocument = typeof cvDocuments.$inferSelect;
export type InsertCvDocument = typeof cvDocuments.$inferInsert;
export type CvData = typeof cvData.$inferSelect;
export type InsertCvData = typeof cvData.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type ProfileView = typeof profileViews.$inferSelect;
export type InsertProfileView = typeof profileViews.$inferInsert;
export type FormuleTarifaire = typeof formulesTarifaires.$inferSelect;
export type InsertFormuleTarifaire = typeof formulesTarifaires.$inferInsert;
export type CvTemplate = typeof cvTemplates.$inferSelect;
export type InsertCvTemplate = typeof cvTemplates.$inferInsert;
export type CvTemplatePurchase = typeof cvTemplatePurchases.$inferSelect;
export type InsertCvTemplatePurchase = typeof cvTemplatePurchases.$inferInsert;

// ─── Demandes de souscription (paiement manuel Option B) ──────────────────────
// Workflow : le recruteur déclare un paiement (Orange Money / MTN MoMo)
// avec sa référence de transaction. L'admin vérifie le paiement réel sur
// le téléphone marchand et valide → la formule devient active sur la
// fiche employeur. Pas d'intégration de passerelle pour ce MVP.

export const methodePaiementEnum = pgEnum("methodePaiement", [
  "orange_money",
  "mtn_momo",
  "autre",
]);

export const statutDemandeEnum = pgEnum("statutDemande", [
  "en_attente",
  "validee",
  "refusee",
]);

export const demandesSouscription = pgTable("demandes_souscription", {
  id: serial("id").primaryKey(),
  employeurId: integer("employeurId")
    .notNull()
    .references(() => employeurs.id, { onDelete: "cascade" }),
  formuleId: integer("formuleId")
    .notNull()
    .references(() => formulesTarifaires.id),
  montant: decimal("montant", { precision: 10, scale: 2 }).notNull(),
  devise: varchar("devise", { length: 10 }).default("XAF").notNull(),
  methodePaiement: methodePaiementEnum("methodePaiement").notNull(),
  referenceTransaction: varchar("referenceTransaction", { length: 100 }).notNull(),
  statut: statutDemandeEnum("statut").default("en_attente").notNull(),
  raisonRefus: text("raisonRefus"),
  validatedByAdminId: integer("validatedByAdminId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  validatedAt: timestamp("validatedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DemandeSouscription = typeof demandesSouscription.$inferSelect;
export type InsertDemandeSouscription = typeof demandesSouscription.$inferInsert;
