import { describe, expect, it } from "vitest";
import { extractCVDataWithAI } from "./cvExtractor";

describe("CV Extraction", () => {
  it("should extract basic information from CV text", async () => {
    const cvText = `
      Jean Dupont
      Développeur Full Stack
      +237 612345678
      jean.dupont@email.com
      Yaoundé, Cameroun
      
      EXPÉRIENCE PROFESSIONNELLE
      
      Développeur Senior - Tech Company Cameroun
      Yaoundé, Cameroun
      Janvier 2020 - Présent
      - Développement d'applications web avec React et Node.js
      - Gestion d'équipe de 5 développeurs
      
      Développeur Junior - StartUp Digital
      Douala, Cameroun
      Mars 2018 - Décembre 2019
      - Création de sites web responsive
      - Intégration d'APIs REST
      
      FORMATION
      
      Master en Informatique
      Université de Yaoundé I
      2016 - 2018
      Spécialisation en Génie Logiciel
      
      Licence en Informatique
      Université de Douala
      2013 - 2016
      
      COMPÉTENCES
      - JavaScript (Expert)
      - React (Avancé)
      - Node.js (Avancé)
      - Python (Intermédiaire)
      - SQL (Avancé)
      
      LANGUES
      - Français (Langue maternelle)
      - Anglais (Courant)
      - Espagnol (Intermédiaire)
    `;

    const result = await extractCVDataWithAI(cvText);

    // Vérifier les informations personnelles
    expect(result.prenom).toBeDefined();
    expect(result.nom).toBeDefined();
    expect(result.telephone).toBeDefined();

    // Vérifier les expériences
    expect(result.experiences).toBeDefined();
    expect(result.experiences.length).toBeGreaterThan(0);
    expect(result.experiences[0]).toHaveProperty("poste");
    expect(result.experiences[0]).toHaveProperty("entreprise");
    expect(result.experiences[0]).toHaveProperty("dateDebut");

    // Vérifier les formations
    expect(result.formations).toBeDefined();
    expect(result.formations.length).toBeGreaterThan(0);
    expect(result.formations[0]).toHaveProperty("diplome");
    expect(result.formations[0]).toHaveProperty("etablissement");

    // Vérifier les compétences
    expect(result.competences).toBeDefined();
    expect(result.competences.length).toBeGreaterThan(0);
    expect(result.competences[0]).toHaveProperty("nom");

    // Vérifier les langues
    expect(result.langues).toBeDefined();
    expect(result.langues.length).toBeGreaterThan(0);
    expect(result.langues[0]).toHaveProperty("nom");
  }, 30000); // Timeout de 30 secondes pour l'appel IA

  it("should handle CV with minimal information", async () => {
    const cvText = `
      Marie Kamga
      Comptable
      +237 698765432
      
      EXPÉRIENCE
      Comptable - Entreprise ABC
      2019 - Présent
      
      FORMATION
      BTS Comptabilité
      École de Commerce de Douala
      2017 - 2019
    `;

    const result = await extractCVDataWithAI(cvText);

    expect(result).toBeDefined();
    expect(result.experiences).toBeDefined();
    expect(result.formations).toBeDefined();
    expect(result.competences).toBeDefined();
    expect(result.langues).toBeDefined();
  }, 30000);
});
