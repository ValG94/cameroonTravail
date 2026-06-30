/**
 * Liste des villes du Cameroun acceptées dans les formulaires
 * d'inscription. Couvre les chefs-lieux de région + les principales
 * villes des 10 régions (60+ entrées).
 *
 * La comparaison est tolérante :
 * - insensible à la casse
 * - insensible aux accents (Yaoundé == YAOUNDE)
 * - trim des espaces de bord
 */

export const VILLES_CAMEROUN: string[] = [
  // ─── 10 chefs-lieux de région ───
  "Yaoundé",
  "Douala",
  "Garoua",
  "Bamenda",
  "Bafoussam",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Ebolowa",
  "Buéa",

  // ─── Autres villes majeures ───
  "Kribi",
  "Limbé",
  "Edéa",
  "Kumba",
  "Dschang",
  "Loum",
  "Mbalmayo",
  "Nkongsamba",
  "Foumban",
  "Bafia",
  "Banyo",
  "Kousséri",
  "Mokolo",
  "Yagoua",
  "Sangmélima",
  "Bafang",
  "Bangangté",
  "Tiko",
  "Mbouda",
  "Tibati",
  "Garoua-Boulaï",
  "Batouri",
  "Akonolinga",
  "Obala",
  "Mbanga",
  "Penja",
  "Manjo",
  "Yokadouma",
  "Abong-Mbang",
  "Eseka",
  "Tonga",
  "Foumbot",
  "Mfou",
  "Yabassi",
  "Lolodorf",
  "Kaélé",
  "Mora",
  "Bogo",
  "Tcholliré",
  "Mbé",
  "Guider",
  "Poli",
  "Touboro",
  "Pitoa",
  "Figuil",
  "Wum",
  "Nkambé",
  "Fundong",
  "Mbengwi",
  "Batibo",
  "Mamfé",
  "Ndian",
  "Mundemba",
  "Idenau",
  "Muyuka",
  "Meiganga",
  "Djoum",
  "Mbang",
  "Lomié",
  "Bélabo",
  "Doumé",
  "Akom II",
];

/**
 * Normalise une chaîne pour comparaison : passage en minuscules,
 * suppression des accents diacritiques (range U+0300 → U+036F :
 * combining diacritical marks), trim. Permet de matcher "YAOUNDE"
 * avec "Yaoundé", "kribi " avec "Kribi", etc.
 */
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

const VILLES_NORMALIZED = new Set(VILLES_CAMEROUN.map(normalize));

/**
 * Retourne `true` si la chaîne correspond à une ville camerounaise
 * connue (comparaison tolérante). Une chaîne vide renvoie `false`.
 */
export function isCameroonCity(input: string): boolean {
  if (!input) return false;
  return VILLES_NORMALIZED.has(normalize(input));
}
