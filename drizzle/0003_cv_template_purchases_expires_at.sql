-- ─── Migration : expiration des achats de templates premium (6 mois) ────────
-- Ajoute la colonne expiresAt à cv_template_purchases.
-- À exécuter dans le SQL Editor de Supabase APRÈS 0002.

ALTER TABLE "cv_template_purchases"
  ADD COLUMN IF NOT EXISTS "expiresAt" timestamp;

-- Pour les achats déjà présents (en mock/test) : les laisser sans expiration
-- (les futurs achats auront expiresAt = unlockedAt + 6 mois).
