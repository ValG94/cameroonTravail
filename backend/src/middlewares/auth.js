import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import rateLimitLib from 'express-rate-limit';
import db from '../../models/index.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('La variable JWT_SECRET est obligatoire.');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('La variable JWT_REFRESH_SECRET est obligatoire.');
}

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = async (password, hashedPassword) =>
  bcrypt.compare(password, hashedPassword);

/**
 * Génère un access token JWT avec un JTI unique (requis pour la révocation)
 */
export const generateJWT = (user) => {
  const payload = {
    jti: crypto.randomUUID(),
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'cameroon-travail',
    audience: process.env.JWT_AUDIENCE || 'cameroon-travail-users',
  });
};

/**
 * Génère un refresh token JWT avec son propre JTI
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { jti: crypto.randomUUID(), userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
      issuer: process.env.JWT_ISSUER || 'cameroon-travail',
    }
  );
};

export const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new Error('Token expiré');
    if (error.name === 'JsonWebTokenError') throw new Error('Token invalide');
    throw new Error('Erreur de vérification du token');
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new Error('Refresh token expiré');
    if (error.name === 'JsonWebTokenError') throw new Error('Refresh token invalide');
    throw new Error('Erreur de vérification du refresh token');
  }
};

export const generateSecureToken = () => crypto.randomBytes(32).toString('hex');

export const generateEmailVerificationToken = () => crypto.randomBytes(32).toString('hex');

export const getTokenExpiration = (hours = 1) => {
  const exp = new Date();
  exp.setHours(exp.getHours() + hours);
  return exp;
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};

/**
 * Middleware JWT — lit le token depuis le cookie httpOnly (priorité)
 * ou depuis le header Authorization (compatibilité clients non-browser).
 * Vérifie aussi que le JTI n'est pas dans la liste de révocation.
 */
export const isAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token d'authentification manquant",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Vérifier la liste de révocation (logout explicite)
    if (decoded.jti && db.RevokedToken) {
      const revoked = await db.RevokedToken.findByPk(decoded.jti);
      if (revoked) {
        return res.status(401).json({
          success: false,
          message: 'Session révoquée, veuillez vous reconnecter',
        });
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide',
    });
  }
};

// Alias
export const authenticate = isAuthenticated;

/**
 * Middleware de limitation de requêtes (anti brute-force)
 */
export const rateLimit = (maxRequests = 5, windowMs = 15 * 60 * 1000) =>
  rateLimitLib({
    windowMs,
    max: maxRequests,
    message: {
      success: false,
      message: 'Trop de tentatives, veuillez réessayer plus tard.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

export const validatePasswordStrength = (password) => {
  const result = { isValid: true, score: 0, feedback: [] };
  if (password.length < 8) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins 8 caractères');
  } else result.score++;
  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins une lettre minuscule');
  } else result.score++;
  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins une lettre majuscule');
  } else result.score++;
  if (!/[0-9]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins un chiffre');
  } else result.score++;
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else result.score++;
  if (password.length >= 12) result.score++;
  return result;
};

export const generateAuthResponse = (user, accessToken, refreshToken) => ({
  success: true,
  message: 'Authentification réussie',
  data: {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    },
    tokens: { accessToken, refreshToken, expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  },
});

export default {
  hashPassword,
  verifyPassword,
  generateJWT,
  generateRefreshToken,
  verifyJWT,
  verifyRefreshToken,
  generateSecureToken,
  generateEmailVerificationToken,
  getTokenExpiration,
  extractTokenFromHeader,
  generateAuthResponse,
  validatePasswordStrength,
  rateLimit,
  isAuthenticated,
  authenticate,
};
