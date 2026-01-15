# 🚀 Déploiement CameroonTravail sur Manus

**Date** : 13 janvier 2026  
**Statut** : ✅ Frontend et Backend déployés

---

## 📊 URLs d'accès

### Frontend (Interface utilisateur)
🌐 **URL publique** : https://5173-i5v5sx1aqh9ot2hrvwuuj-b14e31cf.us2.manus.computer

### Backend (API)
🔌 **URL publique** : https://3001-i5v5sx1aqh9ot2hrvwuuj-b14e31cf.us2.manus.computer

### Endpoints API disponibles
- **Health check** : `GET /health`
- **Inscription** : `POST /api/auth/register`
- **Connexion** : `POST /api/auth/login`
- **Informations utilisateur** : `GET /api/auth/me`

---

## ✅ Ce qui a été déployé

### Backend
- ✅ Serveur Node.js + Express sur le port 3001
- ✅ Base de données SQLite locale (database.sqlite)
- ✅ Module d'authentification complet
- ✅ Modèle User avec tous les champs nécessaires
- ⚠️ Modèles CvProfile et JobOffer désactivés temporairement (incompatibles avec SQLite)

### Frontend
- ✅ Application React + Vite sur le port 5173
- ✅ Proxy configuré vers le backend (/api → http://localhost:3001)
- ✅ Interface utilisateur complète

### Base de données
- ✅ SQLite (database.sqlite)
- ✅ Table `users` créée et fonctionnelle
- ✅ Support de l'authentification

---

## 🔧 Configuration appliquée

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
JWT_SECRET=manus_cameroon_travail_jwt_secret_key_2025_very_long_and_secure_string_min_32_chars
JWT_REFRESH_SECRET=manus_cameroon_travail_refresh_secret_key_2025_very_long_and_secure_string_min_32_chars
CORS_ORIGIN=*
```

### Modifications apportées
1. **config/db.js** - Support de SQLite ajouté
2. **config/config.js** - Configuration SQLite ajoutée
3. **models/user.js** - Associations désactivées temporairement
4. **models/cvprofile.js** - Désactivé (.disabled)
5. **models/jobOffer.js** - Désactivé (.disabled)
6. **frontend/vite.config.ts** - Proxy API configuré

---

## 🧪 Tests

### Test du backend

```bash
# Health check
curl https://3001-i5v5sx1aqh9ot2hrvwuuj-b14e31cf.us2.manus.computer/health

# Inscription d'un utilisateur
curl -X POST https://3001-i5v5sx1aqh9ot2hrvwuuj-b14e31cf.us2.manus.computer/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@cameroon-travail.cm",
    "password": "TestPassword123!",
    "confirmPassword": "TestPassword123!",
    "fullName": "Jean Baptiste Kamga",
    "phoneNumber": "+237612345678",
    "role": "candidate",
    "location": "Douala",
    "preferredLanguage": "fr"
  }'
```

### Test du frontend

Ouvrez simplement l'URL dans votre navigateur :
https://5173-i5v5sx1aqh9ot2hrvwuuj-b14e31cf.us2.manus.computer

---

## 🐛 Problèmes connus et solutions

### 1. Erreur "phoneNumber" vs "phone_number"
**Problème** : Incohérence entre camelCase et snake_case  
**Solution** : Correction en cours dans authService.js

### 2. Modèles CvProfile et JobOffer désactivés
**Problème** : Types ARRAY non supportés par SQLite  
**Solution temporaire** : Modèles désactivés (.disabled)  
**Solution future** : Convertir les ARRAY en TEXT avec JSON

### 3. Base de données SQLite vs PostgreSQL
**Problème** : SQLite pour le développement, PostgreSQL pour la production  
**Solution** : Configuration adaptative dans config/db.js et config/config.js

---

## 📁 Structure du projet

```
/home/ubuntu/cameroon-travail-app/
├── backend/
│   ├── config/
│   │   ├── config.js (✅ Support SQLite ajouté)
│   │   └── db.js (✅ Support SQLite ajouté)
│   ├── models/
│   │   ├── user.js (✅ Actif)
│   │   ├── cvprofile.js.disabled (⚠️ Désactivé)
│   │   └── jobOffer.js.disabled (⚠️ Désactivé)
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── database.sqlite (✅ Base de données)
│   ├── .env (✅ Configuration)
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── pages/
    │   └── main.tsx
    ├── vite.config.ts (✅ Proxy configuré)
    └── package.json
```

---

## 🔄 Processus de démarrage

### Backend
```bash
cd /home/ubuntu/cameroon-travail-app/backend
npm run dev
```

### Frontend
```bash
cd /home/ubuntu/cameroon-travail-app/frontend
npm run dev
```

---

## 🎯 Prochaines étapes

### Court terme
- [ ] Corriger l'erreur phoneNumber/phone_number
- [ ] Tester complètement l'inscription
- [ ] Tester la connexion
- [ ] Vérifier le frontend

### Moyen terme
- [ ] Réactiver les modèles CvProfile et JobOffer avec support SQLite
- [ ] Convertir les champs ARRAY en TEXT/JSON
- [ ] Ajouter plus de tests

### Long terme
- [ ] Migrer vers PostgreSQL pour la production
- [ ] Déployer sur un serveur permanent
- [ ] Configurer un nom de domaine personnalisé

---

## 📞 Informations techniques

### Ports utilisés
- **Frontend** : 5173
- **Backend** : 3001

### Base de données
- **Type** : SQLite
- **Fichier** : /home/ubuntu/cameroon-travail-app/backend/database.sqlite
- **Taille** : ~16 KB

### Technologies
- **Backend** : Node.js 22.13.0, Express 5.1.0, Sequelize 6.37.7
- **Frontend** : React 18.3.1, Vite 5.4.21, TypeScript 5.5.3
- **Base de données** : SQLite 3

---

## ✅ Checklist de déploiement

- [x] Cloner le repository GitHub
- [x] Installer les dépendances backend
- [x] Installer les dépendances frontend
- [x] Configurer SQLite pour le backend
- [x] Créer le fichier .env
- [x] Initialiser la base de données
- [x] Désactiver les modèles incompatibles
- [x] Configurer le proxy frontend
- [x] Démarrer le backend
- [x] Démarrer le frontend
- [x] Exposer les ports publics
- [ ] Tester l'inscription (en cours de correction)
- [ ] Tester la connexion
- [ ] Tester le frontend

---

**Note** : Ce déploiement est temporaire et destiné au développement. Pour la production, il faudra migrer vers PostgreSQL et configurer un hébergement permanent.
