-- ============================================
-- Script d'insertion de données de test
-- CameroonTravail - Plateforme de recherche d'emploi
-- ============================================

USE cameroon_travail;

-- ============================================
-- Insertion d'utilisateurs de test
-- ============================================

-- Utilisateur 1: Candidat de test
-- Email: test@cameroontravail.cm
-- Mot de passe: Password123!
-- Hash généré avec bcrypt (12 rounds)
INSERT INTO users (
    id,
    full_name,
    email,
    phone_number,
    password_hash,
    role,
    status,
    profile_picture,
    job_title,
    city,
    country,
    birth_date,
    bio,
    profile_completion,
    createdAt,
    updatedAt
) VALUES (
    UUID(),
    'Test User',
    'test@cameroontravail.cm',
    '+237 6 77 88 99 00',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWHvqqVu',
    'candidate',
    'active',
    NULL,
    'Développeur Full Stack',
    'Douala',
    'Cameroun',
    '1995-03-15',
    'Passionné de technologie et de développement web.',
    30,
    NOW(),
    NOW()
);

-- Récupérer l'ID de l'utilisateur de test pour les insertions suivantes
SET @test_user_id = (SELECT id FROM users WHERE email = 'test@cameroontravail.cm');

-- ============================================
-- Insertion d'expériences professionnelles de test
-- ============================================

INSERT INTO experiences (
    id,
    user_id,
    job_title,
    company,
    location,
    start_date,
    end_date,
    is_current,
    description,
    `order`,
    createdAt,
    updatedAt
) VALUES 
(
    UUID(),
    @test_user_id,
    'Développeur Full Stack Senior',
    'TechAfrica Solutions',
    'Douala, Cameroun',
    '2022-01-01',
    NULL,
    TRUE,
    'Conception et développement d\'applications web modernes avec React et Node.js. Mise en place d\'architectures microservices.',
    1,
    NOW(),
    NOW()
),
(
    UUID(),
    @test_user_id,
    'Développeur Full Stack',
    'Digital Cameroon',
    'Yaoundé, Cameroun',
    '2020-03-01',
    '2021-12-31',
    FALSE,
    'Développement d\'applications web pour clients gouvernementaux et privés. Intégration d\'APIs RESTful.',
    2,
    NOW(),
    NOW()
),
(
    UUID(),
    @test_user_id,
    'Développeur Junior',
    'StartupHub Cameroun',
    'Douala, Cameroun',
    '2019-06-01',
    '2020-02-28',
    FALSE,
    'Développement de fonctionnalités frontend avec React. Participation aux sprints agiles.',
    3,
    NOW(),
    NOW()
);

-- ============================================
-- Insertion de formations de test
-- ============================================

INSERT INTO educations (
    id,
    user_id,
    degree,
    institution,
    location,
    start_year,
    end_year,
    is_current,
    description,
    `order`,
    createdAt,
    updatedAt
) VALUES 
(
    UUID(),
    @test_user_id,
    'Master en Génie Logiciel',
    'Université de Douala',
    'Douala, Cameroun',
    2017,
    2019,
    FALSE,
    'Spécialisation en développement web et architecture logicielle.',
    1,
    NOW(),
    NOW()
),
(
    UUID(),
    @test_user_id,
    'Licence en Informatique',
    'Université de Yaoundé I',
    'Yaoundé, Cameroun',
    2014,
    2017,
    FALSE,
    'Formation en programmation, algorithmique et bases de données.',
    2,
    NOW(),
    NOW()
);

-- ============================================
-- Insertion de compétences de test
-- ============================================

INSERT INTO skills (
    id,
    user_id,
    name,
    category,
    level,
    `order`,
    createdAt,
    updatedAt
) VALUES 
(UUID(), @test_user_id, 'JavaScript', 'technical', 5, 1, NOW(), NOW()),
(UUID(), @test_user_id, 'TypeScript', 'technical', 5, 2, NOW(), NOW()),
(UUID(), @test_user_id, 'React', 'technical', 5, 3, NOW(), NOW()),
(UUID(), @test_user_id, 'Node.js', 'technical', 5, 4, NOW(), NOW()),
(UUID(), @test_user_id, 'Express', 'technical', 4, 5, NOW(), NOW()),
(UUID(), @test_user_id, 'MySQL', 'technical', 4, 6, NOW(), NOW()),
(UUID(), @test_user_id, 'MongoDB', 'technical', 4, 7, NOW(), NOW()),
(UUID(), @test_user_id, 'Docker', 'technical', 3, 8, NOW(), NOW()),
(UUID(), @test_user_id, 'Git', 'technical', 5, 9, NOW(), NOW()),
(UUID(), @test_user_id, 'Tailwind CSS', 'technical', 5, 10, NOW(), NOW());

-- ============================================
-- Insertion de langues de test
-- ============================================

INSERT INTO languages (
    id,
    user_id,
    name,
    proficiency,
    `order`,
    createdAt,
    updatedAt
) VALUES 
(UUID(), @test_user_id, 'Français', 'native', 1, NOW(), NOW()),
(UUID(), @test_user_id, 'Anglais', 'fluent', 2, NOW(), NOW()),
(UUID(), @test_user_id, 'Allemand', 'intermediate', 3, NOW(), NOW());

-- ============================================
-- Afficher les données insérées
-- ============================================

SELECT 'Utilisateurs créés:' AS Info;
SELECT id, full_name, email, role, status, profile_completion FROM users;

SELECT 'Expériences créées:' AS Info;
SELECT id, job_title, company, start_date, end_date, is_current FROM experiences WHERE user_id = @test_user_id;

SELECT 'Formations créées:' AS Info;
SELECT id, degree, institution, start_year, end_year FROM educations WHERE user_id = @test_user_id;

SELECT 'Compétences créées:' AS Info;
SELECT id, name, category, level FROM skills WHERE user_id = @test_user_id;

SELECT 'Langues créées:' AS Info;
SELECT id, name, proficiency FROM languages WHERE user_id = @test_user_id;

-- ============================================
-- Informations de connexion
-- ============================================

SELECT '
============================================
UTILISATEUR DE TEST CRÉÉ AVEC SUCCÈS !
============================================

Email: test@cameroontravail.cm
Mot de passe: Password123!

Vous pouvez maintenant vous connecter avec ces identifiants.
============================================
' AS 'Informations de connexion';
