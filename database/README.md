# Scripts SQL - CameroonTravail

Ce dossier contient les scripts SQL pour initialiser la base de données de l'application CameroonTravail.

## 📁 Fichiers disponibles

### `schema.sql`
Script de création de toutes les tables de la base de données. Ce script :
- Crée la base de données `cameroon_travail` si elle n'existe pas
- Crée les tables suivantes :
  - **users** : Utilisateurs (candidats, recruteurs, admins)
  - **experiences** : Expériences professionnelles
  - **educations** : Formations et diplômes
  - **skills** : Compétences avec niveau (1-5)
  - **languages** : Langues parlées avec niveau de maîtrise

### `seed.sql`
Script d'insertion de données de test. Ce script :
- Crée un utilisateur de test complet
- Insère des expériences professionnelles
- Insère des formations
- Insère des compétences
- Insère des langues

**Identifiants de test :**
- Email : `test@cameroontravail.cm`
- Mot de passe : `Password123!`

## 🚀 Utilisation

### Option 1 : Exécution via ligne de commande

```bash
# 1. Créer les tables
mysql -u root -p < schema.sql

# 2. Insérer les données de test
mysql -u root -p < seed.sql
```

### Option 2 : Exécution via MySQL Workbench

1. Ouvrez MySQL Workbench
2. Connectez-vous à votre serveur MySQL
3. Ouvrez le fichier `schema.sql`
4. Cliquez sur l'icône éclair (⚡) pour exécuter le script
5. Ouvrez le fichier `seed.sql`
6. Cliquez sur l'icône éclair (⚡) pour exécuter le script

### Option 3 : Exécution via client MySQL

```bash
# Se connecter à MySQL
mysql -u root -p

# Exécuter les scripts
source /chemin/vers/schema.sql
source /chemin/vers/seed.sql
```

## 🔐 Configuration des accès

Si vous souhaitez créer un utilisateur MySQL dédié pour l'application :

```sql
-- Créer un utilisateur
CREATE USER 'cameroon_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';

-- Donner tous les droits sur la base de données
GRANT ALL PRIVILEGES ON cameroon_travail.* TO 'cameroon_user'@'localhost';

-- Appliquer les changements
FLUSH PRIVILEGES;
```

N'oubliez pas de mettre à jour le fichier `.env` du backend avec ces identifiants :

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cameroon_travail
DB_USER=cameroon_user
DB_PASSWORD=votre_mot_de_passe
```

## 📊 Structure de la base de données

### Table `users`
Stocke les informations des utilisateurs (candidats, recruteurs, admins).

**Champs principaux :**
- `id` : UUID (clé primaire)
- `full_name` : Nom complet
- `email` : Email (unique)
- `password_hash` : Mot de passe hashé
- `role` : candidate | recruiter | admin
- `profile_completion` : Pourcentage de complétion du profil (0-100)

### Table `experiences`
Stocke les expériences professionnelles des utilisateurs.

**Champs principaux :**
- `id` : UUID (clé primaire)
- `user_id` : Référence vers l'utilisateur
- `job_title` : Titre du poste
- `company` : Nom de l'entreprise
- `start_date` / `end_date` : Dates de début et fin
- `is_current` : Poste actuel ou non

### Table `educations`
Stocke les formations et diplômes des utilisateurs.

**Champs principaux :**
- `id` : UUID (clé primaire)
- `user_id` : Référence vers l'utilisateur
- `degree` : Diplôme obtenu
- `institution` : Établissement
- `start_year` / `end_year` : Années de début et fin

### Table `skills`
Stocke les compétences des utilisateurs avec leur niveau.

**Champs principaux :**
- `id` : UUID (clé primaire)
- `user_id` : Référence vers l'utilisateur
- `name` : Nom de la compétence
- `level` : Niveau de 1 à 5

### Table `languages`
Stocke les langues parlées par les utilisateurs.

**Champs principaux :**
- `id` : UUID (clé primaire)
- `user_id` : Référence vers l'utilisateur
- `name` : Nom de la langue
- `proficiency` : Niveau de maîtrise (native, fluent, intermediate, beginner)

## 🔄 Relations entre les tables

```
users (1) ──< (N) experiences
users (1) ──< (N) educations
users (1) ──< (N) skills
users (1) ──< (N) languages
```

Toutes les relations utilisent `ON DELETE CASCADE`, ce qui signifie que la suppression d'un utilisateur supprime automatiquement toutes ses données associées.

## ⚠️ Notes importantes

1. **UUID** : Les IDs sont des UUID générés automatiquement par MySQL
2. **Timestamps** : Toutes les tables ont des champs `createdAt` et `updatedAt` gérés automatiquement
3. **Charset** : Toutes les tables utilisent `utf8mb4_unicode_ci` pour supporter les caractères spéciaux et emojis
4. **Indexes** : Des index sont créés sur les colonnes fréquemment utilisées pour optimiser les performances

## 🧪 Vérification

Après l'exécution des scripts, vous pouvez vérifier que tout fonctionne :

```sql
-- Vérifier les tables créées
SHOW TABLES;

-- Vérifier les données insérées
SELECT * FROM users;
SELECT * FROM experiences;
SELECT * FROM educations;
SELECT * FROM skills;
SELECT * FROM languages;
```

## 🔄 Réinitialisation

Si vous souhaitez réinitialiser complètement la base de données :

```sql
-- Supprimer la base de données
DROP DATABASE IF EXISTS cameroon_travail;

-- Puis réexécuter les scripts
source schema.sql
source seed.sql
```

---

**Bon développement ! 🚀**
