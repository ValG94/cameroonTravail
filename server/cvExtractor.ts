import mammoth from "mammoth";
import { invokeLLM } from "./_core/llm";
import { PDFExtract } from "pdf.js-extract";

/**
 * Extraire le texte d'un fichier PDF
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(buffer);
    
    // Extraire le texte de toutes les pages
    const fullText = data.pages
      .map((page) =>
        page.content
          .map((item) => item.str)
          .join(" ")
      )
      .join("\n");
    
    return fullText.trim();
  } catch (error) {
    console.error("[CV Extractor] Error extracting text from PDF:", error);
    throw new Error("Impossible d'extraire le texte du PDF");
  }
}

/**
 * Extraire le texte d'un fichier Word (.docx)
 */
export async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("[CV Extractor] Error extracting text from Word:", error);
    throw new Error("Impossible d'extraire le texte du document Word");
  }
}

/**
 * Extraire le texte selon le type de fichier
 */
export async function extractTextFromCV(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    return await extractTextFromPDF(buffer);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    return await extractTextFromWord(buffer);
  } else {
    throw new Error("Format de fichier non supporté. Utilisez PDF ou Word (.docx)");
  }
}

/**
 * Structure des données extraites du CV
 */
export interface ExtractedCVData {
  // Informations personnelles
  prenom?: string;
  nom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  region?: string;
  dateNaissance?: string;
  nationalite?: string;
  
  // Expériences professionnelles
  experiences: Array<{
    poste: string;
    entreprise: string;
    ville?: string;
    pays?: string;
    dateDebut: string;
    dateFin?: string;
    enCours?: boolean;
    description?: string;
    competencesAcquises?: string;
  }>;
  
  // Formations
  formations: Array<{
    diplome: string;
    etablissement: string;
    ville?: string;
    pays?: string;
    dateDebut: string;
    dateFin?: string;
    enCours?: boolean;
    domaine?: string;
    description?: string;
  }>;
  
  // Compétences
  competences: Array<{
    nom: string;
    niveau?: "debutant" | "intermediaire" | "avance" | "expert";
    categorie?: string;
  }>;
  
  // Langues
  langues: Array<{
    nom: string;
    niveauOral?: "debutant" | "intermediaire" | "courant" | "bilingue" | "langue_maternelle";
    niveauEcrit?: "debutant" | "intermediaire" | "courant" | "bilingue" | "langue_maternelle";
  }>;
}

/**
 * Extraire les données structurées d'un CV avec l'IA
 */
export async function extractCVDataWithAI(cvText: string): Promise<ExtractedCVData> {
  const prompt = `Tu es un expert en extraction de données de CV. Analyse le CV suivant et extrais TOUTES les informations dans un format JSON structuré.

IMPORTANT:
- Extrais TOUTES les expériences professionnelles mentionnées
- Extrais TOUTES les formations et diplômes mentionnés
- Extrais TOUTES les compétences techniques et soft skills mentionnées
- Extrais TOUTES les langues mentionnées avec leurs niveaux
- Pour les dates, utilise le format YYYY-MM-DD si possible, sinon YYYY-MM ou YYYY
- Si une information n'est pas présente, ne l'inclus pas dans le JSON
- Pour les niveaux de langue, utilise: "debutant", "intermediaire", "courant", "bilingue", ou "langue_maternelle"
- Pour les niveaux de compétence, utilise: "debutant", "intermediaire", "avance", ou "expert"
- Pour les numéros de téléphone camerounais, formate-les avec +237

Voici le CV à analyser:

${cvText}

Retourne uniquement le JSON structuré sans aucun texte supplémentaire.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Tu es un expert en extraction de données de CV. Tu retournes uniquement du JSON valide.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cv_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              prenom: { type: "string" },
              nom: { type: "string" },
              telephone: { type: "string" },
              email: { type: "string" },
              adresse: { type: "string" },
              ville: { type: "string" },
              region: { type: "string" },
              dateNaissance: { type: "string" },
              nationalite: { type: "string" },
              experiences: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    poste: { type: "string" },
                    entreprise: { type: "string" },
                    ville: { type: "string" },
                    pays: { type: "string" },
                    dateDebut: { type: "string" },
                    dateFin: { type: "string" },
                    enCours: { type: "boolean" },
                    description: { type: "string" },
                    competencesAcquises: { type: "string" },
                  },
                  required: ["poste", "entreprise", "dateDebut"],
                  additionalProperties: false,
                },
              },
              formations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    diplome: { type: "string" },
                    etablissement: { type: "string" },
                    ville: { type: "string" },
                    pays: { type: "string" },
                    dateDebut: { type: "string" },
                    dateFin: { type: "string" },
                    enCours: { type: "boolean" },
                    domaine: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["diplome", "etablissement", "dateDebut"],
                  additionalProperties: false,
                },
              },
              competences: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nom: { type: "string" },
                    niveau: {
                      type: "string",
                      enum: ["debutant", "intermediaire", "avance", "expert"],
                    },
                    categorie: { type: "string" },
                  },
                  required: ["nom"],
                  additionalProperties: false,
                },
              },
              langues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nom: { type: "string" },
                    niveauOral: {
                      type: "string",
                      enum: ["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"],
                    },
                    niveauEcrit: {
                      type: "string",
                      enum: ["debutant", "intermediaire", "courant", "bilingue", "langue_maternelle"],
                    },
                  },
                  required: ["nom"],
                  additionalProperties: false,
                },
              },
            },
            required: ["experiences", "formations", "competences", "langues"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Aucune réponse de l'IA");
    }

    const extractedData: ExtractedCVData = JSON.parse(content);
    return extractedData;
  } catch (error) {
    console.error("[CV Extractor] Error extracting data with AI:", error);
    throw new Error("Impossible d'extraire les données du CV avec l'IA");
  }
}

/**
 * Dédupliquer les expériences professionnelles
 */
function deduplicateExperiences(experiences: ExtractedCVData["experiences"]): ExtractedCVData["experiences"] {
  const seen = new Map<string, typeof experiences[0]>();
  
  for (const exp of experiences) {
    // Créer une clé unique basée sur poste + entreprise (insensible à la casse)
    const key = `${exp.poste.toLowerCase().trim()}_${exp.entreprise.toLowerCase().trim()}`;
    
    // Garder seulement la première occurrence
    if (!seen.has(key)) {
      seen.set(key, exp);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Dédupliquer les formations
 */
function deduplicateFormations(formations: ExtractedCVData["formations"]): ExtractedCVData["formations"] {
  const seen = new Map<string, typeof formations[0]>();
  
  for (const form of formations) {
    // Créer une clé unique basée sur diplome + etablissement (insensible à la casse)
    const key = `${form.diplome.toLowerCase().trim()}_${form.etablissement.toLowerCase().trim()}`;
    
    // Garder seulement la première occurrence
    if (!seen.has(key)) {
      seen.set(key, form);
    }
  }
  
  return Array.from(seen.values());
}

/**
 * Pipeline complet: extraire le texte puis les données structurées
 */
export async function processCVFile(
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; data: ExtractedCVData }> {
  // Étape 1: Extraire le texte
  const text = await extractTextFromCV(buffer, mimeType);
  
  if (!text || text.trim().length < 50) {
    throw new Error("Le CV semble vide ou illisible");
  }

  // Étape 2: Extraire les données structurées avec l'IA
  const data = await extractCVDataWithAI(text);
  
  // Étape 3: Dédupliquer les expériences et formations
  data.experiences = deduplicateExperiences(data.experiences);
  data.formations = deduplicateFormations(data.formations);

  return { text, data };
}
