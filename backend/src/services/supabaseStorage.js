import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour le stockage de fichiers.');
}

// Connexion admin (service role bypass RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Initialisation des buckets ───────────────────────────────────────────────

async function ensureBucket(name, isPublic) {
  const { data } = await supabase.storage.getBucket(name);
  if (!data) {
    const { error } = await supabase.storage.createBucket(name, { public: isPublic });
    if (error) {
      console.error(`❌ Impossible de créer le bucket "${name}" :`, error.message);
    } else {
      console.log(`✅ Bucket Supabase Storage créé : "${name}" (${isPublic ? 'public' : 'privé'})`);
    }
  }
}

/**
 * Crée les buckets photos (public) et cvs (privé) si inexistants.
 * À appeler au démarrage du serveur.
 */
export async function initStorageBuckets() {
  try {
    await Promise.all([
      ensureBucket('photos', true),  // URL publiques directes
      ensureBucket('cvs', false),    // URLs signées avec expiration
    ]);
  } catch (err) {
    console.error('❌ Erreur initialisation Supabase Storage :', err.message);
  }
}

// ─── Upload photo de profil ───────────────────────────────────────────────────

/**
 * @param {string} userId
 * @param {Buffer} buffer
 * @param {string} mimetype  ex: 'image/jpeg'
 * @returns {Promise<string>}  URL publique permanente
 */
export async function uploadProfilePhoto(userId, buffer, mimetype) {
  const ext = mimetype.split('/')[1] || 'jpg';
  const path = `${userId}/profile-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('photos')
    .upload(path, buffer, { contentType: mimetype, upsert: true });

  if (error) throw new Error(`Upload photo échoué : ${error.message}`);

  const { data } = supabase.storage.from('photos').getPublicUrl(path);
  return data.publicUrl;
}

// ─── Upload CV ────────────────────────────────────────────────────────────────

/**
 * @param {string} userId
 * @param {Buffer} buffer
 * @returns {Promise<string>}  Chemin dans le bucket (pour générer des URLs signées)
 */
export async function uploadCV(userId, buffer) {
  const storagePath = `${userId}/cv-${Date.now()}.pdf`;

  const { error } = await supabase.storage
    .from('cvs')
    .upload(storagePath, buffer, { contentType: 'application/pdf', upsert: true });

  if (error) throw new Error(`Upload CV échoué : ${error.message}`);

  return storagePath;
}

/**
 * Génère une URL signée pour télécharger un CV privé.
 * @param {string} storagePath  Chemin retourné par uploadCV
 * @param {number} expiresIn    Durée en secondes (défaut : 1 heure)
 * @returns {Promise<string>}
 */
export async function getSignedCvUrl(storagePath, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from('cvs')
    .createSignedUrl(storagePath, expiresIn);

  if (error) throw new Error(`Génération URL signée échouée : ${error.message}`);
  return data.signedUrl;
}
