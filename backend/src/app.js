// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './utils/response.js';

dotenv.config();

const app = express();

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware JSON + URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes principales
app.use('/api', apiRoutes);

// Health check rapide
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API CameroonTravail opérationnelle ✅',
    timestamp: new Date().toISOString(),
  });
});

// Gestion des routes non trouvées
app.use(notFoundHandler);

// Gestion des erreurs globales
app.use(globalErrorHandler);

export default app;
