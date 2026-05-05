// Régions et villes principales du Cameroun

export const regions = [
  "Adamaoua",
  "Centre",
  "Est",
  "Extrême-Nord",
  "Littoral",
  "Nord",
  "Nord-Ouest",
  "Ouest",
  "Sud",
  "Sud-Ouest",
] as const;

export type Region = typeof regions[number];

export const villesParRegion: Record<Region, string[]> = {
  "Adamaoua": [
    "Ngaoundéré",
    "Meiganga",
    "Tibati",
    "Tignère",
    "Banyo",
    "Kontcha",
  ],
  "Centre": [
    "Yaoundé",
    "Mbalmayo",
    "Obala",
    "Eséka",
    "Mfou",
    "Bafia",
    "Nanga-Eboko",
    "Akonolinga",
    "Mbankomo",
    "Soa",
  ],
  "Est": [
    "Bertoua",
    "Abong-Mbang",
    "Batouri",
    "Yokadouma",
    "Doumé",
    "Lomié",
  ],
  "Extrême-Nord": [
    "Maroua",
    "Kousseri",
    "Mokolo",
    "Yagoua",
    "Kaélé",
    "Mora",
    "Guider",
  ],
  "Littoral": [
    "Douala",
    "Edéa",
    "Nkongsamba",
    "Loum",
    "Manjo",
    "Dizangué",
    "Penja",
  ],
  "Nord": [
    "Garoua",
    "Guider",
    "Figuil",
    "Poli",
    "Tcholliré",
    "Rey-Bouba",
  ],
  "Nord-Ouest": [
    "Bamenda",
    "Kumbo",
    "Wum",
    "Fundong",
    "Mbengwi",
    "Nkambe",
    "Ndop",
  ],
  "Ouest": [
    "Bafoussam",
    "Foumban",
    "Dschang",
    "Mbouda",
    "Bafang",
    "Bandjoun",
    "Baham",
    "Bangangté",
  ],
  "Sud": [
    "Ebolowa",
    "Kribi",
    "Sangmélima",
    "Ambam",
    "Lolodorf",
    "Campo",
  ],
  "Sud-Ouest": [
    "Buea",
    "Limbe",
    "Kumba",
    "Tiko",
    "Mamfe",
    "Muyuka",
    "Idenau",
  ],
};

// Fonction utilitaire pour obtenir les villes d'une région
export function getVillesForRegion(region: string): string[] {
  return villesParRegion[region as Region] || [];
}
