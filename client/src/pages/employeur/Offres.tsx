import { EmployeurLayout } from "@/components/EmployeurLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileEdit,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Page /employeur/offres — refonte premium.
 *
 * Structure :
 *  1. EmployeurLayout (sidebar green + topbar, activeKey="jobs")
 *  2. Stats row (4 KPIs) : total, actives, candidatures, vues cumulées
 *  3. Filtres bar : tabs statut (5 pills) + recherche + tri
 *  4. Liste cards premium : bandeau vertical coloré selon statut,
 *     avatar/icône, titre, meta (lieu + contrat + secteur), badges
 *     type (public/privé), stats (candidatures + vues), dates,
 *     actions (Voir + Voir candidatures si > 0), menu ⋯
 *  5. Dialogs préservés : delete / archive / republish
 *
 * i18n : bo.employerJobs.*
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

type TabStatut = "toutes" | "publiee" | "pourvue" | "expiree" | "brouillon";
type SortKey = "recent" | "oldest" | "mostApplications" | "mostViews" | "byTitle";

// Palette pilule contrat (cohérent avec ToutesLesOffres / Dashboard)
const CONTRACT_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  CDI: { bg: C.greenSoft, fg: C.deepGreen, border: "#A7D8B9" },
  CDD: { bg: C.purpleSoft, fg: C.purple, border: "#D8B4F8" },
  Stage: { bg: "#FEF7E0", fg: "#8B5A00", border: C.gold },
  Freelance: { bg: C.blueSoft, fg: C.blue, border: "#93C5FD" },
  Alternance: { bg: "#FEECEC", fg: "#B91C1C", border: "#F4A5A5" },
};

// Statut : bandeau vertical + badge
const STATUT_STYLE: Record<string, { bar: string; bg: string; fg: string; border: string; icon: any }> = {
  publiee: { bar: C.green, bg: C.greenSoft, fg: C.deepGreen, border: "#A7D8B9", icon: BadgeCheck },
  brouillon: { bar: "#94A3B8", bg: "#F1F5F9", fg: "#475569", border: "#CBD5E1", icon: FileEdit },
  expiree: { bar: "#B91C1C", bg: "#FEECEC", fg: "#B91C1C", border: "#F4A5A5", icon: Clock },
  pourvue: { bar: C.gold, bg: "#FEF7E0", fg: "#8B5A00", border: C.gold, icon: CheckCircle2 },
};

