# Guide d'Installation et de Configuration - CameroonTravail

Ce guide vous permettra d'installer et de configurer l'application CameroonTravail en local pour tester toutes les fonctionnalités, notamment la page de profil avec upload de photo et extraction IA du CV.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine :

- **Node.js** version 18 ou supérieure
- **npm** ou **pnpm** (gestionnaire de paquets)
- **MySQL** version 8.0 ou supérieure (ou MariaDB)
- **Git**
- Un éditeur de code (VS Code recommandé)

---

## 🚀 Étape 1 : Cloner le projet

Ouvrez un terminal et exécutez les commandes suivantes :

```bash
# Cloner le dépôt
git clone https://github.com/ValG94/cameroonTravail.git

# Aller dans le dossier du projet
cd cameroonTravail

# Se placer sur la branche frontend (qui contient toutes les dernières modifications)
git checkout frontend
```

---

## 🗄️ Étape 2 : Configurer la base de données MySQL

### 2.1 Créer la base de données

Connectez-vous à MySQL et créez la base de données :

```bash
mysql -u root -p
```

Puis exécutez les commandes SQL suivantes :

```sql
-- Créer la base de données
CREATE DATABASE cameroon_travail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Créer un utilisateur dédié (optionnel mais recommandé)
CREATE USER 'cameroon_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';

-- Donner tous les droits sur la base de données
GRANT ALL PRIVILEGES ON cameroon_travail.* TO 'cameroon_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;

-- Quitter MySQL
EXIT;
```

### 2.2 Créer les tables

Les tables seront créées automatiquement par Sequelize au premier démarrage du backend grâce aux modèles définis. Vous pouvez aussi exécuter les migrations manuellement (voir section suivante).

---

## ⚙️ Étape 3 : Configurer le Backend

### 3.1 Installer les dépendances

```bash
cd backend
npm install
```

### 3.2 Configurer les variables d'environnement

Créez un fichier `.env` à la racine du dossier `backend` :

```bash
# Copier le fichier d'exemple (s'il existe)
cp .env.example .env

# Ou créer un nouveau fichier
touch .env
```

Ajoutez les variables suivantes dans le fichier `.env` :

```env
# Configuration du serveur
NODE_ENV=development
PORT=3001

# Configuration de la base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cameroon_travail
DB_USER=cameroon_user
DB_PASSWORD=votre_mot_de_passe_securise

# Configuration JWT
JWT_SECRET=votre_secret_jwt_tres_securise_minimum_32_caracteres
JWT_REFRESH_SECRET=votre_refresh_secret_jwt_tres_securise_minimum_32_caracteres
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
JWT_ISSUER=cameroon-travail
JWT_AUDIENCE=cameroon-travail-users

# Configuration CORS
CORS_ORIGIN=http://localhost:5173

# Configuration OpenAI (pour l'extraction de CV)
OPENAI_API_KEY=votre_cle_api_openai
```

