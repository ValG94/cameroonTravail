import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Upload, FileText, X } from "lucide-react";
import { storagePut } from "@/lib/storage";

interface DialogCandidatureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offreId: number;
  offreTitre: string;
  onSuccess?: () => void;
}

export function DialogCandidature({
  open,
  onOpenChange,
  offreId,
  offreTitre,
  onSuccess,
}: DialogCandidatureProps) {

  const [lettreMotivation, setLettreMotivation] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [documentsFiles, setDocumentsFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const createMutation = trpc.candidatures.create.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      onSuccess?.();
      // Fermer le dialog après 3 secondes
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
        setLettreMotivation("");
        setCvFile(null);
        setDocumentsFiles([]);
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lettreMotivation.length < 50) {
      toast.error("Votre lettre de motivation doit contenir au moins 50 caractères.");
      return;
    }

    setIsUploading(true);

    try {
      let cvUrl: string | undefined;
      let cvFileKey: string | undefined;

      // Upload du CV si fourni
      if (cvFile) {
        const fileKey = `candidatures/${Date.now()}-${cvFile.name}`;
        const result = await storagePut(fileKey, cvFile);
        cvUrl = result.url;
        cvFileKey = fileKey;
      }

      // Upload des documents supplémentaires si fournis
      let documentsSupplementaires: string | undefined;
      if (documentsFiles.length > 0) {
        const uploadedDocs = await Promise.all(
          documentsFiles.map(async (file) => {
            const fileKey = `candidatures/${Date.now()}-${file.name}`;
            const result = await storagePut(fileKey, file);
            return { name: file.name, url: result.url, key: fileKey };
          })
        );
        documentsSupplementaires = JSON.stringify(uploadedDocs);
      }

      // Créer la candidature
      await createMutation.mutateAsync({
        offreId,
        lettreMotivation,
        cvUrl,
        cvFileKey,
        documentsSupplementaires,
      });
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'upload des fichiers.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le CV ne doit pas dépasser 5 Mo.");
        return;
      }
      setCvFile(file);
    }
  };

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse 5 Mo.`);
        return false;
      }
      return true;
    });
    setDocumentsFiles((prev) => [...prev, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    setDocumentsFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Candidature envoyée !</h2>
            <p className="text-gray-600 mb-2">
              Votre candidature pour le poste <strong>{offreTitre}</strong> a bien été transmise à l'employeur.
            </p>
            <p className="text-sm text-gray-500">
              Vous pouvez suivre l'état de votre candidature dans la section <strong>Mes candidatures</strong>.
            </p>
            <div className="mt-6 w-full bg-gray-100 rounded-full h-1">
              <div className="bg-green-500 h-1 rounded-full animate-[shrink_3s_linear_forwards]" style={{ width: "100%", animation: "width 3s linear forwards" }} />
            </div>
          </div>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle>Postuler à cette offre</DialogTitle>
          <DialogDescription>{offreTitre}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Lettre de motivation */}
          <div className="space-y-2">
            <Label htmlFor="lettreMotivation">
              Lettre de motivation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="lettreMotivation"
              value={lettreMotivation}
              onChange={(e) => setLettreMotivation(e.target.value)}
              placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
              rows={8}
              required
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {lettreMotivation.length} / 50 caractères minimum
            </p>
          </div>

          {/* Upload CV */}
          <div className="space-y-2">
            <Label htmlFor="cv">
              CV (PDF, DOC, DOCX - max 5 Mo)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("cv")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                {cvFile ? cvFile.name : "Choisir un fichier"}
              </Button>
              {cvFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCvFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Si vous ne fournissez pas de CV, celui de votre profil sera utilisé.
            </p>
          </div>

          {/* Documents supplémentaires */}
          <div className="space-y-2">
            <Label htmlFor="documents">
              Documents supplémentaires (Diplômes, certificats, etc.)
            </Label>
            <div className="space-y-2">
              <Input
                id="documents"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentsChange}
                multiple
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("documents")?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Ajouter des documents
              </Button>

              {documentsFiles.length > 0 && (
                <div className="space-y-2">
                  {documentsFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(0)} Ko)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading || createMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isUploading ||
                createMutation.isPending ||
                lettreMotivation.length < 50
              }
            >
              {isUploading || createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Envoyer ma candidature"
              )}
            </Button>
          </DialogFooter>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
