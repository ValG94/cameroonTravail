-- ─── Migration : ajout du template "Vif Coloré Crème" ──────────────────────
-- Nouveau template d'après le PPTX
-- "CV Vie professionnelle en Crème Violet Orange style Vif Coloré.pptx"
-- (Mariam Chapuis - Comptabilité).
--
-- Idempotente : utilise ON CONFLICT DO NOTHING.
-- À EXÉCUTER UNE SEULE FOIS dans le SQL Editor de Supabase.

INSERT INTO "cv_templates" ("slug", "nom", "description", "categorie", "prix", "ordre")
VALUES (
  'colorful_warm_blocks',
  'Vif Coloré Crème',
  'CV vif et coloré sur fond crème avec blocs violet, orange et jaune alternés. Photo, identité forte et sections en cartes contrastées. Adapté aux profils créatifs, jeunes diplômés et reconversion.',
  'creatif',
  1000.00,
  7
)
ON CONFLICT ("slug") DO NOTHING;

-- Vérification
SELECT slug, nom, categorie, prix, ordre, "isActive"
FROM "cv_templates"
WHERE slug = 'colorful_warm_blocks';
