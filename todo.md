# Cameroon Travail - TODO

## Phase 1: Configuration de la base de données
- [x] Créer le schéma de base de données avec tables: candidats, employeurs, offres_emploi, candidatures, alertes, experiences, formations, competences, langues
- [x] Ajouter les relations entre les tables
- [x] Configurer les migrations avec drizzle

## Phase 2: Système d'authentification
- [x] Étendre le modèle utilisateur avec type de profil (candidat/employeur)
- [x] Créer l'interface de sélection de type de profil lors de l'inscription
- [x] Créer la page de connexion avec logo Cameroon Travail
- [x] Créer la page d'inscription avec logo Cameroon Travail
- [x] Implémenter la logique de redirection selon le type de profil

## Phase 3: Interface candidat - Profil
- [x] Créer le tableau de bord candidat
- [x] Créer le formulaire de profil candidat (informations personnelles)
- [ ] Créer le formulaire d'expériences professionnelles (CRUD)
- [ ] Créer le formulaire de formations et diplômes (CRUD)
- [ ] Créer le formulaire de compétences (CRUD)
- [ ] Créer le formulaire de langues (CRUD)
- [ ] Implémenter la sauvegarde du profil candidat

## Phase 4: Import CV avec extraction IA
- [ ] Créer l'interface d'upload de CV (PDF et Word)
- [ ] Implémenter l'extraction de texte depuis PDF
- [ ] Implémenter l'extraction de texte depuis Word
- [ ] Créer le prompt IA pour extraire les données structurées du CV
- [ ] Implémenter l'extraction IA: nom, prénom, email, téléphone
- [ ] Implémenter l'extraction IA: expériences professionnelles
- [ ] Implémenter l'extraction IA: formations et diplômes
- [ ] Implémenter l'extraction IA: compétences
- [ ] Implémenter l'extraction IA: langues
- [ ] Créer l'interface de révision/modification des données extraites
- [ ] Permettre l'ajout manuel d'informations supplémentaires

## Phase 5: Recherche d'emploi - Emploi Public
- [ ] Créer la page de recherche Emploi Public
- [ ] Créer le formulaire de recherche avec filtres (métier, localisation, type de contrat)
- [ ] Créer la liste des offres d'emploi public
- [ ] Créer la page de détail d'une offre d'emploi public
- [ ] Implémenter la pagination des résultats
- [ ] Implémenter le tri des résultats (date, pertinence)
- [ ] Permettre la sauvegarde d'offres favorites

## Phase 6: Recherche d'emploi - Emploi Privé
- [ ] Créer la page de recherche Emploi Privé
- [ ] Créer le formulaire de recherche avec filtres (métier, localisation, type de contrat)
- [ ] Créer la liste des offres d'emploi privé
- [ ] Créer la page de détail d'une offre d'emploi privé
- [ ] Implémenter la pagination des résultats
- [ ] Implémenter le tri des résultats (date, pertinence)
- [ ] Permettre la sauvegarde d'offres favorites

## Phase 7: Système d'alertes personnalisées
- [ ] Créer l'interface de création d'alertes
- [ ] Permettre la définition de critères d'alerte (métier, localisation, type de contrat, secteur)
- [ ] Créer la logique de matching entre profil candidat et offres
- [ ] Implémenter le système de notification des alertes
- [ ] Créer l'interface de gestion des alertes (liste, modification, suppression)

## Phase 8: Interface employeur
- [ ] Créer le tableau de bord employeur
- [ ] Créer le formulaire de profil employeur (informations entreprise)
- [ ] Créer l'interface de gestion des formules d'abonnement
- [ ] Créer le formulaire de publication d'offre d'emploi
- [ ] Créer la liste des offres publiées par l'employeur
- [ ] Implémenter la modification/suppression d'offres
- [ ] Créer l'interface de consultation des candidatures reçues
- [ ] Implémenter le système de limitation selon l'abonnement

## Phase 9: Fonctionnalités additionnelles
- [ ] Créer la page d'accueil avec bannière et modules d'action
- [ ] Créer la navigation globale responsive
- [ ] Implémenter le système de candidature à une offre
- [ ] Créer la page de conseils/ressources
- [ ] Créer le pied de page avec liens utiles
- [ ] Optimiser le responsive mobile
- [ ] Ajouter les tests unitaires critiques

## Phase 10: Tests et déploiement
- [ ] Tester le parcours complet candidat
- [ ] Tester le parcours complet employeur
- [ ] Tester l'import CV et extraction IA
- [ ] Tester les alertes personnalisées
- [ ] Vérifier la compatibilité mobile
- [ ] Créer le checkpoint final

## Phase 11: Internationalisation et localisation
- [x] Installer et configurer react-i18next pour le bilinguisme (Français/Anglais)
- [x] Créer les fichiers de traduction fr.json et en.json
- [x] Ajouter le sélecteur de langue dans la navigation
- [ ] Traduire toutes les interfaces en français et anglais
- [x] Configurer les formats de numéros de téléphone camerounais (+237)
- [x] Ajouter la validation des numéros de téléphone camerounais
- [x] Créer la liste des 10 régions du Cameroun
- [x] Créer la liste des villes principales par région
- [x] Configurer le format de devise Francs CFA (XAF)
- [x] Adapter les filtres de recherche pour les régions camerounaises

