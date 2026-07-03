import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { TemplateThumbnail } from "@/cv-templates/Thumbnails";
import {
  ArrowRight,
  BadgeCheck,
  Coins,
  Edit3,
  Eye,
  FileText,
  Search,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Provider = "mtn_momo" | "orange_money";
type SortKey = "latest" | "popular" | "price" | "az";
type FilterKey = "all" | "corporate" | "modern" | "minimalist" | "creative" | "executive";
type BadgeKey = "popular" | "new" | "premium";

/**
 * Page /candidat/templates — bibliothèque premium refonte.
 *
 *  1. Hero vert profond + image droite + accents or
 *  2. Search + filtres pills + tri
 *  3. Bandeau bénéfices (4 items ivoire)
 *  4. Grille 5 col des 10 modèles (badge popular/new/premium)
 *  5. Micro-réassurance paiement
 *  6. Modal preview + modal paiement (existante préservée)
 *
 * Filtrage / tri front. i18n : namespace `templates.*`.
 */

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

// Map slug → catégorie de filtre front. La DB a des catégories DB
// (moderne / creatif / executif / minimaliste / service), le filtre
// UI en expose 5 (corporate / modern / minimalist / creative /
// executive) + "all". "corporate" et "service" n'ont pas de match
// direct : on les considère comme "modern" par défaut.
const FILTER_MAP: Record<string, FilterKey> = {
  moderne: "modern",
  creatif: "creative",
  executif: "executive",
  minimaliste: "minimalist",
  service: "modern",
  corporate: "corporate",
};

// Badges maquette — mapping statique par slug pour matcher le rendu
// visuel demandé (populaire / nouveau / premium).
const BADGES: Record<string, BadgeKey> = {
  modern_sidebar_dark: "popular",
  hospitality_timeline: "new",
  minimal_centered: "premium",
  editorial_creative: "new",
  executive_curved: "premium",
  professional_modern_white: "popular",
  colorful_warm_blocks: "new",
  developer_dark_sidebar: "premium",
  sport_orange_dark: "new",
  pink_red_blobs: "premium",
};

const FILTERS: FilterKey[] = ["all", "corporate", "modern", "minimalist", "creative", "executive"];
const SORTS: SortKey[] = ["latest", "popular", "price", "az"];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function CandidatTemplates() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const { data: templates, isLoading } = trpc.cvTemplates.list.useQuery();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("mtn_momo");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (user.profileType !== "candidat" && user.role !== "admin"))) {
      setLocation("/connexion");
    }
  }, [user, authLoading, setLocation]);

  const purchaseMutation = trpc.cvTemplates.initiatePurchase.useMutation({
    onSuccess: (data, variables) => {
      utils.cvTemplates.list.invalidate();
      utils.cv.list.invalidate();
      setSelectedSlug(null);
      if (data.alreadyPurchased) {
        toast.info("Vous avez déjà accès à ce modèle");
      } else {
        toast.success("Paiement validé. Modèle débloqué pour 6 mois !");
      }
      const url = data.cvDocumentId
        ? `/candidat/cv-premium/${variables.slug}?cvId=${data.cvDocumentId}`
        : `/candidat/cv-premium/${variables.slug}`;
      setLocation(url);
    },
    onError: (e) => toast.error(e.message || "Erreur lors du paiement"),
  });

  const handlePay = () => {
    if (!selectedSlug) return;
    if (!phone.trim()) {
      toast.error("Numéro de téléphone requis pour le paiement mobile money");
      return;
    }
    purchaseMutation.mutate({ slug: selectedSlug, provider, payerPhone: phone.trim() });
  };

  const handleUseTemplate = (slug: string, purchased: boolean) => {
    if (purchased) {
      setLocation(`/candidat/cv-premium/${slug}`);
    } else {
      setSelectedSlug(slug);
      setProvider("mtn_momo");
      setPhone("");
    }
  };

  // ─── Filtre + recherche + tri (client-side) ─────────────────
  const filtered = useMemo(() => {
    if (!templates) return [];
    let list = [...templates];

    // Recherche par nom / description
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.nom.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    // Filtre catégorie
    if (filter !== "all") {
      list = list.filter((t) => FILTER_MAP[t.categorie || ""] === filter);
    }

    // Tri
    switch (sort) {
      case "az":
        list.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case "price":
        list.sort((a, b) => Number(a.prix) - Number(b.prix));
        break;
      case "popular":
        list.sort((a, b) => {
          const aPop = BADGES[a.slug] === "popular" ? 0 : 1;
          const bPop = BADGES[b.slug] === "popular" ? 0 : 1;
          return aPop - bPop;
        });
        break;
      case "latest":
      default:
        list.sort((a, b) => (b.ordre ?? 0) - (a.ordre ?? 0));
        break;
    }
    return list;
  }, [templates, search, filter, sort]);

  const previewTemplate = useMemo(
    () => templates?.find((t) => t.slug === previewSlug) || null,
    [templates, previewSlug]
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: C.green }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <CandidatNav />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* ─── 1. HERO premium ──────────────────────────────────
            Image full-cover en fond du hero (pas de fond vert vide,
            pas de dégradé moche) + overlay dégradé gauche pour la
            lisibilité du texte. Le fond de l'image est déjà vert
            profond donc l'overlay se fond naturellement. */}
        <motion.section {...animate(0)} aria-labelledby="tpl-hero-title">
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              backgroundColor: C.darkerGreen,
              minHeight: "320px",
              boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.4)",
            }}
          >
            {/* Image full-cover en fond du hero */}
            <img
              src="/images/candidat/hero-templates.webp"
              alt={t("templates.hero.imageAlt")}
              className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none select-none"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />

            {/* Overlay dégradé gauche → droite : opaque à gauche
                pour lisibilité du texte, transparent à droite pour
                laisser voir le CV et la couronne. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${C.darkerGreen} 0%, ${C.darkerGreen}F0 30%, ${C.darkerGreen}A0 50%, transparent 75%)`,
              }}
            />

            {/* Contenu gauche */}
            <div className="relative z-10 p-8 sm:p-10 lg:p-12 max-w-[95%] md:max-w-[58%]">
              {/* Badge Modèles payants */}
              <span
                className="inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold mb-5"
                style={{
                  backgroundColor: "rgba(246, 195, 67, 0.12)",
                  borderColor: "rgba(246, 195, 67, 0.35)",
                  color: C.gold,
                }}
              >
                {t("templates.hero.badge")}
              </span>

              {/* Titre */}
              <h1
                id="tpl-hero-title"
                className="font-extrabold text-white tracking-tight leading-tight mb-3"
                style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
              >
                {t("templates.hero.title")}{" "}
                <span style={{ color: C.gold }}>{t("templates.hero.titleHighlight")}</span>
              </h1>

              {/* Sous-titre */}
              <p
                className="text-sm sm:text-base leading-relaxed mb-6 max-w-xl"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                {t("templates.hero.subtitle")}
              </p>

              {/* Bénéfices inline */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 mb-7">
                {[
                  { icon: Coins, key: "priceBenefit" },
                  { icon: Sparkles, key: "designBenefit" },
                  { icon: FileText, key: "pdfBenefit" },
                  { icon: Target, key: "applicationBenefit" },
                ].map(({ icon: Icon, key }) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 shrink-0" style={{ color: C.gold }} />
                    <span style={{ color: "rgba(255,255,255,0.9)" }}>
                      {t(`templates.hero.${key}`)}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    document.getElementById("templates-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="h-12 rounded-xl px-6 font-semibold text-[15px] hover:opacity-90"
                  style={{ backgroundColor: C.gold, color: C.deepGreen }}
                >
                  {t("templates.hero.primaryCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setLocation("/candidat/cv")}
                  variant="outline"
                  className="h-12 rounded-xl px-6 font-semibold text-[15px] border-2 bg-transparent"
                  style={{ borderColor: "rgba(255,255,255,0.25)", color: "#ffffff" }}
                >
                  {t("templates.hero.secondaryCta")}
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ─── 2. SEARCH + FILTRES + TRI ──────────────────────── */}
        <motion.section
          {...animate(1)}
          className="mt-6 lg:mt-8 flex flex-col lg:flex-row lg:items-center gap-4"
        >
          {/* Search */}
          <div className="relative lg:w-80 shrink-0">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: C.textMuted }}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("templates.search.placeholder")}
              className="pl-10 pr-14 h-12 rounded-xl bg-white"
              style={{ borderColor: C.border }}
              aria-label={t("templates.search.placeholder")}
            />
            <kbd
              className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] font-mono pointer-events-none"
              style={{ borderColor: C.border, color: C.textMuted, backgroundColor: C.bg }}
            >
              ⌘ K
            </kbd>
          </div>

          {/* Filtres pills */}
          <div className="flex-1 overflow-x-auto -mx-1 px-1">
            <div className="flex items-center gap-2 min-w-max lg:justify-center">
              {FILTERS.map((key) => {
                const active = filter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className="h-10 px-4 rounded-full text-sm font-medium transition-colors whitespace-nowrap border"
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
                    aria-pressed={active}
                  >
                    {t(`templates.filters.${key === "modern" ? "modern" : key === "minimalist" ? "minimalist" : key === "creative" ? "creative" : key === "executive" ? "executive" : key === "corporate" ? "corporate" : "all"}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium" style={{ color: C.textMuted }}>
              {t("templates.sort.label")}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-xl border px-3 pr-8 text-sm font-medium bg-white cursor-pointer focus:outline-none focus:ring-2"
              style={{ borderColor: C.border, color: C.textMain }}
              aria-label={t("templates.sort.label")}
            >
              {SORTS.map((s) => (
                <option key={s} value={s}>
                  {t(`templates.sort.${s}`)}
                </option>
              ))}
            </select>
          </div>
        </motion.section>

        {/* ─── 3. BANDEAU BÉNÉFICES ───────────────────────────── */}
        <motion.section
          {...animate(2)}
          className="mt-6 rounded-2xl border overflow-hidden"
          style={{ borderColor: "rgba(246, 195, 67, 0.35)", backgroundColor: C.ivory }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: C.border }}>
            {[
              { icon: FileText, key: "pdf" },
              { icon: Sparkles, key: "design" },
              { icon: BadgeCheck, key: "ats" },
              { icon: Edit3, key: "customization" },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-start gap-3 px-6 py-5">
                <div
                  className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0, 155, 90, 0.10)" }}
                >
                  <Icon className="h-5 w-5" style={{ color: C.green }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[14px]" style={{ color: C.textMain }}>
                    {t(`templates.benefits.${key}.title`)}
                  </p>
                  <p className="text-[12.5px] mt-0.5 leading-snug" style={{ color: C.textMuted }}>
                    {t(`templates.benefits.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── 4. GRILLE DES MODÈLES ──────────────────────────── */}
        <motion.section
          {...animate(3)}
          id="templates-grid"
          className="mt-6 scroll-mt-24"
        >
          {filtered.length === 0 ? (
            <div
              className="rounded-2xl border bg-white text-center py-16"
              style={{ borderColor: C.border, color: C.textMuted }}
            >
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">{t("templates.empty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((tpl) => {
                const badge = BADGES[tpl.slug] || "premium";
                const badgeStyles: Record<BadgeKey, { bg: string; fg: string }> = {
                  popular: { bg: C.gold, fg: C.deepGreen },
                  new: { bg: C.green, fg: "#ffffff" },
                  premium: { bg: C.deepGreen, fg: "#ffffff" },
                };
                const bs = badgeStyles[badge];

                return (
                  <article
                    key={tpl.id}
                    className="group bg-white rounded-2xl border overflow-hidden transition-all duration-250 hover:-translate-y-1 flex flex-col"
                    style={{
                      borderColor: tpl.purchased ? C.green : C.border,
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px -10px rgba(6, 63, 36, 0.25)";
                      (e.currentTarget as HTMLElement).style.borderColor = C.green;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 2px rgba(15, 23, 42, 0.04)";
                      (e.currentTarget as HTMLElement).style.borderColor = tpl.purchased ? C.green : C.border;
                    }}
                  >
                    {/* Preview zone */}
                    <div className="relative aspect-[3/4] bg-gray-50 border-b overflow-hidden" style={{ borderColor: C.border }}>
                      <TemplateThumbnail slug={tpl.slug} className="w-full h-full" />
                      {/* Badge angle top-right */}
                      <span
                        className="absolute top-3 right-3 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm"
                        style={{ backgroundColor: bs.bg, color: bs.fg }}
                      >
                        {t(`templates.badge.${badge}`)}
                      </span>
                    </div>

                    {/* Contenu */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-[15px] leading-tight mb-1" style={{ color: C.textMain }}>
                        {tpl.nom}
                      </h3>
                      <p
                        className="text-[12.5px] leading-relaxed mb-3 line-clamp-2"
                        style={{ color: C.textMuted }}
                      >
                        {tpl.description}
                      </p>

                      {/* Prix */}
                      <div className="mb-3 mt-auto">
                        <span className="text-xl font-extrabold" style={{ color: C.deepGreen }}>
                          {t("templates.card.price")}
                        </span>{" "}
                        <span className="text-[13px] font-semibold" style={{ color: C.textMuted }}>
                          {t("templates.card.fcfa")}
                        </span>
                        {tpl.purchased && (
                          <span
                            className="ml-2 inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                            style={{ backgroundColor: C.greenSoft, color: C.green }}
                          >
                            {t("templates.card.purchased")}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPreviewSlug(tpl.slug)}
                          className="h-10 rounded-lg text-[13px] font-semibold min-w-0 px-2"
                          style={{ borderColor: C.border, color: C.deepGreen }}
                        >
                          <Eye className="mr-1.5 h-4 w-4 shrink-0" />
                          <span className="truncate">{t("templates.card.preview")}</span>
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleUseTemplate(tpl.slug, tpl.purchased)}
                          className="h-10 rounded-lg text-white text-[13px] font-semibold hover:opacity-90 min-w-0 px-2"
                          style={{ backgroundColor: C.green }}
                        >
                          <span className="truncate">{t("templates.card.use")}</span>
                          <ArrowRight className="ml-1 h-4 w-4 shrink-0" />
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ─── 5. RÉASSURANCE ─────────────────────────────────── */}
        <motion.div
          {...animate(4)}
          className="flex items-center justify-center gap-2 py-8 text-sm"
          style={{ color: C.textMuted }}
        >
          <ShieldCheck className="h-4 w-4" style={{ color: C.green }} />
          {t("templates.reassurance")}
        </motion.div>
      </div>

      {/* ─── Modal PRÉVISUALISATION ──────────────────────────── */}
      <Dialog open={!!previewSlug} onOpenChange={(open) => !open && setPreviewSlug(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" style={{ color: C.green }} />
              {previewTemplate?.nom || t("templates.preview.title")}
            </DialogTitle>
            <DialogDescription>{previewTemplate?.description}</DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div
              className="rounded-xl border overflow-hidden bg-gray-50"
              style={{ borderColor: C.border, aspectRatio: "3/4", maxHeight: "70vh" }}
            >
              <TemplateThumbnail slug={previewTemplate.slug} className="w-full h-full" />
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPreviewSlug(null)}>
              <X className="mr-2 h-4 w-4" />
              {t("templates.preview.close")}
            </Button>
            {previewTemplate && (
              <Button
                onClick={() => {
                  const slug = previewTemplate.slug;
                  const purchased = previewTemplate.purchased;
                  setPreviewSlug(null);
                  handleUseTemplate(slug, purchased);
                }}
                className="text-white hover:opacity-90"
                style={{ backgroundColor: C.green }}
              >
                {t("templates.card.use")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Modal PAIEMENT (préservée) ──────────────────────── */}
      <Dialog open={!!selectedSlug} onOpenChange={(open) => !open && setSelectedSlug(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: C.gold }} />
              {t("templates.payment.title")}
            </DialogTitle>
            <DialogDescription>{t("templates.payment.description")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2 block">{t("templates.payment.method")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProvider("mtn_momo")}
                  className="p-3 rounded-lg border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: provider === "mtn_momo" ? C.green : C.border,
                    backgroundColor: provider === "mtn_momo" ? C.greenSoft : "transparent",
                    color: provider === "mtn_momo" ? C.deepGreen : C.textMuted,
                  }}
                >
                  MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setProvider("orange_money")}
                  className="p-3 rounded-lg border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: provider === "orange_money" ? C.green : C.border,
                    backgroundColor: provider === "orange_money" ? C.greenSoft : "transparent",
                    color: provider === "orange_money" ? C.deepGreen : C.textMuted,
                  }}
                >
                  Orange Money
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="mb-1 block">
                {t("templates.payment.phone")}
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textMuted }} />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6XX XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                {t("templates.payment.phoneHint")}
              </p>
            </div>

            <div
              className="rounded-lg p-3 text-xs border"
              style={{
                backgroundColor: "rgba(246, 195, 67, 0.10)",
                borderColor: "rgba(246, 195, 67, 0.35)",
                color: C.deepGreen,
              }}
            >
              {t("templates.payment.testMode")}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlug(null)}>
              {t("templates.payment.cancel")}
            </Button>
            <Button
              onClick={handlePay}
              disabled={purchaseMutation.isPending}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: C.deepGreen }}
            >
              {purchaseMutation.isPending ? t("templates.payment.paying") : t("templates.payment.pay")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
