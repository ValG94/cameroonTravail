import ProfileService from '../services/profileService.js';
import CVExtractionService from '../services/cvExtractionService.js';
import {
  uploadProfilePhoto,
  uploadCV as uploadCVToStorage,
} from '../services/supabaseStorage.js';
import db from '../../models/index.js';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/response.js';

class ProfileController {
  // GET /api/profile
  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const profile = await ProfileService.getFullProfile(userId);
      return successResponse(res, profile, 'Profil récupéré avec succès');
    } catch (error) {
      return serverErrorResponse(res, 'Erreur lors de la récupération du profil', error);
    }
  }

  // PUT /api/profile/personal-info
  static async updatePersonalInfo(req, res) {
    try {
      const userId = req.user.userId;
      const user = await ProfileService.updatePersonalInfo(userId, req.body);
      return successResponse(res, user, 'Informations personnelles mises à jour');
    } catch (error) {
      return serverErrorResponse(res, 'Erreur lors de la mise à jour', error);
    }
  }

  // POST /api/profile/upload-photo
  static async uploadPhoto(req, res) {
    try {
      if (!req.file) return errorResponse(res, 'Aucun fichier fourni', 400);

      const userId = req.user.userId;

      // Upload vers Supabase Storage → URL publique permanente
      const photoUrl = await uploadProfilePhoto(userId, req.file.buffer, req.file.mimetype);

      // Sauvegarder l'URL dans le profil
      await db.User.update({ profile_picture: photoUrl }, { where: { id: userId } });

      return successResponse(res, { photoUrl }, 'Photo de profil mise à jour avec succès');
    } catch (error) {
      return serverErrorResponse(res, "Erreur lors de l'upload de la photo", error);
    }
  }

  // POST /api/profile/upload-cv
  static async uploadCV(req, res) {
    try {
      if (!req.file) return errorResponse(res, 'Aucun fichier fourni', 400);

      const userId = req.user.userId;
      const buffer = req.file.buffer;

      // Upload Supabase + extraction IA en parallèle
      const [cvStoragePath, extractedData] = await Promise.all([
        uploadCVToStorage(userId, buffer),
        CVExtractionService.processCVBuffer(buffer),
      ]);

      // Sauvegarder le chemin Supabase du CV
      await db.User.update({ cv_url: cvStoragePath }, { where: { id: userId } });

      // Populer le profil avec les données extraites du CV
      if (extractedData.personalInfo) {
        const personalInfo = {};
        const pi = extractedData.personalInfo;
        if (pi.phone) personalInfo.phone = pi.phone;
        if (pi.location) personalInfo.location = pi.location;
        if (pi.bio) personalInfo.bio = pi.bio;
        if (Object.keys(personalInfo).length > 0) {
          await ProfileService.updatePersonalInfo(userId, personalInfo);
        }
      }

      if (extractedData.experiences?.length > 0) {
        for (const exp of extractedData.experiences) {
          await ProfileService.createExperience(userId, exp);
        }
      }

      if (extractedData.educations?.length > 0) {
        for (const edu of extractedData.educations) {
          await ProfileService.createEducation(userId, edu);
        }
      }

      if (extractedData.skills?.length > 0) {
        for (const skill of extractedData.skills) {
          await ProfileService.createSkill(userId, skill);
        }
      }

      if (extractedData.languages?.length > 0) {
        for (const lang of extractedData.languages) {
          await ProfileService.createLanguage(userId, lang);
        }
      }

      const updatedProfile = await ProfileService.getFullProfile(userId);

      return successResponse(
        res,
        { extractedData, profile: updatedProfile },
        'CV analysé et profil mis à jour avec succès'
      );
    } catch (error) {
      return serverErrorResponse(res, "Erreur lors de l'analyse du CV", error);
    }
  }

  // === EXPÉRIENCES ===

  static async createExperience(req, res) {
    try {
      const exp = await ProfileService.createExperience(req.user.userId, req.body);
      return successResponse(res, exp, 'Expérience ajoutée avec succès', 201);
    } catch (error) {
      return serverErrorResponse(res, "Erreur création expérience", error);
    }
  }

  static async updateExperience(req, res) {
    try {
      const exp = await ProfileService.updateExperience(req.user.userId, req.params.id, req.body);
      return successResponse(res, exp, 'Expérience mise à jour avec succès');
    } catch (error) {
      return serverErrorResponse(res, "Erreur mise à jour expérience", error);
    }
  }

  static async deleteExperience(req, res) {
    try {
      const result = await ProfileService.deleteExperience(req.user.userId, req.params.id);
      return successResponse(res, null, result.message);
    } catch (error) {
      return serverErrorResponse(res, "Erreur suppression expérience", error);
    }
  }

  // === FORMATIONS ===

  static async createEducation(req, res) {
    try {
      const edu = await ProfileService.createEducation(req.user.userId, req.body);
      return successResponse(res, edu, 'Formation ajoutée avec succès', 201);
    } catch (error) {
      return serverErrorResponse(res, "Erreur création formation", error);
    }
  }

  static async updateEducation(req, res) {
    try {
      const edu = await ProfileService.updateEducation(req.user.userId, req.params.id, req.body);
      return successResponse(res, edu, 'Formation mise à jour avec succès');
    } catch (error) {
      return serverErrorResponse(res, "Erreur mise à jour formation", error);
    }
  }

  static async deleteEducation(req, res) {
    try {
      const result = await ProfileService.deleteEducation(req.user.userId, req.params.id);
      return successResponse(res, null, result.message);
    } catch (error) {
      return serverErrorResponse(res, "Erreur suppression formation", error);
    }
  }

  // === COMPÉTENCES ===

  static async createSkill(req, res) {
    try {
      const skill = await ProfileService.createSkill(req.user.userId, req.body);
      return successResponse(res, skill, 'Compétence ajoutée avec succès', 201);
    } catch (error) {
      return serverErrorResponse(res, "Erreur création compétence", error);
    }
  }

  static async updateSkill(req, res) {
    try {
      const skill = await ProfileService.updateSkill(req.user.userId, req.params.id, req.body);
      return successResponse(res, skill, 'Compétence mise à jour avec succès');
    } catch (error) {
      return serverErrorResponse(res, "Erreur mise à jour compétence", error);
    }
  }

  static async deleteSkill(req, res) {
    try {
      const result = await ProfileService.deleteSkill(req.user.userId, req.params.id);
      return successResponse(res, null, result.message);
    } catch (error) {
      return serverErrorResponse(res, "Erreur suppression compétence", error);
    }
  }

  // === LANGUES ===

  static async createLanguage(req, res) {
    try {
      const lang = await ProfileService.createLanguage(req.user.userId, req.body);
      return successResponse(res, lang, 'Langue ajoutée avec succès', 201);
    } catch (error) {
      return serverErrorResponse(res, "Erreur création langue", error);
    }
  }

  static async updateLanguage(req, res) {
    try {
      const lang = await ProfileService.updateLanguage(req.user.userId, req.params.id, req.body);
      return successResponse(res, lang, 'Langue mise à jour avec succès');
    } catch (error) {
      return serverErrorResponse(res, "Erreur mise à jour langue", error);
    }
  }

  static async deleteLanguage(req, res) {
    try {
      const result = await ProfileService.deleteLanguage(req.user.userId, req.params.id);
      return successResponse(res, null, result.message);
    } catch (error) {
      return serverErrorResponse(res, "Erreur suppression langue", error);
    }
  }
}

export default ProfileController;
