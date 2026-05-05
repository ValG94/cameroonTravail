import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './utils/response.js';
import { initStorageBuckets } from './services/supabaseStorage.js';
import db from '../models/index.js';

dotenv.config();

const app = express();

// ─── Sécurité — headers HTTP ──────────────────────────────────────────────────
app.use(helmet());

// ─── Rate limiting global — toutes les routes ─────────────────────────────────
// Protège contre le scraping, les scans de vulnérabilités, les bots
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,                  // 200 requêtes / IP / fenêtre
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Trop de requêtes, veuillez réessayer dans quelques minutes.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
    },
  })
);

// ─── CORS — multi-origines, jamais de wildcard ─────────────────────────────────
// CORS_ORIGIN peut contenir plusieurs URLs séparées par des virgules :
//   CORS_ORIGIN=https://cameroon-travail.vercel.app,https://staging.vercel.app
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origine (Postman, curl, appels serveur-serveur)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origine non autorisée par la politique CORS : ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Parsing ──────────────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Health check (hors /api pour que Railway le détecte)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API CameroonTravail opérationnelle ✅',
    timestamp: new Date().toISOString(),
  });
});

// ─── Handlers erreurs ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Synchronisation Sequelize + initialisation Supabase Storage ──────────────
Promise.all([
  db.sequelize.sync({ force: false }),
  initStorageBuckets(),
])
  .then(() => console.log('✅ DB synchronisée et buckets Supabase prêts'))
  .catch((err) => console.error('❌ Erreur initialisation :', err.message));

export default app;
