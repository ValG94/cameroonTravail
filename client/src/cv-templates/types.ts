/**
 * Forme normalisée des données passées aux templates de CV.
 * Construite à partir du profil candidat + cv_data + experiences/formations/competences/langues.
 * Garde-fous : tous les tableaux sont garantis présents (vides plutôt que null/undefined).
 */
export interface CvTemplateData {
  // Identité
  fullName: string;
  title: string; // poste recherché / accroche courte
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  linkedin?: string;
  website?: string;
  photoUrl?: string;

  // Résumé
  professionalSummary?: string;

  // Sections
  experiences: ExperienceItem[];
  education: EducationItem[];
  hardSkills: string[];
  softSkills: string[];
  languages: LanguageItem[];
  interests: string[];
  references: ReferenceItem[];
}

export interface ExperienceItem {
  company: string;
  position: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface LanguageItem {
  name: string;
  level: string; // débutant / intermédiaire / courant / bilingue / langue_maternelle
}

export interface ReferenceItem {
  name: string;
  position?: string;
  company?: string;
  contact?: string;
}
