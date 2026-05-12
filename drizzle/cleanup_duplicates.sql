-- ─── Script de cleanup : doublons hérités de l'import Manus ─────────────────
-- À EXÉCUTER UNE SEULE FOIS dans le SQL Editor de Supabase.
-- L'import Manus contenait des doublons d'expériences/compétences/formations/langues
-- pour certains candidats (ex: "PAO/Web" 3 fois). Ce script garde la 1ère ligne
-- (id min) et supprime les autres.
--
-- ⚠️  À RELIRE avant exécution. Faire un snapshot Supabase d'abord par précaution.

-- 1. Expériences : doublon si (candidatId, poste, entreprise, dateDebut, dateFin) identique
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "candidatId", poste, entreprise,
                        COALESCE("dateDebut", '1900-01-01'::timestamp),
                        COALESCE("dateFin", '1900-01-01'::timestamp)
           ORDER BY id ASC
         ) AS rn
  FROM experiences
)
DELETE FROM experiences WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 2. Compétences : doublon si (candidatId, nom, niveau, categorie) identique
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "candidatId", LOWER(nom), niveau, COALESCE(categorie, '')
           ORDER BY id ASC
         ) AS rn
  FROM competences
)
DELETE FROM competences WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 3. Formations : doublon si (candidatId, diplome, etablissement, dateDebut) identique
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "candidatId", diplome, COALESCE(etablissement, ''),
                        COALESCE("dateDebut", '1900-01-01'::timestamp)
           ORDER BY id ASC
         ) AS rn
  FROM formations
)
DELETE FROM formations WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- 4. Langues : doublon si (candidatId, nom) identique
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "candidatId", LOWER(nom)
           ORDER BY id ASC
         ) AS rn
  FROM langues
)
DELETE FROM langues WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- ─── Vérification ────────────────────────────────────────────────────────────
-- Compte final des entrées par candidat — devrait être cohérent (pas 3x le même poste)
SELECT
  'experiences' AS table_name,
  COUNT(*) AS total_lignes,
  COUNT(DISTINCT ("candidatId", poste, entreprise)) AS distinct_combos
FROM experiences
UNION ALL
SELECT 'competences', COUNT(*), COUNT(DISTINCT ("candidatId", nom, niveau)) FROM competences
UNION ALL
SELECT 'formations', COUNT(*), COUNT(DISTINCT ("candidatId", diplome, etablissement)) FROM formations
UNION ALL
SELECT 'langues', COUNT(*), COUNT(DISTINCT ("candidatId", nom)) FROM langues;
