import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Check,
  Crown,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Modal "Créer un nouveau CV" — 2 chemins clairs :
 *
 *  1. UPLOAD : l'utilisateur importe son CV (PDF ou Word), l'IA
 *     extrait automatiquement les données pour peupler son profil
 *     candidat. Le fichier est aussi sauvegardé comme "CV document"
 *     visible dans sa liste + CVthèque.
 *
 *  2. TEMPLATE PREMIUM : redirige vers /candidat/templates, la
 *     bibliothèque payante (10 modèles).
 *
 * Charte : matches la refonte premium (deep green + gold + ivory,
 * rounded-2xl, i18n complète FR/EN). Confirmations et toasts en
 * i18n également.
 */

const C = {
  green: "#009B5A",
  greenAction: "#007A3D",
  deepGreen: "#063F24",
  darkerGreen: "#031F16",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  goldSoft: "rgba(246, 195, 67, 0.15)",
  ivory: "#FAF7EF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

interface NewCvModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Callback appelé après un upload réussi (fichier stocké + IA
   * exécutée + cv document créé). Utilisé par la page parent pour
   * rafraîchir la liste des CV.
   */
  onUploadSuccess?: () => void;
}

export function NewCvModal({ open, onOpenChange, onUploadSuccess }: NewCvModalProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // ─── Upload state ─────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadCVMutation = trpc.candidat.uploadCV.useMutation();
  const createCvDocMutation = trpc.cv.create.useMutation();

  const busy = uploadCVMutation.isPending || createCvDocMutation.isPending;

  const resetAndClose = () => {
    setSelectedFile(null);
    onOpenChange(false);
  };

  // Validation format + taille avant sélection
  const validateFile = (file: File): string | null => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type)) return t("createCvPage.modal.upload.errorFormat");
    if (file.size > 10 * 1024 * 1024) return t("createCvPage.modal.upload.errorSize");
    return null;
  };

  const handleFileSelect = (file: File) => {
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setSelectedFile(file);
  };

  // Handlers input + dropzone
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);

  // Flow d'upload : 1) candidat.uploadCV (extraction IA + profile update)
  // 2) cv.create (crée un CV document pour la liste + CVthèque)
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error("File read failed"));
        reader.readAsDataURL(selectedFile);
      });
      const fileData = base64.split(",")[1];

      // 1) Upload + extraction IA
      const uploadResult = await uploadCVMutation.mutateAsync({
        fileData,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
      });

      // 2) Créer un cv document pour l'afficher dans la liste
      if (uploadResult?.cvUrl) {
        await createCvDocMutation.mutateAsync({
          nom: selectedFile.name.replace(/\.(pdf|docx?|DOCX?|PDF)$/, ""),
          type: "upload",
          fileUrl: uploadResult.cvUrl,
          langue: "fr",
        });
      }

      toast.success(t("createCvPage.modal.upload.success"));
      utils.candidat.getProfile.invalidate();
      utils.cv.list.invalidate();
      onUploadSuccess?.();
      resetAndClose();
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    }
  };

  const goTemplates = () => {
    resetAndClose();
    setLocation("/candidat/templates");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) onOpenChange(o); }}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden rounded-2xl border-0"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Header avec background gradient vert */}
        <div
          className="relative p-6 sm:p-7"
          style={{
            background: `linear-gradient(160deg, ${C.deepGreen} 0%, ${C.darkerGreen} 100%)`,
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: C.gold }}
          />
          <DialogHeader>
            <DialogTitle className="text-white font-extrabold tracking-tight" style={{ fontSize: "clamp(20px, 2.2vw, 26px)" }}>
              {t("createCvPage.modal.title")}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
              {t("createCvPage.modal.subtitle")}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Contenu : 2 options */}
        <div className="p-6 sm:p-7 space-y-4">
          {/* Option 1 : Upload */}
          <div
            className="rounded-2xl border p-5 transition-all"
            style={{
              borderColor: selectedFile ? C.green : C.border,
              backgroundColor: selectedFile ? C.greenSoft : "#ffffff",
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: C.greenSoft }}
              >
                <Upload className="h-5 w-5" style={{ color: C.green }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[15px]" style={{ color: C.textMain }}>
                    {t("createCvPage.modal.upload.title")}
                  </h3>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 flex items-center gap-1"
                    style={{ backgroundColor: C.goldSoft, color: C.deepGreen }}
                  >
                    <Zap className="h-2.5 w-2.5" />
                    {t("createCvPage.modal.upload.badge")}
                  </span>
                </div>
                <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: C.textMuted }}>
                  {t("createCvPage.modal.upload.subtitle")}
                </p>
              </div>
            </div>

            {/* Dropzone / fichier sélectionné */}
            {selectedFile ? (
              <div
                className="flex items-center gap-3 rounded-xl border p-3.5"
                style={{ borderColor: C.green, backgroundColor: "#ffffff" }}
              >
                <FileText className="h-5 w-5 shrink-0" style={{ color: C.green }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-semibold truncate" style={{ color: C.textMain }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-[11.5px]" style={{ color: C.textMuted }}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  disabled={busy}
                  className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" style={{ color: C.textMuted }} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className="w-full rounded-xl border-2 border-dashed py-6 px-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors"
                style={{
                  borderColor: dragOver ? C.green : C.border,
                  backgroundColor: dragOver ? C.greenSoft : "#F8FAFC",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-1"
                  style={{ backgroundColor: dragOver ? "#ffffff" : C.greenSoft }}
                >
                  <Upload className="h-4.5 w-4.5" style={{ color: C.green }} />
                </div>
                <p className="font-semibold text-sm" style={{ color: C.textMain }}>
                  {t("createCvPage.modal.upload.dropzoneTitle")}
                </p>
                <p className="text-[12.5px]" style={{ color: C.textMuted }}>
                  {t("createCvPage.modal.upload.dropzoneSubtitle")}
                </p>
                <p className="text-[11.5px] mt-1" style={{ color: C.textMuted }}>
                  {t("createCvPage.modal.upload.dropzoneFormats")}
                </p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={onInputChange}
              className="hidden"
            />

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={busy}
                className="w-full mt-3 rounded-xl h-11 font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: C.deepGreen }}
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("createCvPage.modal.upload.uploading")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("createCvPage.modal.upload.uploadBtn")}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Séparateur OU */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
            <span className="text-[11.5px] font-bold uppercase tracking-widest" style={{ color: C.textMuted }}>
              {t("createCvPage.modal.or")}
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: C.border }} />
          </div>

          {/* Option 2 : Template Premium */}
          <button
            type="button"
            onClick={goTemplates}
            disabled={busy}
            className="w-full rounded-2xl border p-5 transition-all text-left hover:border-[color:var(--hover)]"
            style={{
              borderColor: C.border,
              backgroundColor: "#ffffff",
              ["--hover" as string]: C.gold,
            } as React.CSSProperties}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: C.goldSoft }}
              >
                <Crown className="h-5 w-5" style={{ color: C.gold }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-[15px]" style={{ color: C.textMain }}>
                    {t("createCvPage.modal.template.title")}
                  </h3>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 flex items-center gap-1 border"
                    style={{ backgroundColor: C.goldSoft, color: C.deepGreen, borderColor: C.gold }}
                  >
                    <Crown className="h-2.5 w-2.5" />
                    {t("createCvPage.modal.template.badge")}
                  </span>
                </div>
                <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: C.textMuted }}>
                  {t("createCvPage.modal.template.subtitle")}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 mt-2.5" style={{ color: C.deepGreen }} />
            </div>
          </button>

          {/* Cancel */}
          <div className="pt-2 flex justify-end">
            <Button
              variant="ghost"
              onClick={resetAndClose}
              disabled={busy}
              className="text-sm"
              style={{ color: C.textMuted }}
            >
              {t("createCvPage.modal.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
