import { useAuth } from "@/_core/hooks/useAuth";
import { EmployeurNav } from "@/components/EmployeurNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Briefcase, Crown, Eye, FileText, Plus, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
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
            {t("bo.employerDashboard.welcome", { name: employeur?.nomEntreprise || user?.name })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bo.employerDashboard.stats.activeJobs")}</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.offresActives || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{t("bo.employerDashboard.stats.activeJobsDesc")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bo.employerDashboard.stats.applications")}</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.candidatures || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{t("bo.employerDashboard.stats.applicationsDesc")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bo.employerDashboard.stats.views")}</CardTitle>
              <Eye className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.vuesTotales || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{t("bo.employerDashboard.stats.viewsDesc")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("bo.employerDashboard.stats.remainingJobs")}</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeur?.nombreOffresRestantes || 0}</div>
              <p className="text-xs text-gray-500 mt-1">{t("bo.employerDashboard.stats.remainingJobsDesc")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bannière quota faible / épuisé. Affichée uniquement si une
            formule est active (sinon la bannière "Aucune formule" qui
            suit suffit) et que le quota est ≤ 3 offres. Couleur :
            ambre pour avertissement (1-3), rouge pour épuisé (0). */}
        {(() => {
          const formule = employeur?.formuleAbonnement;
          const quota = employeur?.nombreOffresRestantes ?? 0;
          const hasActiveFormule = formule && formule !== "gratuit";
          if (!hasActiveFormule || quota > 3) return null;
          const isEmpty = quota === 0;
          return (
            <Card
              className="border-2 mb-6"
              style={{
                borderColor: isEmpty ? "#FCA5A5" : "#FCD34D",
                backgroundColor: isEmpty ? "#FEF2F2" : "#FFFBEB",
              }}
            >
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isEmpty ? "#DC2626" : "#F59E0B" }}
                >
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base" style={{ color: isEmpty ? "#7F1D1D" : "#78350F" }}>
                    {isEmpty
                      ? t("bo.employerDashboard.quota.emptyTitle")
                      : t("bo.employerDashboard.quota.lowTitle", { count: quota })}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: isEmpty ? "#991B1B" : "#92400E" }}>
                    {isEmpty
                      ? t("bo.employerDashboard.quota.emptyDesc")
                      : t("bo.employerDashboard.quota.lowDesc")}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setLocation("/tarifs");
                    setTimeout(() => {
                      document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 80);
                  }}
                  className="text-white shrink-0"
                  style={{ backgroundColor: isEmpty ? "#DC2626" : "#F59E0B" }}
                >
                  {isEmpty ? t("bo.employerDashboard.quota.subscribeCta") : t("bo.employerDashboard.quota.renewCta")}
                </Button>
              </CardContent>
            </Card>
          );
        })()}

        {/* Formule actuelle */}
        {(() => {
          // Plus de package gratuit côté recruteur : si formuleAbonnement vaut
          // 'gratuit' (valeur historique = pas d'abonnement actif), on affiche
          // une bannière d'incitation à souscrire, sans mentionner "Gratuit".
          const formule = employeur?.formuleAbonnement || "gratuit";
          const formuleConfig = {
            gratuit: {
              label: t("bo.employerDashboard.formule.noneLabel"),
              icon: Zap,
              gradient: "from-gray-700 to-gray-900",
              badgeBg: "bg-white/20 text-white border border-white/30",
              description: t("bo.employerDashboard.formule.noneDesc"),
              ctaLabel: t("bo.employerDashboard.formule.chooseCta"),
              ctaVariant: "primary" as const,
            },
            // L'ancienne enum 'professionnel' est mappée sur la nouvelle
            // dénomination commerciale "Offre avantage" (50 000 FCFA).
            professionnel: {
              label: t("bo.employerDashboard.formule.advantageLabel"),
              icon: Sparkles,
              gradient: "from-orange-500 to-amber-600",
              badgeBg: "bg-orange-100 text-orange-700",
              description: t("bo.employerDashboard.formule.advantageDesc"),
              ctaLabel: t("bo.employerDashboard.formule.seeFormulesCta"),
              ctaVariant: "outline" as const,
            },
            // 'entreprise' → "Offre Premium" (150 000 FCFA, offres illimitées).
            entreprise: {
              label: t("bo.employerDashboard.formule.premiumLabel"),
              icon: Crown,
              gradient: "from-purple-500 to-indigo-600",
              badgeBg: "bg-purple-100 text-purple-700",
              description: t("bo.employerDashboard.formule.premiumDesc"),
              ctaLabel: t("bo.employerDashboard.formule.seeFormulesCta"),
              ctaVariant: "outline" as const,
            },
          }[formule];
          const Icon = formuleConfig.icon;

          return (
            <Card className="mb-8 overflow-hidden border-0 shadow-md">
              <div className={`bg-gradient-to-r ${formuleConfig.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-2xl p-3">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium opacity-90">{t("bo.employerDashboard.formule.currentLabel")}</p>
                        <Badge className={`${formuleConfig.badgeBg} hover:${formuleConfig.badgeBg}`}>
                          {formuleConfig.label}
                        </Badge>
                      </div>
                      <p className="text-white/90 text-sm">{formuleConfig.description}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      // Navigation SPA + scroll vers la grille de tarifs
                      // (id="tarifs" dans EspaceRecruteur). Le setTimeout
                      // laisse le temps à la page de monter avant de
                      // chercher l'élément à scroller.
                      setLocation("/tarifs");
                      setTimeout(() => {
                        document
                          .getElementById("tarifs")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 80);
                    }}
                    className={
                      formuleConfig.ctaVariant === "primary"
                        ? "bg-white text-orange-600 hover:bg-orange-50"
                        : "bg-white/20 text-white hover:bg-white/30 border border-white/40"
                    }
                  >
                    {formuleConfig.ctaLabel}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t("bo.employerDashboard.actions.postJobTitle")}
              </CardTitle>
              <CardDescription>
                {t("bo.employerDashboard.actions.postJobDesc")}
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
                {t("bo.employerDashboard.actions.manageJobsTitle")}
              </CardTitle>
              <CardDescription>
                {t("bo.employerDashboard.actions.manageJobsDesc")}
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
              <CardTitle className="text-orange-900">{t("bo.employerDashboard.completeProfile.title")}</CardTitle>
              <CardDescription className="text-orange-700">
                {t("bo.employerDashboard.completeProfile.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/employeur/profil")}>
                {t("bo.employerDashboard.completeProfile.cta")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Offers */}
        <Card>
          <CardHeader>
            <CardTitle>{t("bo.employerDashboard.recentJobs.title")}</CardTitle>
            <CardDescription>{t("bo.employerDashboard.recentJobs.description")}</CardDescription>
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
                      <span className="text-sm text-gray-500">
                        {t("bo.employerDashboard.recentJobs.applicationsCount", { count: offre.nombreCandidatures || 0 })}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => setLocation(`/employeur/offres`)}>
                        {t("bo.employerDashboard.recentJobs.viewBtn")}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2" onClick={() => setLocation("/employeur/offres")}>
                  {t("bo.employerDashboard.recentJobs.viewAllBtn")}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t("bo.employerDashboard.recentJobs.emptyTitle")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("bo.employerDashboard.recentJobs.emptyDesc")}
                </p>
                <Button onClick={() => setLocation("/employeur/publier")}>
                  <Plus className="mr-2 h-5 w-5" />
                  {t("bo.employerDashboard.recentJobs.emptyCta")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
