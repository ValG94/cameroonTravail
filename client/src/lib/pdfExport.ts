/**
 * Export d'un CV premium au format PDF.
 *
 * Stratégie :
 *  1. html2canvas capture le node DOM (#cv-render-root) en image bitmap à
 *     haute DPI (scale 2) → l'identité graphique des templates (blobs SVG,
 *     polices custom, masques, dégradés) est conservée pixel-perfect.
 *  2. jsPDF crée un document A4 portrait (210 × 297 mm) et y embarque l'image.
 *  3. Si le CV dépasse une page A4, on slice l'image canvas en plusieurs
 *     pages successives sans recalculer la capture (1 seul rendu html2canvas
 *     = ressources et temps optimisés).
 *
 * Limites assumées :
 *  - Le PDF généré est une image rasterisée (pas de texte sélectionnable),
 *    acceptable pour un CV destiné à l'impression / candidature.
 *  - Pour du texte sélectionnable : à terme, passer par un backend Puppeteer.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/** Format A4 portrait en millimètres. */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

interface ExportOptions {
  /** Élément DOM à exporter. À fournir directement plutôt qu'un sélecteur
   *  pour éviter les dépendances implicites au DOM global. */
  element: HTMLElement;
  /** Nom du fichier généré (sans extension). */
  filename: string;
  /** Résolution de capture (1 = identique écran, 2 = retina). Défaut 2. */
  scale?: number;
}

export async function exportCvToPdf({
  element,
  filename,
  scale = 2,
}: ExportOptions): Promise<void> {
  if (!element) throw new Error("Élément CV introuvable");

  // Capture du DOM en canvas haute DPI.
  // useCORS: true → autorise les images Supabase Storage / Google Fonts.
  // backgroundColor: null → respecte le background de l'élément.
  // logging: false → pas de pollution console en prod.
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    logging: false,
    // Évite un rendu déformé si l'élément a une scrollbar interne
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
    compress: true,
  });

  // Calcule la hauteur du CV en mm si on conserve la largeur A4 (210 mm).
  // Aspect ratio préservé : pdfHeightMm = canvas.height × (210 / canvas.width).
  const pdfPageHeightPx = (canvas.width * A4_HEIGHT_MM) / A4_WIDTH_MM;
  const totalPages = Math.max(1, Math.ceil(canvas.height / pdfPageHeightPx));

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) pdf.addPage();

    // On crée un canvas off-screen par page, on y copie la tranche concernée.
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    const sliceHeight = Math.min(
      pdfPageHeightPx,
      canvas.height - pageIdx * pdfPageHeightPx
    );
    pageCanvas.height = sliceHeight;
    const ctx = pageCanvas.getContext("2d");
    if (!ctx) throw new Error("Impossible de créer le contexte canvas 2D");
    ctx.drawImage(
      canvas,
      0, // sx
      pageIdx * pdfPageHeightPx, // sy
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight
    );

    const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
    const imgHeightMm = (sliceHeight * A4_WIDTH_MM) / canvas.width;
    pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, imgHeightMm);
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
