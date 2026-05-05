import express from 'express';
import ProfileController from '../controllers/profileController.js';
import { authenticate } from '../middlewares/auth.js';
import { uploadPhoto, uploadCV } from '../config/multer.js';
import { validateImageUpload, validatePdfUpload } from '../middlewares/fileValidation.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Profil général
router.get('/', ProfileController.getProfile);
router.put('/personal-info', ProfileController.updatePersonalInfo);

// Upload de fichiers — multer stocke sur disque, puis fileValidation vérifie les magic bytes
router.post('/upload-photo', uploadPhoto, validateImageUpload, ProfileController.uploadPhoto);
router.post('/upload-cv', uploadCV, validatePdfUpload, ProfileController.uploadCV);

// Expériences
router.post('/experiences', ProfileController.createExperience);
router.put('/experiences/:id', ProfileController.updateExperience);
router.delete('/experiences/:id', ProfileController.deleteExperience);

// Formations
router.post('/educations', ProfileController.createEducation);
router.put('/educations/:id', ProfileController.updateEducation);
router.delete('/educations/:id', ProfileController.deleteEducation);

// Compétences
router.post('/skills', ProfileController.createSkill);
router.put('/skills/:id', ProfileController.updateSkill);
router.delete('/skills/:id', ProfileController.deleteSkill);

// Langues
router.post('/languages', ProfileController.createLanguage);
router.put('/languages/:id', ProfileController.updateLanguage);
router.delete('/languages/:id', ProfileController.deleteLanguage);

export default router;
