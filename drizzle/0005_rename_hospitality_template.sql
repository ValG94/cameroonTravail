-- ─── Migration : renommage du template hospitality_timeline ─────────────────
-- Le template a été redessiné selon une nouvelle maquette PPTX
-- (Communication Minimaliste Bleu — Antoine Auclair).
-- Le slug reste identique pour préserver les achats existants ; seuls
-- le nom, la description, la catégorie et l'ordre d'affichage changent.
--
-- À EXÉCUTER UNE SEULE FOIS dans le SQL Editor de Supabase.

UPDATE "cv_templates"
SET
  "nom" = 'Communication Minimaliste',
  "description" = 'Sidebar pastel avec photo, identité forte et timeline d''expériences à puces. Adapté aux profils communication, marketing et chef de projet.',
  "categorie" = 'minimaliste',
  "updatedAt" = NOW()
WHERE "slug" = 'hospitality_timeline';

-- Vérification
SELECT slug, nom, categorie, "isActive"
FROM "cv_templates"
WHERE slug = 'hospitality_timeline';
