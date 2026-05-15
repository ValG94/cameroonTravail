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
    nom: "Jeune Diplômé Sombre",
    description:
      "Sidebar foncée avec photo carrée et sections en blanc, identité centrée à droite avec FORMATION, EXPÉRIENCES et COMPÉTENCES en deux colonnes. Adapté aux profils ingénieurs, jeunes diplômés et techniques.",
    categorie: "moderne",
    thumbnail: "/cv-templates/modern_sidebar_dark.svg",
    Component: lazy(() => import("./modern_sidebar_dark/Template")),
    defaultAccent: "#111827",
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
  sport_orange_dark: {
    slug: "sport_orange_dark",
    nom: "Sport Orange & Noir",
    description:
      "CV dynamique noir et orange avec fond image sport grisé. Sidebar avec photo encadrée orange, identité forte et sections claires. Adapté aux profils sport, entraîneurs, coachs et métiers actifs.",
    categorie: "moderne",
    thumbnail: "/cv-templates/sport_orange_dark.svg",
    Component: lazy(() => import("./sport_orange_dark/Template")),
    defaultAccent: "#FE8010",
  },
  developer_dark_sidebar: {
    slug: "developer_dark_sidebar",
    nom: "Développeur Noir & Blanc",
    description:
      "CV simple et moderne en noir et blanc avec photo grande sidebar gauche, identité forte à droite et touches bleu pétrole. Adapté aux profils tech, développeurs, ingénieurs et data.",
    categorie: "moderne",
    thumbnail: "/cv-templates/developer_dark_sidebar.svg",
    Component: lazy(() => import("./developer_dark_sidebar/Template")),
    defaultAccent: "#5C7C8F",
  },
  colorful_warm_blocks: {
    slug: "colorful_warm_blocks",
    nom: "Vif Coloré Crème",
    description:
      "CV vif et coloré sur fond crème avec blocs violet, orange et jaune alternés. Photo, identité forte et sections en cartes contrastées. Adapté aux profils créatifs, jeunes diplômés et reconversion.",
    categorie: "creatif",
    thumbnail: "/cv-templates/colorful_warm_blocks.svg",
    Component: lazy(() => import("./colorful_warm_blocks/Template")),
    defaultAccent: "#D4AFE9",
  },
  professional_modern_white: {
    slug: "professional_modern_white",
    nom: "White Professional Modern",
    description:
      "CV professionnel moderne en blanc avec photo dans cadre courbé et accent orange. Layout 2 colonnes : identité, About, Skills à gauche ; Education et Experience à droite. Adapté aux profils marketing, management et créatifs.",
    categorie: "moderne",
    thumbnail: "/cv-templates/professional_modern_white.svg",
    Component: lazy(() => import("./professional_modern_white/Template")),
    defaultAccent: "#f97316",
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
  pink_red_blobs: {
    slug: "pink_red_blobs",
    nom: "Rose et Rouge",
    description:
      "CV professionnel moderne avec blob rouge en haut-droite contenant la photo et blob rose pâle en bas-gauche. Texte en rouge sur fond off-white avec séparateur pointillé. Adapté aux profils événementiel, communication, marketing et chef de projet.",
    categorie: "creatif",
    thumbnail: "/cv-templates/pink_red_blobs.svg",
    Component: lazy(() => import("./pink_red_blobs/Template")),
    defaultAccent: "#C41212",
  },
};

export const getTemplate = (slug: string): CvTemplateMeta | undefined => CV_TEMPLATES[slug];

export const listTemplates = (): CvTemplateMeta[] => Object.values(CV_TEMPLATES);
