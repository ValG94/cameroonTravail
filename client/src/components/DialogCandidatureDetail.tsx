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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

interface DialogCandidatureDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidature: any;
  onClose: () => void;
}

const statutLabels: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  vue: { label: "Vue", color: "bg-blue-100 text-blue-700" },
  retenue: { label: "Retenue", color: "bg-green-100 text-green-700" },
  rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700" },
  entretien: { label: "Entretien", color: "bg-purple-100 text-purple-700" },
};

export function DialogCandidatureDetail({
  open,
  onOpenChange,
  candidature,
  onClose,
}: DialogCandidatureDetailProps) {
  const [statut, setStatut] = useState(candidature.statut);
  const [commentaire, setCommentaire] = useState(candidature.commentaireEmployeur || "");

  const updateMutation = trpc.candidatures.updateStatut.useMutation({
    onSuccess: () => {
      toast.success("Candidature mise à jour avec succès");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateMutation.mutateAsync({
      candidatureId: candidature.id,
      statut,
      commentaire: commentaire || undefined,
    });
  };

  const documentsSupplementaires = candidature.documentsSupplementaires
    ? JSON.parse(candidature.documentsSupplementaires)
    : [];

  const statutInfo = statutLabels[candidature.statut] || {
    label: candidature.statut,
    color: "bg-gray-100 text-gray-700",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${statutInfo.color}`}>
              {statutInfo.label}
            </span>
          </div>
          <DialogTitle className="text-2xl">
            {candidature.candidatPrenom} {candidature.candidatNom}
          </DialogTitle>
          <DialogDescription>
            Candidature pour: {candidature.offreTitre}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du candidat */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informations du candidat</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{candidature.candidatEmail}</span>
              </div>
              {candidature.candidatTelephone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{candidature.candidatTelephone}</span>
                </div>
              )}
              {candidature.candidatVille && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{candidature.candidatVille}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  Candidature du{" "}
                  {new Date(candidature.dateCandidature).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lettre de motivation */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Lettre de motivation</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {candidature.lettreMotivation}
              </p>
            </div>
          </div>

          <Separator />

          {/* CV et documents */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Documents</h3>
            <div className="space-y-2">
              {candidature.cvUrl && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">CV du candidat</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={candidature.cvUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </a>
                  </Button>
                </div>
              )}

              {documentsSupplementaires.length > 0 && (
                <>
                  <p className="text-sm font-medium text-gray-700 mt-4">
                    Documents supplémentaires:
                  </p>
                  {documentsSupplementaires.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <span className="text-sm">{doc.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          <Separator />

          {/* Gestion de la candidature */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Gérer la candidature</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut de la candidature</Label>
                  <Select value={statut} onValueChange={setStatut}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statutLabels).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          {info.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commentaire">
                    Commentaire / Message au candidat (optionnel)
                  </Label>
                  <Textarea
                    id="commentaire"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Ajoutez un commentaire ou un message pour le candidat..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || statut === candidature.statut && commentaire === (candidature.commentaireEmployeur || "")}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
