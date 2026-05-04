import express from 'express';
import authController from '../controllers/authController.js';
import {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordReset,
  validatePasswordResetConfirm
} from '../middlewares/validation.js';
import { isAuthenticated, rateLimit } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - confirmPassword
 *         - fullName
 *         - role
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email de l'utilisateur
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Mot de passe (min 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial)
 *         confirmPassword:
 *           type: string
 *           description: Confirmation du mot de passe
 *         fullName:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nom complet de l'utilisateur
 *         phoneNumber:
 *           type: string
 *           pattern: '^(\+237|237)?[6-9]\d{8}$'
 *           description: Numéro de téléphone camerounais
 *         role:
 *           type: string
 *           enum: [candidate, recruiter]
 *           description: Rôle de l'utilisateur
 *         location:
 *           type: string
 *           description: Localisation de l'utilisateur
 *         preferredLanguage:
 *           type: string
 *           enum: [fr, en]
 *           default: fr
 *           description: Langue préférée
 *         companyName:
 *           type: string
 *           description: Nom de l'entreprise (requis pour les recruteurs)
 *         companySize:
 *           type: string
 *           enum: [1-10, 11-50, 51-200, 201-500, 500+]
 *           description: Taille de l'entreprise
 *         industry:
 *           type: string
 *           description: Secteur d'activité
 *
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email
 *         password:
 *           type: string
 *           description: Mot de passe
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         fullName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         location:
 *           type: string
 *         role:
 *           type: string
 *         status:
 *           type: string
 *         emailVerified:
 *           type: boolean
 *         profileCompletionPercentage:
 *           type: integer
 *         preferredLanguage:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// === ROUTES AUTHENTIFICATION ===

router.post(
  '/register',
  rateLimit(5, 15 * 60 * 1000),
  validateUserRegistration,
  authController.register
);

router.post(
  '/login',
  rateLimit(10, 15 * 60 * 1000),
  validateUserLogin,
  authController.login
);

router.post('/logout', isAuthenticated, authController.logout);

router.post(
  '/forgot-password',
  rateLimit(3, 15 * 60 * 1000),
  validatePasswordReset,
  authController.forgotPassword
);

router.post(
  '/reset-password',
  rateLimit(5, 15 * 60 * 1000),
  validatePasswordResetConfirm,
  authController.resetPassword
);

router.get('/verify-email/:token', authController.verifyEmail);

router.post(
  '/resend-verification',
  rateLimit(3, 15 * 60 * 1000),
  validatePasswordReset,
  authController.resendVerification
);

router.post('/refresh', authController.refreshToken);

router.get('/me', isAuthenticated, authController.getCurrentUser);

router.put(
  '/change-password',
  isAuthenticated,
  // TODO: Ajouter la validation pour le changement de mot de passe
  authController.changePassword
);

export default router;