import { useAuth } from "@/_core/hooks/useAuth";
import { EmployeurNav } from "@/components/EmployeurNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Briefcase, Eye, FileText, Plus, TrendingUp, Users } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function EmployeurDashboard() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: employeur, isLoading: employeurLoading } = trpc.employeur.getProfile.useQuery();
  const { data: stats, isLoading: statsLoading } = trpc.jobs.getStats.useQuery();
  const { data: offresRecentes } = trpc.jobs.getByEmployeur.useQuery();

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "employeur" && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || employeurLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("nav.dashboard")}
          </h1>
          <p className="text-gray-600">
            Bienvenue {employeur?.nomEntreprise || user?.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offres actives</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.offresActives || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Offres publiées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidatures</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.candidatures || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Candidatures reçues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.vuesTotales || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Vues sur vos offres</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offres restantes</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeur?.nombreOffresRestantes || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Formule: {employeur?.formuleAbonnement || "gratuit"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Publier une offre d'emploi
              </CardTitle>
              <CardDescription>
                Créez et publiez une nouvelle offre d'emploi pour attirer des candidats qualifiés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/employeur/publier")} className="w-full">
                <Plus className="mr-2 h-5 w-5" />
                {t("nav.postJob")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                Gérer mes offres
              </CardTitle>
              <CardDescription>
                Consultez, modifiez ou supprimez vos offres d'emploi existantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setLocation("/employeur/offres")}
                className="w-full"
              >
                {t("nav.myJobs")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        {!employeur && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Complétez votre profil employeur</CardTitle>
              <CardDescription className="text-orange-700">
                Complétez votre profil pour commencer à publier des offres d'emploi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/employeur/profil")}>
                Compléter mon profil
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Offers */}
        <Card>
          <CardHeader>
            <CardTitle>Mes dernières offres</CardTitle>
            <CardDescription>Consultez vos offres d'emploi récentes</CardDescription>
          </CardHeader>
          <CardContent>
            {offresRecentes && offresRecentes.length > 0 ? (
              <div className="space-y-3">
                {offresRecentes.slice(0, 5).map((offre) => (
                  <div key={offre.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{offre.titre}</p>
                      <p className="text-sm text-gray-500">{offre.ville} · {offre.typeContrat}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">{offre.nombreCandidatures || 0} candidature(s)</span>
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/employeur/offres`)}>Voir</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2" onClick={() => setLocation("/employeur/offres")}>
                  Voir toutes mes offres
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune offre publiée
                </h3>
                <p className="text-gray-600 mb-6">
                  Commencez par publier votre première offre d'emploi
                </p>
                <Button onClick={() => setLocation("/employeur/publier")}>
                  <Plus className="mr-2 h-5 w-5" />
                  Publier une offre
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
