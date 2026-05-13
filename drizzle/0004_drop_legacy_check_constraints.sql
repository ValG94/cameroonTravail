-- ─── Migration : drop des CHECK constraints héritées de l'import Manus ─────
-- Manus utilisait Sequelize qui créait des CHECK constraints en parallèle des
-- enums Postgres pour valider les colonnes. Quand on étend un enum (ajout de
-- 'premium' à typeCv), la CHECK constraint reste figée sur les valeurs initiales
-- et bloque les INSERTs avec la nouvelle valeur (erreur 23514).
--
-- L'enum Postgres protège déjà nativement les valeurs autorisées, donc la
-- CHECK constraint en doublon est inutile et nuisible.
--
-- À EXÉCUTER UNE SEULE FOIS dans le SQL Editor de Supabase.

-- 1. cv_documents.type
ALTER TABLE "cv_documents" DROP CONSTRAINT IF EXISTS "cv_documents_type_check";
ALTER TABLE "cv_documents" DROP CONSTRAINT IF EXISTS "cv_documents_langue_check";

-- 2. employeurs.formuleAbonnement (au cas où on ajoute des formules plus tard)
ALTER TABLE "employeurs" DROP CONSTRAINT IF EXISTS "employeurs_formuleAbonnement_check";

-- 3. Candidatures, offres, alertes : même risque potentiel
ALTER TABLE "candidatures" DROP CONSTRAINT IF EXISTS "candidatures_statut_check";
ALTER TABLE "offresEmploi" DROP CONSTRAINT IF EXISTS "offresEmploi_statut_check";
ALTER TABLE "offresEmploi" DROP CONSTRAINT IF EXISTS "offresEmploi_typeOffre_check";
ALTER TABLE "alertes" DROP CONSTRAINT IF EXISTS "alertes_frequence_check";
ALTER TABLE "alertes" DROP CONSTRAINT IF EXISTS "alertes_typeOffre_check";

-- 4. Compétences / langues / formules
ALTER TABLE "competences" DROP CONSTRAINT IF EXISTS "competences_niveau_check";
ALTER TABLE "langues" DROP CONSTRAINT IF EXISTS "langues_niveauOral_check";
ALTER TABLE "langues" DROP CONSTRAINT IF EXISTS "langues_niveauEcrit_check";
ALTER TABLE "formules_tarifaires" DROP CONSTRAINT IF EXISTS "formules_tarifaires_cible_check";
ALTER TABLE "formules_tarifaires" DROP CONSTRAINT IF EXISTS "formules_tarifaires_periode_check";

-- 5. Articles conseils, users
ALTER TABLE "articles_conseils" DROP CONSTRAINT IF EXISTS "articles_conseils_categorie_check";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_check";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_profileType_check";

-- 6. Cv_documents.type (variation de nom)
ALTER TABLE "cv_documents" DROP CONSTRAINT IF EXISTS "check_cv_documents_type";

-- ─── Vérification ────────────────────────────────────────────────────────────
-- Liste les CHECK constraints encore présentes sur les tables enum-typées
-- (devrait être vide pour les colonnes enum après cette migration)
SELECT
  conrelid::regclass::text AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype = 'c'
  AND conrelid::regclass::text IN (
    'cv_documents', 'cv_template_purchases', 'cv_templates',
    'users', 'candidats', 'employeurs',
    'experiences', 'formations', 'competences', 'langues',
    'offresEmploi', 'candidatures', 'alertes', 'favoris',
    'articles_conseils', 'formules_tarifaires', 'profile_views'
  )
ORDER BY conrelid::regclass::text, conname;
