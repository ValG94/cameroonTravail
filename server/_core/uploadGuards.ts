/**
 * Validations de sécurité pour les uploads de fichiers.
 *
 * Couche défensive en plus de la vérification des magic bytes (file-type) :
 *  - Extension cohérente avec le contenu déclaré
 *  - Détection de JavaScript embarqué dans les PDFs (vecteurs d'attaque
 *    courants : auto-execution sur ouverture, exfiltration de données)
 *  - Sanitisation du nom de fichier (anti path traversal, anti scripts)
 *
 * Limite reconnue : on ne fait pas de scan antivirus complet ici. Pour cela,
 * roadmap Phase 2+ : intégrer ClamAV (self-hosted Railway) ou VirusTotal API.
 */

const PDF_JS_PATTERNS = [
  // Action JavaScript déclenchée par certains événements
  /\/JavaScript\s/i,
  /\/JS\s/i,
  // Lancement d'une action externe / exécution
  /\/Launch\s/i,
  // SubmitForm / EmbeddedFile peuvent aussi être suspects
  /\/SubmitForm\s/i,
  // OpenAction auto-exécutée à l'ouverture
  /\/OpenAction\s/i,
];

const ALLOWED_PDF_EXTENSIONS = [".pdf"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export interface ValidationResult {
  ok: boolean;
  /** Code interne pour i18n / logs (non exposé brut à l'utilisateur si sensible) */
  code?:
    | "BAD_EXTENSION"
    | "MIME_EXTENSION_MISMATCH"
    | "SUSPICIOUS_PDF"
    | "EMPTY_FILE"
    | "FILENAME_INVALID";
  /** Message utilisateur prêt à afficher */
  message?: string;
}

/** Extrait l'extension en minuscules (ex: ".pdf"). */
export function getExtension(fileName: string): string {
  const m = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
  return m ? m[0] : "";
}

/**
 * Sanitise un nom de fichier pour stockage / affichage.
 * - Retire les segments de path (../)
 * - Garde seulement [a-zA-Z0-9._-] et espaces simples
 * - Tronque à 100 caractères
 */
export function sanitizeFilename(name: string): string {
  if (!name) return "fichier";
  const base = name.replace(/^.*[\\/]/, ""); // retire le path
  const clean = base
    .replace(/[^\w.\- ]+/g, "_") // remplace tout caractère bizarre par _
    .replace(/\s+/g, " ") // condense les espaces
    .replace(/^_+|_+$/g, "")
    .slice(0, 100);
  return clean || "fichier";
}

/**
 * Sanitise une CLÉ de stockage (path avec slashes) pour empêcher :
 *  - path traversal (`..`)
 *  - chemins absolus (`/foo/bar`)
 *  - caractères de control
 * Garde les slashes pour préserver la structure de bucket.
 */
export function sanitizeStorageKey(key: string): string {
  if (!key) return "";
  return key
    .replace(/^[\\/]+/, "") // pas de leading slash
    .replace(/\.\.[\\/]/g, "") // pas de ../
    .replace(/[\x00-\x1f]/g, "") // pas de control chars
    .slice(0, 500);
}

/** Vérifie qu'un nom de fichier ne contient pas de motifs dangereux. */
export function validateFilename(fileName: string): ValidationResult {
  if (!fileName || fileName.length === 0) {
    return { ok: false, code: "FILENAME_INVALID", message: "Nom de fichier invalide" };
  }
  // Caractères de control + null byte + segments de path
  if (/[\x00-\x1f]|\.\.[\\/]|^[\\/]/.test(fileName)) {
    return { ok: false, code: "FILENAME_INVALID", message: "Nom de fichier invalide" };
  }
  return { ok: true };
}

/** Validation PDF : extension + signature de scripts embarqués. */
export function validatePdfUpload(
  buffer: Buffer,
  fileName: string,
  detectedMime: string | undefined
): ValidationResult {
  if (!buffer || buffer.length === 0) {
    return { ok: false, code: "EMPTY_FILE", message: "Fichier vide" };
  }

  const fnCheck = validateFilename(fileName);
  if (!fnCheck.ok) return fnCheck;

  const ext = getExtension(fileName);
  if (!ALLOWED_PDF_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      code: "BAD_EXTENSION",
      message: "Seuls les fichiers PDF (.pdf) sont acceptés",
    };
  }

  if (detectedMime !== "application/pdf") {
    return {
      ok: false,
      code: "MIME_EXTENSION_MISMATCH",
      message: "Le contenu du fichier ne correspond pas à un PDF valide",
    };
  }

  // Heuristique anti-JS : scanne seulement l'en-tête (premiers 256 Ko)
  // pour limiter le coût CPU sur de gros fichiers
  const head = buffer.subarray(0, Math.min(buffer.length, 256 * 1024)).toString("latin1");
  if (PDF_JS_PATTERNS.some((re) => re.test(head))) {
    return {
      ok: false,
      code: "SUSPICIOUS_PDF",
      message:
        "Ce PDF contient du contenu actif (JavaScript ou actions automatiques) et a été refusé pour des raisons de sécurité.",
    };
  }

  return { ok: true };
}

/** Validation image : extension + mime détecté. */
export function validateImageUpload(
  buffer: Buffer,
  fileName: string,
  detectedMime: string | undefined
): ValidationResult {
  if (!buffer || buffer.length === 0) {
    return { ok: false, code: "EMPTY_FILE", message: "Fichier vide" };
  }

  const fnCheck = validateFilename(fileName);
  if (!fnCheck.ok) return fnCheck;

  const ext = getExtension(fileName);
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return {
      ok: false,
      code: "BAD_EXTENSION",
      message: "Seules les images JPEG, PNG et WEBP sont acceptées",
    };
  }

  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (!detectedMime || !allowedMimes.includes(detectedMime)) {
    return {
      ok: false,
      code: "MIME_EXTENSION_MISMATCH",
      message: "Le contenu du fichier ne correspond pas à une image valide",
    };
  }

  return { ok: true };
}
