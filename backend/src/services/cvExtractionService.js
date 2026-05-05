import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class CVExtractionService {
  /**
   * Extrait le texte brut d'un Buffer PDF.
   * @param {Buffer} buffer
   * @returns {Promise<string>}
   */
  static async extractTextFromPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error("Erreur extraction texte PDF :", error);
      throw new Error("Impossible d'extraire le texte du CV.");
    }
  }

  /**
   * Utilise GPT pour structurer les informations du CV en JSON.
   * @param {string} cvText
   * @returns {Promise<Object>}
   */
  static async extractCVData(cvText) {
    const prompt = `Tu es un expert en analyse de CV. Analyse le CV suivant et extrais les informations dans un format JSON structuré.

CV:
${cvText}

Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte (sans texte supplémentaire):
{
  "personalInfo": {
    "firstName": "string ou null",
    "lastName": "string ou null",
    "email": "string ou null",
    "phone": "string ou null",
    "location": "string ou null",
    "bio": "string ou null (résumé professionnel)"
  },
  "experiences": [
    {
      "title": "string",
      "company": "string",
      "location": "string ou null",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD ou null si en cours",
      "current": boolean,
      "description": "string"
    }
  ],
  "educations": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string ou null",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD ou null si en cours",
      "current": boolean,
      "description": "string ou null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": number entre 1 et 5
    }
  ],
  "languages": [
    {
      "name": "string",
      "proficiency": "beginner|intermediate|advanced|native"
    }
  ]
}

Règles importantes:
- Si une information n'est pas trouvée, utilise null
- Pour les dates, utilise le format YYYY-MM-DD (ex: 2020-01-15)
- Pour les compétences, estime le niveau de 1 (débutant) à 5 (expert)
- Pour les langues, utilise: beginner, intermediate, advanced, ou native
- Retourne UNIQUEMENT le JSON, sans markdown, sans texte explicatif`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse de CV. Tu retournes UNIQUEMENT du JSON valide, sans texte supplémentaire.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      let responseText = completion.choices[0].message.content.trim();

      // Nettoyer les balises markdown si présentes
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }

      return JSON.parse(responseText);
    } catch (error) {
      console.error("Erreur extraction CV avec IA :", error);
      throw new Error("Impossible d'analyser le CV avec l'IA.");
    }
  }

  /**
   * Traite un CV complet depuis un Buffer : extraction texte + analyse IA.
   * Remplace processCVFile (qui lisait depuis le disque).
   * @param {Buffer} buffer
   * @returns {Promise<Object>}
   */
  static async processCVBuffer(buffer) {
    const cvText = await this.extractTextFromPDF(buffer);

    if (!cvText || cvText.trim().length < 50) {
      throw new Error('Le CV semble vide ou illisible.');
    }

    return this.extractCVData(cvText);
  }
}

export default CVExtractionService;