## Phase 4: Import CV avec extraction IA
- [x] Créer l'endpoint backend pour upload de CV (PDF/Word)
- [x] Implémenter l'extraction de texte depuis PDF et Word
- [x] Créer le prompt IA pour extraire les données structurées du CV
- [x] Implémenter l'extraction automatique: nom, prénom, téléphone, email, adresse
- [x] Implémenter l'extraction des expériences professionnelles
- [x] Implémenter l'extraction des formations et diplômes
- [x] Implémenter l'extraction des compétences
- [x] Implémenter l'extraction des langues
- [x] Créer l'interface de prévisualisation des données extraites
- [x] Permettre la modification manuelle des données extraites
- [x] Sauvegarder le CV dans S3 et les données dans la base
- [x] Créer les tests unitaires pour l'extraction IA

## Améliorations demandées - Page d'accueil et Inscription
- [x] Compléter la traduction EN sur la page d'accueil
- [x] Ajouter un bouton "Inscription" dans le header
- [x] Créer le formulaire d'inscription inspiré de la maquette
- [x] Créer un carrousel des dernières offres d'emploi sur la page d'accueil
- [x] Afficher les offres récentes avec titre, entreprise, localisation, salaire

## Pages de gestion détaillées candidat
- [x] Créer la page de gestion des expériences (liste, ajout, modification, suppression)
- [x] Créer la page de gestion des formations (liste, ajout, modification, suppression)
- [ ] Créer la page de gestion des compétences (liste, ajout, modification, suppression)
- [ ] Créer la page de gestion des langues (liste, ajout, modification, suppression)

## Correction urgente
- [x] Créer la route /employeur/dashboard
- [x] Créer la page du tableau de bord employeur
- [x] Ajouter la navigation employeur

## Corrections urgentes - Inscription
- [x] Corriger le logo cassé sur la page d'accueil
- [x] Créer une page de choix de profil avant l'inscription (Candidat/Employeur)
- [x] Intégrer le formulaire d'inscription candidat avec tous les champs
- [x] Intégrer le formulaire d'inscription employeur avec tous les champs
- [x] Corriger la redirection selon le profil choisi après inscription
- [x] Remplacer l'inscription Google directe par le système de formulaires

## Corrections UI - Traductions et style
- [x] Corriger les traductions manquantes sur la page de choix de profil (profile.candidate → Candidat)
- [x] Vérifier et corriger le logo qui ne s'affiche pas
- [x] Réduire la taille de police pour la case à cocher des conditions d'utilisation
- [x] Ajuster le style pour correspondre exactement à la maquette

## Authentification email/mot de passe
- [x] Installer bcrypt pour le hachage des mots de passe
- [x] Ajouter les colonnes email et password dans la table users
- [x] Créer l'endpoint tRPC pour l'inscription avec email/mot de passe
- [x] Créer l'endpoint tRPC pour la connexion avec email/mot de passe
- [x] Créer la page de connexion avec formulaire email/mot de passe
- [x] Modifier les formulaires d'inscription pour rediriger vers la page d'accueil
- [x] Implémenter la gestion de session avec JWT
- [ ] Ajouter la fonctionnalité "Mot de passe oublié"

## Corrections urgentes - Session et OAuth
- [x] Supprimer la redirection OAuth automatique après connexion au dashboard
- [x] Corriger la logique de redirection dans Home.tsx pour ne pas rediriger les utilisateurs connectés
- [x] Ajouter un menu utilisateur avec photo et nom dans le header de la page d'accueil
- [ ] Permettre l'upload de photo de profil pour les candidats
- [x] Afficher le nom complet de l'utilisateur connecté dans le menu
- [x] Ajouter les options "Mon compte" et "Me déconnecter" dans le menu utilisateur
- [x] Corriger toutes les traductions manquantes (auth.login, auth.rememberMe, auth.continueWith, auth.continueGoogle)
- [x] Corriger l'erreur de balises <a> imbriquées dans Connexion.tsx

## Corrections critiques - Traductions et persistance de session
- [x] Corriger le chargement des traductions i18n (auth.login affiché au lieu de "Connexion")
- [x] Vérifier la configuration i18n dans main.tsx
- [x] Corriger la logique de création des cookies JWT dans server/auth.ts
- [x] Vérifier les options de cookie (httpOnly, secure, sameSite, path, domain)
- [x] Corriger la lecture des cookies dans le contexte d'authentification
- [x] Supprimer complètement les références OAuth dans le flux d'authentification custom
- [x] Tester la persistance de session après connexion et rafraîchissement de page

## Débogage urgent - Traductions et session
- [x] Ajouter des logs dans la mutation login (server/routers.ts)
- [x] Ajouter des logs dans verifySession (server/_core/sdk.ts)
- [x] Ajouter des logs dans authenticateRequest (server/_core/sdk.ts)
- [x] Ajouter des logs dans Connexion.tsx côté client
- [x] Analyser les logs pour identifier le problème
- [x] Corriger le problème identifié (clé auth.login manquante)

## Correction urgente - Session non persistée après redirection
- [x] Analyser pourquoi useAuth retourne user: null après connexion réussie
- [x] Corriger les balises <a> imbriquées dans CandidatNav.tsx (ligne 62-63)
- [x] Forcer le refresh de auth.me après connexion réussie dans Connexion.tsx
- [x] Vérifier les options de cookie (httpOnly pourrait bloquer la lecture côté client)
- [x] Ajouter un délai avant redirection pour laisser le cookie se propager
- [x] Vérifier les logs serveur pour confirmer que le cookie est bien envoyé

## Correction critique - Nom de cookie incompatible (401 Unauthorized)
- [x] Identifier le nom de cookie utilisé (app_session_id dans le code)
- [x] Vérifier où le cookie est créé (server/routers.ts mutation login)
- [x] Vérifier où le cookie est lu (server/_core/sdk.ts et context.ts)
- [x] Corriger le problème d'upsert avec openId pour custom auth
- [x] Tester que le cookie est bien lu après connexion (logs montrent User authenticated)

