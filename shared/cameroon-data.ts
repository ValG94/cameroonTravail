/**
 * Données géographiques du Cameroun
 * 10 régions avec leurs villes principales
 */

export const CAMEROON_REGIONS = [
  { value: "adamaoua", labelFr: "Adamaoua", labelEn: "Adamawa" },
  { value: "centre", labelFr: "Centre", labelEn: "Centre" },
  { value: "est", labelFr: "Est", labelEn: "East" },
  { value: "extreme-nord", labelFr: "Extrême-Nord", labelEn: "Far North" },
  { value: "littoral", labelFr: "Littoral", labelEn: "Littoral" },
  { value: "nord", labelFr: "Nord", labelEn: "North" },
  { value: "nord-ouest", labelFr: "Nord-Ouest", labelEn: "Northwest" },
  { value: "ouest", labelFr: "Ouest", labelEn: "West" },
  { value: "sud", labelFr: "Sud", labelEn: "South" },
  { value: "sud-ouest", labelFr: "Sud-Ouest", labelEn: "Southwest" },
] as const;

export const CAMEROON_CITIES_BY_REGION: Record<string, string[]> = {
  adamaoua: ["Ngaoundéré", "Meiganga", "Tignère", "Banyo", "Tibati"],
  centre: ["Yaoundé", "Mbalmayo", "Obala", "Eséka", "Mfou", "Bafia", "Akonolinga"],
  est: ["Bertoua", "Batouri", "Abong-Mbang", "Yokadouma", "Doumé"],
  "extreme-nord": ["Maroua", "Kousseri", "Mokolo", "Yagoua", "Kaélé", "Mora"],
  littoral: ["Douala", "Nkongsamba", "Edéa", "Loum", "Yabassi", "Dizangué"],
  nord: ["Garoua", "Guider", "Lagdo", "Poli", "Tcholliré", "Rey Bouba"],
  "nord-ouest": ["Bamenda", "Kumbo", "Wum", "Fundong", "Mbengwi", "Ndop"],
  ouest: ["Bafoussam", "Foumban", "Dschang", "Mbouda", "Bangangté", "Foumbot"],
  sud: ["Ebolowa", "Kribi", "Sangmélima", "Ambam", "Lolodorf"],
  "sud-ouest": ["Buea", "Limbe", "Kumba", "Mamfe", "Tiko", "Muyuka"],
};

export const ALL_CAMEROON_CITIES = Object.values(CAMEROON_CITIES_BY_REGION).flat().sort();

/**
 * Types de contrat de travail
 */
export const CONTRACT_TYPES = [
  { value: "cdi", labelFr: "CDI (Contrat à Durée Indéterminée)", labelEn: "Permanent Contract" },
  { value: "cdd", labelFr: "CDD (Contrat à Durée Déterminée)", labelEn: "Fixed-term Contract" },
  { value: "stage", labelFr: "Stage", labelEn: "Internship" },
  { value: "freelance", labelFr: "Freelance", labelEn: "Freelance" },
  { value: "temps-partiel", labelFr: "Temps partiel", labelEn: "Part-time" },
  { value: "temps-plein", labelFr: "Temps plein", labelEn: "Full-time" },
  { value: "vacataire", labelFr: "Vacataire", labelEn: "Temporary Worker" },
] as const;

/**
 * Secteurs d'activité
 */
export const BUSINESS_SECTORS = [
  { value: "administration", labelFr: "Administration publique", labelEn: "Public Administration" },
  { value: "agriculture", labelFr: "Agriculture", labelEn: "Agriculture" },
  { value: "banque", labelFr: "Banque et Finance", labelEn: "Banking and Finance" },
  { value: "commerce", labelFr: "Commerce et Distribution", labelEn: "Retail and Distribution" },
  { value: "construction", labelFr: "Construction et BTP", labelEn: "Construction" },
  { value: "education", labelFr: "Éducation et Formation", labelEn: "Education and Training" },
  { value: "energie", labelFr: "Énergie", labelEn: "Energy" },
  { value: "hotellerie", labelFr: "Hôtellerie et Restauration", labelEn: "Hospitality and Catering" },
  { value: "industrie", labelFr: "Industrie", labelEn: "Industry" },
  { value: "informatique", labelFr: "Informatique et Technologies", labelEn: "IT and Technology" },
  { value: "sante", labelFr: "Santé", labelEn: "Healthcare" },
  { value: "telecommunication", labelFr: "Télécommunication", labelEn: "Telecommunications" },
  { value: "transport", labelFr: "Transport et Logistique", labelEn: "Transport and Logistics" },
  { value: "tourisme", labelFr: "Tourisme", labelEn: "Tourism" },
  { value: "autre", labelFr: "Autre", labelEn: "Other" },
] as const;

/**
 * Format de numéro de téléphone camerounais
 * Format: +237 6XX XXX XXX
 */
export const CAMEROON_PHONE_REGEX = /^\+237[26]\d{8}$/;
export const CAMEROON_PHONE_FORMAT = "+237 6XX XXX XXX";

/**
 * Devise: Franc CFA (XAF)
 */
export const CURRENCY = {
  code: "XAF",
  symbol: "FCFA",
  name: "Franc CFA",
};

/**
 * Formater un montant en Francs CFA
 */
export function formatCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Valider un numéro de téléphone camerounais
 */
export function isValidCameroonPhone(phone: string): boolean {
  return CAMEROON_PHONE_REGEX.test(phone);
}

/**
 * Formater un numéro de téléphone camerounais
 */
export function formatCameroonPhone(phone: string): string {
  // Supprimer tous les espaces et caractères non numériques sauf +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Si le numéro commence par 6 ou 2, ajouter +237
  if (/^[26]\d{8}$/.test(cleaned)) {
    return `+237 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  // Si le numéro commence déjà par +237
  if (cleaned.startsWith('+237')) {
    const number = cleaned.slice(4);
    return `+237 ${number.slice(0, 1)} ${number.slice(1, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }
  
  return phone;
}
