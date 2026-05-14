import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import type { CvTemplateData } from "./types";

export interface CvTemplateMeta {
  slug: string;
  nom: string;
  description: string;
  categorie: string;
  thumbnail: string;
  /** Composant React qui rend le CV à partir des données candidat. */
  Component: LazyExoticComponent<ComponentType<{ data: CvTemplateData; accentColor?: string }>>;
  /** Couleur d'accent par défaut (overridable depuis l'éditeur). */
  defaultAccent: string;
}

/**
 * Registry des templates premium. Le slug doit correspondre à `cv_templates.slug` en DB.
 * Pour ajouter un template : créer le composant dans `client/src/cv-templates/<slug>/`
 * puis l'enregistrer ici. Les métadonnées DB (prix, isActive) restent maîtres.
 */
export const CV_TEMPLATES: Record<string, CvTemplateMeta> = {
  modern_sidebar_dark: {
    slug: "modern_sidebar_dark",
    nom: "Moderne Sombre",
    description:
      "Colonne latérale sombre avec photo et accents colorés. Idéal pour profils tech et créatifs.",
    categorie: "moderne",
    thumbnail: "/cv-templates/modern_sidebar_dark.svg",
    Component: lazy(() => import("./modern_sidebar_dark/Template")),
    defaultAccent: "#10b981",
  },
  hospitality_timeline: {
    slug: "hospitality_timeline",
    nom: "Hospitalité",
    description:
      "Timeline visuelle et bandeaux colorés. Pensé pour restauration, hôtellerie et services.",
    categorie: "service",
    thumbnail: "/cv-templates/hospitality_timeline.svg",
    // Placeholder : ces 4 templates seront implémentés en Phase 3
    Component: lazy(() => import("./modern_sidebar_dark/Template")),
    defaultAccent: "#d97706",
  },
  minimal_centered: {
    slug: "minimal_centered",
    nom: "Minimal Centré",
    description: "Mise en page épurée et centrée pour profils corporate et consulting.",
    categorie: "minimaliste",
    thumbnail: "/cv-templates/minimal_centered.svg",
    Component: lazy(() => import("./modern_sidebar_dark/Template")),
    defaultAccent: "#374151",
  },
  editorial_creative: {
    slug: "editorial_creative",
    nom: "Éditorial Créatif",
    description: "Style magazine avec photo en évidence. Pour communication et design.",
    categorie: "creatif",
    thumbnail: "/cv-templates/editorial_creative.svg",
    Component: lazy(() => import("./editorial_creative/Template")),
    defaultAccent: "#7dd3fc",
  },
  executive_curved: {
    slug: "executive_curved",
    nom: "Exécutif",
    description: "Modèle corporate avec formes graphiques. Pour postes de direction.",
    categorie: "executif",
    thumbnail: "/cv-templates/executive_curved.svg",
    Component: lazy(() => import("./modern_sidebar_dark/Template")),
    defaultAccent: "#1e3a8a",
  },
};

export const getTemplate = (slug: string): CvTemplateMeta | undefined => CV_TEMPLATES[slug];

export const listTemplates = (): CvTemplateMeta[] => Object.values(CV_TEMPLATES);
