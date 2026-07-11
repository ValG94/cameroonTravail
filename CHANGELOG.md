# Changelog

Toutes les évolutions notables du projet Cameroon Travail sont documentées ici.
Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) — versions
séparées par date.

---

## [Non publié] — Backlog

- **Spotlights côté recruteur** : décider si on affiche la grille tarifaire
  (25 000 / 50 000 / 100 000 XAF) sur la page publique ou si on garde les
  tarifs en négociation directe.
- **Lot 2 Pack Visibilité Recruteur** :
  - Section "Entreprises qui recrutent" sur la home (badge Partenaire).
  - Card sponsorisée sur la page `/offres`.
  - Badge "Entreprise partenaire" sur profil recruteur + fiche offre.
  - Page recruteur `/employeur/visibilite` avec les 3 tiers + CTA "Souscrire"
    (flow manuel V1 : demande → validation admin).
- **Page profil entreprise publique** (`/entreprise/:id`) pour pointer le CTA
  secondaire des spotlights vers une fiche interne au lieu d'un site externe.

---

## [2026-07-11]

### Ajouté

#### 🛠 Back-office admin
- **Shell admin AdminLayout étendu** : nouvelle entrée sidebar « Spotlights »
  (icône or Sparkles) + logo cliquable renvoyant à la home publique + bouton
  « Retour au site ». La navigation entre modules admin (Dashboard,
  Souscriptions, Spotlights, Articles) devient possible depuis n'importe où.
- **Migration `Spotlights.tsx` et `Souscriptions.tsx`** vers `AdminLayout`
  (fin du wrapper `SiteHeader` sur ces pages).

#### 🎯 Spotlights (encart annonceur premium homepage)
- **Table `sponsored_spotlights`** (migration `0018`) : employeur, pack
  (pme/grande/continu), baseline FR/EN, CTA FR/EN, dates, actif. Enum
  `packSpotlight`, index composite, RLS.
- **Router tRPC `spotlights.*`** : `getActive` public (renvoie le spotlight
  courant à afficher + `publishedJobsCount`), `list/create/update/toggle/remove`
  admin, `searchEmployeurs` pour l'autocomplete du BO.
- **Composant `SpotlightSection` sur la home** placé juste avant la section
  « Deux parcours, une plateforme » :
  - Bannière pleine largeur avec image de background dédiée
    (`/images/recruteur/background-encarsPublicitaire.png`) intégrant le
    dégradé vert profond et un halo doré ambiant.
  - Logo entreprise dans un contenant blanc entouré d'un **halo doré animé**
    (conic-gradient 5s, cohérent avec les cards partenaires).
  - Eyebrow doré « Entreprise à la une » + titre blanc + baseline.
  - CTA primaire or (« Voir les offres de X »), **masqué si le recruteur
    n'a aucune offre publiée** (évite d'envoyer sur une page vide).
  - CTA secondaire outline optionnel (« Découvrir l'entreprise »),
    devient primaire doré si c'est le seul CTA visible.
  - Href intelligent : `http(s)://` → nouvel onglet, `/xxx` → wouter interne.
    Permet de basculer d'un site externe à une future fiche interne sans
    changer de code.
  - Fallback « Devenir partenaire » (auto-marketing) si aucun spotlight actif.
- **Migration `0019`** : colonnes `ctaSecondaryLabel/En` + `ctaSecondaryHref`.
- **BO admin `/admin/spotlights`** : liste + statuts (Live/Programmé/En pause)
  + dialog create/edit avec autocomplete recruteur, pack (auto-ajuste les
  dates selon la durée du pack), baseline FR/EN, CTA primaire, bloc CTA
  secondaire optionnel, toggle actif/pause + suppression.
- **Seed Nomadéo** (`0018_seed_nomadeo_spotlight.sql`) : compte démo +
  spotlight actif 30 jours (pack continu) avec CTA secondaire vers
  https://nomadeo.africa/.

#### 👤 Espace recruteur (EmployeurLayout)
- **Logo sidebar cliquable → home** (focus visible clavier, ferme le drawer
  mobile).
- **Bouton « Retour accueil »** dans le topbar (icône + label, dégradé
  responsive : label masqué en `lg-`, icône seule dès `sm`).
- **Refonte premium des 5 pages restantes** dans le shell `EmployeurLayout` :
  Candidatures, MesSouscriptions, Offres, Paramètres, Publier une offre.
- **Suppression du bouton doublon « Publier une offre »** en topbar Dashboard.

#### 🏠 Homepage
- **Section « Fiers de travailler avec les meilleurs au Cameroun » refaite** :
  - Remplacement des 8 logos texte simulés par **12 vraies cards image**
    partenaires (fichiers renommés en kebab-case, formats mixtes PNG/JPEG).
  - Ordre priorisé : Fotchine International en tête.
  - Cards carrées (`aspect-ratio: 1`) avec halo doré animé
    (conic-gradient 5s, désynchronisé via `--halo-delay`).
  - Grille responsive **3 / 4 / 6 colonnes** → 12 partenaires en 2 lignes
    propres desktop.
  - Respecte `prefers-reduced-motion`.
- **Copy hero i18n** : « bons talents » → « meilleurs talents » (FR + EN).

### Modifié

- `client/public/images/partners/*` : 12 fichiers renommés en kebab-case
  (fini les espaces et doubles extensions `.jpg.jpeg`).
- `bo.adminLayout.nav.spotlights` (FR + EN) ajouté.
- `landing.spotlight.*` (FR + EN) créés.
- `bo.employerLayout.topBar.backHome` (FR + EN) créés.
- `bo.employerPostJob.*` étendu (17 clés sidebar hero/récap/astuces).

### Notes de déploiement

⚠️ **Migrations Supabase à appliquer** (dans cet ordre) :
1. `drizzle/0018_sponsored_spotlights.sql` — table + enum + index + RLS.
2. `drizzle/0019_spotlight_secondary_cta.sql` — colonnes CTA secondaire.
3. *(optionnel)* `drizzle/0018_seed_nomadeo_spotlight.sql` — spotlight démo.