## Nettoyage et nouvelles fonctionnalités
- [x] Nettoyer les logs de débogage dans context.ts
- [x] Nettoyer les logs de débogage dans sdk.ts
- [x] Nettoyer les logs de débogage dans Connexion.tsx
- [x] Nettoyer les logs de débogage dans useAuth.ts
- [x] Ajouter un champ photoUrl dans la table candidats (déjà existant)
- [x] Ajouter un champ photoUrl dans la table employeurs (logoUrl déjà existant)
- [x] Créer l'endpoint tRPC pour uploader une photo de profil vers S3
- [x] Modifier le menu utilisateur pour afficher la photo uploadée
- [ ] Ajouter un bouton pour changer la photo de profil dans Mon compte
- [x] Corriger l'erreur "Impossible d'extraire le texte du PDF" dans candidat.uploadCV
- [x] Vérifier que l'extraction de texte fonctionne avec pdf-parse (utilise createRequire)
- [ ] Tester l'analyse de CV avec l'API LLM intégrée

## Correction urgente - Erreur d'extraction PDF
- [x] Analyser les logs serveur pour identifier l'erreur exacte de pdf-parse (pdfParse is not a function)
- [x] Tester si createRequire fonctionne correctement (ne fonctionne pas)
- [x] Remplacer pdf-parse par pdf.js-extract (spécifiquement conçu pour Node.js)
- [ ] Tester l'upload et l'analyse de CV avec un fichier PDF réel

## Améliorations analyse CV et upload photo
- [x] Ajouter une déduplication des expériences professionnelles dans l'analyse de CV (éviter les doublons)
- [x] Vérifier la logique d'extraction des expériences par l'IA
- [x] Ajouter un bouton d'upload de photo dans la page "Mon compte" du dashboard candidat
- [x] Afficher la photo actuelle et permettre de la changer
- [x] Ajouter un aperçu de la photo avant upload

## Gestion des compétences et langues
- [x] Vérifier le schéma de base de données pour les tables competences et langues
- [x] Créer les endpoints tRPC pour les compétences (déjà existants)
- [x] Créer les endpoints tRPC pour les langues (déjà existants)
- [x] Créer la page Compétences.tsx dans client/src/pages/candidat/
- [x] Ajouter un formulaire d'ajout de compétence avec nom et niveau
- [x] Afficher la liste des compétences avec boutons modifier/supprimer
- [x] Créer la page Langues.tsx dans client/src/pages/candidat/
- [x] Ajouter un formulaire d'ajout de langue avec nom et niveau
- [x] Afficher la liste des langues avec boutons modifier/supprimer
- [x] Ajouter les routes dans App.tsx
- [x] Les liens existent déjà dans le Dashboard candidat
- [ ] Tester toutes les opérations CRUD

## Correction erreur Formations et recherche d'emploi
- [ ] Corriger l'erreur de balises <a> imbriquées dans la page Formations
- [x] Créer le schéma de base de données pour les offres d'emploi (table offres)
- [x] Ajouter les champs: titre, description, entreprise, secteur, type (public/privé), contrat, salaire, région, ville, datePublication, dateExpiration
- [x] Créer les endpoints tRPC pour rechercher et filtrer les offres (jobs.search, jobs.getById)
- [x] Créer la page RechercheEmploi.tsx avec filtres avancés
- [x] Ajouter les filtres: mots-clés, région, ville, secteur, type de contrat, fourchette de salaire
- [x] Afficher les résultats de recherche avec pagination
- [x] Ajouter un bouton pour voir les détails de chaque offre
- [ ] Créer la page de détails d'une offre d'emploi
- [x] Ajouter les routes dans App.tsx (/recherche-emploi, /emploi-public, /emploi-prive)

## Page de détail d'offre d'emploi
- [x] Créer la page OffreDetail.tsx pour afficher les détails complets d'une offre
- [x] Afficher toutes les informations de l'offre (titre, description, entreprise, secteur, type, contrat, salaire, localisation)
- [x] Afficher les informations sur l'entreprise employeur
- [x] Ajouter un bouton "Postuler" pour les candidats connectés
- [x] Ajouter la route /offre/:id dans App.tsx
- [x] Gérer les états de chargement et d'erreur (offre non trouvée)
- [x] Modifier l'endpoint jobs.getById pour inclure les informations de l'employeur avec un join

## Système de candidature complet
- [x] Créer les endpoints tRPC pour la candidature (candidatures.create, candidatures.getByCandidat, candidatures.getById, candidatures.hasApplied)
- [x] Créer le composant DialogCandidature avec formulaire de lettre de motivation
- [x] Ajouter l'upload de CV et documents supplémentaires dans le formulaire
- [x] Intégrer le stockage S3 pour les fichiers uploadés (lib/storage.ts)
- [x] Modifier le bouton "Postuler" dans OffreDetail.tsx pour ouvrir le dialog
- [x] Vérifier que le candidat n'a pas déjà postulé à cette offre (hasApplied query)
- [x] Créer la page CandidatCandidatures pour afficher toutes les candidatures du candidat
- [x] Afficher le statut de chaque candidature (en_attente, vue, retenue, rejetee, entretien)
- [x] Ajouter la route /candidat/candidatures dans App.tsx
- [x] Ajouter le lien dans CandidatNav
- [x] Gérer les erreurs et validations du formulaire (toast notifications)

