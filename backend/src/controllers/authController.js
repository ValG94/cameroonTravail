import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import authService from '../services/authService.js';
import {
  generateJWT,
  verifyRefreshToken,
  extractTokenFromHeader,
} from '../middlewares/auth.js';
import db from '../../models/index.js';
import {
  successResponse,
  errorResponse,
  createdResponse,
  serverErrorResponse,
} from '../utils/response.js';

// ─── Helpers cookies ─────────────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === 'production';

const COOKIE_BASE = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'lax',
};

function setAuthCookies(res, token, refreshToken) {
  res.cookie('accessToken', token, {
    ...COOKIE_BASE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_BASE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
  });
}

function clearAuthCookies(res) {
  res.clearCookie('accessToken', COOKIE_BASE);
  res.clearCookie('refreshToken', COOKIE_BASE);
}

// Révoque un token JWT (access ou refresh) en insérant son JTI en BDD
async function revokeToken(rawToken) {
  if (!rawToken || !db.RevokedToken) return;
  try {
    const decoded = jwt.decode(rawToken); // decode sans vérification (token peut être expiré)
    if (decoded?.jti && decoded?.exp && decoded?.userId) {
      await db.RevokedToken.upsert({
        jti: decoded.jti,
        user_id: decoded.userId,
        expires_at: new Date(decoded.exp * 1000),
      });
    }
  } catch (_) {
    // token malformé → ignorer
  }
}

// Nettoyage opportuniste des tokens révoqués expirés
async function cleanExpiredRevokedTokens() {
  if (!db.RevokedToken) return;
  try {
    await db.RevokedToken.destroy({ where: { expires_at: { [Op.lt]: new Date() } } });
  } catch (_) {}
}

