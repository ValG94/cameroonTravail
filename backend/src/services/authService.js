import db from '../../models/index.js';
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  generateRefreshToken,
  generateEmailVerificationToken,
} from '../middlewares/auth.js';
import { Op } from 'sequelize';

const { User } = db;

function validateUserRegistration(userData) {
  const errors = [];
  if (!userData.email || !userData.email.includes('@')) errors.push('Email invalide');
  if (!userData.password || userData.password.length < 8)
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  if (!userData.fullName || userData.fullName.trim().length < 2)
    errors.push('Le nom complet est requis');
  return { isValid: errors.length === 0, errors };
}

function validateLoginCredentials(credentials) {
  const errors = [];
  if (!credentials.identifier || credentials.identifier.trim().length === 0)
    errors.push('Email requis');
  if (!credentials.password || credentials.password.length === 0)
    errors.push('Mot de passe requis');
  return { isValid: errors.length === 0, errors };
}

class AuthService {
  static calculateInitialCompletionPercentage(userData) {
    let score = 20;
    if (userData.fullName) score += 20;
    if (userData.phoneNumber) score += 20;
    if (userData.location) score += 20;
    if (userData.preferredLanguage) score += 20;
    return Math.min(score, 100);
  }

  static async registerUser(userData) {
    const validationResult = validateUserRegistration(userData);
    if (!validationResult.isValid) {
      const error = new Error(
        `Données d'inscription invalides : ${validationResult.errors.join(', ')}`
      );
      error.name = 'ValidationError';
      throw error;
    }

    try {
      const normalizedData = {
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        fullName: userData.fullName?.trim(),
        phoneNumber: userData.phoneNumber?.trim() || null,
        location: userData.location?.trim() || null,
        role: userData.role || 'candidate',
        preferredLanguage: userData.preferredLanguage || 'fr',
      };

      const existingUser = await User.findOne({ where: { email: normalizedData.email } });
      if (existingUser) {
        const error = new Error('Un compte existe déjà avec cette adresse e-mail.');
        error.name = 'UserAlreadyExistsError';
        throw error;
      }

      const hashedPassword = await hashPassword(normalizedData.password);
      const emailVerificationToken = generateEmailVerificationToken();

      const newUser = await User.create({
        email: normalizedData.email,
        password_hash: hashedPassword,
        full_name: normalizedData.fullName,
        phone_number: normalizedData.phoneNumber,
        location: normalizedData.location,
        role: normalizedData.role,
        status: 'active',
        email_verified: true,
        email_verification_token: emailVerificationToken,
        preferred_language: normalizedData.preferredLanguage,
        timezone: 'Africa/Douala',
        profile_completion_percentage: this.calculateInitialCompletionPercentage(normalizedData),
      });

      const tokenPayload = { id: newUser.id, email: newUser.email, role: newUser.role };
      const token = generateJWT(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

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

      return { token, refreshToken, user: userResponse, emailVerificationToken };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      if (error.name === 'ValidationError' || error.name === 'UserAlreadyExistsError') throw error;
      const genericError = new Error(
        "Erreur lors de l'inscription. Veuillez réessayer plus tard."
      );
      genericError.name = 'RegistrationError';
      throw genericError;
    }
  }

  static async loginUser(credentials) {
    const validationResult = validateLoginCredentials(credentials);
    if (!validationResult.isValid) {
      const error = new Error(
        `Identifiants invalides : ${validationResult.errors.join(', ')}`
      );
      error.name = 'ValidationError';
      throw error;
    }

    const { identifier, password } = credentials;

    try {
      const user = await User.findOne({
        where: { [Op.or]: [{ email: identifier.trim().toLowerCase() }] },
      });

      if (!user) {
        const error = new Error('Aucun compte trouvé avec cet email.');
        error.name = 'UserNotFoundError';
        throw error;
      }

      if (user.status === 'inactive') {
        const error = new Error('Ce compte est désactivé. Merci de contacter le support.');
        error.name = 'InactiveAccountError';
        throw error;
      }

      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        const error = new Error('Mot de passe incorrect.');
        error.name = 'InvalidPasswordError';
        throw error;
      }

      const tokenPayload = { id: user.id, email: user.email, role: user.role };
      const token = generateJWT(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      await user.update({ last_login: new Date() });

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

      return { token, refreshToken, user: userResponse };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      if (
        ['ValidationError', 'UserNotFoundError', 'InvalidPasswordError', 'InactiveAccountError']
          .includes(error.name)
      ) throw error;
      const genericError = new Error('Erreur lors de la connexion. Veuillez réessayer plus tard.');
      genericError.name = 'LoginError';
      throw genericError;
    }
  }
}

export default AuthService;
