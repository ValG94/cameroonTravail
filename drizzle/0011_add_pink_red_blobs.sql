-- ─── Migration : ajout du template "Rose et Rouge" ─────────────────────────
-- Nouveau template d'après le PPTX
-- "CV Professionnel Moderne Rose et Rouge.pptx" (Sacha Dubois - Chargée de Projet).
-- Idempotente : utilise ON CONFLICT DO NOTHING.

INSERT INTO "cv_templates" ("slug", "nom", "description", "categorie", "prix", "ordre")
VALUES (
  'pink_red_blobs',
  'Rose et Rouge',
  'CV professionnel moderne avec blob rouge en haut-droite contenant la photo et blob rose pâle en bas-gauche. Texte en rouge sur fond off-white avec séparateur pointillé. Adapté aux profils événementiel, communication, marketing et chef de projet.',
  'creatif',
  1000.00,
  10
)
ON CONFLICT ("slug") DO NOTHING;

SELECT slug, nom, categorie, prix, ordre, "isActive"
FROM "cv_templates"
WHERE slug = 'pink_red_blobs';
