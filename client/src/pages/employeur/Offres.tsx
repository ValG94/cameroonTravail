import { EmployeurNav } from "@/components/EmployeurNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Archive,
  AlertTriangle,
  Briefcase,
  Calendar,
  CheckCircle2,
  Copy,
  Eye,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TabStatut = "toutes" | "publiee" | "pourvue" | "expiree" | "brouillon";

export default function EmployeurOffres() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const statutLabels: Record<string, { label: string; color: string }> = {
    brouillon: { label: t("bo.employerJobs.statusDraft"), color: "bg-gray-100 text-gray-700" },
    publiee: { label: t("bo.employerJobs.statusPublished"), color: "bg-green-100 text-green-700" },
    expiree: { label: t("bo.employerJobs.statusExpired"), color: "bg-red-100 text-red-700" },
    pourvue: { label: t("bo.employerJobs.statusFilled"), color: "bg-amber-100 text-amber-700" },
  };
  const [activeTab, setActiveTab] = useState<TabStatut>("toutes");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [republierDialogOpen, setRepublierDialogOpen] = useState(false);
  const [offreToDelete, setOffreToDelete] = useState<number | null>(null);
  const [offreToArchive, setOffreToArchive] = useState<{ id: number; titre: string } | null>(null);
  const [offreToRepublier, setOffreToRepublier] = useState<{ id: number; titre: string } | null>(null);
  const [offreTitreToDelete, setOffreTitreToDelete] = useState<string>("");

  const { data: allOffres, isLoading, refetch } = trpc.jobs.getByEmployeur.useQuery();

  const offres = useMemo(() => {
    if (!allOffres) return [];
    if (activeTab === "toutes") return allOffres;
    if (activeTab === "expiree") {
      return allOffres.filter(o =>
        o.statut === "expiree" || (o.dateLimite && new Date(o.dateLimite) < new Date() && o.statut === "publiee")
      );
    }
    return allOffres.filter(o => o.statut === activeTab);
  }, [allOffres, activeTab]);

  const counts = useMemo(() => {
    if (!allOffres) return { toutes: 0, publiee: 0, pourvue: 0, expiree: 0, brouillon: 0 };
    return {
      toutes: allOffres.length,
      publiee: allOffres.filter(o => o.statut === "publiee" && !(o.dateLimite && new Date(o.dateLimite) < new Date())).length,
      pourvue: allOffres.filter(o => o.statut === "pourvue").length,
      expiree: allOffres.filter(o => o.statut === "expiree" || (o.dateLimite && new Date(o.dateLimite) < new Date() && o.statut === "publiee")).length,
      brouillon: allOffres.filter(o => o.statut === "brouillon").length,
    };
  }, [allOffres]);

  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerJobs.deletedToast"));
      setDeleteDialogOpen(false);
      setOffreToDelete(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const republierMutation = trpc.jobs.republier.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerJobs.republishedToast"));
      setRepublierDialogOpen(false);
      setOffreToRepublier(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const archiveMutation = trpc.jobs.archive.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerJobs.archivedToast"));
      setArchiveDialogOpen(false);
      setOffreToArchive(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: number, titre: string) => {
    setOffreToDelete(id);
    setOffreTitreToDelete(titre);
    setDeleteDialogOpen(true);
  };

  const handleArchive = (id: number, titre: string) => {
    setOffreToArchive({ id, titre });
    setArchiveDialogOpen(true);
  };

  const handleRepublier = (id: number, titre: string) => {
    setOffreToRepublier({ id, titre });
    setRepublierDialogOpen(true);
  };

  const confirmRepublier = () => {
    if (offreToRepublier) {
      republierMutation.mutate({ id: offreToRepublier.id });
    }
  };

  const confirmDelete = () => {
    if (offreToDelete) {
      deleteMutation.mutate({ id: offreToDelete });
    }
  };

  const confirmArchive = () => {
    if (offreToArchive) {
      archiveMutation.mutate({ id: offreToArchive.id });
    }
  };
  
  const handleDuplicate = (id: number) => {
    setLocation(`/employeur/publier?duplicateId=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("bo.employerJobs.title")}</h1>
            <p className="text-gray-600 mt-1">
              {t("bo.employerJobs.totalCount", { count: counts.toutes })}
            </p>
          </div>
          <Button onClick={() => setLocation("/employeur/publier")}>
            {t("bo.employerJobs.newJobBtn")}
          </Button>
        </div>

        {/* Onglets de filtrage */}
        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-6 overflow-x-auto">
          {([
            { key: "toutes", label: t("bo.employerJobs.tabs.all"), count: counts.toutes },
            { key: "publiee", label: t("bo.employerJobs.tabs.active"), count: counts.publiee },
            { key: "pourvue", label: t("bo.employerJobs.tabs.filled"), count: counts.pourvue },
            { key: "expiree", label: t("bo.employerJobs.tabs.expired"), count: counts.expiree },
            { key: "brouillon", label: t("bo.employerJobs.tabs.draft"), count: counts.brouillon },
          ] as { key: TabStatut; label: string; count: number }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("bo.employerJobs.loading")}</p>
          </div>
        ) : offres && offres.length > 0 ? (
          <div className="space-y-4">
            {offres.map((offre) => {
              const statutInfo = statutLabels[offre.statut] || {
                label: offre.statut,
                color: "bg-gray-100 text-gray-700",
              };
              const isPourvue = offre.statut === "pourvue";
              const isExpired = offre.dateLimite && new Date(offre.dateLimite) < new Date();

              return (
                <Card
                  key={offre.id}
                  className={`hover:shadow-md transition-shadow ${isPourvue ? "opacity-75 border-amber-200" : ""}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-1 rounded flex items-center gap-1 ${statutInfo.color}`}>
                            {isPourvue && <CheckCircle2 className="h-3 w-3" />}
                            {statutInfo.label}
                          </span>
                          {isExpired && offre.statut === "publiee" && (
                            <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-700">
                              {t("bo.employerJobs.statusExpired")}
                            </span>
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              offre.typeOffre === "public"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {offre.typeOffre === "public" ? t("bo.employerJobs.publicJob") : t("bo.employerJobs.privateJob")}
                          </span>
                        </div>
                        <CardTitle className="text-xl">
                          <Link
                            href={`/offre/${offre.id}`}
                            className="hover:text-green-600 transition-colors"
                          >
                            {offre.titre}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {offre.ville}, {offre.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {offre.typeContrat}
                          </span>
                          {offre.secteur && (
                            <span className="flex items-center gap-1">
                              <span className="text-sm">📁</span>
                              {offre.secteur}
                            </span>
                          )}
                        </CardDescription>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/offre/${offre.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("bo.employerJobs.actions.viewJob")}
                            </Link>
                          </DropdownMenuItem>
                          {!isPourvue && (
                            <DropdownMenuItem
                              onClick={() => setLocation(`/employeur/offres/${offre.id}/modifier`)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              {t("bo.employerJobs.actions.edit")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDuplicate(offre.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            {t("bo.employerJobs.actions.duplicate")}
                          </DropdownMenuItem>
                          {!isPourvue && (
                            <DropdownMenuItem
                              onClick={() => handleArchive(offre.id, offre.titre)}
                              className="text-amber-600"
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              {t("bo.employerJobs.actions.markFilled")}
                            </DropdownMenuItem>
                          )}
                          {isPourvue && (
                            <DropdownMenuItem
                              onClick={() => handleRepublier(offre.id, offre.titre)}
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {t("bo.employerJobs.actions.republish")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(offre.id, offre.titre)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("bo.employerJobs.actions.deleteForever")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {t("bo.employerJobs.publishedOn", { date: new Date(offre.datePublication).toLocaleDateString() })}
                          </span>
                        </div>
                        {offre.dateLimite && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {t("bo.employerJobs.expiresOn", { date: new Date(offre.dateLimite).toLocaleDateString() })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-600">
                            {t("bo.employerJobs.applications", { count: offre.nombreCandidatures || 0 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-600">
                            {t("bo.employerJobs.views", { count: offre.nombreVues || 0 })}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/offre/${offre.id}`}>
                            {t("bo.employerJobs.actions.viewJob")}
                          </Link>
                        </Button>
                        {(offre.nombreCandidatures || 0) > 0 && (
                          <Button asChild size="sm">
                            <Link href="/employeur/candidatures">
                              {t("bo.employerJobs.actions.viewApplications")}
                            </Link>
                          </Button>
                        )}
                        {!isPourvue && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                  onClick={() => handleArchive(offre.id, offre.titre)}
                                >
                                  <Archive className="h-4 w-4 mr-1" />
                                  {t("bo.employerJobs.actions.archive")}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-sm">
                                {t("bo.employerJobs.tooltipArchive")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {isPourvue && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleRepublier(offre.id, offre.titre)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  {t("bo.employerJobs.actions.republishShort")}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-sm">
                                {t("bo.employerJobs.tooltipRepublish")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
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
                {t("bo.employerJobs.empty")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("bo.employerJobs.emptyDesc")}
              </p>
              <Button onClick={() => setLocation("/employeur/publier")}>
                {t("bo.employerJobs.firstJobBtn")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de suppression DÉFINITIVE avec avertissement renforcé */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              {t("bo.employerJobs.deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>{t("bo.employerJobs.deleteDialog.intro", { title: offreTitreToDelete })}</p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-red-700">{t("bo.employerJobs.deleteDialog.warningTitle")}</p>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>{t("bo.employerJobs.deleteDialog.warn1")}</li>
                    <li>{t("bo.employerJobs.deleteDialog.warn2")}</li>
                    <li>{t("bo.employerJobs.deleteDialog.warn3")}</li>
                    <li>{t("bo.employerJobs.deleteDialog.warn4")}</li>
                  </ul>
                </div>
                <p className="text-gray-500">{t("bo.employerJobs.deleteDialog.alternative")}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bo.employerJobs.deleteDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("bo.employerJobs.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de republication */}
      <AlertDialog open={republierDialogOpen} onOpenChange={setRepublierDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              {t("bo.employerJobs.republishDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>{t("bo.employerJobs.republishDialog.intro", { title: offreToRepublier?.titre ?? "" })}</p>
                <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-green-700">{t("bo.employerJobs.republishDialog.willTitle")}</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>{t("bo.employerJobs.republishDialog.point1")}</li>
                    <li>{t("bo.employerJobs.republishDialog.point2")}</li>
                    <li>{t("bo.employerJobs.republishDialog.point3")}</li>
                    <li>{t("bo.employerJobs.republishDialog.point4")}</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bo.employerJobs.republishDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRepublier}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t("bo.employerJobs.republishDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog d'archivage "Poste pourvu" */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-700">
              <Archive className="h-5 w-5" />
              {t("bo.employerJobs.archiveDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>{t("bo.employerJobs.archiveDialog.intro", { title: offreToArchive?.titre ?? "" })}</p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-amber-700">{t("bo.employerJobs.archiveDialog.willTitle")}</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>{t("bo.employerJobs.archiveDialog.point1")}</li>
                    <li>{t("bo.employerJobs.archiveDialog.point2")}</li>
                    <li>{t("bo.employerJobs.archiveDialog.point3")}</li>
                    <li>{t("bo.employerJobs.archiveDialog.point4")}</li>
                    <li>{t("bo.employerJobs.archiveDialog.point5")}</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bo.employerJobs.archiveDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchive}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              {t("bo.employerJobs.archiveDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
