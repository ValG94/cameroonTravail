import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();

/**
 * 🧭 Configuration des routes principales de l'API CameroonTravail
 */

// Routes d'authentification
router.use('/auth', authRoutes);

// ✅ Endpoint de "health check"
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API CameroonTravail fonctionne correctement',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Route racine (informations générales)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: "Bienvenue sur l'API CameroonTravail 🚀",
    documentation: '/api-docs',
    version: process.env.API_VERSION || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

export default router;
