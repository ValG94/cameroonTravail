-- ─── Migration : ajout du template "Développeur Noir & Blanc" ─────────────
-- Nouveau template d'après le PPTX
-- "Noir et Blanc simple moderne développeur web CV homme.pptx" (Benjamin Leroy).
-- Idempotente : utilise ON CONFLICT DO NOTHING.

INSERT INTO "cv_templates" ("slug", "nom", "description", "categorie", "prix", "ordre")
VALUES (
  'developer_dark_sidebar',
  'Développeur Noir & Blanc',
  'CV simple et moderne en noir et blanc avec photo grande sidebar gauche, identité forte à droite et touches bleu pétrole. Adapté aux profils tech, développeurs, ingénieurs et data.',
  'moderne',
  1000.00,
  8
)
ON CONFLICT ("slug") DO NOTHING;

SELECT slug, nom, categorie, prix, ordre, "isActive"
FROM "cv_templates"
WHERE slug = 'developer_dark_sidebar';
