-- ============================================
-- Script de création de la base de données
-- CameroonTravail - Plateforme de recherche d'emploi
-- ============================================

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS cameroon_travail 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE cameroon_travail;

-- ============================================
-- Table: users
-- Description: Stocke les informations des utilisateurs (candidats, recruteurs, admins)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('candidate', 'recruiter', 'admin') NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_verification',
    last_login DATETIME,
    profile_picture VARCHAR(500),
    job_title VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255) DEFAULT 'Cameroun',
    birth_date DATE,
    bio TEXT,
    profile_completion INT DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: experiences
-- Description: Stocke les expériences professionnelles des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS experiences (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    `order` INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: educations
-- Description: Stocke les formations et diplômes des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS educations (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_year INT NOT NULL,
    end_year INT,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    `order` INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_start_year (start_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: skills
-- Description: Stocke les compétences des utilisateurs avec leur niveau
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'technical',
    level INT CHECK (level >= 1 AND level <= 5),
    `order` INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: languages
-- Description: Stocke les langues parlées par les utilisateurs avec leur niveau
-- ============================================
CREATE TABLE IF NOT EXISTS languages (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    proficiency VARCHAR(50) NOT NULL DEFAULT 'intermediate',
    `order` INT DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Afficher les tables créées
-- ============================================
SHOW TABLES;

-- ============================================
-- Afficher la structure de chaque table
-- ============================================
DESCRIBE users;
DESCRIBE experiences;
DESCRIBE educations;
DESCRIBE skills;
DESCRIBE languages;
