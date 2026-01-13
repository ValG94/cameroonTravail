import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Pour générer des tokens sécurisés
import dotenv from 'dotenv';
import rateLimitLib from 'express-rate-limit';
dotenv.config();

// Vérification des variables d'environnement nécessaires
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('La variable JWT_REFRESH_SECRET est obligatoire.');
}

/**
 * Configuration pour le hashage des mots de passe
 */
const SALT_ROUNDS = 12;

/**
 * Hache un mot de passe avec bcrypt
 * @param {string} password - Le mot de passe en clair
 * @returns {Promise<string>} Le mot de passe haché
 */
export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error('Erreur lors du hashage du mot de passe');
  }
};

/**
 * Vérifie un mot de passe contre son hash
 * @param {string} password - Le mot de passe en clair
 * @param {string} hashedPassword - Le mot de passe haché
 * @returns {Promise<boolean>} True si le mot de passe correspond
 */
export const verifyPassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Erreur lors de la vérification du mot de passe');
  }
};

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'objet utilisateur
 * @param {string} user.id - L'ID de l'utilisateur
 * @param {string} user.email - L'email de l'utilisateur
 * @param {string} user.role - Le rôle de l'utilisateur
 * @returns {string} Le token JWT
 */
export const generateJWT = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'cameroon-travail',
    audience: process.env.JWT_AUDIENCE || 'cameroon-travail-users'
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Génère un token de rafraîchissement
 * @param {Object} user - L'objet utilisateur
 * @returns {string} Le refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  const options = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
    issuer: process.env.JWT_ISSUER || 'cameroon-travail'
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, options);
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Le token à vérifier
 * @returns {Object} Le payload décodé
 */
export const verifyJWT = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expiré');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token invalide');
    } else {
      throw new Error('Erreur de vérification du token');
    }
  }
};

/**
 * Vérifie un refresh token
 * @param {string} token - Le refresh token à vérifier
 * @returns {Object} Le payload décodé
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expiré');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Refresh token invalide');
    } else {
      throw new Error('Erreur de vérification du refresh token');
    }
  }
};

/**
 * Génère un token aléatoire sécurisé pour la réinitialisation de mot de passe
 * @returns {string} Token aléatoire
 */
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Génère un token de vérification d'email
 * @returns {string} Token de vérification
 */
export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calcule la date d'expiration pour un token (par défaut 1 heure)
 * @param {number} hours - Nombre d'heures avant expiration
 * @returns {Date} Date d'expiration
 */
export const getTokenExpiration = (hours = 1) => {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + hours);
  return expiration;
};

/**
 * Extrait le token du header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Le token ou null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Génère une réponse d'authentification standardisée
 * @param {Object} user - L'utilisateur
 * @param {string} accessToken - Le token d'accès
 * @param {string} refreshToken - Le token de rafraîchissement
 * @returns {Object} Réponse d'authentification
 */
export const generateAuthResponse = (user, accessToken, refreshToken) => {
  return {
    success: true,
    message: 'Authentification réussie',
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        profileCompletionPercentage: user.profileCompletionPercentage,
        preferredLanguage: user.preferredLanguage
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    }
  };
};

/**
 * Valide la force d'un mot de passe
 * @param {string} password - Le mot de passe à valider
 * @returns {Object} Résultat de la validation
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: true,
    score: 0,
    feedback: []
  };

  // Vérifications de base
  if (password.length < 8) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    result.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins une lettre minuscule');
  } else {
    result.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins une lettre majuscule');
  } else {
    result.score += 1;
  }

  if (!/[0-9]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins un chiffre');
  } else {
    result.score += 1;
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    result.isValid = false;
    result.feedback.push('Le mot de passe doit contenir au moins un caractère spécial');
  } else {
    result.score += 1;
  }

  // Vérifications avancées pour améliorer le score
  if (password.length >= 12) {
    result.score += 1;
  }

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{2,}/.test(password)) {
    result.score += 1;
  }

  return result;
};

/**
 * Middleware de limitation de requêtes (anti brute-force)
 * @param {number} maxRequests - Nombre max de requêtes
 * @param {number} windowMs - Fenêtre de temps (en ms)
 * @returns {Function} Middleware rate limiter
 */
export const rateLimit = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  return rateLimitLib({
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
};

/**
 * Middleware pour vérifier l'authentification via JWT
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format du token invalide',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === 'TokenExpiredError'
          ? 'Token expiré'
          : 'Token invalide',
    });
  }
};

// Alias pour compatibilité
export const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format du token invalide',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error.name === 'TokenExpiredError'
          ? 'Token expiré'
          : 'Token invalide',
    });
  }
};


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
  isAuthenticated
};
