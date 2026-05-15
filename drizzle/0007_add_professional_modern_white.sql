-- ─── Migration : ajout du template "White Professional Modern" ─────────────
-- Nouveau template d'après le PPTX
-- "White professional modern CV resume.pptx" (Connor Hamilton).
--
-- Idempotente : utilise ON CONFLICT DO NOTHING.
-- À EXÉCUTER UNE SEULE FOIS dans le SQL Editor de Supabase.

INSERT INTO "cv_templates" ("slug", "nom", "description", "categorie", "prix", "ordre")
VALUES (
  'professional_modern_white',
  'White Professional Modern',
  'CV professionnel moderne en blanc avec photo dans cadre courbé et accent orange. Layout 2 colonnes : identité, About, Skills à gauche ; Education et Experience à droite. Adapté aux profils marketing, management et créatifs.',
  'moderne',
  1000.00,
  6
)
ON CONFLICT ("slug") DO NOTHING;

-- Vérification
SELECT slug, nom, categorie, prix, ordre, "isActive"
FROM "cv_templates"
WHERE slug = 'professional_modern_white';
