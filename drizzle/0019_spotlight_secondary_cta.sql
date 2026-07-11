-- 0019 — CTA secondaire optionnel pour les spotlights
--
-- Ajoute un second bouton (ex. "Découvrir l'entreprise") à côté du CTA
-- principal ("Voir les offres"). Bilingue FR/EN. Optionnel : si les
-- deux champs (label + href) sont vides, seul le CTA principal est
-- rendu côté home.

ALTER TABLE "sponsored_spotlights"
  ADD COLUMN IF NOT EXISTS "ctaSecondaryLabel"   VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "ctaSecondaryLabelEn" VARCHAR(60),
  ADD COLUMN IF NOT EXISTS "ctaSecondaryHref"    VARCHAR(500);
