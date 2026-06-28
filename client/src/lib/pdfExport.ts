/**
 * Export d'un CV premium au format PDF.
 *
 * Stratégie :
 *  1. html-to-image (toCanvas) capture le node DOM (#cv-render-root) en
 *     canvas haute DPI. On préfère html-to-image à html2canvas car le
 *     parser de couleur de ce dernier ne supporte pas oklch() (utilisé
 *     par Tailwind v4 dans nos CSS variables de thème).
 *  2. jsPDF crée un document A4 portrait (210 × 297 mm) et y embarque l'image.
 *  3. Si le CV dépasse une page A4, on slice l'image canvas en plusieurs
 *     pages successives sans recalculer la capture (1 seul rendu = ressources
 *     et temps optimisés).
 *
 * Limites assumées :
 *  - Le PDF généré est une image rasterisée (pas de texte sélectionnable),
 *    acceptable pour un CV destiné à l'impression / candidature.
 *  - Pour du texte sélectionnable : à terme, passer par un backend Puppeteer.
 */

import { toCanvas } from "html-to-image";
import { jsPDF } from "jspdf";

/** Format A4 portrait en millimètres. */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/** Marge haut/bas par défaut, en mm. Évite les coupures collées au bord
 *  de la feuille sur les CV multi-pages (effet visuel disgracieux). */
const DEFAULT_MARGIN_MM = 6;

interface ExportOptions {
  /** Élément DOM à exporter. À fournir directement plutôt qu'un sélecteur
   *  pour éviter les dépendances implicites au DOM global. */
  element: HTMLElement;
  /** Nom du fichier généré (sans extension). */
  filename: string;
  /** Résolution de capture (1 = identique écran, 2 = retina). Défaut 2. */
  scale?: number;
  /** Marge top + bottom en mm sur chaque page PDF. Défaut 6mm. */
  marginMm?: number;
}

export async function exportCvToPdf({
  element,
  filename,
  scale = 2,
  marginMm = DEFAULT_MARGIN_MM,
}: ExportOptions): Promise<void> {
  if (!element) throw new Error("Élément CV introuvable");

  // Capture du DOM en canvas haute DPI.
  // pixelRatio: scale → équivalent du scale html2canvas (haute résolution)
  // cacheBust: true → contourne le cache navigateur des images (URL signée
  //   Supabase notamment) pour éviter les CORS-tainted canvas
  // skipFonts: false → embarque les Google Fonts dans la capture
  const canvas = await toCanvas(element, {
    pixelRatio: scale,
    cacheBust: true,
    skipFonts: false,
    backgroundColor: undefined,
  });

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  // Hauteur "utile" d'une page PDF en mm (sans les marges).
  const usableHeightMm = A4_HEIGHT_MM - 2 * marginMm;
  // Convertit cette hauteur en pixels canvas (la largeur du canvas représente
  // les 210mm de largeur A4 pleine — les marges sont uniquement verticales).
  const pageSliceHeightPx = (canvas.width * usableHeightMm) / A4_WIDTH_MM;
  const totalPages = Math.max(1, Math.ceil(canvas.height / pageSliceHeightPx));

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) pdf.addPage();

    // On crée un canvas off-screen par page, on y copie la tranche concernée.
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
      0, // sx
      pageIdx * pageSliceHeightPx, // sy
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
    const imgHeightMm = (sliceHeightPx * A4_WIDTH_MM) / canvas.width;
    // Image placée avec offset = marginMm en haut, pleine largeur en X.
    pdf.addImage(imgData, "JPEG", 0, marginMm, A4_WIDTH_MM, imgHeightMm);
  }

  pdf.save(`${filename}.pdf`);
}

/** Compose un nom de fichier propre à partir du nom du candidat + slug template. */
export function buildCvFilename(fullName: string, templateSlug: string): string {
  const safeName = (fullName || "cv")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 50);
  return `cv-${safeName || "candidat"}-${templateSlug}`;
}
