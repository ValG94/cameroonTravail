-- ─── Migration : ajout du template "Sport Orange & Noir" ───────────────────
-- Nouveau template d'après le PPTX
-- "Orange et Noir Sports Sportif Entraîneur CV.pptx" (Alain Amari).
-- Idempotente : utilise ON CONFLICT DO NOTHING.

INSERT INTO "cv_templates" ("slug", "nom", "description", "categorie", "prix", "ordre")
VALUES (
  'sport_orange_dark',
  'Sport Orange & Noir',
  'CV dynamique noir et orange avec fond image sport grisé. Sidebar avec photo encadrée orange, identité forte et sections claires. Adapté aux profils sport, entraîneurs, coachs et métiers actifs.',
  'moderne',
  1000.00,
  9
)
ON CONFLICT ("slug") DO NOTHING;

SELECT slug, nom, categorie, prix, ordre, "isActive"
FROM "cv_templates"
WHERE slug = 'sport_orange_dark';
