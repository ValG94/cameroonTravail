import db from '../../models/index.js';
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  generateRefreshToken,
  generateSecureToken,
  generateEmailVerificationToken,
  getTokenExpiration,
  verifyRefreshToken,
} from '../middlewares/auth.js';
import { Op } from 'sequelize';

const { User } = db;

/**
 * Validation simple des données d'inscription
 */
function validateUserRegistration(userData) {
  const errors = [];

  if (!userData.email || !userData.email.includes('@')) {
    errors.push('Email invalide');
  }

  if (!userData.password || userData.password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!userData.fullName || userData.fullName.trim().length < 2) {
    errors.push('Le nom complet est requis');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validation simple des identifiants de connexion
 */
function validateLoginCredentials(credentials) {
  const errors = [];

  if (!credentials.identifier || credentials.identifier.trim().length === 0) {
    errors.push('Email ou téléphone requis');
  }

  if (!credentials.password || credentials.password.length === 0) {
    errors.push('Mot de passe requis');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Service d'authentification
 * Contient toute la logique métier liée à l'authentification
 */
class AuthService {
  /**
   * Calculer un pourcentage de complétion de profil de base
   * en fonction des infos fournies à l'inscription
   */
  static calculateInitialCompletionPercentage(userData) {
    let score = 20; // email + mot de passe

    if (userData.fullName) score += 20;
    if (userData.phoneNumber) score += 20;
    if (userData.location) score += 20;
    if (userData.preferredLanguage) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData
   */
  static async registerUser(userData) {
    // 1. Validation des données
    const validationResult = validateUserRegistration(userData);
    if (!validationResult.isValid) {
      const error = new Error(
        `Données d'inscription invalides : ${validationResult.errors.join(', ')}`
      );
      error.name = 'ValidationError';
      throw error;
    }

    try {
      // 2. Normalisation minimale
      const normalizedData = {
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        fullName: userData.fullName?.trim(),
        phoneNumber: userData.phoneNumber?.trim() || null,
        location: userData.location?.trim() || null,
        role: userData.role || 'candidate',
        preferredLanguage: userData.preferredLanguage || 'fr',
      };

      // 3. Vérifier que l'email n'existe pas déjà
      const existingUser = await User.findOne({
        where: { email: normalizedData.email },
      });

      if (existingUser) {
        const error = new Error(
          "Un compte existe déjà avec cette adresse e-mail."
        );
        error.name = 'UserAlreadyExistsError';
        throw error;
      }

      // 4. Hasher le mot de passe
      const hashedPassword = await hashPassword(normalizedData.password);

      // 5. Générer un token de vérification d'e-mail
      const emailVerificationToken = generateEmailVerificationToken();

      // 6. Construire l'objet aligné sur les colonnes SQL (snake_case)
      const userToCreate = {
        // champs identiques au modèle Sequelize
        email: normalizedData.email,
        password_hash: hashedPassword,
        full_name: normalizedData.fullName,
        phone_number: normalizedData.phoneNumber || null,
        location: normalizedData.location || null,
        role: normalizedData.role,
        status: 'active', // Changé de 'pending_verification' à 'active' pour simplifier
        email_verified: true, // Changé à true pour simplifier (pas de vérification email pour l'instant)
        email_verification_token: emailVerificationToken,
        preferred_language: normalizedData.preferredLanguage || 'fr',
        timezone: 'Africa/Douala',
        profile_completion_percentage:
          this.calculateInitialCompletionPercentage(normalizedData),
      };

      // 7. Créer l'utilisateur
      const newUser = await User.create(userToCreate);

      // 8. Générer un JWT pour connexion automatique après inscription
      const tokenPayload = {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      };

      const token = generateJWT(tokenPayload);

      // 9. Construire une réponse propre pour le front (camelCase)
      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        phoneNumber: newUser.phone_number,
        location: newUser.location,
        role: newUser.role,
        status: newUser.status,
        emailVerified: newUser.email_verified,
        profileCompletionPercentage: newUser.profile_completion_percentage,
        preferredLanguage: newUser.preferred_language,
        createdAt: newUser.createdAt,
      };

      return {
        token,
        user: userResponse,
        emailVerificationToken,
      };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);

      if (error.name === 'ValidationError' || error.name === 'UserAlreadyExistsError') {
        throw error;
      }

      const genericError = new Error(
        "Erreur lors de l'inscription. Veuillez réessayer plus tard."
      );
      genericError.name = 'RegistrationError';
      throw genericError;
    }
  }

  /**
   * Connexion d'un utilisateur
   * @param {Object} credentials
   * @returns {Object} token + user
   */
  static async loginUser(credentials) {
    // 1. Validation des identifiants
    const validationResult = validateLoginCredentials(credentials);
    if (!validationResult.isValid) {
      const error = new Error(
        `Identifiants de connexion invalides : ${validationResult.errors.join(', ')}`
      );
      error.name = 'ValidationError';
      throw error;
    }

    const { identifier, password } = credentials;

    try {
      // 2. Trouver l'utilisateur par email (ou téléphone si tu ajoutes cette logique plus tard)
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { email: identifier.trim().toLowerCase() },
            // si tu veux un login par téléphone plus tard :
            // { phone_number: identifier.trim() }
          ],
        },
      });

      if (!user) {
        const error = new Error(
          'Aucun compte trouvé avec cet email ou numéro de téléphone.'
        );
        error.name = 'UserNotFoundError';
        throw error;
      }

      // 3. Vérifier l'état du compte
      if (user.status === 'inactive') {
        const error = new Error(
          'Ce compte est désactivé. Merci de contacter le support.'
        );
        error.name = 'InactiveAccountError';
        throw error;
      }

      // 4. Vérifier l'email si tu veux forcer la vérification
      // if (!user.email_verified) { ... }

      // 5. Vérifier le mot de passe (IMPORTANT : utiliser password_hash)
      const isPasswordValid = await verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        const error = new Error('Mot de passe incorrect.');
        error.name = 'InvalidPasswordError';
        throw error;
      }

      // 6. Générer un JWT (CORRIGÉ : utiliser generateJWT au lieu de generateToken)
      const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const token = generateJWT(tokenPayload);

      // 7. Mettre à jour la date de dernière connexion (champ SQL last_login)
      await user.update({ last_login: new Date() });

      // 8. Mapper la réponse pour le front (camelCase)
      const userResponse = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phoneNumber: user.phone_number,
        location: user.location,
        role: user.role,
        status: user.status,
        emailVerified: user.email_verified,
        profileCompletionPercentage: user.profile_completion_percentage,
        preferredLanguage: user.preferred_language,
        lastLogin: user.last_login,
      };

      return {
        token,
        user: userResponse,
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);

      if (
        [
          'ValidationError',
          'UserNotFoundError',
          'InvalidPasswordError',
          'InactiveAccountError',
        ].includes(error.name)
      ) {
        throw error;
      }

      const genericError = new Error(
        'Erreur lors de la connexion. Veuillez réessayer plus tard.'
      );
      genericError.name = 'LoginError';
      throw genericError;
    }
  }
}

export default AuthService;