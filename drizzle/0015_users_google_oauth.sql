-- Ajout du support Google OAuth sur la table users.
-- Colonne `googleId` : sub claim Google (identifiant unique stable
-- côté Google). Indexée unique pour éviter qu'un même compte Google
-- soit lié à 2 users différents. Nullable (les comptes inscrits par
-- email classique n'ont pas de googleId).
--
-- Pas de colonne `provider` : on peut déduire le mode d'authentification
-- (presence de googleId vs hashedPassword). Évite une migration enum.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "googleId" VARCHAR(100);

-- Unique partiel : seuls les non-null sont uniques (PostgreSQL gère
-- les NULL comme distincts donc UNIQUE direct fonctionne, mais on
-- préfère être explicite).
CREATE UNIQUE INDEX IF NOT EXISTS "users_googleId_unique_idx"
  ON "users" ("googleId")
  WHERE "googleId" IS NOT NULL;