export default function EmployeurOffres() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const [activeTab, setActiveTab] = useState<TabStatut>("toutes");
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  // Dialogs
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [republierDialogOpen, setRepublierDialogOpen] = useState(false);
  const [offreToDelete, setOffreToDelete] = useState<number | null>(null);
  const [offreToArchive, setOffreToArchive] = useState<{ id: number; titre: string } | null>(null);
  const [offreToRepublier, setOffreToRepublier] = useState<{ id: number; titre: string } | null>(null);
  const [offreTitreToDelete, setOffreTitreToDelete] = useState<string>("");

  const { data: allOffres, isLoading, refetch } = trpc.jobs.getByEmployeur.useQuery();

  // ─── Counts par tab ──────────────────────────────────────
  const counts = useMemo(() => {
    if (!allOffres) return { toutes: 0, publiee: 0, pourvue: 0, expiree: 0, brouillon: 0 };
    return {
      toutes: allOffres.length,
      publiee: allOffres.filter((o) => o.statut === "publiee" && !(o.dateLimite && new Date(o.dateLimite) < new Date())).length,
      pourvue: allOffres.filter((o) => o.statut === "pourvue").length,
      expiree: allOffres.filter((o) => o.statut === "expiree" || (o.dateLimite && new Date(o.dateLimite) < new Date() && o.statut === "publiee")).length,
      brouillon: allOffres.filter((o) => o.statut === "brouillon").length,
    };
  }, [allOffres]);

  // Stats globales pour KPI row
  const stats = useMemo(() => {
    if (!allOffres) return { total: 0, active: 0, applications: 0, views: 0 };
    return {
      total: allOffres.length,
      active: counts.publiee,
      applications: allOffres.reduce((sum, o) => sum + (o.nombreCandidatures || 0), 0),
      views: allOffres.reduce((sum, o) => sum + (o.nombreVues || 0), 0),
    };
  }, [allOffres, counts]);

  // ─── Filtre + search + tri ─────────────────────────────
  const filtered = useMemo(() => {
    if (!allOffres) return [];
    let list = [...allOffres];

    // Tab
    if (activeTab === "expiree") {
      list = list.filter(
        (o) => o.statut === "expiree" || (o.dateLimite && new Date(o.dateLimite) < new Date() && o.statut === "publiee")
      );
    } else if (activeTab !== "toutes") {
      if (activeTab === "publiee") {
        list = list.filter(
          (o) => o.statut === "publiee" && !(o.dateLimite && new Date(o.dateLimite) < new Date())
        );
      } else {
        list = list.filter((o) => o.statut === activeTab);
      }
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((o) =>
        (o.titre || "").toLowerCase().includes(q) ||
        (o.secteur || "").toLowerCase().includes(q) ||
        (o.ville || "").toLowerCase().includes(q) ||
        (o.region || "").toLowerCase().includes(q)
      );
    }

    // Tri
    switch (sort) {
      case "oldest":
        list.sort((a, b) => new Date(a.datePublication as any).getTime() - new Date(b.datePublication as any).getTime());
        break;
      case "mostApplications":
        list.sort((a, b) => (b.nombreCandidatures || 0) - (a.nombreCandidatures || 0));
        break;
      case "mostViews":
        list.sort((a, b) => (b.nombreVues || 0) - (a.nombreVues || 0));
        break;
      case "byTitle":
        list.sort((a, b) => (a.titre || "").localeCompare(b.titre || ""));
        break;
      case "recent":
      default:
        list.sort((a, b) => new Date(b.datePublication as any).getTime() - new Date(a.datePublication as any).getTime());
    }
    return list;
  }, [allOffres, activeTab, searchQuery, sort]);

  const dateLocale = i18n.language === "en" ? "en-GB" : "fr-FR";
  const formatDate = (d: any) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });
  };

  // ─── Mutations ─────────────────────────────────────────
  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerJobs.deletedToast"));
      setDeleteDialogOpen(false);
      setOffreToDelete(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const republierMutation = trpc.jobs.republier.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerJobs.republishedToast"));
      setRepublierDialogOpen(false);
      setOffreToRepublier(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const archiveMutation = trpc.jobs.archive.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerJobs.archivedToast"));
      setArchiveDialogOpen(false);
      setOffreToArchive(null);
      refetch();
    },
    onError: (error) => toast.error(error.message),
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
  const handleDuplicate = (id: number) => {
    setLocation(`/employeur/publier?duplicateId=${id}`);
  };

  const hasFilters = activeTab !== "toutes" || searchQuery.trim().length > 0 || sort !== "recent";
  const resetFilters = () => {
    setActiveTab("toutes");
    setSearchQuery("");
    setSort("recent");
  };

  return (
    <EmployeurLayout
      title={t("bo.employerJobs.title")}
      subtitle={t("bo.employerJobs.subtitle")}
      activeKey="jobs"
      actions={
        <Button
          onClick={() => setLocation("/employeur/publier")}
          className="h-10 rounded-lg font-semibold text-white shadow-sm hidden sm:inline-flex"
          style={{ backgroundColor: C.deepGreen }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t("bo.employerJobs.newJobBtn")}
        </Button>
      }
    >
      <div className="space-y-5">
        {/* ═══ Stats row (4 KPIs) ═══════════════════════════ */}
        <motion.section {...animate(0)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            icon={Briefcase}
            iconBg={C.greenSoft}
            iconColor={C.green}
            label={t("bo.employerJobs.stats.total")}
            value={stats.total}
            desc={t("bo.employerJobs.stats.totalDesc")}
          />
          <StatCard
            icon={BadgeCheck}
            iconBg={C.greenSoft}
            iconColor={C.green}
            label={t("bo.employerJobs.stats.active")}
            value={stats.active}
            desc={t("bo.employerJobs.stats.activeDesc")}
          />
          <StatCard
            icon={Users}
            iconBg={C.blueSoft}
            iconColor={C.blue}
            label={t("bo.employerJobs.stats.applications")}
            value={stats.applications}
            desc={t("bo.employerJobs.stats.applicationsDesc")}
          />
          <StatCard
            icon={Eye}
            iconBg={C.purpleSoft}
            iconColor={C.purple}
            label={t("bo.employerJobs.stats.views")}
            value={stats.views}
            desc={t("bo.employerJobs.stats.viewsDesc")}
          />
        </motion.section>

        {/* ═══ Filtres bar (tabs + search + sort) ═════════ */}
        <motion.section {...animate(1)}>
          <div
            className="bg-white rounded-2xl border p-4 lg:p-5"
            style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.04)" }}
          >
            {/* Tabs pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {([
                { key: "toutes", label: t("bo.employerJobs.tabs.all"), count: counts.toutes },
                { key: "publiee", label: t("bo.employerJobs.tabs.active"), count: counts.publiee },
                { key: "pourvue", label: t("bo.employerJobs.tabs.filled"), count: counts.pourvue },
                { key: "expiree", label: t("bo.employerJobs.tabs.expired"), count: counts.expiree },
                { key: "brouillon", label: t("bo.employerJobs.tabs.draft"), count: counts.brouillon },
              ] as { key: TabStatut; label: string; count: number }[]).map((tab) => (
                <TabPill
                  key={tab.key}
                  active={activeTab === tab.key}
                  label={tab.label}
                  count={tab.count}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>

            {/* Search + Sort */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                <Input
                  placeholder={t("bo.employerJobs.searchPlaceholder")}
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
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-10 w-full md:w-48 rounded-lg text-sm shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t("bo.employerJobs.sortRecent")}</SelectItem>
                  <SelectItem value="oldest">{t("bo.employerJobs.sortOldest")}</SelectItem>
                  <SelectItem value="mostApplications">{t("bo.employerJobs.sortMostApplications")}</SelectItem>
                  <SelectItem value="mostViews">{t("bo.employerJobs.sortMostViews")}</SelectItem>
                  <SelectItem value="byTitle">{t("bo.employerJobs.sortByTitle")}</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="h-10 rounded-lg text-sm font-semibold shrink-0"
                  style={{ borderColor: C.border, color: "#DC2626" }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  {t("bo.employerJobs.resetFilters")}
                </Button>
              )}
            </div>
          </div>
        </motion.section>

        {/* ═══ Liste des offres ═════════════════════════════ */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse" style={{ borderColor: C.border }}>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: C.border }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded" style={{ backgroundColor: C.border }} />
                    <div className="h-3 w-1/2 rounded" style={{ backgroundColor: C.border }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div {...animate(2)}>
            <div className="bg-white rounded-2xl border p-16 text-center" style={{ borderColor: C.border }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                <Briefcase className="h-7 w-7" style={{ color: C.green }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: C.textMain }}>
                {t("bo.employerJobs.empty")}
              </h3>
              <p className="mb-6 max-w-md mx-auto" style={{ color: C.textMuted }}>
                {t("bo.employerJobs.emptyDesc")}
              </p>
              <Button
                onClick={() => setLocation("/employeur/publier")}
                className="rounded-xl h-11 font-semibold text-white"
                style={{ backgroundColor: C.deepGreen }}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("bo.employerJobs.firstJobBtn")}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div {...animate(2)} className="space-y-3">
            {filtered.map((offre: any) => (
              <OffreCard
                key={offre.id}
                offre={offre}
                formatDate={formatDate}
                onView={() => setLocation(`/offre/${offre.id}`)}
                onEdit={() => setLocation(`/employeur/offres/${offre.id}/modifier`)}
                onDuplicate={() => handleDuplicate(offre.id)}
                onArchive={() => handleArchive(offre.id, offre.titre)}
                onRepublish={() => handleRepublier(offre.id, offre.titre)}
                onDelete={() => handleDelete(offre.id, offre.titre)}
                onViewApplications={() => setLocation("/employeur/candidatures")}
                t={t}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* ═══ Dialogs conservés (delete / republish / archive) ═══ */}
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
              onClick={() => offreToDelete && deleteMutation.mutate({ id: offreToDelete })}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("bo.employerJobs.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              onClick={() => offreToRepublier && republierMutation.mutate({ id: offreToRepublier.id })}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t("bo.employerJobs.republishDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              onClick={() => offreToArchive && archiveMutation.mutate({ id: offreToArchive.id })}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Archive className="h-4 w-4 mr-2" />
              {t("bo.employerJobs.archiveDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  value: number;
  desc: string;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, desc }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border p-4 lg:p-5"
      style={{ borderColor: C.border, boxShadow: "0 4px 24px -16px rgba(15, 23, 42, 0.06)" }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <span className="text-[11.5px] leading-tight font-medium" style={{ color: C.textMuted }}>
          {label}
        </span>
      </div>
      <div className="font-extrabold" style={{ fontSize: "clamp(22px, 2.2vw, 28px)", color: C.textMain }}>
        {value.toLocaleString()}
      </div>
      <p className="text-[11.5px] mt-1" style={{ color: C.textMuted }}>
        {desc}
      </p>
    </div>
  );
}

interface TabPillProps {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}

function TabPill({ active, label, count, onClick }: TabPillProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-3 py-1.5 border transition-colors"
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
      {label}
      {count > 0 && (
        <span
          className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-[10.5px] font-bold"
          style={{
            backgroundColor: active ? "rgba(255,255,255,0.2)" : C.greenSoft,
            color: active ? "#ffffff" : C.deepGreen,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface OffreCardProps {
  offre: any;
  formatDate: (d: any) => string;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRepublish: () => void;
  onDelete: () => void;
  onViewApplications: () => void;
  t: (k: string, opts?: any) => string;
}

function OffreCard({ offre, formatDate, onView, onEdit, onDuplicate, onArchive, onRepublish, onDelete, onViewApplications, t }: OffreCardProps) {
  const isPourvue = offre.statut === "pourvue";
  const isExpired = offre.dateLimite && new Date(offre.dateLimite) < new Date() && offre.statut === "publiee";
  const effectiveStatut = isExpired ? "expiree" : offre.statut;
  const style = STATUT_STYLE[effectiveStatut] || STATUT_STYLE.publiee;
  const StyleIcon = style.icon;
  const cc = CONTRACT_COLORS[offre.typeContrat] || { bg: "#F1F5F9", fg: "#475569", border: "#CBD5E1" };
  const applicationsCount = offre.nombreCandidatures || 0;
  const viewsCount = offre.nombreVues || 0;

  const statusLabelKey =
    effectiveStatut === "publiee" ? "statusPublished" :
    effectiveStatut === "brouillon" ? "statusDraft" :
    effectiveStatut === "expiree" ? "statusExpired" :
    "statusFilled";

  return (
    <article
      className="bg-white rounded-2xl border overflow-hidden flex transition-shadow hover:shadow-lg"
      style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)", opacity: isPourvue ? 0.85 : 1 }}
    >
      {/* Bandeau vertical coloré selon statut */}
      <div className="w-1.5 shrink-0" style={{ backgroundColor: style.bar }} />

      <div className="flex-1 p-5">
        {/* Top row : badges + menu */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 border"
              style={{ backgroundColor: style.bg, color: style.fg, borderColor: style.border }}
            >
              <StyleIcon className="h-2.5 w-2.5" />
              {t(`bo.employerJobs.${statusLabelKey}`)}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5"
              style={{
                backgroundColor: offre.typeOffre === "public" ? C.greenSoft : C.blueSoft,
                color: offre.typeOffre === "public" ? C.deepGreen : C.blue,
              }}
            >
              {offre.typeOffre === "public" ? t("bo.employerJobs.publicJob") : t("bo.employerJobs.privateJob")}
            </span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-gray-100 shrink-0" aria-label="Menu">
                <MoreVertical className="h-4 w-4" style={{ color: C.textMuted }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" style={{ color: C.blue }} />
                {t("bo.employerJobs.actions.viewJob")}
              </DropdownMenuItem>
              {!isPourvue && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" style={{ color: C.green }} />
                  {t("bo.employerJobs.actions.edit")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" style={{ color: C.textMuted }} />
                {t("bo.employerJobs.actions.duplicate")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isPourvue && (
                <DropdownMenuItem onClick={onArchive} className="text-amber-700">
                  <Archive className="h-4 w-4 mr-2" />
                  {t("bo.employerJobs.actions.markFilled")}
                </DropdownMenuItem>
              )}
              {isPourvue && (
                <DropdownMenuItem onClick={onRepublish} className="text-green-700">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t("bo.employerJobs.actions.republish")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                {t("bo.employerJobs.actions.deleteForever")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Titre */}
        <button
          onClick={onView}
          className="font-bold text-[17px] leading-tight mb-2 text-left hover:opacity-70 transition-opacity"
          style={{ color: C.textMain }}
        >
          {offre.titre}
        </button>

        {/* Meta ligne : lieu + contrat + secteur */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-[12.5px]" style={{ color: C.textMuted }}>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" style={{ color: C.green }} />
            {offre.ville}{offre.region ? `, ${offre.region}` : ""}
          </span>
          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 border"
            style={{ backgroundColor: cc.bg, color: cc.fg, borderColor: cc.border }}
          >
            <Briefcase className="h-3 w-3" />
            {offre.typeContrat || "—"}
          </span>
          {offre.secteur && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" style={{ color: C.textMuted }} />
              {offre.secteur}
            </span>
          )}
        </div>

        {/* Stats + Dates */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-[12.5px]">
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: C.blue }}>
            <Users className="h-3.5 w-3.5" />
            {t("bo.employerJobs.applications", { count: applicationsCount })}
          </span>
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: C.purple }}>
            <Eye className="h-3.5 w-3.5" />
            {t("bo.employerJobs.views", { count: viewsCount })}
          </span>
          <span className="flex items-center gap-1.5" style={{ color: C.textMuted }}>
            <Calendar className="h-3.5 w-3.5" />
            {t("bo.employerJobs.publishedOn", { date: formatDate(offre.datePublication) })}
          </span>
          {offre.dateLimite && (
            <span className="flex items-center gap-1.5" style={{ color: isExpired ? "#B91C1C" : C.textMuted }}>
              <Clock className="h-3.5 w-3.5" />
              {t("bo.employerJobs.expiresOn", { date: formatDate(offre.dateLimite) })}
            </span>
          )}
        </div>

        {/* Actions bottom */}
        <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: C.border }}>
          <Button
            onClick={onView}
            variant="outline"
            className="h-9 rounded-lg text-xs font-semibold"
            style={{ borderColor: C.border, color: C.textMain }}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {t("bo.employerJobs.actions.viewJob")}
          </Button>
          {applicationsCount > 0 && (
            <Button
              onClick={onViewApplications}
              className="h-9 rounded-lg text-xs font-semibold text-white hover:opacity-90"
              style={{ backgroundColor: C.deepGreen }}
            >
              {t("bo.employerJobs.actions.viewApplications")}
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
          {!isPourvue && (
            <Button
              onClick={onArchive}
              variant="outline"
              className="h-9 rounded-lg text-xs font-semibold"
              style={{ borderColor: C.gold, color: "#8B5A00", backgroundColor: "#FEF7E0" }}
            >
              <Archive className="h-3.5 w-3.5 mr-1.5" />
              {t("bo.employerJobs.actions.archive")}
            </Button>
          )}
          {isPourvue && (
            <Button
              onClick={onRepublish}
              variant="outline"
              className="h-9 rounded-lg text-xs font-semibold"
              style={{ borderColor: C.green, color: C.deepGreen, backgroundColor: C.greenSoft }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {t("bo.employerJobs.actions.republishShort")}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
