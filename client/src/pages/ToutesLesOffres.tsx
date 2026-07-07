import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CandidatNav } from "@/components/CandidatNav";
import { EmployeurNav } from "@/components/EmployeurNav";
import { SiteHeader } from "@/components/SiteHeader";
import { DialogCandidature } from "@/components/DialogCandidature";
import { stripHtml } from "@/lib/stripHtml";
import {
  Bell,
  BadgeCheck,
  Bookmark,
  Briefcase,
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  CAMEROON_REGIONS,
  BUSINESS_SECTORS,
} from "@shared/cameroon-data";
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
import { motion, useReducedMotion } from "framer-motion";

const PAGE_SIZE = 10;

const C = {
  green: "#009B5A",
  greenAction: "#007A3D",
  deepGreen: "#063F24",
  darkerGreen: "#031F16",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  ivory: "#FAF7EF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
};

// Types de contrat exposés en filtres (checkboxes multi-sélect)
const CONTRACT_KEYS = ["cdi", "cdd", "internship", "freelance", "alternance"] as const;
type ContractKey = (typeof CONTRACT_KEYS)[number];
// Mapping clé UI → valeur backend attendue par jobs.search (typeContrat)
const CONTRACT_VALUE: Record<ContractKey, string> = {
  cdi: "CDI",
  cdd: "CDD",
  internship: "Stage",
  freelance: "Freelance",
  alternance: "Alternance",
};

// Fourchettes de salaire
const SALARY_RANGES = [
  { key: "0-300000", label: "< 300 000 FCFA", min: undefined, max: 300000 },
  { key: "300000-600000", label: "300 000 – 600 000 FCFA", min: 300000, max: 600000 },
  { key: "600000-1000000", label: "600 000 – 1 000 000 FCFA", min: 600000, max: 1000000 },
  { key: "1000000+", label: "> 1 000 000 FCFA", min: 1000000, max: undefined },
] as const;

