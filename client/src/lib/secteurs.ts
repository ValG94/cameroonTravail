/**
 * Liste partagée des secteurs d'activité utilisée dans :
 *  - le formulaire d'inscription employeur
 *  - le formulaire de publication d'offre
 *  - la modification d'offre
 *  - le profil employeur
 *
 * Garder synchro : si un secteur est ajouté/renommé ici, il s'applique partout.
 */
export const SECTEURS = [
  "Administration publique",
  "Agriculture",
  "Audiovisuel",
  "Banque / Finance",
  "BTP / Construction",
  "Commerce / Vente",
  "Communication / Marketing",
  "Éducation / Formation",
  "Énergie",
  "Hôtellerie / Restauration",
  "Industrie",
  "Informatique / IT",
  "Juridique",
  "Santé",
  "Service",
  "Télécommunications",
  "Transport / Logistique",
  "Autre",
] as const;

export type Secteur = (typeof SECTEURS)[number];
