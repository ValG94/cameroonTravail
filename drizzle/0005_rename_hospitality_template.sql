-- ─── Migration : renommage du template hospitality_timeline ─────────────────
-- Le template a été redessiné selon une nouvelle maquette PPTX
-- (CV professionnel chargé de communication minimaliste bleu).
-- Le slug reste identique pour préserver les achats existants ; seuls
-- le nom et la description changent.
--
-- Idempotente : peut être ré-exécutée sans danger.
-- À EXÉCUTER UNE SEULE FOIS dans le SQL Editor de Supabase.

UPDATE "cv_templates"
SET
  "nom" = 'Communication Bleu Marine',
  "description" = 'CV professionnel minimaliste avec fond bleu marine élégant et cartes blanches pour mettre en valeur expériences et formations. Adapté aux profils communication, marketing et chef de projet.',
  "categorie" = 'minimaliste',
  "updatedAt" = NOW()
WHERE "slug" = 'hospitality_timeline';

-- Vérification
SELECT slug, nom, description, categorie, "isActive"
FROM "cv_templates"
WHERE slug = 'hospitality_timeline';
