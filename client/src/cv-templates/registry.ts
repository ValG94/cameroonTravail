import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import type { CvTemplateData } from "./types";

/** Libellés personnalisables des sections (passés à tous les templates). */
export interface CvSectionLabels {
  contact?: string;
  hardSkills?: string;
  softSkills?: string;
  languages?: string;
  interests?: string;
  experiences?: string;
  education?: string;
}

export interface CvTemplateMeta {
  slug: string;
  nom: string;
  description: string;
  categorie: string;
  thumbnail: string;
  /** Composant React qui rend le CV à partir des données candidat. */
  Component: LazyExoticComponent<
    ComponentType<{ data: CvTemplateData; accentColor?: string; labels?: CvSectionLabels }>
  >;
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
    nom: "Communication Bleu Marine",
    description:
      "CV professionnel minimaliste avec fond bleu marine élégant et cartes blanches pour mettre en valeur expériences et formations. Adapté aux profils communication, marketing et chef de projet.",
    categorie: "minimaliste",
    thumbnail: "/cv-templates/hospitality_timeline.svg",
    Component: lazy(() => import("./hospitality_timeline/Template")),
    defaultAccent: "#14215D",
  },
  minimal_centered: {
    slug: "minimal_centered",
    nom: "Minimal Centré",
    description: "Mise en page épurée et centrée, parfaite pour les profils corporate, juridiques ou consulting.",
    categorie: "minimaliste",
    thumbnail: "/cv-templates/minimal_centered.svg",
    Component: lazy(() => import("./minimal_centered/Template")),
    defaultAccent: "#1f2937",
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
    description: "Modèle corporate avec formes graphiques organiques en haut. Adapté aux postes de direction et profils seniors.",
    categorie: "executif",
    thumbnail: "/cv-templates/executive_curved.svg",
    Component: lazy(() => import("./executive_curved/Template")),
    defaultAccent: "#4a5568",
  },
};

export const getTemplate = (slug: string): CvTemplateMeta | undefined => CV_TEMPLATES[slug];

export const listTemplates = (): CvTemplateMeta[] => Object.values(CV_TEMPLATES);
