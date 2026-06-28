/**
 * Dialog de choix pour l'export PDF d'un CV.
 *
 * Apparaît quand le CV nécessite un shrink trop important pour tenir
 * sur une page A4 (texte qui deviendrait illisible). Donne le choix
 * à l'utilisateur entre :
 *  - "1 page" : shrink proportionnel pour tenir sur une page (lisible
 *    selon les yeux du candidat)
 *  - "Plusieurs pages" : embed par tranches, chaque page A4 = une
 *    portion du CV
 *
 * Affiche un aperçu visuel des deux options pour aider la décision.
 */

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileText, Files } from "lucide-react";

interface PdfExportDialogProps {
  /** Canvas déjà capturé. Si null, le dialog est fermé. */
  canvas: HTMLCanvasElement | null;
  /** Facteur de shrink calculé pour le mode single-page (0..1). */
  fitFactor: number;
  /** Callback : utilisateur a choisi un mode → générer le PDF. */
  onChoose: (mode: "single-page" | "multi-page") => void;
  /** Callback : fermeture du dialog sans choix. */
  onClose: () => void;
}

export function PdfExportDialog({
  canvas,
  fitFactor,
  onChoose,
  onClose,
}: PdfExportDialogProps) {
  const open = canvas !== null;
  const [loading, setLoading] = useState<null | "single-page" | "multi-page">(null);

  const handle = (mode: "single-page" | "multi-page") => {
    if (loading) return;
    setLoading(mode);
    // Décale d'un tick pour laisser le bouton afficher son état "loading".
    setTimeout(() => onChoose(mode), 50);
  };

  // Reset l'état loading à la fermeture
  useEffect(() => {
    if (!open) setLoading(null);
  }, [open]);

  const shrinkPercent = Math.round((1 - fitFactor) * 100);
  const totalPagesMulti = canvas
    ? Math.max(1, Math.ceil(canvas.height / ((canvas.width * (297 - 12)) / 210)))
    : 1;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Votre CV est plus long qu'une page A4</DialogTitle>
          <DialogDescription>
            Choisissez comment l'exporter. Vous pourrez télécharger l'autre version plus tard si besoin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* ─── Option 1 page ─────────────────────────────────────── */}
          <button
            onClick={() => handle("single-page")}
            disabled={loading !== null}
            className="group text-left rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all p-4 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900">Sur 1 page</h3>
            </div>
            <PreviewSinglePage canvas={canvas} />
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              CV réduit à <strong>{Math.round(fitFactor * 100)}%</strong> de sa taille originale
              {shrinkPercent > 0 && <> (–{shrinkPercent}%)</>}.
              Recommandé pour les candidatures.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 group-hover:gap-2 transition-all">
                {loading === "single-page" ? "Génération..." : "Télécharger"}
                <Download className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>

          {/* ─── Option multi-pages ────────────────────────────────── */}
          <button
            onClick={() => handle("multi-page")}
            disabled={loading !== null}
            className="group text-left rounded-2xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all p-4 bg-white disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Files className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-gray-900">Sur {totalPagesMulti} pages</h3>
            </div>
            <PreviewMultiPage canvas={canvas} pages={totalPagesMulti} />
            <p className="text-xs text-gray-600 mt-3 leading-relaxed">
              CV à sa taille originale, étalé sur <strong>{totalPagesMulti} pages A4</strong>.
              Texte plus lisible, mais coupures possibles entre les sections.
            </p>
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 group-hover:gap-2 transition-all">
                {loading === "multi-page" ? "Génération..." : "Télécharger"}
                <Download className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        </div>

        <div className="text-center mt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading !== null}>
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Aperçus visuels ──────────────────────────────────────────────────────────

/** Aperçu mode single-page : représente une feuille A4 avec le contenu
 *  shrunk pour tenir entièrement. */
function PreviewSinglePage({ canvas }: { canvas: HTMLCanvasElement | null }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const preview = ref.current;
    if (!preview || !canvas) return;
    const ctx = preview.getContext("2d");
    if (!ctx) return;

    // Format A4 réduit à largeur 140px → hauteur 198px (ratio 210:297)
    const PREVIEW_W = 140;
    const PREVIEW_H = 198;
    preview.width = PREVIEW_W;
    preview.height = PREVIEW_H;
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);

    // Shrink proportionnel du contenu pour qu'il tienne dans la page preview
    const naturalRatio = canvas.height / canvas.width;
    const a4Ratio = 297 / 210;
    let contentW = PREVIEW_W;
    let contentH = PREVIEW_W * naturalRatio;
    if (contentH > PREVIEW_H) {
      contentH = PREVIEW_H;
      contentW = PREVIEW_H / naturalRatio;
    }
    const offsetX = (PREVIEW_W - contentW) / 2;
    const offsetY = (PREVIEW_H - contentH) / 2;
    ctx.drawImage(canvas, offsetX, offsetY, contentW, contentH);
  }, [canvas]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={ref}
        className="border border-gray-300 shadow-sm rounded"
        style={{ width: "140px", height: "198px" }}
      />
    </div>
  );
}

/** Aperçu mode multi-pages : représente N feuilles A4 cascadées. */
function PreviewMultiPage({
  canvas,
  pages,
}: {
  canvas: HTMLCanvasElement | null;
  pages: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const preview = ref.current;
    if (!preview || !canvas) return;
    const ctx = preview.getContext("2d");
    if (!ctx) return;

    // Hauteur preview = première page + (offset * (N-1))
    const PAGE_W = 120;
    const PAGE_H = 170; // 120 * 297/210 ≈ 170
    const PAGE_OFFSET = 14;
    const TOTAL_W = PAGE_W + (pages - 1) * PAGE_OFFSET;
    const TOTAL_H = PAGE_H + (pages - 1) * PAGE_OFFSET;
    preview.width = TOTAL_W;
    preview.height = TOTAL_H;
    ctx.fillStyle = "transparent";
    ctx.clearRect(0, 0, TOTAL_W, TOTAL_H);

    // Hauteur d'une slice en pixels canvas (correspond à PAGE_H mm)
    const sliceHeightPx = (canvas.width * (297 - 12)) / 210;

    // Dessine les pages de la dernière à la première (pour que la 1ère soit devant)
    for (let i = pages - 1; i >= 0; i--) {
      const x = i * PAGE_OFFSET;
      const y = i * PAGE_OFFSET;
      // Fond blanc + bord
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, PAGE_W, PAGE_H);
      ctx.strokeStyle = "#d1d5db";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, PAGE_W - 1, PAGE_H - 1);

      // Slice correspondante du canvas source
      const srcY = i * sliceHeightPx;
      const srcH = Math.min(sliceHeightPx, canvas.height - srcY);
      if (srcH > 0) {
        const destH = (srcH / sliceHeightPx) * PAGE_H;
        ctx.drawImage(
          canvas,
          0,
          srcY,
          canvas.width,
          srcH,
          x,
          y,
          PAGE_W,
          destH
        );
      }
    }
  }, [canvas, pages]);

  return (
    <div className="flex justify-center">
      <canvas ref={ref} className="rounded" style={{ maxWidth: "100%" }} />
    </div>
  );
}
