import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './utils/response.js';
import { isAuthenticated } from './middlewares/auth.js';
import db from '../models/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Sécurité ─────────────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true, // Nécessaire pour que les cookies soient envoyés cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Parsing ──────────────────────────────────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Fichiers statiques ───────────────────────────────────────────────────────

// Photos de profil : publiques (visibles dans les listings, CVthèque, etc.)
app.use('/uploads/photos', express.static(path.join(__dirname, '../../uploads/photos')));

// CVs : protégés — authentification requise
app.get('/uploads/cvs/:filename', isAuthenticated, (req, res) => {
  // path.basename() empêche toute attaque de traversée de répertoire (../../../etc)
  const safeName = path.basename(req.params.filename);
  res.sendFile(path.resolve(__dirname, '../../uploads/cvs', safeName));
});

// ─── Routes API ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API CameroonTravail opérationnelle ✅',
    timestamp: new Date().toISOString(),
  });
});

// ─── Handlers ─────────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Synchronisation Sequelize → Supabase ─────────────────────────────────────
db.sequelize
  .sync({ force: false })
  .then(() => console.log('✅ Tables synchronisées avec Supabase'))
  .catch((err) => console.error('❌ Erreur de synchronisation DB :', err.message));

export default app;
