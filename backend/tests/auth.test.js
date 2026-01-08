/* eslint-env jest */
import request from 'supertest';
import dotenv from 'dotenv';

// Charger l'environnement de développement
dotenv.config();
process.env.NODE_ENV = 'development'; // ✅ Force l’environnement à "development"

// Import de l'application et de la BDD
import app from '../src/app.js';
import db from '../models/index.js'; // 🔁 Ton index ESM des modèles
const { sequelize, User } = db;

describe('Authentication Endpoints', () => {
  // Configuration avant tous les tests
  beforeAll(async () => {
    // On synchronise directement sur cameroontravail_dev
    await sequelize.sync({ force: true });
  });

  // Nettoyage après tous les tests
  afterAll(async () => {
    await sequelize.close();
  });

  // Nettoyage avant chaque test
  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  // -------------------------
  //  TESTS D’INSCRIPTION
  // -------------------------
  describe('POST /api/auth/register', () => {
    const validCandidateData = {
      email: 'candidate@test.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      fullName: 'Jean Dupont',
      phoneNumber: '+237612345678',
      role: 'candidate',
      location: 'Douala',
      preferredLanguage: 'fr'
    };

    const validRecruiterData = {
      email: 'recruiter@test.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      fullName: 'Marie Martin',
      phoneNumber: '+237698765432',
      role: 'recruiter',
      location: 'Yaoundé',
      companyName: 'Tech Solutions Cameroun',
      companySize: '11-50',
      industry: 'Technologie',
      preferredLanguage: 'fr'
    };

    it('devrait créer un compte candidat avec des données valides', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validCandidateData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validCandidateData.email);
      expect(response.body.data.user.role).toBe('candidate');
    });

    it('devrait créer un compte recruteur avec des données valides', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRecruiterData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('recruiter');
    });

    it('devrait rejeter une inscription avec un email invalide', async () => {
      const invalidData = { ...validCandidateData, email: 'email-invalide' };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // -------------------------
  //  TESTS DE CONNEXION
  // -------------------------
  describe('POST /api/auth/login', () => {
    const userData = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
      fullName: 'Test User',
      role: 'candidate'
    };

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(userData);
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
    });
  });
});
