import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  FileText,
} from "lucide-react";
import { Link } from "wouter";

const statutLabels: Record<string, { label: string; color: string }> = {
  en_attente: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  vue: { label: "Vue", color: "bg-blue-100 text-blue-700" },
  retenue: { label: "Retenue", color: "bg-green-100 text-green-700" },
  rejetee: { label: "Rejetée", color: "bg-red-100 text-red-700" },
  entretien: { label: "Entretien", color: "bg-purple-100 text-purple-700" },
};

export default function CandidatCandidatures() {
  const { data: candidatures, isLoading } = trpc.candidatures.getByCandidat.useQuery();

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes candidatures</h1>
          <p className="text-gray-600 mt-2">
            Suivez l'état de vos candidatures et consultez les réponses des employeurs
          </p>
        </div>

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
                          {candidature.offreTypeOffre === "public" ? (
                            <Building2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              candidature.offreTypeOffre === "public"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {candidature.offreTypeOffre === "public"
                              ? "Emploi Public"
                              : "Emploi Privé"}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${statutInfo.color}`}
                          >
                            {statutInfo.label}
                          </span>
                        </div>
                        <CardTitle className="text-xl">
                          <Link
                            href={`/offre/${candidature.offreId}`}
                            className="hover:text-green-600 transition-colors"
                          >
                            {candidature.offreTitre}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {candidature.entreprise}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {candidature.offreVille}, {candidature.offreRegion}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {candidature.offreTypeContrat}
                          </span>
                          {candidature.offreSalaire && (
                            <span className="flex items-center gap-1">
                              <span className="text-sm">💰</span>
                              {candidature.offreSalaire} FCFA
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
                          Candidature envoyée le{" "}
                          {new Date(candidature.dateCandidature).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {candidature.dateReponse && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>
                            Réponse reçue le{" "}
                            {new Date(candidature.dateReponse).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      )}

                      {candidature.commentaireEmployeur && (
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              Message de l'employeur
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {candidature.commentaireEmployeur}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/offre/${candidature.offreId}`}>
                            Voir l'offre
                          </Link>
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
              <p className="text-gray-600 mb-6">
                Vous n'avez pas encore postulé à des offres d'emploi.
              </p>
              <Button asChild>
                <Link href="/recherche-emploi">Rechercher des offres</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
