-- ─── Migration : Bibliothèque de templates CV premium ───────────────────────
-- Ajoute :
--  1. Enums paymentStatus + paymentProvider
--  2. Table cv_templates (catalogue des modèles)
--  3. Table cv_template_purchases (achats pay-per-template)
-- À exécuter dans le SQL Editor de Supabase.

DO $$ BEGIN
  CREATE TYPE "paymentStatus" AS ENUM ('pending', 'success', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "paymentProvider" AS ENUM ('mtn_momo', 'orange_money', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "cv_templates" (
  "id"            serial PRIMARY KEY,
  "slug"          varchar(80) NOT NULL UNIQUE,
  "nom"           varchar(100) NOT NULL,
  "description"   text,
  "categorie"     varchar(50),
  "prix"          decimal(10,2) NOT NULL DEFAULT 1000.00,
  "devise"        varchar(10) NOT NULL DEFAULT 'XAF',
  "thumbnailUrl"  text,
  "previewUrl"    text,
  "isPremium"     boolean NOT NULL DEFAULT true,
  "isActive"      boolean NOT NULL DEFAULT true,
  "ordre"         serial,
  "createdAt"     timestamp NOT NULL DEFAULT now(),
  "updatedAt"     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "cv_template_purchases" (
  "id"                serial PRIMARY KEY,
  "userId"            serial NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "templateId"        serial NOT NULL REFERENCES "cv_templates"("id") ON DELETE CASCADE,
  "amount"            decimal(10,2) NOT NULL,
  "currency"          varchar(10) NOT NULL DEFAULT 'XAF',
  "provider"          "paymentProvider" NOT NULL,
  "status"            "paymentStatus" NOT NULL DEFAULT 'pending',
  "paymentReference"  varchar(200),
  "payerPhone"        varchar(20),
  "providerPayload"   text,
  "unlockedAt"        timestamp,
  "createdAt"         timestamp NOT NULL DEFAULT now(),
  "updatedAt"         timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cv_template_purchases_user_idx" ON "cv_template_purchases" ("userId");
CREATE INDEX IF NOT EXISTS "cv_template_purchases_template_idx" ON "cv_template_purchases" ("templateId");
CREATE INDEX IF NOT EXISTS "cv_template_purchases_status_idx" ON "cv_template_purchases" ("status");

-- ─── Seed du catalogue initial (5 templates premium) ─────────────────────────
INSERT INTO "cv_templates" ("slug", "nom", "description", "categorie", "prix", "ordre")
VALUES
  ('modern_sidebar_dark',   'Moderne Sombre',  'Mise en page sombre avec colonne latérale, photo et contraste élégant. Idéal pour les profils tech, créatifs et marketing.',                      'moderne',     1000.00, 1),
  ('hospitality_timeline',  'Hospitalité',     'Modèle dynamique avec timeline et bandeaux colorés. Recommandé pour les métiers de la restauration, hôtellerie et services.',                    'service',     1000.00, 2),
  ('minimal_centered',      'Minimal Centré',  'Mise en page épurée et centrée, parfaite pour les profils corporate, juridiques ou consulting.',                                                  'minimaliste', 1000.00, 3),
  ('editorial_creative',    'Éditorial Créatif','Design éditorial avec photo en évidence et mise en page magazine. Pour les profils créatifs, communication, design.',                            'creatif',     1000.00, 4),
  ('executive_curved',      'Exécutif',        'Modèle corporate premium avec formes graphiques en haut. Adapté aux postes de direction et profils seniors.',                                    'executif',    1000.00, 5)
ON CONFLICT ("slug") DO NOTHING;