## Interface employeur - Gestion des candidatures
- [x] Créer les endpoints tRPC pour les employeurs (candidatures.getByEmployeur avec filtres, candidatures.updateStatut)
- [x] Créer la page EmployeurCandidatures pour afficher toutes les candidatures reçues
- [x] Ajouter des filtres par statut (en_attente, vue, retenue, rejetee, entretien)
- [x] Ajouter des statistiques par statut en haut de la page
- [x] Créer le composant DialogCandidatureDetail pour voir les détails d'une candidature
- [x] Afficher la lettre de motivation, le CV et les documents supplémentaires
- [x] Ajouter des actions pour changer le statut de la candidature
- [x] Ajouter un champ pour ajouter un commentaire employeur
- [x] Ajouter la route /employeur/candidatures dans App.tsx
- [x] Ajouter le lien dans EmployeurNav
- [x] Vérification de sécurité: l'employeur ne peut modifier que les candidatures de ses propres offres

## Interface employeur - Publication et gestion des offres
- [x] Créer les endpoints tRPC pour les offres (jobs.create, jobs.getByEmployeur, jobs.update, jobs.delete)
- [x] Créer la page EmployeurPublier avec formulaire complet de publication d'offre
- [x] Ajouter tous les champs: titre, description, missions, compétences, expérience, niveau d'étude, secteur, type (public/privé), contrat, durée, salaire, avantages, région, ville, dates limites
- [x] Ajouter la validation des champs obligatoires (titre min 5 caractères, description min 50 caractères)
- [x] Créer la page EmployeurOffres pour afficher toutes les offres de l'employeur
- [x] Afficher le statut de chaque offre (brouillon, publiée, expirée, pourvue) avec badges colorés
- [x] Ajouter des actions: voir, modifier (placeholder), supprimer avec confirmation
- [x] Afficher le nombre de candidatures et de vues par offre
- [x] Ajouter la route /employeur/publier dans App.tsx
- [x] Ajouter la route /employeur/offres dans App.tsx
- [x] Gérer les erreurs et validations du formulaire avec toast notifications
- [x] Vérification de sécurité: l'employeur ne peut modifier/supprimer que ses propres offres


## Correction bug publication d'offre
- [x] Analyser l'erreur d'insertion dans offresEmploi
- [x] Vérifier la compatibilité des types de données avec le schéma
- [x] Corriger le code d'insertion dans jobs.create (retiré pays, datePublication, statut, nombreVues, nombreCandidatures qui ont des valeurs par défaut)
- [x] Tester la publication d'une offre


## Amélioration UX - Suggestions de villes par région
- [x] Créer une liste des villes principales par région du Cameroun (shared/regions-villes.ts)
- [x] Modifier le champ ville pour utiliser un Select avec suggestions au lieu d'un Input libre
- [x] Filtrer les villes affichées selon la région sélectionnée
- [x] Appliquer dans le formulaire de publication d'offre
- [ ] Appliquer dans les autres formulaires concernés (profils candidat/employeur, recherche)


## Corrections et améliorations formulaire publication
- [x] Analyser et corriger l'erreur d'insertion SQL persistante (remplacé insert Drizzle par requête SQL brute)
- [x] Masquer le champ "Durée du contrat" lorsque CDI est sélectionné
- [x] Ajouter un éditeur riche (rich text editor) pour Description, Missions et Compétences requises
- [x] Permettre la mise en forme avec puces, gras, italique, listes, liens dans l'éditeur (Quill.js)
- [ ] Tester la publication d'offre avec caractères spéciaux et mise en forme


## Débogage erreur insertion SQL
- [x] Ajouter des console.log détaillés dans jobs.create pour identifier le problème
- [x] Identifier le vrai problème: colonne experienceRequise trop courte (VARCHAR(100))
- [x] Modifier le schéma pour changer experienceRequise en TEXT
- [x] Pousser la migration vers la base de données (db:push)
- [x] Utiliser une requête SQL brute avec mysql2 pour contourner les problèmes Drizzle
- [x] Tester la publication d'une deuxième offre avec le même profil - SUCCÈS


