-- 0016 — Articles conseils bilingues + status + tags + alt
--
-- La table articles_conseils était monolingue FR uniquement. On la rend
-- bilingue en ajoutant les colonnes _en, un statut (draft/published), un
-- champ tags JSONB pour l'organisation éditoriale future, et un alt text
-- pour l'accessibilité de l'image de couverture.
--
-- Toutes les nouvelles colonnes sont NULL sauf status qui a un défaut
-- 'published' pour préserver le comportement existant : tout article
-- déjà en DB reste visible publiquement immédiatement.
--
-- L'unicité de slug_en est gérée via un index unique partiel (permet
-- plusieurs NULL sans conflit — pattern standard PostgreSQL).

ALTER TABLE "articles_conseils"
  ADD COLUMN IF NOT EXISTS "titre_en" VARCHAR(300),
  ADD COLUMN IF NOT EXISTS "slug_en" VARCHAR(200),
  ADD COLUMN IF NOT EXISTS "description_en" TEXT,
  ADD COLUMN IF NOT EXISTS "contenu_en" TEXT,
  ADD COLUMN IF NOT EXISTS "tags" JSONB,
  ADD COLUMN IF NOT EXISTS "imageAlt" VARCHAR(300),
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'published';

-- Index unique partiel sur slug_en (permet NULL multiples)
CREATE UNIQUE INDEX IF NOT EXISTS "articles_conseils_slug_en_unique"
  ON "articles_conseils" ("slug_en")
  WHERE "slug_en" IS NOT NULL;

-- Index pour requêtes fréquentes (filtre par status + categorie + featured)
CREATE INDEX IF NOT EXISTS "articles_conseils_status_idx"
  ON "articles_conseils" ("status");
CREATE INDEX IF NOT EXISTS "articles_conseils_featured_idx"
  ON "articles_conseils" ("featured") WHERE "featured" = true;
