-- 0018 — Spotlights sponsorisés (encart annonceur homepage)
--
-- Un "spotlight" est un emplacement premium loué à un recruteur pour
-- mettre en avant son entreprise en haut de la homepage (au-dessus des
-- offres récentes). Pack Visibilité Recruteur — 3 tiers :
--   - pme    : 25 000 XAF / semaine
--   - grande : 50 000 XAF / semaine
--   - continu: 100 000 XAF / mois
--
-- Workflow (V1 — paiement manuel, cf. option A validée) :
--   1. Recruteur clique "Souscrire" côté front → notification équipe.
--   2. Admin crée le spotlight dans le BO /admin/spotlights (dates,
--      pack, baseline, CTA).
--   3. actif=true → visible sur home entre startAt et endAt.
--
-- Un seul spotlight actif est affiché à la fois (le plus récent
-- créé). Si aucun n'est actif, la home montre un slot "Devenir
-- partenaire" (auto-marketing pour le pack).

CREATE TYPE "packSpotlight" AS ENUM ('pme', 'grande', 'continu');

CREATE TABLE IF NOT EXISTS "sponsored_spotlights" (
  "id"           SERIAL PRIMARY KEY,
  "employeurId"  INTEGER NOT NULL REFERENCES "employeurs"("id") ON DELETE CASCADE,
  "pack"         "packSpotlight" NOT NULL,
  "baseline"     VARCHAR(180) NOT NULL,
  "baselineEn"   VARCHAR(180),
  "ctaLabel"     VARCHAR(60),
  "ctaLabelEn"   VARCHAR(60),
  "ctaHref"      VARCHAR(500),
  "logoOverride" TEXT,
  "startAt"      TIMESTAMP NOT NULL,
  "endAt"        TIMESTAMP NOT NULL,
  "actif"        BOOLEAN NOT NULL DEFAULT true,
  "createdAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_spotlights_active_window"
  ON "sponsored_spotlights" ("actif", "startAt", "endAt");

-- RLS : géré côté API tRPC (adminProcedure pour CRUD, publicProcedure
-- pour le read de l'actif). Table lue publiquement par les visiteurs
-- non authentifiés → policy permissive en SELECT.
ALTER TABLE "sponsored_spotlights" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sponsored_spotlights_select_public"
  ON "sponsored_spotlights"
  FOR SELECT
  USING (true);

CREATE POLICY "sponsored_spotlights_modify_service"
  ON "sponsored_spotlights"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
