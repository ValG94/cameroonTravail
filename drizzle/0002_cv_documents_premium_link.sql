-- ─── Migration : lier les CVs premium aux cv_documents ─────────────────────
-- 1. Étend l'enum typeCv avec la valeur "premium"
-- 2. Ajoute la colonne premiumTemplateSlug (nullable) à cv_documents
-- À exécuter dans le SQL Editor de Supabase APRÈS 0001.

-- Ajout de la valeur "premium" à l'enum existant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    WHERE t.typname = 'typeCv' AND e.enumlabel = 'premium'
  ) THEN
    ALTER TYPE "typeCv" ADD VALUE 'premium';
  END IF;
END $$;

-- Colonne pour identifier quel template premium est utilisé
ALTER TABLE "cv_documents"
  ADD COLUMN IF NOT EXISTS "premiumTemplateSlug" varchar(80);
