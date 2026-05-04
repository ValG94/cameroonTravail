import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './utils/response.js';
import db from '../models/index.js';

dotenv.config();

const app = express();

// Sécurité — headers HTTP
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques (uploads)
app.use('/uploads', express.static('uploads'));

// Routes principales
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API CameroonTravail opérationnelle ✅',
    timestamp: new Date().toISOString(),
  });
});

// 404 et erreurs globales
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Synchronisation des tables Sequelize avec Supabase
db.sequelize
  .sync({ force: false })
  .then(() => console.log('✅ Tables synchronisées avec Supabase'))
  .catch((err) => console.error('❌ Erreur de synchronisation DB :', err.message));

export default app;
