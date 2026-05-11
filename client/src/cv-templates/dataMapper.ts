import type { CvTemplateData, EducationItem, ExperienceItem, LanguageItem } from "./types";

/**
 * Construit un CvTemplateData à partir de l'output tRPC `candidat.getMyProfile`
 * + `cv.getData` éventuel + tables liées (experiences, formations, competences, langues).
 *
 * Aucune source obligatoire : tous les champs ont un fallback "" ou [].
 * Pas de valeurs inventées : si le candidat n'a pas rempli, on rend vide.
 */
export function buildTemplateData(input: {
  user?: { name?: string | null; email?: string | null } | null;
  candidat?: any | null;
  cvData?: any | null;
  experiences?: any[];
  formations?: any[];
  competences?: any[];
  langues?: any[];
}): CvTemplateData {
  const { user, candidat, cvData, experiences = [], formations = [], competences = [], langues = [] } = input;

  // Identité
  const fullName =
    [candidat?.prenom, candidat?.nom].filter(Boolean).join(" ").trim() ||
    user?.name ||
    "";

  const data: CvTemplateData = {
    fullName,
    title: cvData?.titre || candidat?.secteurRecherche || "",
    email: cvData?.email || user?.email || "",
    phoneNumber: cvData?.telephone || candidat?.telephone || "",
    city: candidat?.ville || "",
    country: candidat?.region || "",
    linkedin: cvData?.siteWeb || undefined,
    website: undefined,
    photoUrl: cvData?.photoUrl || candidat?.photoUrl || undefined,

    professionalSummary: cvData?.resume || undefined,

    experiences: mapExperiences(experiences, cvData?.experiences),
    education: mapEducation(formations, cvData?.formations),
    hardSkills: mapSkills(competences, cvData?.competences, ["technique", "front-end", "back-end", "outils", "logiciels"]),
    softSkills: mapSkills(competences, cvData?.competences, ["soft", "qualité", "leadership", "communication"]),
    languages: mapLanguages(langues, cvData?.languesCv),
    interests: mapInterests(cvData?.loisirs),
    references: [],
  };

  return data;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapExperiences(rows: any[], jsonField?: string | null): ExperienceItem[] {
  // Priorité aux rows DB (tables experiences)
  if (rows && rows.length > 0) {
    return rows.map((r) => ({
      company: r.entreprise || "",
      position: r.poste || "",
      location: [r.ville, r.pays].filter(Boolean).join(", ") || undefined,
      startDate: toIsoYearMonth(r.dateDebut),
      endDate: toIsoYearMonth(r.dateFin),
      current: !!r.enCours,
      description: r.description || undefined,
      achievements: undefined,
    }));
  }
  // Sinon : fallback sur cv_data.experiences (JSON saisi à la main)
  return parseJsonArray(jsonField).map((j: any) => ({
    company: j.entreprise || j.company || "",
    position: j.poste || j.position || "",
    location: j.ville || j.location || undefined,
    startDate: j.dateDebut || j.startDate || undefined,
    endDate: j.dateFin || j.endDate || undefined,
    current: !!j.enCours,
    description: j.description || undefined,
  }));
}

function mapEducation(rows: any[], jsonField?: string | null): EducationItem[] {
  if (rows && rows.length > 0) {
    return rows.map((r) => ({
      school: r.etablissement || "",
      degree: r.diplome || "",
      field: r.domaine || undefined,
      startDate: toIsoYearMonth(r.dateDebut),
      endDate: toIsoYearMonth(r.dateFin),
      description: r.description || undefined,
    }));
  }
  return parseJsonArray(jsonField).map((j: any) => ({
    school: j.etablissement || j.school || "",
    degree: j.diplome || j.degree || "",
    field: j.domaine || j.field || undefined,
    startDate: j.dateDebut || j.startDate || undefined,
    endDate: j.dateFin || j.endDate || undefined,
    description: j.description || undefined,
  }));
}

function mapSkills(rows: any[], jsonField: string | null | undefined, includeCategories: string[]): string[] {
  if (rows && rows.length > 0) {
    return rows
      .filter((r) => {
        if (!r.categorie) return true;
        const cat = r.categorie.toLowerCase();
        return includeCategories.some((k) => cat.includes(k));
      })
      .map((r) => r.nom)
      .filter(Boolean);
  }
  return parseJsonArray(jsonField).map((j: any) => j.nom || j.name || "").filter(Boolean);
}

function mapLanguages(rows: any[], jsonField?: string | null): LanguageItem[] {
  if (rows && rows.length > 0) {
    return rows.map((r) => ({
      name: r.nom || "",
      level: r.niveauOral || r.niveauEcrit || "",
    }));
  }
  return parseJsonArray(jsonField).map((j: any) => ({
    name: j.nom || j.name || "",
    level: j.niveau || j.level || "",
  }));
}

function mapInterests(jsonField?: string | null): string[] {
  if (!jsonField) return [];
  // Soit JSON array, soit string séparée par virgules
  try {
    const parsed = JSON.parse(jsonField);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    return jsonField.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function toIsoYearMonth(d: any): string | undefined {
  if (!d) return undefined;
  if (typeof d === "string") return d.slice(0, 10);
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  return undefined;
}

function parseJsonArray(raw: string | null | undefined): any[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
