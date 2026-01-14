import ProfileService from '../services/profileService.js';
import { successResponse, errorResponse } from '../utils/response.js';

class ProfileController {
  // GET /api/profile - Récupérer le profil complet
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await ProfileService.getFullProfile(userId);
      return successResponse(res, 'Profil récupéré avec succès', profile);
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // PUT /api/profile/personal-info - Mettre à jour les informations personnelles
  static async updatePersonalInfo(req, res) {
    try {
      const userId = req.user.id;
      const user = await ProfileService.updatePersonalInfo(userId, req.body);
      return successResponse(res, 'Informations personnelles mises à jour avec succès', user);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations personnelles:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // === EXPÉRIENCES ===
  static async createExperience(req, res) {
    try {
      const userId = req.user.id;
      const experience = await ProfileService.createExperience(userId, req.body);
      return successResponse(res, 'Expérience ajoutée avec succès', experience, 201);
    } catch (error) {
      console.error('Erreur lors de la création de l\'expérience:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateExperience(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const experience = await ProfileService.updateExperience(userId, id, req.body);
      return successResponse(res, 'Expérience mise à jour avec succès', experience);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'expérience:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteExperience(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await ProfileService.deleteExperience(userId, id);
      return successResponse(res, result.message);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'expérience:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // === FORMATIONS ===
  static async createEducation(req, res) {
    try {
      const userId = req.user.id;
      const education = await ProfileService.createEducation(userId, req.body);
      return successResponse(res, 'Formation ajoutée avec succès', education, 201);
    } catch (error) {
      console.error('Erreur lors de la création de la formation:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateEducation(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const education = await ProfileService.updateEducation(userId, id, req.body);
      return successResponse(res, 'Formation mise à jour avec succès', education);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la formation:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteEducation(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await ProfileService.deleteEducation(userId, id);
      return successResponse(res, result.message);
    } catch (error) {
      console.error('Erreur lors de la suppression de la formation:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // === COMPÉTENCES ===
  static async createSkill(req, res) {
    try {
      const userId = req.user.id;
      const skill = await ProfileService.createSkill(userId, req.body);
      return successResponse(res, 'Compétence ajoutée avec succès', skill, 201);
    } catch (error) {
      console.error('Erreur lors de la création de la compétence:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateSkill(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const skill = await ProfileService.updateSkill(userId, id, req.body);
      return successResponse(res, 'Compétence mise à jour avec succès', skill);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la compétence:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteSkill(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await ProfileService.deleteSkill(userId, id);
      return successResponse(res, result.message);
    } catch (error) {
      console.error('Erreur lors de la suppression de la compétence:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // === LANGUES ===
  static async createLanguage(req, res) {
    try {
      const userId = req.user.id;
      const language = await ProfileService.createLanguage(userId, req.body);
      return successResponse(res, 'Langue ajoutée avec succès', language, 201);
    } catch (error) {
      console.error('Erreur lors de la création de la langue:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async updateLanguage(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const language = await ProfileService.updateLanguage(userId, id, req.body);
      return successResponse(res, 'Langue mise à jour avec succès', language);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la langue:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  static async deleteLanguage(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const result = await ProfileService.deleteLanguage(userId, id);
      return successResponse(res, result.message);
    } catch (error) {
      console.error('Erreur lors de la suppression de la langue:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // POST /api/profile/upload-photo - Upload de photo de profil
  static async uploadPhoto(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Aucun fichier fourni', 400);
      }

      const userId = req.user.userId;
      const photoUrl = `/uploads/photos/${req.file.filename}`;

      // Mettre à jour l'URL de la photo dans le profil
      const user = await ProfileService.updatePersonalInfo(userId, { photoUrl });

      return successResponse(res, 'Photo de profil uploadée avec succès', { photoUrl });
    } catch (error) {
      console.error('Erreur lors de l\'upload de la photo:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // POST /api/profile/upload-cv - Upload et extraction de CV
  static async uploadCV(req, res) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Aucun fichier fourni', 400);
      }

      const userId = req.user.userId;
      const filePath = req.file.path;

      // Importer le service d'extraction
      const CVExtractionService = (await import('../services/cvExtractionService.js')).default;

      // Extraire les données du CV avec l'IA
      const extractedData = await CVExtractionService.processCVFile(filePath);

      // Mettre à jour le profil avec les données extraites
      if (extractedData.personalInfo) {
        const personalInfoToUpdate = {};
        if (extractedData.personalInfo.firstName) personalInfoToUpdate.firstName = extractedData.personalInfo.firstName;
        if (extractedData.personalInfo.lastName) personalInfoToUpdate.lastName = extractedData.personalInfo.lastName;
        if (extractedData.personalInfo.phone) personalInfoToUpdate.phone = extractedData.personalInfo.phone;
        if (extractedData.personalInfo.location) personalInfoToUpdate.location = extractedData.personalInfo.location;
        if (extractedData.personalInfo.bio) personalInfoToUpdate.bio = extractedData.personalInfo.bio;

        if (Object.keys(personalInfoToUpdate).length > 0) {
          await ProfileService.updatePersonalInfo(userId, personalInfoToUpdate);
        }
      }

      // Créer les expériences
      if (extractedData.experiences && extractedData.experiences.length > 0) {
        for (const exp of extractedData.experiences) {
          await ProfileService.createExperience(userId, exp);
        }
      }

      // Créer les formations
      if (extractedData.educations && extractedData.educations.length > 0) {
        for (const edu of extractedData.educations) {
          await ProfileService.createEducation(userId, edu);
        }
      }

      // Créer les compétences
      if (extractedData.skills && extractedData.skills.length > 0) {
        for (const skill of extractedData.skills) {
          await ProfileService.createSkill(userId, skill);
        }
      }

      // Créer les langues
      if (extractedData.languages && extractedData.languages.length > 0) {
        for (const lang of extractedData.languages) {
          await ProfileService.createLanguage(userId, lang);
        }
      }

      // Récupérer le profil complet mis à jour
      const updatedProfile = await ProfileService.getFullProfile(userId);

      return successResponse(res, 'CV analysé et profil mis à jour avec succès', {
        extractedData,
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload du CV:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

export default ProfileController;
