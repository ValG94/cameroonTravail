import authService from '../services/authService.js';
import {
  successResponse,
  errorResponse,
  createdResponse,
  serverErrorResponse
} from '../utils/response.js';
import { generateAuthResponse } from '../middlewares/auth.js';

/**
 * Contrôleur d'authentification
 * Gère les endpoints liés à l'authentification des utilisateurs
 */
class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const userData = req.validatedData;

      // Inscription
      const result = await authService.registerUser(userData);

      // TODO: Envoi email de vérification
      // await emailService.sendVerificationEmail(result.user.email, result.emailVerificationToken);

      // Réponse d'authentification
      const authResponse = generateAuthResponse(
        result.user,
        result.tokens.accessToken,
        result.tokens.refreshToken
      );

      authResponse.message =
        'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.';
      authResponse.data.emailVerificationRequired = !result.user.emailVerified;

      return createdResponse(res, authResponse.data, authResponse.message);
    } catch (error) {
      console.error('Erreur lors de l’inscription:', error);

      if (error.message.includes('existe déjà')) {
        return errorResponse(res, error.message, 409, null, 'USER_ALREADY_EXISTS');
      }
      if (error.message.includes('mot de passe')) {
        return errorResponse(res, error.message, 400, null, 'INVALID_PASSWORD');
      }

      return serverErrorResponse(res, "Erreur lors de l'inscription", error);
    }
  }

  /**
   * Connexion utilisateur
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.validatedData;
      const result = await authService.loginUser(email, password);

      const authResponse = generateAuthResponse(
        result.user,
        result.tokens.accessToken,
        result.tokens.refreshToken
      );

      return successResponse(res, authResponse.data, authResponse.message);
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);

      if (error.message.includes('incorrect') || error.message.includes('invalide')) {
        return errorResponse(res, 'Email ou mot de passe incorrect', 401, null, 'INVALID_CREDENTIALS');
      }
      if (error.message.includes('suspendu')) {
        return errorResponse(res, error.message, 403, null, 'ACCOUNT_SUSPENDED');
      }
      if (error.message.includes('inactif')) {
        return errorResponse(res, error.message, 403, null, 'ACCOUNT_INACTIVE');
      }

      return serverErrorResponse(res, 'Erreur lors de la connexion', error);
    }
  }

  /**
   * Déconnexion utilisateur
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      // TODO: Implémenter une blacklist de tokens si nécessaire
      return successResponse(res, null, 'Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return serverErrorResponse(res, 'Erreur lors de la déconnexion', error);
    }
  }

  /**
   * Réinitialisation - demande de lien
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.validatedData;
      const result = await authService.initiatePasswordReset(email);

      // TODO: Envoi de l'email de réinitialisation
      // if (result.resetToken) await emailService.sendPasswordResetEmail(result.user.email, result.resetToken);

      return successResponse(
        res,
        null,
        'Si cette adresse email existe, vous recevrez un lien de réinitialisation dans quelques minutes.'
      );
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation:', error);
      return serverErrorResponse(res, 'Erreur lors de la demande de réinitialisation', error);
    }
  }

  /**
   * Réinitialisation du mot de passe
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { token, password } = req.validatedData;
      await authService.confirmPasswordReset(token, password);

      return successResponse(
        res,
        null,
        'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
      );
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);

      if (error.message.includes('invalide') || error.message.includes('expiré')) {
        return errorResponse(res, error.message, 400, null, 'INVALID_RESET_TOKEN');
      }

      return serverErrorResponse(res, 'Erreur lors de la réinitialisation du mot de passe', error);
    }
  }

  /**
   * Vérification d'email
   * GET /api/auth/verify-email/:token
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return errorResponse(res, 'Token de vérification manquant', 400, null, 'MISSING_TOKEN');
      }

      const result = await authService.verifyEmail(token);
      return successResponse(res, result.user, result.message);
    } catch (error) {
      console.error('Erreur lors de la vérification d’email:', error);

      if (error.message.includes('invalide')) {
        return errorResponse(res, error.message, 400, null, 'INVALID_VERIFICATION_TOKEN');
      }

      return serverErrorResponse(res, 'Erreur lors de la vérification de l’email', error);
    }
  }

  /**
   * Renvoyer un email de vérification
   * POST /api/auth/resend-verification
   */
  async resendVerification(req, res) {
    try {
      const { email } = req.validatedData;
      const result = await authService.resendEmailVerification(email);

      // TODO: Envoi d'email de vérification
      // await emailService.sendVerificationEmail(result.user.email, result.emailVerificationToken);

      return successResponse(res, null, 'Email de vérification renvoyé avec succès.');
    } catch (error) {
      console.error('Erreur lors du renvoi de vérification:', error);

      if (error.message.includes('non trouvé')) {
        return errorResponse(res, 'Utilisateur non trouvé', 404, null, 'USER_NOT_FOUND');
      }
      if (error.message.includes('déjà vérifié')) {
        return errorResponse(res, error.message, 400, null, 'EMAIL_ALREADY_VERIFIED');
      }

      return serverErrorResponse(res, 'Erreur lors du renvoi de l’email de vérification', error);
    }
  }

  /**
   * Rafraîchit les tokens
   * POST /api/auth/refresh
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token manquant', 400, null, 'MISSING_REFRESH_TOKEN');
      }

      const result = await authService.refreshTokens(refreshToken);

      return successResponse(res, { tokens: result }, 'Tokens rafraîchis avec succès');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des tokens:', error);

      if (error.message.includes('invalide') || error.message.includes('expiré')) {
        return errorResponse(res, 'Refresh token invalide ou expiré', 401, null, 'INVALID_REFRESH_TOKEN');
      }
      if (error.message.includes('inactif')) {
        return errorResponse(res, 'Compte inactif', 403, null, 'ACCOUNT_INACTIVE');
      }

      return serverErrorResponse(res, 'Erreur lors du rafraîchissement des tokens', error);
    }
  }

  /**
   * Informations de l’utilisateur connecté
   * GET /api/auth/me
   */
  async getCurrentUser(req, res) {
    try {
      const user = req.user;

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
        timezone: user.timezone,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return successResponse(res, userResponse, 'Informations utilisateur récupérées avec succès');
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur:', error);
      return serverErrorResponse(res, 'Erreur lors de la récupération des informations utilisateur', error);
    }
  }

  /**
   * Changement de mot de passe
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.validatedData;
      const userId = req.user.id;

      // TODO: Vérifier le mot de passe actuel et mettre à jour le nouveau
      return successResponse(res, null, 'Mot de passe modifié avec succès');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return serverErrorResponse(res, 'Erreur lors du changement de mot de passe', error);
    }
  }
}

const authController = new AuthController();
export default authController;