**⚠️ Important :** 
- Remplacez `votre_mot_de_passe_securise` par le mot de passe MySQL que vous avez défini
- Remplacez `votre_cle_api_openai` par votre clé API OpenAI (nécessaire pour l'extraction de CV)
- Générez des secrets JWT sécurisés (vous pouvez utiliser `openssl rand -base64 32`)

### 3.3 Créer les tables avec Sequelize

Exécutez les migrations pour créer les tables :

```bash
# Si vous avez des migrations définies
npx sequelize-cli db:migrate

# Sinon, les tables seront créées automatiquement au démarrage
```

### 3.4 Démarrer le backend

```bash
npm start
```

Le backend devrait démarrer sur `http://localhost:3001`. Vous devriez voir le message :

```
🚀 Serveur lancé sur http://localhost:3001
```

---

## 🎨 Étape 4 : Configurer le Frontend

Ouvrez un **nouveau terminal** (laissez le backend tourner) :

### 4.1 Installer les dépendances

```bash
cd frontend
npm install
# ou si vous utilisez pnpm
pnpm install
```

### 4.2 Configurer les variables d'environnement (optionnel)

Si nécessaire, créez un fichier `.env` dans le dossier `frontend` :

```env
VITE_API_URL=http://localhost:3001
```

### 4.3 Démarrer le frontend

```bash
npm run dev
# ou avec pnpm
pnpm dev
```

Le frontend devrait démarrer sur `http://localhost:5173`. Vous devriez voir le message :

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## 👤 Étape 5 : Créer un utilisateur de test

### Option A : Via l'interface d'inscription

1. Ouvrez votre navigateur sur `http://localhost:5173/inscription`
2. Remplissez le formulaire d'inscription
3. Cliquez sur "S'inscrire"

### Option B : Via un script SQL direct

Connectez-vous à MySQL et exécutez :

```sql
USE cameroon_travail;

-- Créer un utilisateur de test (mot de passe: Password123!)
INSERT INTO users (
  firstName, lastName, fullName, email, password, 
  role, status, emailVerified, createdAt, updatedAt
) VALUES (
  'Test', 'User', 'Test User', 'test@cameroontravail.cm',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvqqVu',
  'candidate', 'active', 1, NOW(), NOW()
);
```

**Identifiants de test :**
- Email : `test@cameroontravail.cm`
- Mot de passe : `Password123!`

---

## 🧪 Étape 6 : Tester l'application

### 6.1 Se connecter

1. Allez sur `http://localhost:5173/connexion`
2. Connectez-vous avec les identifiants de test
3. Vous devriez être redirigé vers la page d'accueil

### 6.2 Accéder à la page de profil

1. Cliquez sur votre nom en haut à droite (ou allez directement sur `http://localhost:5173/profile`)
2. Vous devriez voir la page de profil avec :
   - Votre photo de profil (initiales)
   - La barre de progression du profil (0% au début)
   - Le bouton "Importer mon CV (PDF)"
   - Les 5 onglets : Informations personnelles, Expérience, Formation, Compétences, Langues

### 6.3 Tester l'upload de photo de profil

1. Cliquez sur le bouton caméra en bas à droite de votre photo de profil
2. Sélectionnez une image (JPEG, PNG ou WEBP, max 5MB)
3. La photo devrait s'uploader et s'afficher immédiatement

### 6.4 Tester l'upload et l'extraction de CV

1. Préparez un CV au format PDF
2. Cliquez sur le bouton "Importer mon CV (PDF)"
3. Sélectionnez votre CV
4. Confirmez l'upload
5. L'IA va analyser votre CV (cela peut prendre 10-30 secondes)
6. Votre profil sera automatiquement rempli avec les données extraites :
   - Informations personnelles (nom, email, téléphone, localisation, bio)
   - Expériences professionnelles
   - Formations
   - Compétences (avec niveau de 1 à 5)
   - Langues (avec niveau de maîtrise)
7. La barre de progression devrait augmenter automatiquement

### 6.5 Tester les onglets

Parcourez chaque onglet pour vérifier que toutes les données ont été correctement extraites et affichées :

- **Informations personnelles** : Modifier et enregistrer vos informations
- **Expérience** : Ajouter, modifier ou supprimer des expériences
- **Formation** : Ajouter, modifier ou supprimer des formations
- **Compétences** : Ajouter, modifier ou supprimer des compétences (avec notation sur 5)
- **Langues** : Ajouter, modifier ou supprimer des langues

---

## 🐛 Dépannage

### Le backend ne démarre pas

**Erreur : "Cannot find module"**
- Vérifiez que vous avez bien exécuté `npm install` dans le dossier backend

**Erreur : "Access denied for user"**
- Vérifiez vos identifiants MySQL dans le fichier `.env`
- Assurez-vous que l'utilisateur MySQL a les droits nécessaires

**Erreur : "Port 3001 already in use"**
- Un autre processus utilise déjà le port 3001
- Changez le port dans le fichier `.env` ou arrêtez l'autre processus

### Le frontend ne démarre pas

**Erreur : "Cannot find module"**
- Vérifiez que vous avez bien exécuté `npm install` dans le dossier frontend

**Erreur : "Network error" lors de l'appel API**
- Vérifiez que le backend est bien démarré sur `http://localhost:3001`
- Vérifiez la configuration CORS dans le backend

### L'upload de CV ne fonctionne pas

**Erreur : "Impossible d'analyser le CV avec l'IA"**
- Vérifiez que votre clé API OpenAI est correcte dans le fichier `.env`
- Vérifiez que vous avez des crédits disponibles sur votre compte OpenAI
- Vérifiez que le CV est bien au format PDF et lisible

**Erreur : "Le CV semble vide ou illisible"**
- Le PDF est peut-être protégé ou contient uniquement des images
- Essayez avec un autre CV au format texte

### Les images uploadées ne s'affichent pas

- Vérifiez que le dossier `backend/uploads/photos` existe
- Vérifiez que le backend sert bien les fichiers statiques (route `/uploads`)
- Vérifiez les permissions du dossier uploads

---

## 📦 Structure du projet

```
cameroonTravail/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── multer.js          # Configuration upload de fichiers
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── profileController.js  # Contrôleur de profil
│   │   ├── services/
│   │   │   ├── profileService.js     # Service de profil
│   │   │   └── cvExtractionService.js # Service d'extraction de CV
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── profile.js            # Routes de profil
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── app.js
│   │   └── server.js
│   ├── models/
│   │   ├── user.js
│   │   ├── experience.js
│   │   ├── education.js
│   │   ├── skill.js
│   │   └── language.js
│   ├── uploads/
│   │   ├── photos/    # Photos de profil
│   │   └── cvs/       # CVs uploadés
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   └── Icons.tsx         # Icônes SVG personnalisées
    │   ├── pages/
    │   │   ├── Home.tsx
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   └── Profile.tsx       # Page de profil complète
    │   ├── contexts/
    │   │   ├── AuthContext.tsx
    │   │   └── LanguageContext.tsx
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── .env
```

---

## 🎯 Fonctionnalités implémentées

### Backend

✅ Modèles de base de données (User, Experience, Education, Skill, Language)  
✅ Service ProfileService avec toutes les opérations CRUD  
✅ Contrôleur ProfileController avec tous les endpoints  
✅ Configuration multer pour l'upload de fichiers  
✅ Service d'extraction de CV avec IA (OpenAI)  
✅ Endpoints d'upload de photo de profil et de CV  
✅ Calcul automatique du pourcentage de complétion du profil  

### Frontend

✅ Page Profile.tsx complète avec 5 onglets fonctionnels  
✅ Composants d'upload de photo et CV avec validation  
✅ Icônes SVG personnalisées  
✅ Design moderne avec Tailwind CSS  
✅ Barre de progression du profil  
✅ Formulaires CRUD pour toutes les sections  

---

## 📞 Support

Si vous rencontrez des problèmes lors de l'installation ou de la configuration, n'hésitez pas à demander de l'aide !

---

**Bon test ! 🚀**
