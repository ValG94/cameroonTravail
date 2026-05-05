import { EmployeurNav } from "@/components/EmployeurNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Briefcase,
  Calendar,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import { DialogCandidatureDetail } from "@/components/DialogCandidatureDetail";

const statutLabels: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  vue: { label: "Vue", color: "bg-blue-100 text-blue-700" },
  retenue: { label: "Retenue", color: "bg-green-100 text-green-700" },
  rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700" },
  entretien: { label: "Entretien", color: "bg-purple-100 text-purple-700" },
};

export default function EmployeurCandidatures() {
  const [statutFilter, setStatutFilter] = useState<string>("all");
  const [selectedCandidature, setSelectedCandidature] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: candidatures, isLoading, refetch } = trpc.candidatures.getByEmployeur.useQuery(
    statutFilter === "all" ? undefined : { statut: statutFilter as any }
  );

  const handleViewDetail = (candidature: any) => {
    setSelectedCandidature(candidature);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCandidature(null);
    refetch();
  };

  // Compter les candidatures par statut
  const counts = candidatures?.reduce((acc, c) => {
    acc[c.statut] = (acc[c.statut] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidatures reçues</h1>
          <p className="text-gray-600 mt-2">
            Gérez et suivez toutes les candidatures à vos offres d'emploi
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {candidatures?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          {Object.entries(statutLabels).map(([statut, info]) => (
            <Card key={statut}>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {counts[statut] || 0}
                </div>
                <div className="text-sm text-gray-600">{info.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Statut:</label>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(statutLabels).map(([statut, info]) => (
                      <SelectItem key={statut} value={statut}>
                        {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des candidatures */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : candidatures && candidatures.length > 0 ? (
          <div className="space-y-4">
            {candidatures.map((candidature) => {
              const statutInfo = statutLabels[candidature.statut] || {
                label: candidature.statut,
                color: "bg-gray-100 text-gray-700",
              };

              return (
                <Card key={candidature.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${statutInfo.color}`}
                          >
                            {statutInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            pour {candidature.offreTitre}
                          </span>
                        </div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {candidature.candidatPhotoUrl && (
                            <img
                              src={candidature.candidatPhotoUrl}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <span>
                            {candidature.candidatPrenom} {candidature.candidatNom}
                          </span>
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {candidature.candidatEmail}
                          </span>
                          {candidature.candidatTelephone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {candidature.candidatTelephone}
                            </span>
                          )}
                          {candidature.candidatVille && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {candidature.candidatVille}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Candidature reçue le{" "}
                          {new Date(candidature.dateCandidature).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {candidature.dateReponse && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span>
                            Réponse envoyée le{" "}
                            {new Date(candidature.dateReponse).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleViewDetail(candidature)}
                          size="sm"
                        >
                          Voir les détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune candidature
              </h3>
              <p className="text-gray-600">
                {statutFilter === "all"
                  ? "Vous n'avez pas encore reçu de candidatures."
                  : `Aucune candidature avec le statut "${statutLabels[statutFilter]?.label}".`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de détail */}
      {selectedCandidature && (
        <DialogCandidatureDetail
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          candidature={selectedCandidature}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
