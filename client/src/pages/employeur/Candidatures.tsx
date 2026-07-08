import { EmployeurLayout } from "@/components/EmployeurLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Mail,
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Send,
  Sparkles,
  Star,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { DialogCandidatureDetail } from "@/components/DialogCandidatureDetail";

/**
 * Page /employeur/candidatures — refonte premium.
 *
 * Vs. maquette user, on ajoute :
 *  - Sidebar cohérente (EmployeurLayout) pour un shell unifié
 *  - Stats cards CLIQUABLES qui filtrent la liste au clic
 *  - Recherche fonctionnelle (nom candidat / titre offre / email)
 *  - Filtre par offre en plus du filtre statut
 *  - Tri (récentes / anciennes / statut)
 *  - Menu ⋯ par candidature pour changer le statut en 1 clic
 *    (sans passer par le dialog) via updateStatut mutation
 *  - Badge "Nouveau" sur candidatures < 24h
 *  - Pagination client (l'endpoint retourne tout d'un coup)
 *  - Empty state avec CTA "Publier une offre"
 *  - Animations fade-up + hover-lift
 *
 * i18n : bo.employerApplications.*
 */

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

const PAGE_SIZE = 8;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

// Statuts : icône + couleurs + bandeau vertical de card
type StatutKey = "en_attente" | "vue" | "retenue" | "rejetee" | "entretien";
const STATUT_STYLE: Record<StatutKey, { bg: string; fg: string; border: string; bar: string; icon: any }> = {
  en_attente: { bg: "#FEF7E0", fg: "#8B5A00", border: C.gold, bar: C.gold, icon: Clock },
  vue: { bg: C.blueSoft, fg: C.blue, border: "#93C5FD", bar: C.blue, icon: Eye },
  retenue: { bg: C.greenSoft, fg: C.deepGreen, border: "#A7D8B9", bar: C.green, icon: Star },
  rejetee: { bg: "#FEECEC", fg: "#B91C1C", border: "#F4A5A5", bar: "#B91C1C", icon: XCircle },
  entretien: { bg: C.purpleSoft, fg: C.purple, border: "#D8B4F8", bar: C.purple, icon: MessageCircle },
};

// Ordre pour tri "par statut"
const STATUT_ORDER: Record<StatutKey, number> = {
  entretien: 0,
  retenue: 1,
  en_attente: 2,
  vue: 3,
  rejetee: 4,
};

type SortKey = "recent" | "oldest" | "byStatus";

