import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidatNav } from "@/components/CandidatNav";
import { EmployeurNav } from "@/components/EmployeurNav";
import {
  Bell,
  Briefcase,
  Building2,
  Clock,
  DollarSign,
  MapPin,
  Search,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { CAMEROON_REGIONS, BUSINESS_SECTORS, CONTRACT_TYPES } from "@shared/cameroon-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { DialogCandidature } from "@/components/DialogCandidature";

const PAGE_SIZE = 10;

export default function ToutesLesOffres() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Lire les paramètres URL transmis depuis la page d'accueil
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get("q") || "";
  const initialVille = urlParams.get("ville") || "";

  // Filtres
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [villeInput, setVilleInput] = useState(initialVille);
  const [typeContrat, setTypeContrat] = useState<string>("");
  const [salaireFourchette, setSalaireFourchette] = useState<string>("");
  const [entreprise, setEntreprise] = useState<string>("");
  const [page, setPage] = useState(1);
  const utils = trpc.useUtils();

  // Dialog candidature
  const [candidatureOffre, setCandidatureOffre] = useState<{ id: number; titre: string } | null>(null);

  // Dialog alerte
  const [showAlerteDialog, setShowAlerteDialog] = useState(false);
  const [alerteNom, setAlerteNom] = useState("");
  const [alerteFrequence, setAlerteFrequence] = useState<"immediate" | "quotidien" | "hebdomadaire">("quotidien");

  const createAlerteMutation = trpc.alertes.create.useMutation({
    onSuccess: () => {
      toast.success("Alerte créée ! Vous serez notifié par email.");
      setShowAlerteDialog(false);
      setAlerteNom("");
      utils.alertes.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Erreur lors de la création de l'alerte"),
  });

  // Déduire salaireMin/Max depuis la fourchette sélectionnée
  const salaireRange = useMemo(() => {
    if (!salaireFourchette) return {};
    const map: Record<string, { min?: number; max?: number }> = {
      "0-300000": { max: 300000 },
      "300000-600000": { min: 300000, max: 600000 },
      "600000-1000000": { min: 600000, max: 1000000 },
      "1000000+": { min: 1000000 },
    };
    return map[salaireFourchette] || {};
  }, [salaireFourchette]);

  const queryInput = useMemo(() => ({
    keywords: search || undefined,
    typeContrat: typeContrat || undefined,
    salaireMin: salaireRange.min,
    salaireMax: salaireRange.max,
    page,
    limit: PAGE_SIZE,
  }), [search, typeContrat, salaireRange, page]);

  const { data: result, isLoading, isFetching } = trpc.jobs.search.useQuery(queryInput);

  const offres = result?.jobs ?? [];
  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Réinitialiser la page quand les filtres changent
  const filterKey = `${search}|${typeContrat}|${salaireFourchette}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  useEffect(() => {
    if (prevFilterKey !== filterKey) {
      setPrevFilterKey(filterKey);
      setPage(1);
    }
  }, [filterKey, prevFilterKey]);

  const hasActiveFilters = !!search || !!typeContrat || !!salaireFourchette || !!entreprise;

  const resetFilters = () => {
    setSearch("");
    setSearchInput("");
    setVilleInput("");
    setTypeContrat("");
    setSalaireFourchette("");
    setEntreprise("");
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  // Pagination helper
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Déterminer si une offre est "recommandée" (publiée récemment < 3 jours)
  const isRecent = (dateStr: string | null | Date) => {
    if (!dateStr) return false;
    const diff = Date.now() - new Date(dateStr as unknown as string).getTime();
    return diff < 3 * 24 * 60 * 60 * 1000;
  };

  const NavComponent =
    user?.profileType === "employeur" || user?.role === "admin"
      ? EmployeurNav
      : user?.profileType === "candidat"
      ? CandidatNav
      : null;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {NavComponent ? (
          <NavComponent />
        ) : (
          <SiteHeader />
        )}

        <div className="container mx-auto px-4 py-6">
          {/* Titre */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Offres d'emploi</h1>

          {/* Barre de recherche principale */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Métier, compétence, entreprise..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-11 border-gray-300"
              />
            </div>
            <div className="relative w-52">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ville, région..."
                value={villeInput}
                onChange={(e) => setVilleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 h-11 border-gray-300"
              />
            </div>
            <Button
              className="h-11 px-6 bg-green-700 hover:bg-green-800 text-white"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          <div className="flex gap-6">
            {/* Filtres latéraux */}
            <aside className="w-48 shrink-0">
              <div className="bg-white rounded-xl border p-4 sticky top-20">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  <span className="font-semibold text-gray-800 text-sm">Filtres</span>
                </div>

                {/* Type de contrat */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Type de contrat</label>
                  <Select
                    value={typeContrat || "tous"}
                    onValueChange={(v) => { setTypeContrat(v === "tous" ? "" : v); setPage(1); }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous les types</SelectItem>
                      {CONTRACT_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.labelFr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salaire */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Salaire</label>
                  <Select
                    value={salaireFourchette || "tous"}
                    onValueChange={(v) => { setSalaireFourchette(v === "tous" ? "" : v); setPage(1); }}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Tous les salaires" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tous">Tous les salaires</SelectItem>
                      <SelectItem value="0-300000">Moins de 300 000 FCFA</SelectItem>
                      <SelectItem value="300000-600000">300 000 – 600 000 FCFA</SelectItem>
                      <SelectItem value="600000-1000000">600 000 – 1 000 000 FCFA</SelectItem>
                      <SelectItem value="1000000+">Plus de 1 000 000 FCFA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Entreprise */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Entreprise</label>
                  <Input
                    placeholder="Nom de l'entreprise"
                    value={entreprise}
                    onChange={(e) => setEntreprise(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-gray-500 border-gray-300"
                    onClick={resetFilters}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            </aside>

            {/* Liste des offres */}
            <div className="flex-1 min-w-0">
              {/* Compteur */}
              {!isLoading && (
                <p className="text-sm text-gray-500 mb-4">
                  {total} offre{total > 1 ? "s" : ""} trouvée{total > 1 ? "s" : ""}
                </p>
              )}

              {/* Skeleton */}
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
                      <div className="h-5 bg-gray-200 rounded mb-2 w-1/2" />
                      <div className="h-4 bg-gray-100 rounded mb-3 w-1/3" />
                      <div className="h-4 bg-gray-100 rounded mb-4 w-2/3" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded w-16" />
                        <div className="h-6 bg-gray-200 rounded w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : offres.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-7 w-7 text-gray-400" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Aucune offre trouvée</h3>
                  <p className="text-sm text-gray-500 mb-4">Essayez de modifier vos critères de recherche.</p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Réinitialiser les filtres
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {offres.map((offre) => {
                    const recent = isRecent(offre.datePublication);
                    const competences = offre.competencesRequises
                      ? offre.competencesRequises.split(",").map((c: string) => c.trim()).filter(Boolean).slice(0, 4)
                      : [];

                    // Calculer le temps écoulé
                    const elapsed = offre.datePublication
                      ? (() => {
                          const diff = Date.now() - new Date(offre.datePublication as unknown as string).getTime();
                          const hours = Math.floor(diff / 3600000);
                          const days = Math.floor(diff / 86400000);
                          if (hours < 1) return "À l'instant";
                          if (hours < 24) return `${hours}h`;
                          return `${days} jour${days > 1 ? "s" : ""}`;
                        })()
                      : "";

                    return (
                      <div
                        key={offre.id}
                        className="bg-white rounded-xl border hover:shadow-md transition-shadow p-5 cursor-pointer"
                        onClick={() => setLocation(`/offre/${offre.id}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Titre + badges */}
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-semibold text-gray-900 text-base">{offre.titre}</h3>
                              {recent && (
                                <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
                                  <Star className="h-3 w-3" />
                                  Recommandé
                                </span>
                              )}
                            </div>

                            {/* Entreprise */}
                            <div className="flex items-center gap-1.5 text-sm text-green-700 font-medium mb-2">
                              <Building2 className="h-3.5 w-3.5" />
                              {(offre as any).entreprise || offre.secteur || "Entreprise"}
                            </div>

                            {/* Description */}
                            {offre.description && (
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                {offre.description}
                              </p>
                            )}

                            {/* Compétences */}
                            {competences.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {competences.map((comp: string) => (
                                  <span
                                    key={comp}
                                    className="text-xs bg-gray-100 text-gray-600 rounded-md px-2 py-0.5"
                                  >
                                    {comp}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Infos bas */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {offre.ville || offre.region}
                              </span>
                              {offre.salaire && (
                                <span className="flex items-center gap-1 text-gray-700">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {offre.salaire} FCFA
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {elapsed}
                              </span>
                            </div>
                          </div>

                          {/* Droite : badge contrat + boutons */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge
                              className={`text-xs font-semibold ${
                                offre.typeContrat === "CDI"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50"
                                  : offre.typeContrat === "CDD"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-50"
                                  : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {offre.typeContrat || "Contrat"}
                            </Badge>
                            <Button
                              size="sm"
                              className="bg-green-700 hover:bg-green-800 text-white text-xs px-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!user) {
                                  setLocation("/connexion");
                                  return;
                                }
                                if (user.profileType !== "candidat") {
                                  toast.error("Seuls les candidats peuvent postuler à une offre.");
                                  return;
                                }
                                setCandidatureOffre({ id: offre.id, titre: offre.titre });
                              }}
                            >
                              Postuler
                            </Button>
                            <button
                              className="text-xs text-green-700 hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLocation(`/offre/${offre.id}`);
                              }}
                            >
                              Voir les détails
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination numérotée */}
              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="h-9 px-3 text-sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>

                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(p as number)}
                        disabled={isFetching}
                        className={`h-9 w-9 p-0 text-sm ${
                          p === page ? "bg-green-700 hover:bg-green-800 text-white border-green-700" : ""
                        }`}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isFetching}
                    className="h-9 px-3 text-sm"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Alerte candidat */}
              {user?.profileType === "candidat" && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      setAlerteNom(search || "Toutes les offres");
                      setShowAlerteDialog(true);
                    }}
                  >
                    <Bell className="h-4 w-4" />
                    Créer une alerte pour ces critères
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog création d'alerte */}
      <Dialog open={showAlerteDialog} onOpenChange={setShowAlerteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              Créer une alerte emploi
            </DialogTitle>
            <DialogDescription>
              Vous recevrez un email dès qu'une offre correspondant à vos critères sera publiée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="alerte-nom">Nom de l'alerte *</Label>
              <Input
                id="alerte-nom"
                value={alerteNom}
                onChange={(e) => setAlerteNom(e.target.value)}
                placeholder="Ex : Développeur Yaoundé, Comptable CDI..."
              />
            </div>
            <div className="space-y-2">
              <Label>Fréquence de notification</Label>
              <Select
                value={alerteFrequence}
                onValueChange={(v) => setAlerteFrequence(v as "immediate" | "quotidien" | "hebdomadaire")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiate (dès la publication)</SelectItem>
                  <SelectItem value="quotidien">Quotidienne (résumé du jour)</SelectItem>
                  <SelectItem value="hebdomadaire">Hebdomadaire (résumé de la semaine)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlerteDialog(false)}>Annuler</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={!alerteNom.trim() || createAlerteMutation.isPending}
              onClick={() =>
                createAlerteMutation.mutate({
                  nom: alerteNom.trim(),
                  motsCles: search || undefined,
                  typeContrat: typeContrat || undefined,
                  typeOffre: "tous",
                  frequence: alerteFrequence,
                })
              }
            >
              {createAlerteMutation.isPending ? "Création..." : "Créer l'alerte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog candidature directe */}
      {candidatureOffre && (
        <DialogCandidature
          open={!!candidatureOffre}
          onOpenChange={(open) => { if (!open) setCandidatureOffre(null); }}
          offreId={candidatureOffre.id}
          offreTitre={candidatureOffre.titre}
          onSuccess={() => setCandidatureOffre(null)}
        />
      )}
    </>
  );
}
