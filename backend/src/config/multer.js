import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer les dossiers s'ils n'existent pas
const uploadsDir = path.join(__dirname, '../../uploads');
const photosDir = path.join(uploadsDir, 'photos');
const cvsDir = path.join(uploadsDir, 'cvs');

[uploadsDir, photosDir, cvsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configuration du stockage pour les photos de profil
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.userId}-${uniqueSuffix}${ext}`);
  }
});

// Configuration du stockage pour les CVs
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cvsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `cv-${req.user.userId}-${uniqueSuffix}.pdf`);
  }
});

// Filtre pour les images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, JPG, PNG, WEBP) sont autorisées'));
  }
};

// Filtre pour les PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    return cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés'));
  }
};

// Middleware pour l'upload de photo de profil
export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
}).single('photo');

// Middleware pour l'upload de CV
export const uploadCV = multer({
  storage: cvStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
}).single('cv');

export default {
  uploadPhoto,
  uploadCV
};
