/**
 * Export d'un CV au format PDF.
 *
 * Stratégie :
 *  1. html-to-image (toCanvas) capture le node DOM en canvas haute DPI.
 *     On préfère html-to-image à html2canvas car ce dernier ne supporte
 *     pas oklch() (utilisé par Tailwind v4 dans nos CSS variables).
 *  2. jsPDF crée un document A4 portrait (210 × 297 mm) et y embarque l'image.
 *  3. Deux modes d'embedding :
 *     - "single-page" : redimensionne l'image pour qu'elle tienne sur une
 *       seule page A4 (shrink proportionnel). Recommandé pour les CVs car
 *       les ATS et recruteurs préfèrent un CV sur 1 page.
 *     - "multi-page"  : slice l'image en plusieurs pages de hauteur A4.
 *       À utiliser si le shrink-to-fit rendrait le texte illisible.
 *
 * Limites assumées :
 *  - PDF rasterisé (pas de texte sélectionnable). OK pour candidatures.
 *  - Pour texte sélectionnable : à terme, passer par un backend Puppeteer.
 */

import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

/** Format A4 portrait en millimètres. */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** Marge haut/bas par défaut, en mm. Pour ne pas que le contenu colle
 *  pile au bord du papier (effet de césure disgracieux). */
const DEFAULT_MARGIN_MM = 6;

/** Sous ce facteur de shrink, on considère que le CV serait trop réduit
 *  pour rester lisible (texte < ~85% de sa taille originale). À utiliser
 *  côté caller pour déclencher un dialog de choix utilisateur. */
export const SINGLE_PAGE_SHRINK_THRESHOLD = 0.85;

export type FitMode = "single-page" | "multi-page";

// ─── Capture ──────────────────────────────────────────────────────────────────

/** Capture un élément DOM en canvas haute DPI. À utiliser quand on a besoin
 *  d'inspecter le canvas avant de générer le PDF (pour calcul du shrink,
 *  preview, etc.). Pour le cas simple, préférer exportCvToPdf(). */
export async function captureElementAsCanvas(
  element: HTMLElement,
  scale = 2
): Promise<HTMLCanvasElement> {
  if (!element) throw new Error("Élément CV introuvable");
  return await toCanvas(element, {
    pixelRatio: scale,
    cacheBust: true,
    skipFonts: false,
    backgroundColor: undefined,
  });
}

// ─── Calculs ──────────────────────────────────────────────────────────────────

/** Calcule la hauteur naturelle du CV en mm si on conserve la largeur A4. */
export function getNaturalHeightMm(canvas: HTMLCanvasElement): number {
  return (canvas.height * A4_WIDTH_MM) / canvas.width;
}

/** Retourne le facteur de shrink (0 < f ≤ 1) pour faire tenir le CV sur
 *  une seule page A4 avec marges. f = 1 → tient déjà ; f = 0.7 → doit
 *  être réduit à 70% de sa taille. */
export function computeSinglePageFitFactor(
  canvas: HTMLCanvasElement,
  marginMm: number = DEFAULT_MARGIN_MM
): number {
  const naturalHeightMm = getNaturalHeightMm(canvas);
  const usableHeightMm = A4_HEIGHT_MM - 2 * marginMm;
  if (naturalHeightMm <= usableHeightMm) return 1;
  return usableHeightMm / naturalHeightMm;
}

// ─── Génération PDF à partir d'un canvas ──────────────────────────────────────

interface CanvasToPdfOptions {
  filename: string;
  mode: FitMode;
  marginMm?: number;
}

/** Construit + télécharge le PDF à partir d'un canvas déjà capturé. */
export function canvasToPdf(
  canvas: HTMLCanvasElement,
  { filename, mode, marginMm = DEFAULT_MARGIN_MM }: CanvasToPdfOptions
): void {
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  if (mode === "single-page") {
    embedSinglePage(pdf, canvas, marginMm);
  } else {
    embedMultiPage(pdf, canvas, marginMm);
  }

  pdf.save(`${filename}.pdf`);
}

/** Embed une seule page : shrink proportionnel pour faire tenir tout le
 *  CV dans la zone utile (A4 - marges), centré horizontalement et
 *  verticalement. Si déjà plus petit que la zone utile, embed tel quel. */
function embedSinglePage(pdf: jsPDF, canvas: HTMLCanvasElement, marginMm: number) {
  const usableWidthMm = A4_WIDTH_MM;
  const usableHeightMm = A4_HEIGHT_MM - 2 * marginMm;
  const naturalHeightMm = getNaturalHeightMm(canvas);

  // Shrink uniforme pour tenir en hauteur (la largeur est déjà = A4).
  const fitFactor = Math.min(1, usableHeightMm / naturalHeightMm);
  const finalWidthMm = usableWidthMm * fitFactor;
  const finalHeightMm = naturalHeightMm * fitFactor;
  const offsetX = (A4_WIDTH_MM - finalWidthMm) / 2;
  const offsetY = marginMm + (usableHeightMm - finalHeightMm) / 2;

  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  pdf.addImage(imgData, "JPEG", offsetX, offsetY, finalWidthMm, finalHeightMm);
}

/** Embed multi-page : slice l'image en tranches de hauteur A4 (moins
 *  les marges), une page par tranche. */
function embedMultiPage(pdf: jsPDF, canvas: HTMLCanvasElement, marginMm: number) {
  const usableHeightMm = A4_HEIGHT_MM - 2 * marginMm;
  const pageSliceHeightPx = (canvas.width * usableHeightMm) / A4_WIDTH_MM;
  const totalPages = Math.max(1, Math.ceil(canvas.height / pageSliceHeightPx));

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) pdf.addPage();

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    const sliceHeightPx = Math.min(
      pageSliceHeightPx,
      canvas.height - pageIdx * pageSliceHeightPx
    );
    pageCanvas.height = sliceHeightPx;
    const ctx = pageCanvas.getContext("2d");
    if (!ctx) throw new Error("Impossible de créer le contexte canvas 2D");
    ctx.drawImage(
      canvas,
      0,
      pageIdx * pageSliceHeightPx,
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
    const imgHeightMm = (sliceHeightPx * A4_WIDTH_MM) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, marginMm, A4_WIDTH_MM, imgHeightMm);
  }
}

// ─── API haut niveau (cas simple) ─────────────────────────────────────────────

interface ExportOptions {
  element: HTMLElement;
  filename: string;
  scale?: number;
  marginMm?: number;
  /** Défaut : "single-page" (recommandé pour CV). */
  fitMode?: FitMode;
}

/** Capture + export en une seule étape (cas simple). Pour un contrôle
 *  fin avec preview avant download, utiliser captureElementAsCanvas +
 *  canvasToPdf séparément. */
export async function exportCvToPdf({
  element,
  filename,
  scale = 2,
  marginMm = DEFAULT_MARGIN_MM,
  fitMode = "single-page",
}: ExportOptions): Promise<void> {
  const canvas = await captureElementAsCanvas(element, scale);
  canvasToPdf(canvas, { filename, mode: fitMode, marginMm });
}

// ─── Helpers nom de fichier ───────────────────────────────────────────────────

/** Compose un nom de fichier propre à partir du nom + slug template. */
export function buildCvFilename(fullName: string, templateSlug: string): string {
  const safeName = (fullName || "cv")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 50);
  return `cv-${safeName || "candidat"}-${templateSlug}`;
}
