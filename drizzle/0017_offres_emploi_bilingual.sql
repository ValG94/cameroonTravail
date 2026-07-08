-- 0017 — Offres d'emploi bilingues FR/EN
--
-- Sur le modèle de la migration 0016 (articles conseils), on rend la
-- table "offresEmploi" bilingue en ajoutant les colonnes _en pour les
-- champs éditoriaux :
--   - titreEn (varchar 200)
--   - descriptionEn (text)
--   - missionsEn (text)
--   - competencesRequisesEn (text)
--   - experienceRequiseEn (text)
--   - niveauEtudeEn (varchar 100)
--   - avantagesEn (text)
--
-- Tous nullable : un employeur peut publier une offre FR-only, la
-- traduction EN est optionnelle (générée à la demande via l'endpoint
-- jobs.translateJob qui appelle OpenAI GPT-4o mini côté serveur).
--
-- Les autres colonnes (typeContrat, ville, region, secteur, salaire,
-- dates, etc.) restent unilingues — ce sont des données structurées,
-- pas du texte éditorial.
--
-- NB : nomenclature camelCase (comme le reste de la table
-- "offresEmploi"), quotée pour préserver la casse en PostgreSQL.

ALTER TABLE "offresEmploi"
  ADD COLUMN IF NOT EXISTS "titreEn" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "descriptionEn" TEXT,
  ADD COLUMN IF NOT EXISTS "missionsEn" TEXT,
  ADD COLUMN IF NOT EXISTS "competencesRequisesEn" TEXT,
  ADD COLUMN IF NOT EXISTS "experienceRequiseEn" TEXT,
  ADD COLUMN IF NOT EXISTS "niveauEtudeEn" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "avantagesEn" TEXT;
