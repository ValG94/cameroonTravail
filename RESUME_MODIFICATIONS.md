# Résumé des modifications - Authentification dynamique et Page de profil

## 🎯 Objectif
Rendre l'authentification complètement dynamique et connectée au backend, en supprimant le `mockUser` et en permettant l'inscription, la connexion et la gestion des utilisateurs via la base de données MySQL.

---

## ✅ Modifications effectuées

### **1. Frontend - AuthContext.tsx**
**Fichier** : `/frontend/src/contexts/AuthContext.tsx`

**Changements** :
- ✅ Suppression du `mockUser` en dur
- ✅ Connexion au backend via axios pour :
  - `register()` - Inscription d'un nouvel utilisateur
  - `login()` - Connexion avec email/mot de passe
  - `logout()` - Déconnexion
  - `getCurrentUser()` - Récupération de l'utilisateur connecté via le token JWT
- ✅ Gestion du token JWT dans le localStorage
- ✅ Gestion des erreurs et des états de chargement
- ✅ Vérification automatique de l'utilisateur au chargement de l'application

**Endpoints utilisés** :
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Récupération de l'utilisateur connecté

---

### **2. Frontend - Register.tsx**
**Fichier** : `/frontend/src/pages/Register.tsx`

**Changements** :
- ✅ Modification du formulaire pour utiliser `fullName` au lieu de `firstName` + `lastName`
- ✅ Modification du champ `phone` en `phoneNumber`
- ✅ Appel au vrai backend via `register()` du contexte
- ✅ Gestion des erreurs de validation
- ✅ Redirection automatique vers la page d'accueil après inscription réussie

---

### **3. Frontend - Header.tsx**
**Fichier** : `/frontend/src/components/Header.tsx`

**Changements** :
- ✅ Affichage de `user.full_name` au lieu de `user.firstName`
- ✅ Adaptation aux nouvelles données utilisateur du backend

---

### **4. Backend - config.js**
**Fichier** : `/backend/config/config.js`

**Changements** :
- ✅ Correction du dialecte de base de données : **PostgreSQL → MySQL**
- ✅ Correction du port : **5432 → 3306**
- ✅ Correction du nom d'utilisateur : **postgres → root**
- ✅ Utilisation des variables d'environnement du `.env`

**Avant** :
```javascript
dialect: 'postgres',
port: 5432,
username: process.env.DB_USERNAME || 'postgres',
```

**Après** :
```javascript
dialect: 'mysql',
port: 3306,
username: process.env.DB_USER || 'root',
```

---

### **5. Backend - .env**
**Fichier** : `/backend/.env`

**Création du fichier** avec les variables d'environnement :
```env
# Configuration du serveur
NODE_ENV=development
PORT=3001

# Configuration de la base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cameroon_travail
DB_USER=root
DB_PASSWORD=

# Configuration JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Configuration OpenAI (pour l'extraction de CV)
OPENAI_API_KEY=${OPENAI_API_KEY}

# Configuration CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 📊 Structure de la base de données

### **Table `users`**
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  role ENUM('candidate', 'recruiter', 'admin') DEFAULT 'candidate',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  profile_picture VARCHAR(500),
  bio TEXT,
  location VARCHAR(255),
  cv_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);
```

### **Tables associées** (déjà créées)
- `experiences` - Expériences professionnelles
- `educations` - Formations
- `skills` - Compétences (avec niveau 1-5)
- `languages` - Langues (avec niveau de maîtrise)

---

## 🚀 Instructions de test en local

### **Prérequis**
1. MySQL installé et démarré
2. Node.js v22+ installé
3. Git installé

### **Étape 1 : Cloner le projet**
```bash
git clone https://github.com/ValG94/cameroonTravail.git
cd cameroonTravail
git checkout frontend
```

### **Étape 2 : Créer la base de données**
```bash
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE cameroon_travail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Exécuter les scripts SQL
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### **Étape 3 : Configurer le backend**
```bash
cd backend

# Installer les dépendances
npm install

# Créer le fichier .env (déjà créé, vérifier les valeurs)
# Modifier DB_PASSWORD si nécessaire

# Démarrer le serveur
npm start
```

Le backend devrait démarrer sur `http://localhost:3001`

### **Étape 4 : Configurer le frontend**
```bash
cd ../frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend devrait démarrer sur `http://localhost:5173`

