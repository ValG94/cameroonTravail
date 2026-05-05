import multer from 'multer';

// Stockage en mémoire — le buffer est transmis directement à Supabase Storage.
// Avantage : aucun fichier temporaire sur disque, compatible Railway/Vercel.
const memStorage = multer.memoryStorage();

// Filtre MIME déclaratif (première ligne de défense — peut être contourné)
// La vérification des magic bytes réels est faite après par fileValidation.js
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images JPEG, PNG et WEBP sont autorisées.'));
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers PDF sont autorisés.'));
  }
};

export const uploadPhoto = multer({
  storage: memStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
}).single('photo');

export const uploadCV = multer({
  storage: memStorage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 Mo
}).single('cv');

export default { uploadPhoto, uploadCV };
