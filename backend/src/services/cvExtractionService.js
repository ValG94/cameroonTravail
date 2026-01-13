import fs from 'fs';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class CVExtractionService {
  /**
   * Extrait le texte d'un fichier PDF
   * @param {string} filePath - Chemin vers le fichier PDF
   * @returns {Promise<string>} Le texte extrait
   */
  static async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte du PDF:', error);
      throw new Error('Impossible d\'extraire le texte du CV');
    }
  }

  /**
   * Utilise l'IA pour extraire les informations structurées du CV
   * @param {string} cvText - Le texte du CV
   * @returns {Promise<Object>} Les informations extraites
   */
  static async extractCVData(cvText) {
    try {
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

      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse de CV. Tu extrais les informations de manière structurée et précise. Tu retournes UNIQUEMENT du JSON valide, sans texte supplémentaire.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      });

      const responseText = completion.choices[0].message.content.trim();
      
      // Nettoyer la réponse si elle contient des balises markdown
      let cleanedResponse = responseText;
      if (responseText.startsWith('```json')) {
        cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (responseText.startsWith('```')) {
        cleanedResponse = responseText.replace(/```\n?/g, '');
      }

      const extractedData = JSON.parse(cleanedResponse);
      
      return extractedData;
    } catch (error) {
      console.error('Erreur lors de l\'extraction des données du CV avec IA:', error);
      throw new Error('Impossible d\'analyser le CV avec l\'IA');
    }
  }

  /**
   * Traite un CV complet : extraction du texte + analyse IA
   * @param {string} filePath - Chemin vers le fichier PDF
   * @returns {Promise<Object>} Les informations extraites
   */
  static async processCVFile(filePath) {
    try {
      // Étape 1 : Extraire le texte du PDF
      const cvText = await this.extractTextFromPDF(filePath);

      if (!cvText || cvText.trim().length < 50) {
        throw new Error('Le CV semble vide ou illisible');
      }

      // Étape 2 : Analyser avec l'IA
      const extractedData = await this.extractCVData(cvText);

      return extractedData;
    } catch (error) {
      console.error('Erreur lors du traitement du CV:', error);
      throw error;
    }
  }
}

export default CVExtractionService;
