import { fileTypeFromBuffer } from 'file-type';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const PDF_MIME = 'application/pdf';

/**
 * Valide les magic bytes d'une image après multer (memoryStorage).
 * Protège contre les fichiers malveillants renommés en .jpg/.png.
 * Aucun fichier disque à nettoyer — le buffer est en mémoire.
 */
export const validateImageUpload = async (req, res, next) => {
  if (!req.file) return next();

  const detected = await fileTypeFromBuffer(req.file.buffer).catch(() => null);

  if (!detected || !IMAGE_MIMES.has(detected.mime)) {
    return res.status(400).json({
      success: false,
      message: 'Fichier invalide. Seules les images JPEG, PNG et WEBP sont acceptées.',
      errorCode: 'INVALID_FILE_TYPE',
    });
  }

  next();
};

/**
 * Valide les magic bytes d'un PDF après multer (memoryStorage).
 */
export const validatePdfUpload = async (req, res, next) => {
  if (!req.file) return next();

  const detected = await fileTypeFromBuffer(req.file.buffer).catch(() => null);

  if (!detected || detected.mime !== PDF_MIME) {
    return res.status(400).json({
      success: false,
      message: 'Fichier invalide. Seul le format PDF est accepté.',
      errorCode: 'INVALID_FILE_TYPE',
    });
  }

  next();
};