### **Étape 5 : Tester l'inscription**
1. Ouvrir `http://localhost:5173/inscription`
2. Remplir le formulaire :
   - **Nom complet** : Marie KOUASSI
   - **Email** : marie.kouassi@test.cm
   - **Téléphone** : +237677889900 (sans espaces !)
   - **Mot de passe** : Test123456!
   - **Confirmer le mot de passe** : Test123456!
   - ✅ Cocher "J'accepte les conditions"
3. Cliquer sur "S'inscrire"
4. Vous devriez être redirigé vers la page d'accueil et voir votre nom dans le header

### **Étape 6 : Tester la connexion**
1. Ouvrir `http://localhost:5173/connexion`
2. Se connecter avec :
   - **Email** : test@cameroontravail.cm
   - **Mot de passe** : Password123!
3. Vous devriez être redirigé vers la page d'accueil et voir "Test User" dans le header

### **Étape 7 : Tester la page de profil**
1. Une fois connecté, cliquer sur votre nom dans le header
2. Cliquer sur "Profil"
3. Vous devriez voir la page de profil avec les 5 onglets :
   - Informations personnelles
   - Expérience professionnelle
   - Formation
   - Compétences
   - Langues

---

## 🐛 Problèmes connus

### **1. Format du numéro de téléphone**
Le backend valide strictement le format du numéro de téléphone camerounais :
- ✅ Format accepté : `+237677889900`
- ❌ Format refusé : `+237 677 88 99 00` (avec espaces)

**Solution** : Entrer le numéro sans espaces

### **2. Base de données non démarrée**
Si vous voyez l'erreur `ECONNREFUSED`, cela signifie que MySQL n'est pas démarré.

**Solution** :
```bash
# Sur macOS
brew services start mysql

# Sur Linux
sudo systemctl start mysql

# Sur Windows
# Démarrer MySQL via les Services Windows
```

### **3. Mot de passe MySQL**
Si votre utilisateur `root` MySQL a un mot de passe, modifiez le fichier `/backend/.env` :
```env
DB_PASSWORD=votre_mot_de_passe
```

---

## 📦 Packages installés

### **Backend**
- `multer` - Upload de fichiers
- `pdf-parse` - Extraction de texte PDF
- `openai` - API OpenAI pour l'IA
- `mysql2` - Driver MySQL pour Sequelize
- `bcrypt` - Hachage des mots de passe
- `jsonwebtoken` - Gestion des tokens JWT

### **Frontend**
- `axios` - Requêtes HTTP
- `react-router-dom` - Routing
- `tailwindcss` - Styling

---

## 🎉 Fonctionnalités implémentées

### **Authentification**
- ✅ Inscription d'un nouvel utilisateur
- ✅ Connexion avec email/mot de passe
- ✅ Déconnexion
- ✅ Récupération de l'utilisateur connecté via JWT
- ✅ Persistance de la session (localStorage)
- ✅ Protection des routes (redirection si non connecté)

### **Page de profil**
- ✅ 5 onglets fonctionnels
- ✅ Formulaires CRUD pour toutes les sections
- ✅ Barre de progression du profil
- ✅ Photo de profil avec initiales
- ✅ Upload de photo de profil
- ✅ Upload de CV avec extraction IA

### **Backend**
- ✅ Endpoints d'authentification
- ✅ Endpoints de profil
- ✅ Endpoints d'upload de fichiers
- ✅ Service d'extraction de CV avec IA
- ✅ Validation des données
- ✅ Gestion des erreurs

---

## 📝 Notes importantes

1. **Sécurité** : Le `JWT_SECRET` dans le `.env` doit être changé en production
2. **OpenAI** : Pour l'extraction de CV, une clé API OpenAI est requise
3. **CORS** : Le backend accepte uniquement les requêtes depuis `http://localhost:5173`
4. **Base de données** : Les scripts SQL créent automatiquement toutes les tables nécessaires

---

## 🔗 Liens utiles

- **Repository GitHub** : https://github.com/ValG94/cameroonTravail
- **Branche** : `frontend`
- **Guide d'installation** : `/GUIDE_INSTALLATION.md`
- **Scripts SQL** : `/database/schema.sql` et `/database/seed.sql`

---

## ✨ Prochaines étapes

1. Tester l'inscription et la connexion en local
2. Tester la page de profil avec toutes les sections
3. Tester l'upload de photo de profil
4. Tester l'upload de CV avec extraction IA
5. Valider que toutes les données sont bien sauvegardées dans la base de données

---

**Bon test ! 🚀**