type SortKey = "latest" | "relevance" | "salary" | "company";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function ToutesLesOffres() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  // Paramètres URL initiaux (venant de la homepage)
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get("q") || "";
  const initialVille = urlParams.get("ville") || "";

  // ─── State filtres ──────────────────────────────────────────────
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [villeInput, setVilleInput] = useState(initialVille);
  const [ville, setVille] = useState(initialVille);
  const [contractKeys, setContractKeys] = useState<Set<ContractKey>>(new Set());
  const [category, setCategory] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [salaryRange, setSalaryRange] = useState<string>("");
  const [sort, setSort] = useState<SortKey>("latest");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ─── Modales ────────────────────────────────────────────────────
  const [candidatureOffre, setCandidatureOffre] = useState<{ id: number; titre: string } | null>(null);
  const [showAlerteDialog, setShowAlerteDialog] = useState(false);
  const [alerteNom, setAlerteNom] = useState("");
  const [alerteFrequence, setAlerteFrequence] = useState<"immediate" | "quotidien" | "hebdomadaire">("quotidien");

  const createAlerteMutation = trpc.alertes.create.useMutation({
    onSuccess: () => {
      toast.success(t("jobs.alert.successToast"));
      setShowAlerteDialog(false);
      setAlerteNom("");
      utils.alertes.list.invalidate();
    },
    onError: (err) => toast.error(err.message || t("jobs.alert.errorToast")),
  });

  // ─── Salaire calculé depuis la fourchette ───────────────────────
  const salaireRange = useMemo(() => {
    const found = SALARY_RANGES.find((r) => r.key === salaryRange);
    return found ? { min: found.min, max: found.max } : {};
  }, [salaryRange]);

  // Un seul type de contrat envoyé au backend actuel (typeContrat: string).
  // Si l'utilisateur en coche plusieurs, on filtre côté client après réception.
  const singleContract = useMemo(() => {
    return contractKeys.size === 1
      ? CONTRACT_VALUE[Array.from(contractKeys)[0]]
      : undefined;
  }, [contractKeys]);

  const queryInput = useMemo(() => ({
    keywords: search || undefined,
    typeContrat: singleContract,
    region: region || undefined,
    ville: ville || undefined,
    secteur: category || undefined,
    salaireMin: salaireRange.min,
    salaireMax: salaireRange.max,
    page,
    limit: PAGE_SIZE,
  }), [search, singleContract, region, ville, category, salaireRange, page]);

  const { data: result, isLoading, isFetching } = trpc.jobs.search.useQuery(queryInput);

  const rawOffres = result?.jobs ?? [];
  const total = result?.total ?? 0;

  // Multi-contract : filtre client si plusieurs types cochés
  const offres = useMemo(() => {
    let list = [...rawOffres];
    if (contractKeys.size > 1) {
      const allowed = new Set(Array.from(contractKeys).map((k) => CONTRACT_VALUE[k]));
      list = list.filter((o) => o.typeContrat && allowed.has(o.typeContrat));
    }
    // Tri client (le backend renvoie par datePublication desc par défaut)
    switch (sort) {
      case "salary":
        list.sort((a, b) => {
          const sa = Number(a.salaire) || 0;
          const sb = Number(b.salaire) || 0;
          return sb - sa;
        });
        break;
      case "company":
        list.sort((a, b) =>
          ((a as any).entreprise || "").localeCompare((b as any).entreprise || "")
        );
        break;
      case "relevance":
        // Pertinence : approximation — les plus récentes + celles matchant les
        // mots-clés en priorité. Faute de score serveur on garde ordre natif.
        break;
      case "latest":
      default:
        list.sort((a, b) => {
          const da = a.datePublication ? new Date(a.datePublication as unknown as string).getTime() : 0;
          const db = b.datePublication ? new Date(b.datePublication as unknown as string).getTime() : 0;
          return db - da;
        });
        break;
    }
    return list;
  }, [rawOffres, contractKeys, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Reset page quand un filtre change
  const filterKey = `${search}|${ville}|${Array.from(contractKeys).sort().join(",")}|${category}|${region}|${salaryRange}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  useEffect(() => {
    if (prevFilterKey !== filterKey) {
      setPrevFilterKey(filterKey);
      setPage(1);
    }
  }, [filterKey, prevFilterKey]);

  const hasActiveFilters =
    !!search || !!ville || contractKeys.size > 0 || !!category || !!region || !!salaryRange;

  const resetFilters = () => {
    setSearch("");
    setSearchInput("");
    setVilleInput("");
    setVille("");
    setContractKeys(new Set());
    setCategory("");
    setRegion("");
    setSalaryRange("");
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setVille(villeInput);
    setPage(1);
  };

  const toggleContract = (key: ContractKey) => {
    setContractKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Pagination helper : n° pages + "…"
  const getPageNumbers = (): (number | "...")[] => {
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

  // Publié il y a X
  const publishedLabel = (dateStr: string | null | Date | undefined) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr as unknown as string).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 1) return t("jobs.card.publishedJustNow");
    if (hours < 24) return t("jobs.card.publishedToday");
    return t("jobs.card.publishedDaysAgo", { count: days });
  };

  const isNew = (dateStr: string | null | Date | undefined) => {
    if (!dateStr) return false;
    return Date.now() - new Date(dateStr as unknown as string).getTime() < 3 * 24 * 60 * 60 * 1000;
  };

  // Nav conditionnelle selon profil connecté
  const NavComponent =
    user?.profileType === "employeur" || user?.role === "admin"
      ? EmployeurNav
      : user?.profileType === "candidat"
      ? CandidatNav
      : null;

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
        {NavComponent ? <NavComponent /> : <SiteHeader activePage="emplois" />}

        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8 space-y-6">
          {/* ═══ 1. HERO premium ═══════════════════════════════════ */}
          <motion.section {...animate(0)} aria-labelledby="jobs-hero-title">
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{
                backgroundColor: C.darkerGreen,
                minHeight: "260px",
                boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.4)",
              }}
            >
              {/* Image droite — carnet vert (asset dashboard candidat) */}
              <img
                src="/images/candidat/candidate-dashboard.webp"
                alt={t("jobs.hero.imageAlt")}
                className="hidden md:block absolute right-0 top-0 h-full w-1/2 object-cover object-center pointer-events-none select-none"
                style={{
                  maskImage: "linear-gradient(to right, transparent 0%, black 25%, black 100%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 25%, black 100%)",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />

              {/* Halo or discret */}
              <div
                aria-hidden="true"
                className="absolute -bottom-16 right-32 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{ backgroundColor: C.gold }}
              />

              {/* Contenu gauche */}
              <div className="relative z-10 p-8 sm:p-10 lg:p-12 max-w-[95%] md:max-w-[58%]">
                <h1
                  id="jobs-hero-title"
                  className="font-extrabold text-white tracking-tight leading-tight mb-3"
                  style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
                >
                  {t("jobs.hero.title")}{" "}
                  <span style={{ color: C.gold }}>{t("jobs.hero.titleHighlight")}</span>
                </h1>
                <p
                  className="text-sm sm:text-base leading-relaxed mb-6 max-w-xl"
                  style={{ color: "rgba(255,255,255,0.82)" }}
                >
                  {t("jobs.hero.subtitle")}
                </p>

                {/* Bénéfices inline */}
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {[
                    { icon: BadgeCheck, key: "verified" },
                    { icon: Clock, key: "updated" },
                    { icon: Building2, key: "trustedCompanies" },
                  ].map(({ icon: Icon, key }) => (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(246, 195, 67, 0.15)" }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: C.gold }} />
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>
                        {t(`jobs.hero.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* ═══ 2. BARRE DE RECHERCHE ═════════════════════════════ */}
          <motion.section {...animate(1)}>
            <div
              className="bg-white rounded-2xl border p-3 lg:p-4"
              style={{
                borderColor: C.border,
                boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Métier / compétence */}
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
                    style={{ color: C.textMuted }}
                  />
                  <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t("jobs.searchBar.keywordPlaceholder")}
                    className="pl-11 h-14 rounded-xl border"
                    style={{ borderColor: C.border }}
                    aria-label={t("jobs.searchBar.keywordPlaceholder")}
                  />
                </div>
                {/* Ville / région */}
                <div className="relative lg:w-80 shrink-0">
                  <MapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
                    style={{ color: C.textMuted }}
                  />
                  <Input
                    value={villeInput}
                    onChange={(e) => setVilleInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={t("jobs.searchBar.locationPlaceholder")}
                    className="pl-11 h-14 rounded-xl border"
                    style={{ borderColor: C.border }}
                    aria-label={t("jobs.searchBar.locationPlaceholder")}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-14 px-8 rounded-xl font-semibold text-white text-[15px] hover:opacity-90"
                  style={{ backgroundColor: C.deepGreen }}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t("jobs.searchBar.button")}
                </Button>
              </div>
            </div>
          </motion.section>

          {/* ═══ 3. LAYOUT sidebar + liste ═════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
            {/* ─── SIDEBAR filtres ─────────────────────────────── */}
            <motion.aside {...animate(2)} className="min-w-0">
              {/* Bouton mobile pour ouvrir/fermer les filtres */}
              <div className="lg:hidden mb-3">
                <Button
                  variant="outline"
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="w-full h-11 rounded-xl gap-2 font-semibold"
                  style={{ borderColor: C.border }}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t("jobs.filters.title")}
                  {contractKeys.size + (category ? 1 : 0) + (region ? 1 : 0) + (salaryRange ? 1 : 0) > 0 && (
                    <span
                      className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: C.green }}
                    >
                      {contractKeys.size + (category ? 1 : 0) + (region ? 1 : 0) + (salaryRange ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </div>

              <div
                className={`${mobileFiltersOpen ? "block" : "hidden"} lg:block bg-white rounded-2xl border p-6 lg:sticky lg:top-24`}
                style={{
                  borderColor: C.border,
                  boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)",
                }}
              >
                {/* En-tête filtres */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" style={{ color: C.deepGreen }} />
                    <h2 className="font-bold text-[15px]" style={{ color: C.textMain }}>
                      {t("jobs.filters.title")}
                    </h2>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-[13px] font-medium transition-colors hover:opacity-70"
                      style={{ color: C.green }}
                    >
                      <RefreshCw className="h-3 w-3" />
                      {t("jobs.filters.reset")}
                    </button>
                  )}
                </div>

                {/* Type de contrat — checkboxes */}
                <div className="mb-6">
                  <p className="text-[13px] font-bold mb-3" style={{ color: C.textMain }}>
                    {t("jobs.filters.contractType")}
                  </p>
                  <div className="space-y-2.5">
                    {CONTRACT_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2.5 cursor-pointer text-sm hover:opacity-80"
                        style={{ color: C.textMain }}
                      >
                        <Checkbox
                          checked={contractKeys.has(key)}
                          onCheckedChange={() => toggleContract(key)}
                          className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        {t(`jobs.filters.${key}`)}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Catégorie */}
                <div className="mb-5">
                  <p className="text-[13px] font-bold mb-2" style={{ color: C.textMain }}>
                    {t("jobs.filters.category")}
                  </p>
                  <Select
                    value={category || "all"}
                    onValueChange={(v) => setCategory(v === "all" ? "" : v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t("jobs.filters.allCategories")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("jobs.filters.allCategories")}</SelectItem>
                      {BUSINESS_SECTORS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.labelFr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Région */}
                <div className="mb-5">
                  <p className="text-[13px] font-bold mb-2" style={{ color: C.textMain }}>
                    {t("jobs.filters.region")}
                  </p>
                  <Select
                    value={region || "all"}
                    onValueChange={(v) => setRegion(v === "all" ? "" : v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t("jobs.filters.allRegions")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("jobs.filters.allRegions")}</SelectItem>
                      {CAMEROON_REGIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.labelFr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Salaire */}
                <div className="mb-5">
                  <p className="text-[13px] font-bold mb-2" style={{ color: C.textMain }}>
                    {t("jobs.filters.salary")}
                  </p>
                  <Select
                    value={salaryRange || "all"}
                    onValueChange={(v) => setSalaryRange(v === "all" ? "" : v)}
                  >
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t("jobs.filters.allSalaries")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("jobs.filters.allSalaries")}</SelectItem>
                      {SALARY_RANGES.map((r) => (
                        <SelectItem key={r.key} value={r.key}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Plus de filtres — placeholder pour futurs filtres */}
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-xl gap-2 font-semibold text-sm"
                  style={{ borderColor: C.border, color: C.textMain }}
                  disabled
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {t("jobs.filters.more")}
                </Button>
              </div>
            </motion.aside>

            {/* ─── LISTE offres ────────────────────────────────── */}
            <motion.section {...animate(3)} className="min-w-0">
              {/* Compteur + Tri */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <p className="font-semibold" style={{ color: C.textMain }}>
                  {isLoading ? "…" : t("jobs.list.count", { count: total })}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm" style={{ color: C.textMuted }}>
                    {t("jobs.sort.label")}
                  </span>
                  <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                    <SelectTrigger className="h-10 w-44 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">{t("jobs.sort.latest")}</SelectItem>
                      <SelectItem value="relevance">{t("jobs.sort.relevance")}</SelectItem>
                      <SelectItem value="salary">{t("jobs.sort.salary")}</SelectItem>
                      <SelectItem value="company">{t("jobs.sort.company")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Skeleton */}
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse" style={{ borderColor: C.border }}>
                      <div className="flex gap-4">
                        <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0" />
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded mb-2 w-1/2" />
                          <div className="h-4 bg-gray-100 rounded mb-3 w-1/3" />
                          <div className="h-4 bg-gray-100 rounded mb-3 w-2/3" />
                          <div className="flex gap-2">
                            <div className="h-6 bg-gray-100 rounded w-16" />
                            <div className="h-6 bg-gray-100 rounded w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : offres.length === 0 ? (
                <div
                  className="bg-white rounded-2xl border p-12 text-center"
                  style={{ borderColor: C.border, color: C.textMuted }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: C.greenSoft }}
                  >
                    <Sparkles className="h-6 w-6" style={{ color: C.green }} />
                  </div>
                  <p className="font-semibold text-base mb-1" style={{ color: C.textMain }}>
                    {t("jobs.list.empty")}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={resetFilters} className="mt-3 rounded-xl">
                      {t("jobs.filters.reset")}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {offres.map((offre) => (
                    <OffreCard
                      key={offre.id}
                      offre={offre}
                      isNew={isNew(offre.datePublication)}
                      publishedLabel={publishedLabel(offre.datePublication)}
                      onView={() => setLocation(`/offre/${offre.id}`)}
                      t={t}
                    />
                  ))}
                </div>
              )}

              {/* ─── Pagination ────────────────────────────── */}
              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                    className="h-10 rounded-xl px-4 font-medium"
                    style={{ borderColor: C.border, color: C.textMain }}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t("jobs.pagination.previous")}
                  </Button>

                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-sm" style={{ color: C.textMuted }}>
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        onClick={() => setPage(p as number)}
                        disabled={isFetching}
                        className="h-10 w-10 rounded-xl p-0 font-semibold text-sm border"
                        style={{
                          backgroundColor: p === page ? C.deepGreen : "#ffffff",
                          color: p === page ? "#ffffff" : C.textMain,
                          borderColor: p === page ? C.deepGreen : C.border,
                        }}
                        onMouseEnter={(e) => {
                          if (p !== page) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.greenSoft;
                        }}
                        onMouseLeave={(e) => {
                          if (p !== page) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
                        }}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isFetching}
                    className="h-10 rounded-xl px-4 font-medium"
                    style={{ borderColor: C.border, color: C.textMain }}
                  >
                    {t("jobs.pagination.next")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* CTA candidat — créer une alerte */}
              {user?.profileType === "candidat" && (
                <div className="mt-6 text-center">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-xl h-11 font-semibold"
                    style={{ borderColor: C.green, color: C.deepGreen }}
                    onClick={() => {
                      setAlerteNom(search || t("jobs.alert.defaultAllJobs"));
                      setShowAlerteDialog(true);
                    }}
                  >
                    <Bell className="h-4 w-4" />
                    {t("jobs.alert.cta")}
                  </Button>
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </div>

      {/* ─── Modal candidature ─────────────────────────────────── */}
      {candidatureOffre && (
        <DialogCandidature
          open={!!candidatureOffre}
          onOpenChange={(open) => { if (!open) setCandidatureOffre(null); }}
          offreId={candidatureOffre.id}
          offreTitre={candidatureOffre.titre}
          onSuccess={() => setCandidatureOffre(null)}
        />
      )}

      {/* ─── Modal alerte ──────────────────────────────────────── */}
      <Dialog open={showAlerteDialog} onOpenChange={setShowAlerteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" style={{ color: C.green }} />
              {t("jobs.alert.dialogTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("jobs.alert.dialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="alerte-nom">{t("jobs.alert.nameLabel")}</Label>
              <Input
                id="alerte-nom"
                value={alerteNom}
                onChange={(e) => setAlerteNom(e.target.value)}
                placeholder={t("jobs.alert.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("jobs.alert.frequencyLabel")}</Label>
              <Select
                value={alerteFrequence}
                onValueChange={(v) => setAlerteFrequence(v as "immediate" | "quotidien" | "hebdomadaire")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">{t("jobs.alert.frequencyImmediate")}</SelectItem>
                  <SelectItem value="quotidien">{t("jobs.alert.frequencyDaily")}</SelectItem>
                  <SelectItem value="hebdomadaire">{t("jobs.alert.frequencyWeekly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlerteDialog(false)}>{t("jobs.alert.cancel")}</Button>
            <Button
              className="text-white"
              style={{ backgroundColor: C.deepGreen }}
              disabled={!alerteNom.trim() || createAlerteMutation.isPending}
              onClick={() =>
                createAlerteMutation.mutate({
                  nom: alerteNom.trim(),
                  motsCles: search || undefined,
                  typeContrat: singleContract || undefined,
                  typeOffre: "tous",
                  frequence: alerteFrequence,
                })
              }
            >
              {createAlerteMutation.isPending ? t("jobs.alert.creating") : t("jobs.alert.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sub-component : card offre premium
// ═════════════════════════════════════════════════════════════════════════════

interface OffreCardProps {
  offre: any;
  isNew: boolean;
  publishedLabel: string;
  onView: () => void;
  t: (k: string, opts?: any) => string;
}

function OffreCard({ offre, isNew, publishedLabel, onView, t }: OffreCardProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const entreprise = (offre as any).entreprise || t("jobs.card.unspecifiedCompany");
  const description = stripHtml(offre.description, 220);
  const location = offre.ville || offre.region || t("jobs.card.unspecifiedLocation");
  const contractLabel = offre.typeContrat || t("jobs.card.unspecifiedContract");
  const logoUrl = (offre as any).logoUrl as string | undefined;

  // Certaines offres stockent competencesRequises en HTML brut
  // (paragraphes concaténés). On strip d'abord les balises, puis on
  // split sur virgule ET retour ligne, puis on filtre les fragments
  // trop longs (> 40 chars = phrase, pas un tag).
  const tags = offre.competencesRequises
    ? stripHtml(offre.competencesRequises, 500)
        .split(/[,\n]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0 && s.length <= 40)
    : [];
  const visibleTags = tags.slice(0, 4);
  const extraTagsCount = Math.max(0, tags.length - visibleTags.length);

  // Palette badge type de contrat (pilule colorée)
  const contractBadge: Record<string, { bg: string; fg: string; border: string }> = {
    CDI:      { bg: "#EAF8F1", fg: "#063F24", border: "#A7D8B9" },
    CDD:      { bg: "#F3EAFB", fg: "#5B21B6", border: "#D8B4F8" },
    Stage:    { bg: "#FEF7E0", fg: "#8B5A00", border: "#F6C343" },
    Freelance:{ bg: "#EAF3FB", fg: "#1D4ED8", border: "#93C5FD" },
    Alternance:{bg: "#FEECEC", fg: "#B91C1C", border: "#F4A5A5" },
  };
  const cb = contractBadge[offre.typeContrat as string] || { bg: "#F1F5F9", fg: "#334155", border: "#CBD5E1" };

  const initial = entreprise.charAt(0).toUpperCase();

  return (
    <article
      className="group bg-white rounded-2xl border p-6 transition-all duration-250 hover:-translate-y-1"
      style={{
        borderColor: C.border,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px -10px rgba(6, 63, 36, 0.18)";
        (e.currentTarget as HTMLElement).style.borderColor = C.green;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
        (e.currentTarget as HTMLElement).style.borderColor = C.border;
      }}
    >
      <div className="flex gap-4">
        {/* Logo carré */}
        <div className="shrink-0">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="w-14 h-14 rounded-xl object-contain border bg-white"
              style={{ borderColor: C.border }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg text-white"
              style={{ backgroundColor: C.deepGreen }}
              aria-hidden="true"
            >
              {initial}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Ligne titre + bookmark */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-[17px] leading-tight" style={{ color: C.textMain }}>
                  {offre.titre}
                </h3>
                {isNew && (
                  <span
                    className="text-[10.5px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5"
                    style={{ backgroundColor: "rgba(246, 195, 67, 0.15)", color: C.deepGreen, borderColor: C.gold, borderWidth: 1 }}
                  >
                    {t("jobs.card.new")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[14px] font-semibold" style={{ color: C.green }}>
                  {entreprise}
                </span>
                <BadgeCheck className="h-4 w-4 shrink-0" style={{ color: C.green }} aria-label={t("jobs.card.verifiedCompany")} />
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBookmarked((b) => !b);
              }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Sauvegarder"
              aria-pressed={bookmarked}
            >
              <Bookmark
                className="h-5 w-5"
                style={{ color: bookmarked ? C.gold : C.textMuted, fill: bookmarked ? C.gold : "none" }}
              />
            </button>
          </div>

          {/* Meta line — lieu + pilule contrat colorée + date */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 text-[13px]" style={{ color: C.textMuted }}>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </span>
            {offre.typeContrat && (
              <span
                className="inline-flex items-center gap-1 text-[11.5px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 border"
                style={{ backgroundColor: cb.bg, color: cb.fg, borderColor: cb.border }}
              >
                <Briefcase className="h-3 w-3" />
                {offre.typeContrat}
              </span>
            )}
            {!offre.typeContrat && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {contractLabel}
              </span>
            )}
            {publishedLabel && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {publishedLabel}
              </span>
            )}
          </div>

          {/* Description nettoyée */}
          {description && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: C.textMuted }}>
              {description}
            </p>
          )}

          {/* Tags */}
          {(visibleTags.length > 0 || extraTagsCount > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {visibleTags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[11.5px] font-medium rounded-md px-2 py-1"
                  style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}
                >
                  {tag}
                </span>
              ))}
              {extraTagsCount > 0 && (
                <span
                  className="text-[11.5px] font-medium rounded-md px-2 py-1"
                  style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}
                >
                  +{extraTagsCount}
                </span>
              )}
            </div>
          )}

          {/* CTA Voir l'offre */}
          <div className="mt-4 flex items-center justify-end">
            <button
              type="button"
              onClick={onView}
              className="flex items-center gap-1 text-[13.5px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: C.deepGreen }}
            >
              {t("jobs.card.viewJob")}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
