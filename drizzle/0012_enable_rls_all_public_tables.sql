-- ─── Migration : activation de Row-Level Security sur toutes les tables publiques
--
-- CONTEXTE :
-- Supabase a alerté deux failles critiques (17 mai 2026) :
--   1. rls_disabled_in_public     → tables accessibles sans restriction via l'API REST
--   2. sensitive_columns_exposed  → colonnes sensibles (users) exposées via l'API REST
--
-- POURQUOI C'EST SANS RISQUE POUR L'APP :
-- Le backend Express se connecte à Postgres en DIRECT via postgres-js (DATABASE_URL),
-- avec le rôle "postgres" (super-utilisateur) qui BYPASSE RLS automatiquement.
-- Le storage Supabase utilise SUPABASE_SERVICE_ROLE_KEY qui bypasse RLS aussi.
-- Le frontend n'utilise JAMAIS l'API REST PostgREST de Supabase — tout passe par
-- nos endpoints tRPC backend authentifiés via JWT cookies.
--
-- EFFET DE CETTE MIGRATION :
-- Avec RLS activé et AUCUNE policy, les rôles anon/authenticated (utilisés par
-- l'API REST PostgREST de Supabase) reçoivent 0 ligne sur toutes les requêtes.
-- L'app continue de fonctionner normalement via le rôle postgres.
--
-- IDEMPOTENT : pg_tables filtre automatiquement les tables existantes, et
-- ENABLE ROW LEVEL SECURITY est sans effet si déjà activé.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      -- exclure d'éventuelles tables système de Drizzle (préfixe __)
      AND tablename NOT LIKE '\_\_%' ESCAPE '\'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    RAISE NOTICE 'RLS activé sur public.%', r.tablename;
  END LOOP;
END $$;

-- Vérification : liste les tables et leur statut RLS
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
