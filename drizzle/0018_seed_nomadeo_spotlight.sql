-- Seed OPTIONNEL — Spotlight de démo Nomadéo Africa
--
-- À jouer manuellement dans Supabase après la migration 0018.
-- Ce script :
--   1. Crée un compte "démo" pour Nomadéo Africa (user + employeur)
--      si aucun employeur "Nomadéo Africa" n'existe déjà.
--   2. Crée un spotlight actif pour ce recruteur, visible 30 jours.
--
-- Si Nomadéo dispose déjà d'un compte réel sur la plateforme,
-- SKIP cette section 1 et ne joue que la section 2 en remplaçant
-- l'id manuellement.

BEGIN;

-- ─── Section 1 : compte démo Nomadéo Africa ──────────────────────────
INSERT INTO "users" ("email", "name", "profileType", "role", "loginMethod")
SELECT 'demo-nomadeo@cameroon-travail.test',
       'Nomadéo Africa (démo)',
       'employeur',
       'user',
       'seed'
WHERE NOT EXISTS (
  SELECT 1 FROM "employeurs" WHERE "nomEntreprise" ILIKE 'Nomadéo Africa'
);

INSERT INTO "employeurs" ("userId", "nomEntreprise", "secteurActivite", "description", "logoUrl", "siteWeb", "ville", "region")
SELECT u."id",
       'Nomadéo Africa',
       'Architecture & Design',
       'Nomadéo Africa accompagne les projets architecturaux et de design d''intérieur au Cameroun et à l''international.',
       '/images/partners/nomadeo-africa.png',
       'https://www.nomadeo.com',
       'Douala',
       'Littoral'
FROM "users" u
WHERE u."email" = 'demo-nomadeo@cameroon-travail.test'
  AND NOT EXISTS (
    SELECT 1 FROM "employeurs" WHERE "nomEntreprise" ILIKE 'Nomadéo Africa'
  );

-- ─── Section 2 : spotlight actif Nomadéo ─────────────────────────────
-- Crée un spotlight actif pour 30 jours, pack "continu".
-- Idempotent : ne fait rien si un spotlight actif existe déjà pour Nomadéo.
--
-- Note : les colonnes ctaSecondary* proviennent de la migration 0019.
-- Assure-toi d'avoir appliqué 0018 ET 0019 avant de jouer ce seed.
INSERT INTO "sponsored_spotlights"
  ("employeurId", "pack", "baseline", "baselineEn",
   "ctaLabel", "ctaLabelEn", "ctaHref",
   "ctaSecondaryLabel", "ctaSecondaryLabelEn", "ctaSecondaryHref",
   "startAt", "endAt", "actif")
SELECT
  e."id",
  'continu',
  'Nomadéo Africa recrute des architectes, designers et chefs de projet passionnés pour ses studios de Douala et Yaoundé.',
  'Nomadéo Africa is hiring architects, designers and project managers for its Douala and Yaoundé studios.',
  'Voir les offres de Nomadéo',
  'See Nomadéo''s jobs',
  NULL,
  'Découvrir l''entreprise',
  'Discover the company',
  'https://nomadeo.africa/',
  NOW(),
  NOW() + INTERVAL '30 days',
  true
FROM "employeurs" e
WHERE e."nomEntreprise" ILIKE 'Nomadéo Africa'
  AND NOT EXISTS (
    SELECT 1 FROM "sponsored_spotlights" s
    WHERE s."employeurId" = e."id" AND s."actif" = true
  );

COMMIT;
