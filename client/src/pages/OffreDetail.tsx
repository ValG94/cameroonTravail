import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Archive,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useLocation } from "wouter";
import { CandidatNav } from "@/components/CandidatNav";
import { EmployeurNav } from "@/components/EmployeurNav";
import { SiteHeader } from "@/components/SiteHeader";
import { DialogCandidature } from "@/components/DialogCandidature";
import { useState } from "react";
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
import { toast } from "sonner";

export default function OffreDetail() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const offreId = parseInt(params.id || "0");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [republierDialogOpen, setRepublierDialogOpen] = useState(false);

  const { data: offre, isLoading, error, refetch } = trpc.jobs.getById.useQuery({ id: offreId });
  const { data: hasApplied } = trpc.candidatures.hasApplied.useQuery(
    { offreId },
    { enabled: !!user && user.profileType === "candidat" }
  );
  const { data: employeur } = trpc.employeur.getProfile.useQuery(
    undefined,
    { enabled: !!user && (user.profileType === "employeur" || user.role === "admin") }
  );

  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      toast.success("Offre supprimée définitivement");
      setLocation("/employeur/offres");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const republierMutation = trpc.jobs.republier.useMutation({
    onSuccess: () => {
      toast.success("Offre republiée avec succès — elle est à nouveau visible par les candidats");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const archiveMutation = trpc.jobs.archive.useMutation({
    onSuccess: () => {
      toast.success("Offre marquée comme « Poste pourvu »");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Vérifier si l'utilisateur est l'employeur auteur de l'offre
  const isAuteur = !!employeur && !!offre && offre.employeurId === employeur.id;
  const isPourvue = offre?.statut === "pourvue";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {user?.profileType === "candidat" && <CandidatNav />}
        {(user?.profileType === "employeur" || user?.role === "admin") && <EmployeurNav />}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !offre) {
    return (
      <div className="min-h-screen bg-gray-50">
        {user?.profileType === "candidat" && <CandidatNav />}
        {(user?.profileType === "employeur" || user?.role === "admin") && <EmployeurNav />}
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Offre non trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Cette offre d'emploi n'existe pas ou a été supprimée.
              </p>
              <Button asChild>
                <Link href="/recherche-emploi">Retour à la recherche</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handlePostuler = () => {
    if (!user) {
      setLocation("/connexion");
      return;
    }
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.profileType === "candidat" && <CandidatNav />}
      {(user?.profileType === "employeur" || user?.role === "admin") && <EmployeurNav />}
      
      {!user?.profileType && (
        <SiteHeader activePage="emplois" />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour + actions employeur */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => {
              if (isAuteur) {
                setLocation("/employeur/offres");
              } else {
                window.history.back();
              }
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {isAuteur ? "Mes offres" : "Retour"}
          </Button>

          {isAuteur && (
            <div className="flex gap-2">
              {!isPourvue && (
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/employeur/offres/${offreId}/modifier`)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}

              {isPourvue ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => setRepublierDialogOpen(true)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Republier
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-sm">
                      Réactiver cette offre archivée pour qu'elle soit à nouveau visible dans les résultats de recherche et accepte de nouvelles candidatures.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                        onClick={() => setArchiveDialogOpen(true)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Marquer pourvu
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs text-sm">
                      Archiver cette offre en indiquant que le poste est pourvu. Elle restera visible pour les candidats ayant déjà postulé, avec un badge « Poste pourvu ».
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Bannière Poste pourvu */}
        {isPourvue && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">Poste pourvu</p>
              <p className="text-sm text-amber-700">
                Ce poste a été pourvu. L'offre est archivée et n'accepte plus de nouvelles candidatures.
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Colonne principale - Détails de l'offre */}
          <div className="lg:col-span-2 space-y-6">
            {/* En-tête de l'offre */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {offre.typeOffre === "public" ? (
                    <Building2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      offre.typeOffre === "public"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {offre.typeOffre === "public" ? "Emploi Public" : "Emploi Privé"}
                  </span>
                  {offre.secteur && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {offre.secteur}
                    </span>
                  )}
                  {isPourvue && (
                    <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Poste pourvu
                    </span>
                  )}
                </div>
                <CardTitle className="text-2xl">{offre.titre}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 text-sm mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {offre.ville}, {offre.region}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {offre.typeContrat}
                  </span>
                  {offre.salaire && (
                    <span className="flex items-center gap-1 font-medium text-green-600">
                      {offre.salaire} FCFA
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Publié le {new Date(offre.datePublication).toLocaleDateString("fr-FR")}
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Description du poste */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description du poste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: offre.description }} />
              </CardContent>
            </Card>

            {/* Missions */}
            {offre.missions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Missions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: offre.missions }} />
                </CardContent>
              </Card>
            )}

            {/* Compétences requises */}
            {offre.competencesRequises && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compétences requises</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: offre.competencesRequises }} />
                </CardContent>
              </Card>
            )}

            {/* Avantages */}
            {offre.avantages && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Avantages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: offre.avantages }} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Panneau de gestion employeur OU bouton de candidature */}
            {isAuteur ? (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base text-blue-800">Gestion de l'offre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isPourvue && (
                    <Button
                      className="w-full"
                      onClick={() => setLocation(`/employeur/offres/${offreId}/modifier`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Modifier l'offre
                    </Button>
                  )}

                  {isPourvue ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => setRepublierDialogOpen(true)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Republier l'offre
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs text-sm">
                          Réactiver cette offre archivée pour qu'elle soit à nouveau visible dans les résultats de recherche et accepte de nouvelles candidatures.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => setArchiveDialogOpen(true)}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Marquer poste pourvu
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs text-sm">
                          Archiver cette offre en indiquant que le recrutement est terminé. Les candidats ayant postulé pourront toujours voir l'offre avec le badge « Poste pourvu ».
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer l'offre
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/employeur/candidatures")}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Voir les candidatures
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  {isPourvue ? (
                    <div className="text-center">
                      <CheckCircle2 className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                      <p className="font-semibold text-gray-800 mb-1">Poste pourvu</p>
                      <p className="text-sm text-gray-500">
                        Ce recrutement est terminé. L'offre n'accepte plus de nouvelles candidatures.
                      </p>
                    </div>
                  ) : hasApplied ? (
                    <div className="text-center">
                      <Button className="w-full" size="lg" disabled variant="outline">
                        Déjà postulé
                      </Button>
                      <p className="text-xs text-gray-500 mt-3">
                        Vous avez déjà postulé à cette offre
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" onClick={handlePostuler}>
                        Postuler à cette offre
                      </Button>
                      {!user && (
                        <p className="text-xs text-gray-500 text-center mt-3">
                          Vous devez être connecté pour postuler
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Informations sur l'entreprise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">À propos de l'entreprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{offre.entreprise}</h4>
                  {offre.secteur && (
                    <p className="text-sm text-gray-600">Secteur: {offre.secteur}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {offre.metier && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Métier</p>
                        <p className="text-sm font-medium">{offre.metier}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Localisation</p>
                      <p className="text-sm font-medium">{offre.ville}, {offre.region}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Type de contrat</p>
                      <p className="text-sm font-medium">{offre.typeContrat}</p>
                    </div>
                  </div>

                  {offre.niveauEtude && (
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Niveau d'étude</p>
                        <p className="text-sm font-medium">{offre.niveauEtude}</p>
                      </div>
                    </div>
                  )}

                  {offre.experienceRequise && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Expérience requise</p>
                        <p className="text-sm font-medium">{offre.experienceRequise}</p>
                      </div>
                    </div>
                  )}

                  {offre.salaire && (
                    <div>
                      <p className="text-xs text-gray-500">Salaire</p>
                      <p className="text-sm font-medium text-green-600">{offre.salaire} FCFA</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Publié le {new Date(offre.datePublication).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  {offre.dateLimite && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Expire le {new Date(offre.dateLimite).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Partager l'offre */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Partager cette offre</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Lien copié dans le presse-papiers !");
                    }}
                  >
                    Copier le lien
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Dialog de candidature */}
      {offre && (
        <DialogCandidature
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          offreId={offre.id}
          offreTitre={offre.titre}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Dialog de suppression DÉFINITIVE avec avertissement renforcé */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Supprimer définitivement cette offre ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Vous êtes sur le point de supprimer l'offre <strong>« {offre.titre} »</strong>.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-red-700">⚠ Cette action est irréversible :</p>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>L'offre sera <strong>définitivement supprimée</strong></li>
                    <li>Toutes les <strong>candidatures reçues</strong> seront perdues</li>
                    <li>Les candidats <strong>ne pourront plus accéder</strong> à leur candidature</li>
                    <li>Aucune récupération ne sera possible</li>
                  </ul>
                </div>
                <p className="text-gray-500">
                  Si vous souhaitez simplement indiquer que le poste est pourvu tout en conservant l'historique des candidatures, utilisez plutôt le bouton <strong>« Marquer poste pourvu »</strong>.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate({ id: offreId })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
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
              Republier cette offre ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Vous allez réactiver l'offre <strong>« {offre.titre} »</strong>.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-green-700">Ce qui se passera :</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>L'offre sera <strong>réactivée</strong> avec le statut « Publiée »</li>
                    <li>Elle <strong>réapparaîtra</strong> dans les résultats de recherche</li>
                    <li>Les candidats pourront à nouveau <strong>postuler</strong></li>
                    <li>Les candidatures existantes sont <strong>conservées</strong></li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => republierMutation.mutate({ id: offreId })}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmer — Republier l'offre
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
              Marquer ce poste comme pourvu ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  Vous allez archiver l'offre <strong>« {offre.titre} »</strong> en indiquant que le recrutement est terminé.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-amber-700">Ce qui se passera :</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>L'offre sera <strong>archivée</strong> avec le badge « Poste pourvu »</li>
                    <li>Elle <strong>n'apparaîtra plus</strong> dans les résultats de recherche</li>
                    <li>Les candidats ayant postulé <strong>pourront toujours la consulter</strong></li>
                    <li>Toutes les candidatures reçues sont <strong>conservées</strong></li>
                    <li>Aucune nouvelle candidature ne sera acceptée</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => archiveMutation.mutate({ id: offreId })}
            >
              <Archive className="h-4 w-4 mr-2" />
              Confirmer — Poste pourvu
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
