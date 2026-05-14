-- ─── Migration : renommage du template modern_sidebar_dark ─────────────────
-- Le template a été redessiné selon le PPTX
-- "CV jeune diplômé ingénieur professionnel simple avec photo".
-- Le slug reste identique pour préserver les achats existants.
--
-- Idempotente : peut être ré-exécutée sans danger.
-- À EXÉCUTER UNE SEULE FOIS dans le SQL Editor de Supabase.

UPDATE "cv_templates"
SET
  "nom" = 'Jeune Diplômé Sombre',
  "description" = 'Sidebar foncée avec photo carrée et sections en blanc, identité centrée à droite avec FORMATION, EXPÉRIENCES et COMPÉTENCES en deux colonnes. Adapté aux profils ingénieurs, jeunes diplômés et techniques.',
  "categorie" = 'moderne',
  "updatedAt" = NOW()
WHERE "slug" = 'modern_sidebar_dark';

-- Vérification
SELECT slug, nom, description, categorie, "isActive"
FROM "cv_templates"
WHERE slug = 'modern_sidebar_dark';
