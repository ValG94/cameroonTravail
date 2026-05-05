import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Bell, BellOff, Plus, Trash2, MapPin, Briefcase, Tag, Clock } from "lucide-react";
import { CAMEROON_REGIONS, BUSINESS_SECTORS, CONTRACT_TYPES } from "@shared/cameroon-data";

const FREQUENCE_LABELS: Record<string, string> = {
  immediate: "Immédiate (dès la publication)",
  quotidien: "Quotidienne (résumé du jour)",
  hebdomadaire: "Hebdomadaire (résumé de la semaine)",
};

export default function CandidatAlertes() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: alertes = [], isLoading } = trpc.alertes.list.useQuery();

  const deleteMutation = trpc.alertes.delete.useMutation({
    onSuccess: () => {
      toast.success("Alerte supprimée");
      utils.alertes.list.invalidate();
      setDeleteId(null);
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const toggleMutation = trpc.alertes.toggle.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.active ? "Alerte activée" : "Alerte mise en pause");
      utils.alertes.list.invalidate();
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  if (!user || user.profileType !== "candidat") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-6 w-6 text-green-600" />
              Mes alertes emploi
            </h1>
            <p className="text-gray-500 mt-1">
              Recevez des emails dès qu'une offre correspond à vos critères.
            </p>
          </div>
          <Button onClick={() => setLocation("/offres")} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer une alerte
          </Button>
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : alertes.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune alerte configurée
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Créez des alertes depuis la page de recherche d'offres pour être notifié
                automatiquement par email.
              </p>
              <Button onClick={() => setLocation("/offres")}>
                <Plus className="h-4 w-4 mr-2" />
                Aller à la recherche d'offres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alertes.map((alerte) => {
              const secteurLabel =
                BUSINESS_SECTORS.find((s) => s.value === alerte.secteur)?.labelFr || alerte.secteur;
              const regionLabel =
                CAMEROON_REGIONS.find((r) => r.value === alerte.region)?.labelFr || alerte.region;
              const contratLabel =
                CONTRACT_TYPES.find((c) => c.value === alerte.typeContrat)?.labelFr ||
                alerte.typeContrat;

              return (
                <Card
                  key={alerte.id}
                  className={`transition-opacity ${!alerte.active ? "opacity-60" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                          {alerte.active ? (
                            <Bell className="h-4 w-4 text-green-600" />
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" />
                          )}
                          {alerte.nom}
                        </CardTitle>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {FREQUENCE_LABELS[alerte.frequence] || alerte.frequence}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {alerte.active ? "Active" : "En pause"}
                          </span>
                          <Switch
                            checked={alerte.active ?? false}
                            onCheckedChange={(checked) =>
                              toggleMutation.mutate({ id: alerte.id, active: checked })
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(alerte.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {alerte.motsCles && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Tag className="h-3 w-3" />
                          {alerte.motsCles}
                        </Badge>
                      )}
                      {alerte.typeOffre && alerte.typeOffre !== "tous" && (
                        <Badge
                          className={`text-xs ${
                            alerte.typeOffre === "public"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {alerte.typeOffre === "public" ? "Emploi Public" : "Emploi Privé"}
                        </Badge>
                      )}
                      {secteurLabel && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Briefcase className="h-3 w-3" />
                          {secteurLabel}
                        </Badge>
                      )}
                      {regionLabel && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {regionLabel}
                        </Badge>
                      )}
                      {contratLabel && (
                        <Badge variant="outline" className="text-xs">
                          {contratLabel}
                        </Badge>
                      )}
                      {!alerte.motsCles &&
                        !alerte.secteur &&
                        !alerte.region &&
                        !alerte.typeContrat &&
                        alerte.typeOffre === "tous" && (
                          <span className="text-xs text-gray-400 italic">
                            Toutes les offres (aucun filtre)
                          </span>
                        )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette alerte ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous ne recevrez plus de notifications pour cette alerte. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
