import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { EmployeurNav } from "@/components/EmployeurNav";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  MapPin,
  Briefcase,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  User,
  Mail,
} from "lucide-react";

const ITEMS_PER_PAGE = 12;

interface ContactDialogState {
  open: boolean;
  receiverId: number | null;
  candidatName: string;
  cvId?: number;
}

export default function CVtheque() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [competenceInput, setCompetenceInput] = useState("");
  const [villeInput, setVilleInput] = useState("");
  const [competenceFilter, setCompetenceFilter] = useState("");
  const [villeFilter, setVilleFilter] = useState("");
  const [page, setPage] = useState(1);

  // Dialog Contacter
  const [contactDialog, setContactDialog] = useState<ContactDialogState>({
    open: false,
    receiverId: null,
    candidatName: "",
  });
  const [sujet, setSujet] = useState("");
  const [contenu, setContenu] = useState("");

  const isEmployeur = user?.profileType === "employeur" || user?.role === "admin";

  const { data, isLoading, error } = trpc.cv.getCVtheque.useQuery(
    {
      page,
      limit: ITEMS_PER_PAGE,
      competence: competenceFilter || undefined,
      ville: villeFilter || undefined,
    },
    {
      enabled: !loading && !!user && isEmployeur,
      retry: false,
    }
  );

  const formuleRequise = error?.data?.code === "FORBIDDEN" && error.message === "FORMULE_REQUISE";

  // Mutation envoi message
  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      toast.success(t("bo.cvtheque.contactDialog.sentToast", { name: contactDialog.candidatName }));
      setContactDialog({ open: false, receiverId: null, candidatName: "" });
      setSujet("");
      setContenu("");
    },
    onError: (err) => {
      toast.error(err.message || t("bo.cvtheque.contactDialog.errorToast"));
    },
  });

  // Mutation enregistrement vue
  const recordViewMutation = trpc.profileViews.record.useMutation();

  const handleSearch = useCallback(() => {
    setPage(1);
    setCompetenceFilter(competenceInput.trim());
    setVilleFilter(villeInput.trim());
  }, [competenceInput, villeInput]);

  const handleReset = useCallback(() => {
    setCompetenceInput("");
    setVilleInput("");
    setCompetenceFilter("");
    setVilleFilter("");
    setPage(1);
  }, []);

  const handleViewProfile = (userId: number, cvId: number) => {
    // Enregistrer la vue
    recordViewMutation.mutate({
      candidatUserId: userId,
      cvId,
      viewerUserId: user?.id,
    });
    setLocation(`/profil-candidat/${userId}`);
  };

  const handleOpenContact = (e: React.MouseEvent, receiverId: number, candidatName: string, cvId?: number) => {
    e.stopPropagation();
    setContactDialog({ open: true, receiverId, candidatName, cvId });
    setSujet("");
    setContenu("");
  };

  const handleSendMessage = () => {
    if (!contactDialog.receiverId || !contenu.trim()) return;
    sendMessageMutation.mutate({
      receiverId: contactDialog.receiverId,
      sujet: sujet.trim() || undefined,
      contenu: contenu.trim(),
      cvId: contactDialog.cvId,
    });
  };

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const parseCompetences = (raw: string | null | undefined): string[] => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((c: any) => (typeof c === "string" ? c : c.nom || c.name || "")).filter(Boolean).slice(0, 4);
      }
    } catch {
      return raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("bo.cvtheque.accessRestricted")}</h2>
          <p className="text-gray-600 mb-6">{t("bo.cvtheque.loginToAccess")}</p>
          <Button onClick={() => setLocation("/")} className="bg-green-600 hover:bg-green-700">
            {t("bo.cvtheque.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  if (!isEmployeur) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("bo.cvtheque.recruiterAccessRequired")}</h2>
          <p className="text-gray-600 mb-6">
            {t("bo.cvtheque.recruiterAccessDesc")}
          </p>
          <Button onClick={() => setLocation("/")} className="bg-green-600 hover:bg-green-700">
            {t("bo.cvtheque.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  if (formuleRequise) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeurNav />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-8 text-white text-center shadow-lg mb-6">
            <div className="bg-white/20 rounded-2xl p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("bo.cvtheque.formulaRequiredTitle")}</h2>
            <p className="text-orange-50 mb-2">
              {t("bo.cvtheque.formulaRequiredDesc")}
            </p>
            <p className="text-orange-100 text-sm">
              {t("bo.cvtheque.currentFormula")} <span className="font-bold">{t("bo.cvtheque.formulaFree")}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="font-bold text-gray-900 mb-3">{t("bo.cvtheque.formulaBenefitsTitle")}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✓</span>
                {t("bo.cvtheque.formulaBenefit1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✓</span>
                {t("bo.cvtheque.formulaBenefit2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✓</span>
                {t("bo.cvtheque.formulaBenefit3")}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">✓</span>
                {t("bo.cvtheque.formulaBenefit4")}
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                // Nav SPA + scroll vers la grille tarifs (id="tarifs")
                setLocation("/tarifs");
                setTimeout(() => {
                  document
                    .getElementById("tarifs")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 80);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
            >
              {t("bo.cvtheque.discoverFormulas")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/employeur/dashboard")}
              size="lg"
            >
              {t("bo.cvtheque.backToDashboard")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />

      {/* Header de la page */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t("bo.cvtheque.title")}</h1>
              <p className="text-gray-500 text-sm">
                {data ? t("bo.cvtheque.candidatesAvailable", { count: data.total }) : t("bo.cvtheque.loading")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtres */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">{t("bo.cvtheque.filterTitle")}</span>
              {(competenceFilter || villeFilter) && (
                <button
                  onClick={handleReset}
                  className="ml-auto flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                  {t("bo.cvtheque.reset")}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("bo.cvtheque.competencePh")}
                  value={competenceInput}
                  onChange={(e) => setCompetenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("bo.cvtheque.cityPh")}
                  value={villeInput}
                  onChange={(e) => setVilleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Search className="h-4 w-4" />
                {t("bo.cvtheque.searchBtn")}
              </Button>
            </div>

            {(competenceFilter || villeFilter) && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">{t("bo.cvtheque.activeFilters")}</span>
                {competenceFilter && (
                  <Badge variant="secondary" className="gap-1">
                    <Briefcase className="h-3 w-3" />
                    {competenceFilter}
                    <button onClick={() => { setCompetenceFilter(""); setCompetenceInput(""); setPage(1); }}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
                {villeFilter && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {villeFilter}
                    <button onClick={() => { setVilleFilter(""); setVilleInput(""); setPage(1); }}>
                      <X className="h-3 w-3 ml-1" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grille des candidats */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="flex gap-2 w-full">
                      <div className="h-6 bg-gray-200 rounded flex-1" />
                      <div className="h-6 bg-gray-200 rounded flex-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !data || data.docs.length === 0 ? (
          <div className="text-center py-20">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{t("bo.cvtheque.noCandidates")}</h3>
            <p className="text-gray-500 mb-6">
              {competenceFilter || villeFilter
                ? t("bo.cvtheque.noCandidatesFiltered")
                : t("bo.cvtheque.noCandidatesEmpty")}
            </p>
            {(competenceFilter || villeFilter) && (
              <Button variant="outline" onClick={handleReset}>
                {t("bo.cvtheque.resetFilters")}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.docs.map((item) => {
                const competences = parseCompetences(item.displayData?.competences);
                const displayName = item.displayData?.prenom && item.displayData?.nom
                  ? `${item.displayData.prenom} ${item.displayData.nom}`
                  : item.user.name || t("bo.cvtheque.candidate");
                const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                const cvTypeLabel = {
                  classique: t("bo.cvtheque.cvType.classique"),
                  moderne: t("bo.cvtheque.cvType.moderne"),
                  creatif: t("bo.cvtheque.cvType.creatif"),
                  upload: t("bo.cvtheque.cvType.upload"),
                  premium: t("bo.cvtheque.cvType.premium"),
                }[item.cv.type] || t("bo.cvtheque.cvType.fallback");
                const cvTypeColor = {
                  classique: "bg-green-100 text-green-700",
                  moderne: "bg-purple-100 text-purple-700",
                  creatif: "bg-orange-100 text-orange-700",
                  upload: "bg-blue-100 text-blue-700",
                  premium: "bg-amber-100 text-amber-700",
                }[item.cv.type] || "bg-gray-100 text-gray-700";

                return (
                  <Card
                    key={item.cv.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => handleViewProfile(item.user.id, item.cv.id)}
                  >
                    <CardContent className="pt-6 pb-4">
                      <div className="flex flex-col items-center text-center gap-3">
                        {/* Avatar */}
                        <Avatar className="w-16 h-16 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                          <AvatarImage src={item.displayData?.photoUrl || undefined} alt={displayName} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Nom */}
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{displayName}</h3>
                          {item.displayData?.titre && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.displayData.titre}</p>
                          )}
                        </div>

                        {/* Localisation */}
                        {item.displayData?.adresse && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="line-clamp-1">{item.displayData.adresse}</span>
                          </div>
                        )}

                        {/* Type de CV */}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cvTypeColor}`}>
                          {cvTypeLabel}
                        </span>

                        {/* Compétences */}
                        {competences.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {competences.map((comp, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0">
                                {comp}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Boutons d'action */}
                        <div className="flex gap-2 w-full mt-1">
                          <Button
                            size="sm"
                            className="flex-1 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile(item.user.id, item.cv.id);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {t("bo.cvtheque.viewBtn")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 gap-1.5 text-xs border-green-600 text-green-700 hover:bg-green-50"
                            onClick={(e) => handleOpenContact(e, item.user.id, displayName, item.cv.id)}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {t("bo.cvtheque.contactBtn")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("bo.cvtheque.prev")}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const pageNum = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                          pageNum === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="gap-1"
                >
                  {t("bo.cvtheque.next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialog Contacter un candidat */}
      <Dialog open={contactDialog.open} onOpenChange={(open) => setContactDialog((s) => ({ ...s, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-600" />
              {t("bo.cvtheque.contactDialog.title", { name: contactDialog.candidatName })}
            </DialogTitle>
            <DialogDescription>
              {t("bo.cvtheque.contactDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sujet">{t("bo.cvtheque.contactDialog.subject")} <span className="text-gray-400 text-xs">{t("bo.cvtheque.contactDialog.subjectOptional")}</span></Label>
              <Input
                id="sujet"
                placeholder={t("bo.cvtheque.contactDialog.subjectPh")}
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                maxLength={300}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contenu">{t("bo.cvtheque.contactDialog.message")} <span className="text-red-500">*</span></Label>
              <Textarea
                id="contenu"
                placeholder={t("bo.cvtheque.contactDialog.messagePh")}
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                rows={5}
                maxLength={5000}
                className="resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{contenu.length}/5000</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setContactDialog((s) => ({ ...s, open: false }))}
              disabled={sendMessageMutation.isPending}
            >
              {t("bo.cvtheque.contactDialog.cancel")}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!contenu.trim() || sendMessageMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {t("bo.cvtheque.contactDialog.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
