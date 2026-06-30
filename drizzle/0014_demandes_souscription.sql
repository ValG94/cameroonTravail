-- Table demandes_souscription : workflow paiement manuel (Option B)
-- Le recruteur déclare un paiement Orange Money / MTN MoMo + référence
-- de transaction. L'admin vérifie et valide → la formule devient active
-- sur la fiche employeur (formuleAbonnement + dateDebutAbonnement +
-- dateFinAbonnement + nombreOffresRestantes mis à jour).

CREATE TYPE "public"."methodePaiement" AS ENUM('orange_money', 'mtn_momo', 'autre');
CREATE TYPE "public"."statutDemande" AS ENUM('en_attente', 'validee', 'refusee');

CREATE TABLE IF NOT EXISTS "demandes_souscription" (
  "id" serial PRIMARY KEY NOT NULL,
  "employeurId" integer NOT NULL REFERENCES "employeurs"("id") ON DELETE CASCADE,
  "formuleId" integer NOT NULL REFERENCES "formules_tarifaires"("id"),
  "montant" numeric(10, 2) NOT NULL,
  "devise" varchar(10) DEFAULT 'XAF' NOT NULL,
  "methodePaiement" "methodePaiement" NOT NULL,
  "referenceTransaction" varchar(100) NOT NULL,
  "statut" "statutDemande" DEFAULT 'en_attente' NOT NULL,
  "raisonRefus" text,
  "validatedByAdminId" integer REFERENCES "users"("id"),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "validatedAt" timestamp,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "demandes_souscription_employeur_idx"
  ON "demandes_souscription" ("employeurId");
CREATE INDEX IF NOT EXISTS "demandes_souscription_statut_idx"
  ON "demandes_souscription" ("statut");

-- RLS : table accessible uniquement via le backend (postgres direct
-- bypasse RLS, donc on active RLS sans policy pour bloquer l'accès
-- direct via la clé anon). Cohérent avec migration 0012.
ALTER TABLE "demandes_souscription" ENABLE ROW LEVEL SECURITY;