## Système de notifications par email
- [x] Créer un service d'envoi d'emails (email.ts dans server/_core)
- [x] Configurer les templates d'emails HTML (nouvelle candidature et changement de statut)
- [x] Implémenter la notification pour nouvelle candidature (envoyée à l'employeur)
- [x] Implémenter la notification pour changement de statut de candidature (envoyée au candidat)
- [x] Intégrer l'envoi d'email dans candidatures.create
- [x] Intégrer l'envoi d'email dans candidatures.updateStatut
- [x] Gérer les erreurs d'envoi d'email sans bloquer l'opération principale (try/catch)

## Fonctionnalité de duplication d'offres
- [x] Créer l'endpoint jobs.duplicate pour dupliquer une offre existante
- [x] Ajouter un bouton "Dupliquer" dans la page EmployeurOffres
- [x] Copier tous les champs sauf les dates et le statut
- [x] Rediriger vers le formulaire de publication avec les données pré-remplies
- [x] Permettre la modification avant publication (useEffect pour pré-remplir le formulaire)


## Fonctionnalité "Mot de passe oublié"
- [ ] Créer la table passwordResetTokens dans le schéma Drizzle (userId, token, expiresAt)
- [ ] Pousser le schéma vers la base de données (db:push)
- [ ] Créer l'endpoint auth.requestPasswordReset pour générer un token et envoyer l'email
- [ ] Créer l'endpoint auth.resetPassword pour valider le token et changer le mot de passe
- [ ] Créer le template d'email de réinitialisation avec lien sécurisé
- [ ] Créer la page ForgotPassword avec formulaire d'email
- [ ] Créer la page ResetPassword avec formulaire de nouveau mot de passe
- [ ] Ajouter le lien "Mot de passe oublié ?" sur la page de connexion
- [ ] Ajouter les routes dans App.tsx
- [ ] Gérer l'expiration des tokens (24h)
- [ ] Hacher les tokens avant stockage pour plus de sécurité


## Fonctionnalité "Mot de passe oublié"
- [x] Créer la table passwordResetTokens dans la base de données
- [x] Ajouter les champs: userId, token (haché), expiresAt, createdAt
- [x] Créer l'endpoint auth.requestPasswordReset pour demander une réinitialisation
- [x] Générer un token aléatoire et le hacher avec bcrypt
- [x] Envoyer un email avec le lien de réinitialisation (template HTML)
- [x] Créer l'endpoint auth.resetPassword pour réinitialiser le mot de passe
- [x] Vérifier la validité du token et sa date d'expiration (24h)
- [x] Mettre à jour le mot de passe de l'utilisateur
- [x] Supprimer le token après utilisation
- [x] Créer la page ForgotPassword pour demander la réinitialisation
- [x] Créer la page ResetPassword pour définir le nouveau mot de passe
- [x] Ajouter les routes dans App.tsx (/mot-de-passe-oublie, /forgot-password, /reset-password)
- [x] Le lien "Mot de passe oublié" existe déjà sur la page de connexion


## Débogage envoi d'email réinitialisation
- [x] Vérifier la configuration de l'API d'envoi d'email dans email.ts
- [x] Identifier le problème: l'endpoint /email/send n'existe pas dans l'API Manus (404)
- [x] Installer Resend pour l'envoi d'emails (pnpm add resend)
- [x] Configurer Resend avec la clé API (RESEND_API_KEY)
- [x] Modifier email.ts pour utiliser Resend au lieu de l'API Manus
- [x] Créer un test vitest pour valider la clé API
- [x] Tester l'envoi d'email avec Resend - SUCCÈS (ID: f2e63803-31d5-4b9f-b8ab-66b7f96708d6)
- [ ] Vérifier la réception de l'email dans la boîte mail


## Correction URL de réinitialisation
- [x] Modifier requestPasswordReset pour utiliser l'URL de développement
- [x] Corriger l'extraction du token dans ResetPassword.tsx (utiliser window.location.search)
- [ ] Tester le flux complet de réinitialisation de mot de passe


## Améliorations page de réinitialisation
- [x] Ajouter un bouton pour afficher/masquer le mot de passe (Eye/EyeOff icons)
- [x] Corriger le lien "Se connecter" pour pointer vers /connexion au lieu de /login


## Correction tableau de bord employeur
- [x] Corriger l'affichage des statistiques (offres actives, candidatures, vues) pour refléter les données réelles
- [x] Vérifier les requêtes tRPC pour les statistiques employeur (créé endpoint jobs.getStats)
- [x] Afficher correctement le nombre d'offres publiées dans les cartes du dashboard
- [x] Corriger le logo cliquable dans la navbar employeur pour rediriger vers la page d'accueil


## Correction téléchargement documents candidature
- [x] Corriger les URLs de téléchargement des CV et documents supplémentaires (storage.example.com → vraies URLs S3)
- [x] Créer l'endpoint system.uploadFile pour gérer l'upload côté serveur
- [x] Remplacer la fonction storagePut côté client pour utiliser l'API tRPC
- [x] Les fichiers sont maintenant uploadés sur le vrai S3 avec URLs accessibles


## Corrections affichage et upload
- [x] Corriger l'erreur 400 lors de l'upload de fichiers (format requête tRPC incorrect - ajout du format batch)
- [x] Afficher le HTML formaté au lieu des balises brutes dans les descriptions d'offres (dangerouslySetInnerHTML)
- [x] Remplacer le symbole $ par FCFA pour les montants de salaire (retiré DollarSign icon)


## Correction format requête tRPC upload
- [x] Corriger le format de requête dans storage.ts (erreur "expected object, received undefined")
- [x] Utiliser le bon format d'URL tRPC avec query params pour les mutations


## Correction erreur 414 Request-URI Too Large
- [x] L'URL avec query params est trop longue pour les fichiers base64
- [x] Changer pour utiliser le body JSON au lieu des query params
- [x] Utiliser le bon format batch tRPC dans le body (index "0" avec "json" wrapper)


## Création endpoint HTTP pour upload fichiers
- [x] tRPC batch format trop complexe pour l'upload de fichiers
- [x] Créer un endpoint HTTP Express classique /api/upload dans server/_core/index.ts
- [x] Modifier storage.ts pour utiliser ce nouvel endpoint (fetch simple)


## Correction cohérence données employeur
- [x] Analyser la logique de liaison user <-> employeur dans le code
- [x] Corriger le dashboard pour afficher les offres de l'employeur connecté (section récentes)
- [x] Nettoyer les doublons dans la table employeurs (8 entrées userId=1 réduites à 1)
- [x] Transférer les offres de l'employeur 120001 vers l'employeur 1 (Val G)
- [x] Corriger les vérifications profileType pour autoriser les admins
- [x] Renommer l'entreprise de Val G en 'Cameroon Travail'

## Page Profil Employeur
- [ ] Créer la page /employeur/profil avec formulaire complet (nom entreprise, secteur, taille, description, site web, téléphone, adresse)
- [ ] Ajouter l'upload du logo de l'entreprise
- [ ] Connecter la page au backend (lecture et mise à jour du profil)
- [ ] Corriger le lien "Mon Profil" dans la navbar pour rediriger vers /employeur/profil
- [ ] Afficher le logo de l'entreprise dans les offres d'emploi

## Notifications Email
- [ ] Envoyer un email à l'employeur lors d'une nouvelle candidature
- [ ] Envoyer un email au candidat lors d'un changement de statut de sa candidature
- [ ] Utiliser Resend pour l'envoi des emails
- [ ] Créer des templates HTML pour les emails

## Page Profil Employeur et Notifications Email
- [x] Créer la page /employeur/profil avec formulaire complet
- [x] Ajouter upload de logo d'entreprise (S3)
- [x] Ajouter informations générales (nom, secteur, taille, description)
- [x] Ajouter coordonnées (adresse, ville, région, téléphone, site web)
- [x] Ajouter contact RH (nom, prénom, poste, email, téléphone)
- [x] Ajouter le lien "Mon Profil" dans le menu déroulant de la navbar employeur
- [x] Ajouter endpoint uploadLogo dans le routeur employeur
- [x] Emails envoyés lors de nouvelles candidatures (déjà implémenté)
- [x] Emails envoyés lors de changements de statut (déjà implémenté)
- [x] Corriger la vérification profileType dans updateStatut pour les admins

## Corrections navigation et CRUD offres
- [ ] Corriger le lien "Mon Profil" dans la navbar principale (page d'accueil) pour rediriger vers /employeur/profil
- [ ] Ajouter la fonctionnalité de modification d'offres existantes
- [ ] Ajouter la fonctionnalité de suppression d'offres
- [ ] Ajouter les boutons Modifier/Supprimer dans la page "Mes offres"
- [ ] Créer le formulaire de modification d'offre (pré-rempli avec les données existantes)
- [ ] Ajouter les endpoints tRPC updateJob et deleteJob dans le routeur

## CRUD complet des offres employeur
- [x] Corriger le lien "Mon Profil" dans la navbar principale pour les employeurs/admins
- [x] Créer la page /employeur/offres/:id/modifier avec formulaire pré-rempli
- [x] Ajouter la route dans App.tsx
- [x] Connecter le bouton "Modifier" dans la page Offres.tsx (redirection vers la page de modification)
- [x] Corriger les vérifications profileType dans update/delete pour autoriser les admins

## Corrections page détail offre (vue employeur)
- [x] Corriger le bouton "Retour" pour rediriger vers "Mes offres" si l'utilisateur est l'auteur
- [x] Ajouter les boutons Modifier et Supprimer pour l'employeur auteur de l'offre (en haut + panneau latéral)
- [x] Masquer le bouton "Postuler" pour l'employeur auteur de l'offre
- [x] Afficher un panneau de gestion (Modifier, Supprimer, Voir candidatures) à la place du panneau "Postuler"
- [x] Ajouter la navbar EmployeurNav pour les employeurs/admins sur la page de détail

## Gestion avancée des offres (archivage + suppression sécurisée)
- [x] Corriger le pré-remplissage des éditeurs Quill.js dans ModifierOffre (données chargées après init)
- [x] Ajouter endpoint jobs.archive (statut pourvue) dans routers.ts
- [x] OffreDetail : dialog suppression renforcé avec avertissement perte des candidatures
- [x] OffreDetail : bouton "Poste pourvu" avec tooltip explicatif
- [x] OffreDetail : badge "Poste pourvu" visible sur l'offre archivée
- [x] Liste des offres employeur : afficher badge Poste pourvu sur les offres archivées

## Réactivation d'offres archivées
- [x] Backend : endpoint jobs.republier (statut pourvue → publiee)
- [x] OffreDetail : bouton Republier sur les offres pourvues avec dialog de confirmation
- [x] Offres.tsx : bouton Republier dans le menu déroulant des offres pourvues

## Corrections formulaire inscription et authentification
- [ ] Inscription candidat : rendre Prénom, Nom, Téléphone obligatoires avec validation et alertes
- [ ] Mot de passe oublié : implémenter l'envoi réel d'email via Resend
- [ ] Connexion : rediriger vers /mot-de-passe-oublie si le compte existe déjà (email déjà utilisé)

## Alertes emploi
- [ ] Table alertes_emploi dans le schéma Drizzle
- [ ] Endpoints tRPC : créer, lister, supprimer une alerte
- [ ] Bouton "Sauvegarder cette recherche" dans ToutesLesOffres
- [ ] Page /candidat/alertes pour gérer ses alertes
- [ ] Déclencheur email lors de la publication d'une offre

## Pagination et filtres
- [x] Pagination infinie sur ToutesLesOffres (remplacer limite 100)
- [x] Onglets Toutes/Actives/Pourvues/Expirées dans Mes offres employeur

## Tableau de bord administrateur
- [x] Endpoints tRPC admin.stats (statistiques globales : utilisateurs, offres, candidatures, alertes)
- [x] Endpoint admin.recentUsers (liste paginée des utilisateurs avec gestion des rôles)
- [x] Endpoint admin.recentOffres (liste paginée des offres avec actions)
- [x] Endpoint admin.setUserRole (promouvoir/rétrograder admin)
- [x] Endpoint admin.deleteOffre (suppression d'offre par l'admin)
- [x] Page /admin/dashboard avec 3 onglets : Vue d'ensemble, Utilisateurs, Offres
- [x] Cartes KPI : utilisateurs, candidats, employeurs, offres, candidatures, alertes
- [x] Tendances 7j et 30j pour chaque KPI
- [x] Graphique barres : répartition des offres par statut
- [x] Graphique camembert : emploi public vs privé
- [x] Graphique camembert : candidatures par statut
- [x] Graphique barres horizontal : top secteurs d'activité
- [x] Graphique barres : offres par région
- [x] Tableau utilisateurs avec pagination et gestion des rôles
- [x] Tableau offres avec pagination, visualisation et suppression
- [x] Protection d'accès : redirection si non admin

## Refonte page d'accueil
- [x] Bloc hero avec fond vert, titre centré et deux cartes Candidat/Employeur côte à côte
- [x] Carte Candidat : champ recherche, champ ville, bouton Rechercher, liens Créer compte / Déposer CV
- [x] Carte Employeur : liste avantages, boutons Créer compte recruteur / Découvrir espace pro
- [x] Statistiques (10 000+ offres, 2 500+ entreprises, 50 000+ candidats) sous le hero
- [x] Section "Dernières offres d'emploi" avec carrousel de cartes
- [x] Section "Conseils emploi" avec 2 cartes illustrées et bouton "Tous nos conseils"
- [x] Section CTA finale (Prêt à décrocher votre prochain emploi ?)

## Corrections page d'accueil (mars 2026)
- [x] Corriger le bug de recherche (résultats incorrects lors de la recherche depuis le hero)
- [x] Remplacer le fond vert du hero par la carte du Cameroun en image de fond

## Page Conseils Emploi et corrections cartes (mars 2026)
- [x] Filtrer les offres pourvues dans getLatest (page d'accueil)
- [x] Fixer les boutons "Voir les détails" et "Lire la suite" en bas des cartes (flex layout)
- [x] Générer des images africaines pour les articles de conseils
- [x] Créer la page /conseils avec articles, filtres par catégorie, article à la une, formulaire d'abonnement
- [x] Rediriger les clics sur les cartes conseils et le bouton "Tous nos conseils" vers /conseils

## Navbar, pied de page unifié, BDD articles et page détail (mars 2026)
- [x] Ajouter navbar (Accueil/Emplois/Conseils) sur la page d'accueil Home.tsx
- [x] Créer un composant Footer partagé et l'utiliser sur Home et Conseils
- [x] Dater tous les articles de conseils en 2026
- [x] Créer la table articles_conseils dans drizzle/schema.ts (id, titre, description, contenu, categorie, auteur, datePublication, tempsLecture, imageUrl, featured, slug)
- [x] Pousser la migration avec pnpm db:push
- [x] Créer les endpoints tRPC : getAll, getBySlug, getByCategorie, getSimilaires
- [x] Seeder les 6 articles avec contenu complet en base
- [x] Créer la page /conseils/:slug avec contenu complet, partage WhatsApp/Twitter/Facebook, articles similaires
- [x] Mettre à jour la page /conseils pour lire depuis la BDD et rediriger vers /conseils/:slug

## Navbar, admin articles, recherche conseils (mars 2026)
- [x] Corriger la navbar manquante sur la page d'accueil (liens Accueil/Emplois/Conseils)
- [x] Onglet "Articles" dans l'interface admin avec liste des articles
- [x] Formulaire de création/modification d'article dans l'admin (titre, description, contenu, catégorie, auteur, image, featured)
- [x] Endpoints tRPC admin : createArticle, updateArticle, deleteArticle, toggleFeatured, togglePublished
- [x] Afficher les derniers articles depuis la BDD sur la page d'accueil (section Conseils)
- [x] Recherche par mot-clé sur la page /conseils (filtrer par titre/description)

## Éditeur Markdown admin et refonte page Emplois (mars 2026)
- [x] Installer @uiw/react-md-editor pour l'éditeur Markdown enrichi
- [x] Intégrer l'éditeur Markdown dans le formulaire d'article admin (remplacer textarea)
- [x] Refondre la page /offres avec design liste en colonne (titre, entreprise, description, badges compétences)
- [x] Ajouter filtres latéraux (type de contrat, salaire, entreprise) sur la page Emplois
- [x] Ajouter pagination numérotée (Précédent / 1 2 3 / Suivant) sur la page Emplois
- [x] Ajouter badges "Recommandé" et type de contrat (CDI/CDD) sur les cartes offres
- [x] Page de détail d'une offre /offre/:id avec contenu complet (existante, mise à jour avec SiteHeader)
- [x] Ajouter le bouton "Postuler" sur la liste et la page de détail
- [x] Implémenter la candidature directe depuis la page de détail

## Popup candidature directe depuis la liste des offres (mars 2026)
- [x] Intégrer DialogCandidature dans ToutesLesOffres.tsx
- [x] Ouvrir la popup au clic sur "Postuler" sans rediriger vers la page de détail

## Module CV complet (mars 2026)
- [ ] Table `cv_documents` en BDD (id, userId, nom, type: upload/classique/moderne/creatif, fileUrl, fileKey, couleurColonne, langue, actif, createdAt)
- [ ] Table `cv_data` en BDD (id, cvId, prenom, nom, titre, email, telephone, adresse, site, photo, experiences JSON, formations JSON, competences JSON, langues JSON, certifications JSON, loisirs)
- [ ] Pousser la migration avec pnpm db:push
- [ ] Endpoints tRPC : uploadCV, listCV, setActif, deleteCV, getCVData, saveCVData, getCVtheque (admin/employeur)
- [ ] Page /deposer-cv : upload drag-and-drop, choix modèle (Classique/Moderne/Créatif), historique des CV, bouton profil public
- [ ] Redirection depuis le bouton "Déposer mon CV" de la page d'accueil vers /deposer-cv
- [ ] Builder CV Classique (/cv/classique) : formulaire complet, aperçu temps réel, sélecteur FR/EN, téléchargement PDF
- [ ] Builder CV Moderne (/cv/moderne) : formulaire complet, colonne gauche personnalisable (couleur), aperçu temps réel, téléchargement PDF
- [ ] Zone upload CV Créatif (/cv/creatif) : upload fichier PDF/image, prévisualisation, sauvegarde S3
- [ ] Page profil public candidat (/candidat/:id) : affichage CV actif + informations profil, visible par recruteurs
- [ ] CVthèque dans l'espace recruteur : liste des candidats avec CV actif, filtres par compétences/région

## Module CV Builder (accès libre)
- [x] Créer les tables cv_documents et cv_data dans le schéma Drizzle
- [x] Pousser la migration de base de données
- [x] Créer les endpoints tRPC: cv.list, cv.create, cv.saveData, cv.getData, cv.setActif, cv.delete, cv.getCVtheque, cv.getPublicProfile
- [x] Créer la route /api/upload-cv (multipart/form-data via busboy)
- [x] Créer la page /deposer-cv avec choix de modèle, upload CV créatif et historique
- [x] Créer le builder CV Classique (/cv/classique) avec formulaire complet et aperçu temps réel
- [x] Créer le builder CV Moderne (/cv/moderne) avec colonne personnalisable et aperçu temps réel
- [x] Ajouter la génération PDF via jsPDF + html2canvas dans les deux builders
- [x] Ajouter le support bilingue FR/EN dans le builder Classique
- [x] Créer la page profil public candidat (/profil-candidat/:id) visible par les recruteurs
- [x] Enregistrer les routes dans App.tsx

## Corrections navigation CV
- [x] Corriger le bouton "Déposer mon CV" sur la page d'accueil pour pointer vers /deposer-cv
- [x] Améliorer la page /candidat/cv avec bouton de suppression du CV et lien vers /deposer-cv

## Améliorations UI header et page deposer-cv
- [x] Aligner les boutons "Créer ce CV" en bas des cartes sur /deposer-cv
- [x] Centrer la navbar dans le header
- [x] Agrandir le logo Cameroon Travail et augmenter la hauteur du header (~100px)
- [x] Remplacer le header inline de Home.tsx par le composant SiteHeader (centralisation)
- [x] Agrandir le logo à 200px de hauteur dans SiteHeader.tsx

## Sidebar candidat + CVthèque recruteur
- [x] Ajouter lien "Déposer mon CV" dans la sidebar du dashboard candidat
- [x] Créer la page /cvtheque avec liste candidats, filtres compétence/ville, accès employeur

## Visibilité CVthèque
- [x] Ajouter procédure tRPC toggleVisibiliteCVtheque côté serveur
- [x] Ajouter interrupteur visibilité CVthèque sur /candidat/cv et /deposer-cv

## Corrections header
- [x] Corriger erreur bouton Déconnecter dans SiteHeader
- [x] Ajuster logo à 150px avec responsive (tablette 120px, mobile 100px)

## Nouvelles fonctionnalités (sprint 3)
- [x] Table messages en base de données + procédures tRPC envoi/réception
- [x] Bouton Contacter + dialog formulaire sur les cartes CVthèque
- [x] Table profile_views + enregistrement des vues de profil
- [x] Compteur de vues sur le dashboard candidat
- [x] Responsive pages /cv/classique et /cv/moderne sur mobile

## Corrections critiques - Authentification CV builder et CVthèque
- [x] Bloquer l'accès au builder CV (Classique/Moderne/Créatif) si non connecté → redirection connexion/inscription (déjà implémenté)
- [x] Inclure les CV uploadés (non-builder, cv_documents avec fichier S3) dans la CVthèque recruteur

## Corrections CVthèque + Interface Admin
- [ ] Corriger la CVthèque pour afficher tous les candidats avec CV visible (pas seulement 1)
- [ ] Créer l'interface admin /admin pour valerygarrec@gmail.com (articles, formules, utilisateurs)

## Onglet Formules Tarifaires - Interface Admin
- [x] Créer la table `formules_tarifaires` dans le schéma Drizzle
- [x] Créer la table en base de données via SQL direct (TiDB)
- [x] Insérer 6 formules tarifaires par défaut (3 candidat, 3 employeur)
- [x] Ajouter les procédures tRPC admin : getFormules, createFormule, updateFormule, deleteFormule, toggleFormuleActif
- [x] Créer le composant AdminFormules.tsx avec CRUD complet
- [x] Intégrer l'onglet "Formules tarifaires" dans AdminDashboard avec icône CreditCard
- [x] Écrire les tests unitaires pour la logique de parsing et formatage des formules

## Page Publique Espace Recruteur (/espace-recruteur)
- [x] Générer 4 images africaines professionnelles pour la page (hero, handshake, team, interview)
- [x] Ajouter la procédure tRPC publique `formules.getActives` avec filtre par cible
- [x] Créer la page EspaceRecruteur.tsx avec navigation fixe
- [x] Section Hero avec image de fond africaine, titre, CTA et formulaire d'inscription rapide
- [x] Section statistiques avec compteurs animés (2500+ entreprises, 95% satisfaction, 15j recrutement, 24h support)
- [x] Section "Pourquoi nous choisir" avec 6 fonctionnalités (CVthèque, Ciblage, Analytics, Support, Publication, Profils vérifiés)
- [x] Section "Comment ça marche" en 3 étapes avec images africaines
- [x] Section Articles Conseils dynamique (3 derniers articles depuis la BDD)
- [x] Section Tarifs dynamique depuis la BDD (formules actives employeur avec badge Populaire)
- [x] Section Témoignages avec 3 profils camerounais
- [x] Section CTA final avec image de fond africaine
- [x] Footer complet avec liens rapides, support et contact
- [x] Connecter le bouton "Découvrir l'espace pro" de la page d'accueil vers /espace-recruteur
- [x] Ajouter les routes /espace-recruteur et /tarifs dans App.tsx
- [x] Écrire 18 tests unitaires pour les helpers et la logique de la page (67 tests passants au total)
