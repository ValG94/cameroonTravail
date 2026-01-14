import db from '../../models/index.js';
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  generateRefreshToken,
  generateSecureToken,
  generateEmailVerificationToken,
  getTokenExpiration,
  verifyRefreshToken
} from '../middlewares/auth.js';
import { Op } from 'sequelize';

const { User } = db;

/**
 * Service d'authentification
 * Contient toute la logique métier liée à l'authentification
 */
class AuthService {
  /**
   * Inscrit un nouvel utilisateur
   */
  async registerUser(userData) {
    try {
      // Vérifier si l'email existe déjà
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('Un compte avec cette adresse email existe déjà');
      }

      // Vérifier si le numéro de téléphone existe déjà (s'il est fourni)
      if (userData.phoneNumber) {
        const existingPhone = await User.findOne({
          where: { phone_number: userData.phoneNumber }
        });

        if (existingPhone) {
          throw new Error('Un compte avec ce numéro de téléphone existe déjà');
        }
      }

      // Hacher le mot de passe
      const hashedPassword = await hashPassword(userData.password);

      // Générer un token de vérification d'email
      const emailVerificationToken = generateEmailVerificationToken();

      // Préparer les données utilisateur
      const userToCreate = {
        email: userData.email,
        passwordHash: hashedPassword,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber || null,
        location: userData.location || null,
        role: userData.role,
        status: 'pending_verification',
        emailVerified: false,
        emailVerificationToken,
        preferredLanguage: userData.preferredLanguage || 'fr',
        timezone: 'Africa/Douala',
        profileCompletionPercentage: this.calculateInitialCompletionPercentage(userData)
      };

      // Créer l'utilisateur
      const newUser = await User.create(userToCreate);

      // Générer les tokens
      const accessToken = generateJWT(newUser);
      const refreshToken = generateRefreshToken(newUser);

      const userResponse = {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        phoneNumber: newUser.phoneNumber,
        location: newUser.location,
        role: newUser.role,
        status: newUser.status,
        emailVerified: newUser.emailVerified,
        profileCompletionPercentage: newUser.profileCompletionPercentage,
        preferredLanguage: newUser.preferredLanguage,
        createdAt: newUser.createdAt
      };

      return {
        user: userResponse,
        tokens: { accessToken, refreshToken },
        emailVerificationToken
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path;
        if (field === 'email') throw new Error('Un compte avec cette adresse email existe déjà');
        if (field === 'phoneNumber')
          throw new Error('Un compte avec ce numéro de téléphone existe déjà');
      }
      throw error;
    }
  }

  /**
   * Connexion utilisateur
   */
  async loginUser(email, password) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error('Email ou mot de passe incorrect');

      if (user.status === 'suspended')
        throw new Error("Votre compte a été suspendu. Contactez l'administration.");
      if (user.status === 'inactive')
        throw new Error("Votre compte est inactif. Contactez l'administration.");

      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) throw new Error('Email ou mot de passe incorrect');

      await user.update({ lastLogin: new Date() });

      const accessToken = generateJWT(user);
      const refreshToken = generateRefreshToken(user);

      const userResponse = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        location: user.location,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        profileCompletionPercentage: user.profileCompletionPercentage,
        preferredLanguage: user.preferredLanguage,
        lastLogin: user.lastLogin
      };

      return { user: userResponse, tokens: { accessToken, refreshToken } };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Initie la réinitialisation du mot de passe
   */
  async initiatePasswordReset(email) {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return {
          message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation'
        };
      }

      const resetToken = generateSecureToken();
      const resetExpires = getTokenExpiration(1);

      await user.update({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      return {
        resetToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Confirme la réinitialisation du mot de passe
   */
  async confirmPasswordReset(token, newPassword) {
    try {
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [Op.gt]: new Date() }
        }
      });

      if (!user) throw new Error('Token de réinitialisation invalide ou expiré');

      const hashedPassword = await hashPassword(newPassword);

      await user.update({
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      });

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vérifie un email utilisateur
   */
  async verifyEmail(token) {
    try {
      const user = await User.findOne({ where: { emailVerificationToken: token } });
      if (!user) throw new Error('Token de vérification invalide');

      await user.update({
        emailVerified: true,
        emailVerificationToken: null,
        status: 'active'
      });

      return {
        message: 'Email vérifié avec succès',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: true,
          status: user.status
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Renvoie un email de vérification
   */
  async resendEmailVerification(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new Error('Utilisateur non trouvé');
      if (user.emailVerified) throw new Error('Email déjà vérifié');

      const emailVerificationToken = generateEmailVerificationToken();
      await user.update({ emailVerificationToken });

      return {
        emailVerificationToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcule la complétion du profil
   */
  calculateInitialCompletionPercentage(userData) {
    let percentage = 20;
    if (userData.fullName) percentage += 15;
    if (userData.phoneNumber) percentage += 10;
    if (userData.location) percentage += 10;

    if (userData.role === 'recruiter') {
      if (userData.companyName) percentage += 15;
      if (userData.industry) percentage += 10;
      if (userData.companySize) percentage += 5;
    }

    return Math.min(percentage, 100);
  }

  /**
   * Rafraîchit les tokens
   */
  async refreshTokens(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findByPk(decoded.userId);

      if (!user) throw new Error('Utilisateur non trouvé');
      if (user.status !== 'active') throw new Error('Compte inactif');

      const newAccessToken = generateJWT(user);
      const newRefreshToken = generateRefreshToken(user);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