// ─── Controller ──────────────────────────────────────────────────────────────

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const userData = req.validatedData || req.body;
      const result = await authService.registerUser(userData);

      setAuthCookies(res, result.token, result.refreshToken);

      return createdResponse(
        res,
        { user: result.user },
        'Inscription réussie. Vous êtes maintenant connecté.'
      );
    } catch (error) {
      console.error("Erreur inscription:", error);
      if (error.name === 'UserAlreadyExistsError')
        return errorResponse(res, error.message, 409, null, 'USER_ALREADY_EXISTS');
      if (error.name === 'ValidationError')
        return errorResponse(res, error.message, 400, null, 'VALIDATION_ERROR');
      return serverErrorResponse(res, "Erreur lors de l'inscription", error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { email, password } = req.validatedData || req.body;
      const result = await authService.loginUser({ identifier: email, password });

      setAuthCookies(res, result.token, result.refreshToken);

      return successResponse(res, { user: result.user }, 'Connexion réussie');
    } catch (error) {
      console.error('Erreur connexion:', error);
      if (['InvalidPasswordError', 'UserNotFoundError'].includes(error.name))
        return errorResponse(res, 'Email ou mot de passe incorrect', 401, null, 'INVALID_CREDENTIALS');
      if (error.name === 'InactiveAccountError')
        return errorResponse(res, error.message, 403, null, 'ACCOUNT_INACTIVE');
      return serverErrorResponse(res, 'Erreur lors de la connexion', error);
    }
  }

  /**
   * POST /api/auth/logout
   * Révoque les deux tokens (access + refresh) puis efface les cookies
   */
  async logout(req, res) {
    try {
      const accessToken = req.cookies?.accessToken || extractTokenFromHeader(req.headers.authorization);
      const refreshToken = req.cookies?.refreshToken;

      await Promise.all([
        revokeToken(accessToken),
        revokeToken(refreshToken),
      ]);

      // Nettoyage asynchrone non-bloquant
      cleanExpiredRevokedTokens();

      clearAuthCookies(res);
      return successResponse(res, null, 'Déconnexion réussie');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      clearAuthCookies(res); // effacer les cookies même en cas d'erreur
      return serverErrorResponse(res, 'Erreur lors de la déconnexion', error);
    }
  }

  /**
   * GET /api/auth/me
   * Retourne le profil complet de l'utilisateur connecté (depuis la BDD)
   */
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.userId;

      const user = await db.User.findByPk(userId, {
        attributes: { exclude: ['password_hash', 'email_verification_token'] },
      });

      if (!user) {
        return errorResponse(res, 'Utilisateur non trouvé', 404, null, 'USER_NOT_FOUND');
      }

      return successResponse(
        res,
        {
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
          timezone: user.timezone,
          profilePicture: user.profile_picture,
          jobTitle: user.job_title,
          city: user.city,
          country: user.country,
          bio: user.bio,
          lastLogin: user.last_login,
          createdAt: user.createdAt,
        },
        'Informations utilisateur récupérées'
      );
    } catch (error) {
      console.error('Erreur getCurrentUser:', error);
      return serverErrorResponse(res, 'Erreur lors de la récupération du profil', error);
    }
  }

  /**
   * POST /api/auth/refresh
   * Vérifie le refresh token (cookie), émet un nouveau access token
   */
  async refreshToken(req, res) {
    try {
      const refreshTokenValue = req.cookies?.refreshToken;

      if (!refreshTokenValue) {
        return errorResponse(res, 'Refresh token manquant', 401, null, 'MISSING_REFRESH_TOKEN');
      }

      // Vérifier la signature du refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshTokenValue);
      } catch (err) {
        clearAuthCookies(res);
        return errorResponse(res, 'Session expirée, veuillez vous reconnecter', 401, null, 'SESSION_EXPIRED');
      }

      // Vérifier que le refresh token n'est pas révoqué
      if (decoded.jti && db.RevokedToken) {
        const revoked = await db.RevokedToken.findByPk(decoded.jti);
        if (revoked) {
          clearAuthCookies(res);
          return errorResponse(res, 'Session révoquée, veuillez vous reconnecter', 401, null, 'TOKEN_REVOKED');
        }
      }

      // Récupérer l'utilisateur depuis la BDD
      const user = await db.User.findByPk(decoded.userId, {
        attributes: { exclude: ['password_hash', 'email_verification_token'] },
      });

      if (!user || user.status === 'inactive') {
        clearAuthCookies(res);
        return errorResponse(res, 'Compte non disponible', 403, null, 'ACCOUNT_INACTIVE');
      }

      // Émettre un nouveau access token
      const newToken = generateJWT({ id: user.id, email: user.email, role: user.role });

      res.cookie('accessToken', newToken, {
        ...COOKIE_BASE,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(
        res,
        {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
          },
        },
        'Session renouvelée'
      );
    } catch (error) {
      console.error('Erreur refreshToken:', error);
      return serverErrorResponse(res, 'Erreur lors du renouvellement de session', error);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      // TODO: implémenter l'envoi d'email de réinitialisation
      return successResponse(
        res,
        null,
        'Si cette adresse email existe, vous recevrez un lien de réinitialisation dans quelques minutes.'
      );
    } catch (error) {
      return serverErrorResponse(res, 'Erreur lors de la demande de réinitialisation', error);
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      // TODO: implémenter la réinitialisation du mot de passe
      return successResponse(res, null, 'Mot de passe réinitialisé avec succès.');
    } catch (error) {
      return serverErrorResponse(res, 'Erreur lors de la réinitialisation', error);
    }
  }

  /**
   * GET /api/auth/verify-email/:token
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      if (!token) return errorResponse(res, 'Token manquant', 400, null, 'MISSING_TOKEN');
      // TODO: implémenter la vérification d'email
      return successResponse(res, null, 'Email vérifié avec succès');
    } catch (error) {
      return serverErrorResponse(res, "Erreur lors de la vérification de l'email", error);
    }
  }

  /**
   * POST /api/auth/resend-verification
   */
  async resendVerification(req, res) {
    try {
      // TODO: renvoyer l'email de vérification
      return successResponse(res, null, 'Email de vérification renvoyé.');
    } catch (error) {
      return serverErrorResponse(res, "Erreur lors du renvoi", error);
    }
  }

  /**
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      // TODO: implémenter le changement de mot de passe
      return successResponse(res, null, 'Mot de passe modifié avec succès');
    } catch (error) {
      return serverErrorResponse(res, 'Erreur lors du changement de mot de passe', error);
    }
  }
}

const authController = new AuthController();
export default authController;
