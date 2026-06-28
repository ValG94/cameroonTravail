-- ─── Migration : refonte des formules tarifaires employeur ─────────────────
--
-- Demande du 16 mai 2026 :
--   - Plus de package gratuit pour les recruteurs
--   - 3 nouvelles offres avec ces noms et prix exacts :
--     1. Offre découverte  — 25 000 FCFA / mois — 3 offres
--     2. Offre avantage    — 50 000 FCFA / mois — 10 offres + accès CVthèque
--     3. Offre Premium     — 150 000 FCFA / mois — offres illimitées
--
-- STRATÉGIE :
--   1. Désactiver TOUTES les anciennes formules employeur (actif = false)
--      → elles disparaissent du site public et du formulaire d'inscription
--      → on ne les supprime PAS pour ne pas casser un éventuel historique
--        de souscription qui les référencerait
--   2. Insérer les 3 nouvelles formules

-- 1. Désactiver tout l'ancien catalogue employeur
UPDATE "formules_tarifaires"
SET "actif" = false, "updatedAt" = NOW()
WHERE "cible" = 'employeur';

-- 2. Insérer les 3 nouvelles formules
INSERT INTO "formules_tarifaires"
  ("nom", "cible", "prix", "devise", "periode", "description", "fonctionnalites", "actif", "populaire", "ordre")
VALUES
  (
    'Offre découverte',
    'employeur',
    25000.00,
    'XAF',
    'mensuel',
    'Pour démarrer le recrutement en ligne',
    '["3 offres d''emploi par mois", "Réception des candidatures par email", "Tableau de bord de suivi", "Support standard"]',
    true,
    false,
    1
  ),
  (
    'Offre avantage',
    'employeur',
    50000.00,
    'XAF',
    'mensuel',
    'Le bon compromis pour recruter régulièrement',
    '["10 offres d''emploi par mois", "Accès complet à la CVthèque", "Filtres avancés (compétences, région, expérience)", "Mise en avant ponctuelle des offres", "Support prioritaire"]',
    true,
    true,
    2
  ),
  (
    'Offre Premium',
    'employeur',
    150000.00,
    'XAF',
    'mensuel',
    'Recrutement à grande échelle, sans limite',
    '["Offres d''emploi illimitées", "Accès complet à la CVthèque", "Mise en avant permanente de toutes vos offres", "Analytics avancés (vues, candidatures, conversion)", "Conseiller dédié (support 24h/7j)", "Page entreprise personnalisée"]',
    true,
    false,
    3
  );

-- Vérification
SELECT id, nom, prix, devise, periode, actif, populaire, ordre
FROM "formules_tarifaires"
WHERE cible = 'employeur'
ORDER BY actif DESC, ordre;
