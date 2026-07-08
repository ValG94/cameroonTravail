import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { EmployeurLayout } from "@/components/EmployeurLayout";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Filter,
  Lock,
  Mail,
  MapPin,
  Search,
  Send,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * CVthèque — refonte premium.
 *
 * - Recruteurs/admins uniquement, gate par formule payante côté serveur
 * - Utilise EmployeurLayout (sidebar green + topbar) pour cohérence
 *   avec le nouveau dashboard employeur
 * - Design premium : cards blanches rounded-2xl, badges catégorie
 *   colorés, hover-lift, pagination premium
 * - i18n : bo.cvtheque.*
 *
 * Bug résolu côté serveur : le filtre cvDocuments.actif=true était
 * trop restrictif (un candidat n'avait qu'un CV actif à la fois car
 * cv.create marque tous les anciens actif=false). Retiré pour que
 * chaque CV visibleCVtheque=true remonte, indépendamment du fait
 * qu'il soit le "primary" CV du candidat.
 */

const ITEMS_PER_PAGE = 12;

const C = {
  green: "#009B5A",
  greenAction: "#007A3D",
  deepGreen: "#063F24",
  darkerGreen: "#031F16",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  goldSoft: "rgba(246, 195, 67, 0.15)",
  ivory: "#FAF7EF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  blue: "#1D4ED8",
  blueSoft: "#EAF3FB",
  purple: "#5B21B6",
  purpleSoft: "#F3EAFB",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

// Palette par type de CV (cohérent avec bibliothèque premium)
const CV_TYPE_STYLE: Record<string, { bg: string; fg: string; border: string; icon: any }> = {
  premium: { bg: C.goldSoft, fg: C.deepGreen, border: C.gold, icon: Crown },
  classique: { bg: C.greenSoft, fg: C.deepGreen, border: "#A7D8B9", icon: BookOpen },
  moderne: { bg: C.purpleSoft, fg: C.purple, border: "#D8B4F8", icon: Sparkles },
  creatif: { bg: "#FEEDD5", fg: "#8B5A00", border: "#F4B876", icon: Sparkles },
  upload: { bg: C.blueSoft, fg: C.blue, border: "#93C5FD", icon: BookOpen },
};

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
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

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
    recordViewMutation.mutate({ candidatUserId: userId, cvId, viewerUserId: user?.id });
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

  // ─── États d'accès (loading / anonymous / non-employer) ───────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: C.green }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
            <BookOpen className="h-7 w-7" style={{ color: C.green }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.textMain }}>{t("bo.cvtheque.accessRestricted")}</h2>
          <p className="mb-6" style={{ color: C.textMuted }}>{t("bo.cvtheque.loginToAccess")}</p>
          <Button
            onClick={() => setLocation("/connexion")}
            className="rounded-xl text-white"
            style={{ backgroundColor: C.deepGreen }}
          >
            {t("bo.cvtheque.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  if (!isEmployeur) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
            <BookOpen className="h-7 w-7" style={{ color: C.green }} />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.textMain }}>{t("bo.cvtheque.recruiterAccessRequired")}</h2>
          <p className="mb-6" style={{ color: C.textMuted }}>{t("bo.cvtheque.recruiterAccessDesc")}</p>
          <Button onClick={() => setLocation("/")} className="rounded-xl text-white" style={{ backgroundColor: C.deepGreen }}>
            {t("bo.cvtheque.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  // ─── Gate formule payante ──────────────────────────────────
  if (formuleRequise) {
    return (
      <EmployeurLayout
        title={t("bo.employerLayout.nav.cvtheque")}
        activeKey="cvtheque"
      >
        <div className="max-w-3xl mx-auto">
          {/* Bannière verrouillée */}
          <motion.div {...animate(0)}>
            <div
              className="relative rounded-2xl overflow-hidden p-6 lg:p-8 text-center text-white mb-6"
              style={{ background: `linear-gradient(160deg, ${C.deepGreen} 0%, ${C.darkerGreen} 100%)`, boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.4)" }}
            >
              <div aria-hidden="true" className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none" style={{ backgroundColor: C.gold }} />
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: C.goldSoft }}
                >
                  <Lock className="h-7 w-7" style={{ color: C.gold }} />
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold mb-2 tracking-tight">
                  {t("bo.cvtheque.formulaRequiredTitle")}
                </h2>
                <p className="text-[15px] leading-relaxed max-w-xl mx-auto mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {t("bo.cvtheque.formulaRequiredDesc")}
                </p>
                <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {t("bo.cvtheque.currentFormula")} <span className="font-bold" style={{ color: C.gold }}>{t("bo.cvtheque.formulaFree")}</span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bénéfices formule payante */}
          <motion.div {...animate(1)}>
            <div className="bg-white rounded-2xl border p-6 mb-6" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
              <h3 className="font-bold text-[15px] mb-4 flex items-center gap-2" style={{ color: C.textMain }}>
                <Sparkles className="h-4 w-4" style={{ color: C.gold }} />
                {t("bo.cvtheque.formulaBenefitsTitle")}
              </h3>
              <ul className="space-y-2.5">
                {[1, 2, 3, 4].map((n) => (
                  <li key={n} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: C.textMain }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: C.greenSoft }}>
                      <span className="text-[10px] font-bold" style={{ color: C.green }}>✓</span>
                    </div>
                    <span>{t(`bo.cvtheque.formulaBenefit${n}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div {...animate(2)} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setLocation("/tarifs");
                setTimeout(() => { document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
              }}
              className="rounded-xl h-12 px-6 font-bold hover:opacity-90"
              style={{ backgroundColor: C.gold, color: C.deepGreen }}
            >
              <Crown className="h-4 w-4 mr-2" />
              {t("bo.cvtheque.discoverFormulas")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/employeur/dashboard")}
              className="rounded-xl h-12 px-6 font-semibold"
              style={{ borderColor: C.border, color: C.textMain }}
            >
              {t("bo.cvtheque.backToDashboard")}
            </Button>
          </motion.div>
        </div>
      </EmployeurLayout>
    );
  }

  // ─── Vue principale CVthèque ───────────────────────────────
  return (
    <EmployeurLayout
      title={t("bo.employerLayout.nav.cvtheque")}
      subtitle={t("bo.cvtheque.subtitle")}
      activeKey="cvtheque"
    >
      <div className="space-y-5">
        {/* ─── Filtres premium ─────────────────────────────── */}
        <motion.div {...animate(0)}>
          <div
            className="bg-white rounded-2xl border p-5 lg:p-6"
            style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                <Filter className="h-4 w-4" style={{ color: C.green }} />
              </div>
              <span className="font-bold text-[14px]" style={{ color: C.textMain }}>
                {t("bo.cvtheque.filterTitle")}
              </span>
              <span className="text-[12.5px] ml-2" style={{ color: C.textMuted }}>
                {data ? t("bo.cvtheque.candidatesAvailable", { count: data.total }) : t("bo.cvtheque.loading")}
              </span>
              {(competenceFilter || villeFilter) && (
                <button
                  onClick={handleReset}
                  className="ml-auto flex items-center gap-1 text-[12.5px] font-semibold hover:opacity-70"
                  style={{ color: "#DC2626" }}
                >
                  <X className="h-3.5 w-3.5" />
                  {t("bo.cvtheque.reset")}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                <Input
                  placeholder={t("bo.cvtheque.competencePh")}
                  value={competenceInput}
                  onChange={(e) => setCompetenceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-11 rounded-xl"
                  style={{ borderColor: C.border }}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                <Input
                  placeholder={t("bo.cvtheque.cityPh")}
                  value={villeInput}
                  onChange={(e) => setVilleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 h-11 rounded-xl"
                  style={{ borderColor: C.border }}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-11 rounded-xl px-6 font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: C.deepGreen }}
              >
                <Search className="h-4 w-4 mr-1.5" />
                {t("bo.cvtheque.searchBtn")}
              </Button>
            </div>

            {(competenceFilter || villeFilter) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                <span className="text-[11.5px] font-semibold" style={{ color: C.textMuted }}>{t("bo.cvtheque.activeFilters")}</span>
                {competenceFilter && (
                  <span
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold rounded-full px-2.5 py-1 border"
                    style={{ backgroundColor: C.greenSoft, color: C.deepGreen, borderColor: "#A7D8B9" }}
                  >
                    <Briefcase className="h-3 w-3" />
                    {competenceFilter}
                    <button onClick={() => { setCompetenceFilter(""); setCompetenceInput(""); setPage(1); }} className="hover:opacity-70">
                      <X className="h-3 w-3 ml-0.5" />
                    </button>
                  </span>
                )}
                {villeFilter && (
                  <span
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold rounded-full px-2.5 py-1 border"
                    style={{ backgroundColor: C.blueSoft, color: C.blue, borderColor: "#93C5FD" }}
                  >
                    <MapPin className="h-3 w-3" />
                    {villeFilter}
                    <button onClick={() => { setVilleFilter(""); setVilleInput(""); setPage(1); }} className="hover:opacity-70">
                      <X className="h-3 w-3 ml-0.5" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* ─── Grille des candidats ─────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse" style={{ borderColor: C.border }}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="h-4 rounded w-3/4" style={{ backgroundColor: C.border }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: C.border }} />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.docs.length === 0 ? (
          <motion.div {...animate(1)}>
            <div className="bg-white rounded-2xl border p-16 text-center" style={{ borderColor: C.border }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                <Users className="h-7 w-7" style={{ color: C.green }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: C.textMain }}>{t("bo.cvtheque.noCandidates")}</h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: C.textMuted }}>
                {competenceFilter || villeFilter
                  ? t("bo.cvtheque.noCandidatesFiltered")
                  : t("bo.cvtheque.noCandidatesEmpty")}
              </p>
              {(competenceFilter || villeFilter) && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-xl"
                  style={{ borderColor: C.border }}
                >
                  {t("bo.cvtheque.resetFilters")}
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div {...animate(1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.docs.map((item) => {
                const competences = parseCompetences(item.displayData?.competences);
                const displayName = item.displayData?.prenom && item.displayData?.nom
                  ? `${item.displayData.prenom} ${item.displayData.nom}`
                  : item.user.name || t("bo.cvtheque.candidate");
                const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                const cvTypeLabel = (({
                  classique: t("bo.cvtheque.cvType.classique"),
                  moderne: t("bo.cvtheque.cvType.moderne"),
                  creatif: t("bo.cvtheque.cvType.creatif"),
                  upload: t("bo.cvtheque.cvType.upload"),
                  premium: t("bo.cvtheque.cvType.premium"),
                } as Record<string, string>)[item.cv.type] || t("bo.cvtheque.cvType.fallback"));
                const style = CV_TYPE_STYLE[item.cv.type] || CV_TYPE_STYLE.upload;
                const StyleIcon = style.icon;

                return (
                  <article
                    key={item.cv.id}
                    className="bg-white rounded-2xl border p-5 transition-all cursor-pointer hover:-translate-y-1 flex flex-col group"
                    style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
                    onClick={() => handleViewProfile(item.user.id, item.cv.id)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 30px -12px rgba(6, 63, 36, 0.22)";
                      (e.currentTarget as HTMLElement).style.borderColor = C.green;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = C.border;
                    }}
                  >
                    {/* Header : avatar + type badge */}
                    <div className="flex items-start justify-between mb-3">
                      {item.displayData?.photoUrl ? (
                        <img
                          src={item.displayData.photoUrl}
                          alt={displayName}
                          className="w-14 h-14 rounded-full object-cover ring-2 shrink-0"
                          style={{ boxShadow: `0 0 0 2px ${C.greenSoft}` }}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0"
                          style={{ backgroundColor: C.green }}
                        >
                          {initials}
                        </div>
                      )}
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 border shrink-0"
                        style={{ backgroundColor: style.bg, color: style.fg, borderColor: style.border }}
                      >
                        <StyleIcon className="h-2.5 w-2.5" />
                        {cvTypeLabel}
                      </span>
                    </div>

                    {/* Nom + titre */}
                    <h3 className="font-bold text-[14.5px] leading-tight mb-1 line-clamp-1" style={{ color: C.textMain }}>
                      {displayName}
                    </h3>
                    {item.displayData?.titre && (
                      <p className="text-[12px] mb-2 line-clamp-1" style={{ color: C.textMuted }}>
                        {item.displayData.titre}
                      </p>
                    )}

                    {/* Localisation */}
                    {item.displayData?.adresse && (
                      <div className="flex items-center gap-1 text-[12px] mb-3" style={{ color: C.textMuted }}>
                        <MapPin className="h-3 w-3 shrink-0" style={{ color: C.green }} />
                        <span className="line-clamp-1">{item.displayData.adresse}</span>
                      </div>
                    )}

                    {/* Compétences */}
                    {competences.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3 min-h-[24px]">
                        {competences.slice(0, 3).map((comp, idx) => (
                          <span
                            key={idx}
                            className="text-[10.5px] font-medium rounded px-1.5 py-0.5 border"
                            style={{ backgroundColor: C.greenSoft, color: C.deepGreen, borderColor: "#A7D8B9" }}
                          >
                            {comp}
                          </span>
                        ))}
                        {competences.length > 3 && (
                          <span
                            className="text-[10.5px] font-medium rounded px-1.5 py-0.5 border"
                            style={{ backgroundColor: "#F1F5F9", color: C.textMuted, borderColor: C.border }}
                          >
                            +{competences.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2">
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleViewProfile(item.user.id, item.cv.id); }}
                        className="flex-1 rounded-lg h-9 text-xs font-semibold text-white hover:opacity-90"
                        style={{ backgroundColor: C.deepGreen }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        {t("bo.cvtheque.viewBtn")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleOpenContact(e, item.user.id, displayName, item.cv.id)}
                        className="flex-1 rounded-lg h-9 text-xs font-semibold"
                        style={{ borderColor: C.gold, color: C.deepGreen, backgroundColor: C.goldSoft }}
                      >
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        {t("bo.cvtheque.contactBtn")}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </motion.div>

            {/* ─── Pagination premium ──────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-10 rounded-xl px-4 font-medium"
                  style={{ borderColor: C.border, color: C.textMain }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("bo.cvtheque.prev")}
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const pageNum = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                  const active = pageNum === page;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className="h-10 w-10 rounded-xl p-0 font-semibold text-sm border transition-colors"
                      style={{
                        backgroundColor: active ? C.deepGreen : "#ffffff",
                        color: active ? "#ffffff" : C.textMain,
                        borderColor: active ? C.deepGreen : C.border,
                      }}
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.greenSoft;
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-10 rounded-xl px-4 font-medium"
                  style={{ borderColor: C.border, color: C.textMain }}
                >
                  {t("bo.cvtheque.next")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Dialog Contacter ──────────────────────────────── */}
      <Dialog open={contactDialog.open} onOpenChange={(open) => setContactDialog((s) => ({ ...s, open }))}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                <Send className="h-4 w-4" style={{ color: C.green }} />
              </div>
              {t("bo.cvtheque.contactDialog.title", { name: contactDialog.candidatName })}
            </DialogTitle>
            <DialogDescription>{t("bo.cvtheque.contactDialog.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sujet" className="text-sm font-semibold">
                {t("bo.cvtheque.contactDialog.subject")}
                <span className="ml-1 text-[11px] font-normal" style={{ color: C.textMuted }}>{t("bo.cvtheque.contactDialog.subjectOptional")}</span>
              </Label>
              <Input
                id="sujet"
                placeholder={t("bo.cvtheque.contactDialog.subjectPh")}
                value={sujet}
                onChange={(e) => setSujet(e.target.value)}
                maxLength={300}
                className="rounded-xl h-11"
                style={{ borderColor: C.border }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contenu" className="text-sm font-semibold">
                {t("bo.cvtheque.contactDialog.message")} <span style={{ color: "#DC2626" }}>*</span>
              </Label>
              <Textarea
                id="contenu"
                placeholder={t("bo.cvtheque.contactDialog.messagePh")}
                value={contenu}
                onChange={(e) => setContenu(e.target.value)}
                rows={5}
                maxLength={5000}
                className="resize-none rounded-xl"
                style={{ borderColor: C.border }}
              />
              <p className="text-[11px] text-right" style={{ color: C.textMuted }}>{contenu.length}/5000</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setContactDialog((s) => ({ ...s, open: false }))}
              disabled={sendMessageMutation.isPending}
              className="rounded-xl"
              style={{ borderColor: C.border }}
            >
              {t("bo.cvtheque.contactDialog.cancel")}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!contenu.trim() || sendMessageMutation.isPending}
              className="rounded-xl text-white gap-2 hover:opacity-90"
              style={{ backgroundColor: C.deepGreen }}
            >
              {sendMessageMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t("bo.cvtheque.contactDialog.send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EmployeurLayout>
  );
}