export default function EmployeurCandidatures() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  // ─── State filtres/tri/recherche ─────────────────────────────
  const [statutFilter, setStatutFilter] = useState<"all" | StatutKey>("all");
  const [offreFilter, setOffreFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);

  // ─── Dialog ────────────────────────────────────────────────
  const [selectedCandidature, setSelectedCandidature] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ─── Queries ───────────────────────────────────────────────
  const utils = trpc.useUtils();
  const { data: candidaturesRaw, isLoading, refetch } = trpc.candidatures.getByEmployeur.useQuery(undefined);
  const candidatures = Array.isArray(candidaturesRaw) ? candidaturesRaw : [];

  const updateStatutMutation = trpc.candidatures.updateStatut.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerApplications.toastStatusUpdated"));
      utils.candidatures.getByEmployeur.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || t("bo.employerApplications.toastStatusError"));
    },
  });

  // ─── Stats globales (sur ensemble complet, pas filtré) ──────
  const stats = useMemo(() => {
    const counts: Record<StatutKey | "total", number> = {
      total: candidatures.length,
      en_attente: 0,
      vue: 0,
      retenue: 0,
      rejetee: 0,
      entretien: 0,
    };
    for (const c of candidatures) {
      const s = c.statut as StatutKey;
      if (s in counts) counts[s]++;
    }
    return counts;
  }, [candidatures]);

  // ─── Liste unique des offres pour le filtre ────────────────
  const offres = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of candidatures) {
      if (c.offreId && !map.has(c.offreId)) map.set(c.offreId, c.offreTitre || `#${c.offreId}`);
    }
    return Array.from(map.entries()).map(([id, titre]) => ({ id, titre }));
  }, [candidatures]);

  // ─── Filtrage + recherche + tri ─────────────────────────────
  const filtered = useMemo(() => {
    let list = [...candidatures];

    if (statutFilter !== "all") {
      list = list.filter((c) => c.statut === statutFilter);
    }
    if (offreFilter !== "all") {
      const oid = Number(offreFilter);
      list = list.filter((c) => c.offreId === oid);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        const name = `${c.candidatPrenom || ""} ${c.candidatNom || ""}`.toLowerCase();
        const offre = (c.offreTitre || "").toLowerCase();
        const email = (c.candidatEmail || "").toLowerCase();
        return name.includes(q) || offre.includes(q) || email.includes(q);
      });
    }
    switch (sort) {
      case "oldest":
        list.sort((a, b) => new Date(a.dateCandidature as any).getTime() - new Date(b.dateCandidature as any).getTime());
        break;
      case "byStatus":
        list.sort((a, b) => (STATUT_ORDER[a.statut as StatutKey] ?? 99) - (STATUT_ORDER[b.statut as StatutKey] ?? 99));
        break;
      case "recent":
      default:
        list.sort((a, b) => new Date(b.dateCandidature as any).getTime() - new Date(a.dateCandidature as any).getTime());
    }
    return list;
  }, [candidatures, statutFilter, offreFilter, searchQuery, sort]);

  // ─── Pagination client ──────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Reset page quand filtres changent
  const filterKey = `${statutFilter}|${offreFilter}|${searchQuery}|${sort}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    if (page !== 1) setPage(1);
  }

  const from = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(filtered.length, page * PAGE_SIZE);

  // ─── Handlers ──────────────────────────────────────────────
  const dateLocale = i18n.language === "en" ? "en-GB" : "fr-FR";
  const formatDate = (d: any) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });
  };

  const isNew = (d: any) => {
    if (!d) return false;
    return Date.now() - new Date(d).getTime() < 24 * 3600 * 1000;
  };

  const handleViewDetail = (candidature: any) => {
    setSelectedCandidature(candidature);
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCandidature(null);
    refetch();
  };

  const handleChangeStatut = (candidatureId: number, newStatut: StatutKey) => {
    updateStatutMutation.mutate({ candidatureId, statut: newStatut });
  };

  // Filtre rapide par clic sur stat card
  const toggleStatutFilter = (s: StatutKey) => {
    setStatutFilter((prev) => (prev === s ? "all" : s));
  };

  const hasFilters = statutFilter !== "all" || offreFilter !== "all" || searchQuery.trim().length > 0;
  const resetFilters = () => {
    setStatutFilter("all");
    setOffreFilter("all");
    setSearchQuery("");
    setSort("recent");
  };

  return (
    <EmployeurLayout
      title={t("bo.employerApplications.title")}
      subtitle={t("bo.employerApplications.subtitle")}
      activeKey="applications"
    >
      <div className="space-y-5">
        {/* ═══ Stats cards (6 cliquables) ═════════════════════ */}
        <motion.section {...animate(0)} className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <StatCard
            icon={Users}
            iconBg={C.greenSoft}
            iconColor={C.green}
            label={t("bo.employerApplications.statTotal")}
            desc={t("bo.employerApplications.statTotalDesc")}
            value={stats.total}
            active={statutFilter === "all"}
            onClick={() => setStatutFilter("all")}
            highlightColor={C.green}
          />
          <StatCard
            icon={Clock}
            iconBg="#FEF7E0"
            iconColor="#8B5A00"
            label={t("bo.employerApplications.statusPending")}
            desc={t("bo.employerApplications.statPendingDesc")}
            value={stats.en_attente}
            active={statutFilter === "en_attente"}
            onClick={() => toggleStatutFilter("en_attente")}
            highlightColor="#8B5A00"
          />
          <StatCard
            icon={Eye}
            iconBg={C.blueSoft}
            iconColor={C.blue}
            label={t("bo.employerApplications.statusViewed")}
            desc={t("bo.employerApplications.statViewedDesc")}
            value={stats.vue}
            active={statutFilter === "vue"}
            onClick={() => toggleStatutFilter("vue")}
            highlightColor={C.blue}
          />
          <StatCard
            icon={Star}
            iconBg={C.greenSoft}
            iconColor={C.green}
            label={t("bo.employerApplications.statusRetained")}
            desc={t("bo.employerApplications.statRetainedDesc")}
            value={stats.retenue}
            active={statutFilter === "retenue"}
            onClick={() => toggleStatutFilter("retenue")}
            highlightColor={C.green}
          />
          <StatCard
            icon={XCircle}
            iconBg="#FEECEC"
            iconColor="#B91C1C"
            label={t("bo.employerApplications.statusRejected")}
            desc={t("bo.employerApplications.statRejectedDesc")}
            value={stats.rejetee}
            active={statutFilter === "rejetee"}
            onClick={() => toggleStatutFilter("rejetee")}
            highlightColor="#B91C1C"
          />
          <StatCard
            icon={MessageCircle}
            iconBg={C.purpleSoft}
            iconColor={C.purple}
            label={t("bo.employerApplications.statusInterview")}
            desc={t("bo.employerApplications.statInterviewDesc")}
            value={stats.entretien}
            active={statutFilter === "entretien"}
            onClick={() => toggleStatutFilter("entretien")}
            highlightColor={C.purple}
          />
        </motion.section>

        {/* ═══ Filtres bar ═══════════════════════════════════ */}
        <motion.section {...animate(1)}>
          <div
            className="bg-white rounded-2xl border p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center gap-3"
            style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.04)" }}
          >
            {/* Statut */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[13px] font-semibold hidden md:inline" style={{ color: C.textMuted }}>
                {t("bo.employerApplications.filterLabel")}
              </span>
              <Select value={statutFilter} onValueChange={(v) => setStatutFilter(v as any)}>
                <SelectTrigger className="h-10 w-40 rounded-lg text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bo.employerApplications.filterAll")}</SelectItem>
                  <SelectItem value="en_attente">{t("bo.employerApplications.statusPending")}</SelectItem>
                  <SelectItem value="vue">{t("bo.employerApplications.statusViewed")}</SelectItem>
                  <SelectItem value="retenue">{t("bo.employerApplications.statusRetained")}</SelectItem>
                  <SelectItem value="entretien">{t("bo.employerApplications.statusInterview")}</SelectItem>
                  <SelectItem value="rejetee">{t("bo.employerApplications.statusRejected")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recherche */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
              <Input
                placeholder={t("bo.employerApplications.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg text-sm"
                style={{ borderColor: C.border }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100"
                  aria-label="Clear"
                >
                  <X className="h-3.5 w-3.5" style={{ color: C.textMuted }} />
                </button>
              )}
            </div>

            {/* Offre */}
            {offres.length > 1 && (
              <Select value={offreFilter} onValueChange={setOffreFilter}>
                <SelectTrigger className="h-10 w-48 rounded-lg text-sm shrink-0">
                  <SelectValue placeholder={t("bo.employerApplications.filterAllJobs")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bo.employerApplications.filterAllJobs")}</SelectItem>
                  {offres.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)}>
                      {o.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Tri */}
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-10 w-36 rounded-lg text-sm shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t("bo.employerApplications.sortRecent")}</SelectItem>
                <SelectItem value="oldest">{t("bo.employerApplications.sortOldest")}</SelectItem>
                <SelectItem value="byStatus">{t("bo.employerApplications.sortByStatus")}</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset filters */}
            {hasFilters && (
              <Button
                variant="outline"
                onClick={resetFilters}
                className="h-10 rounded-lg text-sm font-semibold shrink-0"
                style={{ borderColor: C.border, color: "#DC2626" }}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Réinitialiser
              </Button>
            )}
          </div>
        </motion.section>

        {/* ═══ Liste ═════════════════════════════════════════ */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full" style={{ backgroundColor: C.border }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded" style={{ backgroundColor: C.border }} />
                    <div className="h-3 w-1/4 rounded" style={{ backgroundColor: C.border }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div {...animate(2)}>
            <div className="bg-white rounded-2xl border p-16 text-center" style={{ borderColor: C.border }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                <Users className="h-7 w-7" style={{ color: C.green }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: C.textMain }}>
                {t("bo.employerApplications.empty")}
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: C.textMuted }}>
                {statutFilter !== "all"
                  ? t("bo.employerApplications.emptyDescFiltered", { status: t(`bo.employerApplications.status${statutFilter === "en_attente" ? "Pending" : statutFilter === "vue" ? "Viewed" : statutFilter === "retenue" ? "Retained" : statutFilter === "entretien" ? "Interview" : "Rejected"}`) })
                  : t("bo.employerApplications.emptyDescAll")}
              </p>
              {statutFilter === "all" && (
                <Button
                  onClick={() => setLocation("/employeur/publier")}
                  className="rounded-xl h-11 font-semibold text-white"
                  style={{ backgroundColor: C.deepGreen }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("bo.employerApplications.emptyPublishCta")}
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div {...animate(2)} className="space-y-3">
              {paginated.map((c: any) => (
                <ApplicationCard
                  key={c.id}
                  candidature={c}
                  isNew={isNew(c.dateCandidature)}
                  formatDate={formatDate}
                  onView={() => handleViewDetail(c)}
                  onChangeStatut={handleChangeStatut}
                  t={t}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div {...animate(3)} className="flex items-center justify-center gap-1.5 mt-6 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-10 rounded-xl px-4 font-medium"
                  style={{ borderColor: C.border, color: C.textMain }}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("bo.employerApplications.prev")}
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
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
                  {t("bo.employerApplications.next")}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* Compteur affichage */}
            <p className="text-center text-[12.5px] mt-2" style={{ color: C.textMuted }}>
              {t("bo.employerApplications.showing", { from, to, total: filtered.length })}
            </p>
          </>
        )}
      </div>

      {/* Dialog détail candidature */}
      {selectedCandidature && (
        <DialogCandidatureDetail
          candidature={selectedCandidature}
          open={dialogOpen}
          onOpenChange={(open) => { if (!open) handleDialogClose(); }}
          onClose={handleDialogClose}
        />
      )}
    </EmployeurLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  label: string;
  desc: string;
  value: number;
  active: boolean;
  onClick: () => void;
  highlightColor: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, desc, value, active, onClick, highlightColor }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border p-4 text-center transition-all cursor-pointer"
      style={{
        borderColor: active ? highlightColor : C.border,
        boxShadow: active ? `0 8px 24px -8px ${highlightColor}30` : "0 4px 24px -16px rgba(15, 23, 42, 0.05)",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = highlightColor;
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 30px -12px rgba(15, 23, 42, 0.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px -16px rgba(15, 23, 42, 0.05)";
        }
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="font-extrabold leading-none mb-1" style={{ fontSize: "clamp(22px, 2vw, 26px)", color: C.textMain }}>
        {value}
      </div>
      <p className="text-[11.5px] font-semibold" style={{ color: C.textMain }}>
        {label}
      </p>
      <p className="text-[10.5px] mt-0.5" style={{ color: C.textMuted }}>
        {desc}
      </p>
    </button>
  );
}

interface ApplicationCardProps {
  candidature: any;
  isNew: boolean;
  formatDate: (d: any) => string;
  onView: () => void;
  onChangeStatut: (id: number, s: StatutKey) => void;
  t: (k: string, opts?: any) => string;
}

function ApplicationCard({ candidature, isNew, formatDate, onView, onChangeStatut, t }: ApplicationCardProps) {
  const style = STATUT_STYLE[candidature.statut as StatutKey] || STATUT_STYLE.en_attente;
  const StyleIcon = style.icon;

  const displayName = [candidature.candidatPrenom, candidature.candidatNom].filter(Boolean).join(" ") || "Candidat";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <article
      className="bg-white rounded-2xl border overflow-hidden flex hover:shadow-lg transition-shadow"
      style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
    >
      {/* Bandeau vertical coloré selon statut */}
      <div className="w-1.5 shrink-0" style={{ backgroundColor: style.bar }} />

      <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4">
        {/* Left : badge statut + offre */}
        <div className="md:w-56 shrink-0 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 border"
              style={{ backgroundColor: style.bg, color: style.fg, borderColor: style.border }}
            >
              <StyleIcon className="h-2.5 w-2.5" />
              {t(`bo.employerApplications.status${candidature.statut === "en_attente" ? "Pending" : candidature.statut === "vue" ? "Viewed" : candidature.statut === "retenue" ? "Retained" : candidature.statut === "entretien" ? "Interview" : "Rejected"}`)}
            </span>
            {isNew && (
              <span
                className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5"
                style={{ backgroundColor: C.goldSoft, color: C.deepGreen }}
              >
                {t("bo.employerApplications.newBadge")}
              </span>
            )}
          </div>
          <p className="text-[11.5px] font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
            {t("bo.employerApplications.forJob", { title: "" }).replace(" ", "")}
          </p>
          <p className="font-bold text-[13.5px] truncate" style={{ color: C.deepGreen }}>
            {candidature.offreTitre}
          </p>
        </div>

        {/* Center : candidat */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {candidature.candidatPhotoUrl ? (
            <img
              src={candidature.candidatPhotoUrl}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0"
              style={{ backgroundColor: C.green }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-[14.5px] truncate" style={{ color: C.textMain }}>
              {displayName}
            </p>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap text-[11.5px]" style={{ color: C.textMuted }}>
              {candidature.candidatEmail && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{candidature.candidatEmail}</span>
                </span>
              )}
              {candidature.candidatTelephone && (
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Phone className="h-3 w-3 shrink-0" />
                  {candidature.candidatTelephone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right : dates + actions */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 shrink-0">
          <div className="flex flex-col gap-1 text-[11.5px]" style={{ color: C.textMuted }}>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3" style={{ color: C.green }} />
              {t("bo.employerApplications.receivedOn", { date: formatDate(candidature.dateCandidature) })}
            </span>
            {candidature.dateReponse && (
              <span className="flex items-center gap-1.5">
                <Send className="h-3 w-3" style={{ color: C.green }} />
                {t("bo.employerApplications.responseSentOn", { date: formatDate(candidature.dateReponse) })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onView}
              className="rounded-lg h-9 text-xs font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: C.deepGreen }}
            >
              {t("bo.employerApplications.viewDetails")}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label={t("bo.employerApplications.actions.moveTo")}
                >
                  <MoreVertical className="h-4 w-4" style={{ color: C.textMuted }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs" style={{ color: C.textMuted }}>
                  {t("bo.employerApplications.actions.moveTo")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onChangeStatut(candidature.id, "vue")}>
                  <Eye className="h-4 w-4 mr-2" style={{ color: C.blue }} />
                  {t("bo.employerApplications.actions.markViewed")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatut(candidature.id, "retenue")}>
                  <Star className="h-4 w-4 mr-2" style={{ color: C.green }} />
                  {t("bo.employerApplications.actions.markRetained")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatut(candidature.id, "entretien")}>
                  <MessageCircle className="h-4 w-4 mr-2" style={{ color: C.purple }} />
                  {t("bo.employerApplications.actions.markInterview")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onChangeStatut(candidature.id, "en_attente")}>
                  <Clock className="h-4 w-4 mr-2" style={{ color: "#8B5A00" }} />
                  {t("bo.employerApplications.actions.markPending")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatut(candidature.id, "rejetee")} className="text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("bo.employerApplications.actions.markRejected")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </article>
  );
}
