import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import SiteFooter from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { stripHtml } from "@/lib/stripHtml";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Calendar,
  Check,
  Clock,
  FileText,
  Mail,
  Search,
  Star,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Page /conseils — bibliothèque éditoriale premium bilingue.
 *
 * Structure (maquette) :
 *  1. SiteHeader (activePage="conseils")
 *  2. Hero ivoire : titre à gauche + search+catégories à droite,
 *     décor logo Cameroon Travail en filigrane à droite
 *  3. Article featured (large 2/3) + Newsletter card (1/3)
 *  4. Grid 4 colonnes des autres articles
 *  5. CTA final vert profond (2 boutons Voir offres / Créer CV)
 *  6. SiteFooter
 *
 * Bilinguisme : la DB stocke titre/description/contenu en FR (source)
 * et titre_en/description_en/contenu_en en EN (optionnel, via traduction
 * assistée admin). getLocalized() choisit la version selon i18n.language
 * courant, avec fallback FR si l'EN est absent.
 */

const C = {
  green: "#009B5A",
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
};

// Catégories DB (enum) — sans accents (Marche/Negociation) tel que
// stocké en PostgreSQL. La colonne i18n conseilsPage.categories.{key}
// affiche le libellé traduit avec accents (Marché/Négociation).
type CategorieDb = "Entretien" | "CV" | "Marche" | "Negociation" | "Reconversion" | "Freelance";
const CATEGORIES_DB: CategorieDb[] = ["Entretien", "CV", "Marche", "Negociation", "Reconversion", "Freelance"];

// Le enum tRPC serveur attend les accents (backward-compat). On mape
// avant d'envoyer la query.
const DB_TO_SERVER: Record<CategorieDb, string> = {
  Entretien: "Entretien",
  CV: "CV",
  Marche: "Marché",
  Negociation: "Négociation",
  Reconversion: "Reconversion",
  Freelance: "Freelance",
};

// Couleur pilule par catégorie (visuel doux, cohérent avec la charte)
const CAT_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  Entretien: { bg: "#EAF3FB", fg: "#1D4ED8", border: "#93C5FD" },
  CV: { bg: "#EAF8F1", fg: "#063F24", border: "#A7D8B9" },
  Marche: { bg: "#F3EAFB", fg: "#5B21B6", border: "#D8B4F8" },
  Negociation: { bg: "#FDF2E3", fg: "#8B5A00", border: "#F6C343" },
  Reconversion: { bg: "#FDECEC", fg: "#B91C1C", border: "#F4A5A5" },
  Freelance: { bg: "#FEF7E0", fg: "#8B5A00", border: "#F6C343" },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

/**
 * Retourne le champ localisé : EN si l'utilisateur est en anglais ET
 * qu'un champ EN est présent, sinon fallback FR (source).
 */
function localized<T extends Record<string, any>>(
  article: T,
  frField: string,
  enField: string,
  lang: string
): string {
  if (lang === "en") {
    const enValue = article[enField];
    if (enValue && String(enValue).trim().length > 0) return enValue;
  }
  return article[frField] || "";
}

export default function Conseils() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const lang = i18n.language;
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const [activeCategorie, setActiveCategorie] = useState<"all" | CategorieDb>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const categorieFilter =
    activeCategorie !== "all" ? (DB_TO_SERVER[activeCategorie] as any) : undefined;

  const { data, isLoading } = trpc.conseils.getAll.useQuery({
    categorie: categorieFilter,
    limit: 50,
    offset: 0,
  });

  const allArticles = data?.articles ?? [];

  // Filtrage local search (front — match sur les 2 langues)
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return allArticles;
    const q = searchQuery.toLowerCase();
    return allArticles.filter((a) => {
      const titre = localized(a, "titre", "titreEn", lang).toLowerCase();
      const desc = localized(a, "description", "descriptionEn", lang).toLowerCase();
      const auteur = (a.auteur || "").toLowerCase();
      return titre.includes(q) || desc.includes(q) || auteur.includes(q);
    });
  }, [allArticles, searchQuery, lang]);

  // Séparation featured / grid
  const { featured, gridArticles } = useMemo(() => {
    if (searchQuery.trim() || activeCategorie !== "all") {
      return { featured: null, gridArticles: filteredArticles };
    }
    const f = filteredArticles.find((a) => a.featured) || filteredArticles[0] || null;
    const grid = filteredArticles.filter((a) => !f || a.id !== f.id);
    return { featured: f, gridArticles: grid };
  }, [filteredArticles, searchQuery, activeCategorie]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO : brancher un endpoint newsletter côté serveur (Resend audience)
    setSubscribed(true);
    toast.success(t("conseilsPage.newsletter.successToast"));
    setEmail("");
  };

  const dateLocale = lang === "en" ? "en-GB" : "fr-FR";

  const formatDate = (d: Date | string | null | undefined, format: "long" | "short" = "long") => {
    if (!d) return "";
    return new Date(d as unknown as string).toLocaleDateString(dateLocale, {
      day: "numeric",
      month: format === "long" ? "long" : "short",
      year: "numeric",
    });
  };

  const goToArticle = (article: any) => {
    const slug = lang === "en" && article.slugEn ? article.slugEn : article.slug;
    setLocation(`/conseils/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <SiteHeader activePage="conseils" />

      {/* ═══ 1. HERO ivoire ═══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${C.ivory} 0%, #FDF9EF 60%, #F3F9F1 100%)`,
        }}
      >
        {/* Filigrane logo Cameroon Travail (subtil, à droite) */}
        <img
          src="/logo-cameroon-travail.webp"
          alt=""
          aria-hidden="true"
          className="hidden lg:block absolute pointer-events-none select-none"
          style={{
            right: "-20px",
            top: "50%",
            transform: "translateY(-50%) rotate(-8deg)",
            width: "360px",
            opacity: 0.09,
          }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />

        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 lg:py-14">
          <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-center">
            {/* Colonne gauche : titre + subtitle */}
            <motion.div {...animate(0)}>
              <h1
                className="font-extrabold tracking-tight leading-tight mb-4"
                style={{ fontSize: "clamp(32px, 4vw, 52px)", color: C.textMain }}
              >
                {t("conseilsPage.hero.title")}{" "}
                <span style={{ color: C.gold }}>{t("conseilsPage.hero.titleHighlight")}</span>
              </h1>
              <p
                className="text-[15.5px] lg:text-base leading-relaxed max-w-lg"
                style={{ color: C.textMuted }}
              >
                {t("conseilsPage.hero.subtitle")}
              </p>
            </motion.div>

            {/* Colonne droite : recherche + pills catégories */}
            <motion.div {...animate(1)}>
              {/* Search input */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none"
                  style={{ color: C.textMuted }}
                />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("conseilsPage.search.placeholder")}
                  className="pl-12 pr-10 h-14 rounded-2xl border bg-white text-[15px]"
                  style={{ borderColor: C.border }}
                  aria-label={t("conseilsPage.search.placeholder")}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" style={{ color: C.textMuted }} />
                  </button>
                )}
              </div>

              {/* Pills catégories */}
              <div className="flex flex-wrap gap-2">
                <CategoryPill
                  active={activeCategorie === "all"}
                  label={t("conseilsPage.categories.all")}
                  onClick={() => setActiveCategorie("all")}
                />
                {CATEGORIES_DB.map((cat) => (
                  <CategoryPill
                    key={cat}
                    active={activeCategorie === cat}
                    label={t(`conseilsPage.categories.${cat}`)}
                    onClick={() => setActiveCategorie(cat)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 2. CONTENT (featured + grid) ═════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 lg:py-12">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: C.green }} />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-white border" style={{ borderColor: C.border }}>
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" style={{ color: C.textMuted }} />
            <p style={{ color: C.textMuted }}>{t("conseilsPage.empty")}</p>
          </div>
        ) : (
          <>
            {/* ─── Featured + Newsletter (grid 2 cols) ─── */}
            {featured && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 mb-10 lg:mb-12">
                {/* Featured card large */}
                <motion.article
                  {...animate(2)}
                  className="bg-white rounded-2xl border overflow-hidden cursor-pointer group transition-shadow"
                  style={{
                    borderColor: C.border,
                    boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.08)",
                  }}
                  onClick={() => goToArticle(featured)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 40px -20px rgba(6, 63, 36, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px -12px rgba(15, 23, 42, 0.08)";
                  }}
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {featured.imageUrl && (
                      <div className="md:w-1/2 h-52 md:h-auto overflow-hidden bg-gray-100">
                        <img
                          src={featured.imageUrl}
                          alt={featured.imageAlt || localized(featured, "titre", "titreEn", lang)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="md:w-1/2 p-6 lg:p-7 flex flex-col justify-center min-w-0">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge
                          bg={C.goldSoft}
                          fg={C.deepGreen}
                          border={C.gold}
                          icon={<Star className="h-3 w-3" />}
                          label={t("conseilsPage.featured.badge")}
                        />
                        <CategoryBadge categorie={featured.categorie} t={t} />
                      </div>
                      <h2
                        className="font-bold leading-tight mb-3"
                        style={{ fontSize: "clamp(20px, 2vw, 26px)", color: C.textMain }}
                      >
                        {localized(featured, "titre", "titreEn", lang)}
                      </h2>
                      <p
                        className="text-[14.5px] leading-relaxed mb-4 line-clamp-3"
                        style={{ color: C.textMuted }}
                      >
                        {stripHtml(localized(featured, "description", "descriptionEn", lang), 220)}
                      </p>
                      <div className="flex items-center gap-4 text-xs mb-5" style={{ color: C.textMuted }}>
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {featured.auteur}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(featured.datePublication, "long")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {featured.tempsLecture}
                        </span>
                      </div>
                      <Button
                        className="text-white gap-2 w-fit rounded-xl h-11 font-semibold hover:opacity-90"
                        style={{ backgroundColor: C.deepGreen }}
                      >
                        {t("conseilsPage.featured.readArticle")}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.article>

                {/* Newsletter card */}
                <motion.aside
                  {...animate(3)}
                  className="rounded-2xl border p-6 lg:p-7 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(155deg, ${C.ivory} 0%, #FDF9EF 100%)`,
                    borderColor: "rgba(246, 195, 67, 0.4)",
                  }}
                >
                  {/* Décor halo or */}
                  <div
                    aria-hidden="true"
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: C.gold }}
                  />

                  <div className="relative">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: C.goldSoft }}
                    >
                      <Mail className="h-5 w-5" style={{ color: C.gold }} />
                    </div>

                    <h3 className="font-bold text-[19px] mb-2" style={{ color: C.textMain }}>
                      {t("conseilsPage.newsletter.title")}
                    </h3>
                    <p className="text-[13.5px] leading-relaxed mb-5" style={{ color: C.textMuted }}>
                      {t("conseilsPage.newsletter.subtitle")}
                    </p>

                    {subscribed ? (
                      <div
                        className="rounded-xl p-3 text-sm font-medium flex items-center gap-2"
                        style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}
                      >
                        <Check className="h-4 w-4" />
                        {t("conseilsPage.newsletter.successToast")}
                      </div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="space-y-2.5">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t("conseilsPage.newsletter.placeholder")}
                          required
                          className="h-11 rounded-xl border bg-white"
                          style={{ borderColor: C.border }}
                        />
                        <Button
                          type="submit"
                          className="w-full text-white h-11 rounded-xl font-semibold hover:opacity-90"
                          style={{ backgroundColor: C.deepGreen }}
                        >
                          {t("conseilsPage.newsletter.cta")}
                        </Button>
                      </form>
                    )}

                    <p className="text-[11.5px] mt-3 flex items-center gap-1.5" style={{ color: C.textMuted }}>
                      <Check className="h-3 w-3" style={{ color: C.green }} />
                      {t("conseilsPage.newsletter.microcopy")}
                    </p>
                  </div>
                </motion.aside>
              </div>
            )}

            {/* ─── Grille articles ─── */}
            <motion.div {...animate(4)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
              {gridArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  lang={lang}
                  t={t}
                  formatDate={formatDate}
                  onClick={() => goToArticle(article)}
                />
              ))}
            </motion.div>
          </>
        )}
      </section>

      {/* ═══ 3. CTA FINAL vert profond ═════════════════════════════════ */}
      <section
        className="relative overflow-hidden mx-4 lg:mx-6 mb-10 rounded-3xl"
        style={{
          background: `linear-gradient(140deg, ${C.deepGreen} 0%, ${C.darkerGreen} 100%)`,
          boxShadow: "0 20px 60px -30px rgba(3, 31, 22, 0.6)",
        }}
      >
        {/* Halo or discret */}
        <div
          aria-hidden="true"
          className="absolute -bottom-16 right-40 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: C.gold }}
        />
        {/* Filigrane logo droite */}
        <img
          src="/logo-cameroon-travail.webp"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute pointer-events-none select-none"
          style={{
            right: "40px",
            top: "50%",
            transform: "translateY(-50%) rotate(-6deg)",
            width: "180px",
            opacity: 0.08,
          }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-8 items-center">
            {/* Icône */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 mx-auto lg:mx-0"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <Briefcase className="h-6 w-6" style={{ color: C.gold }} />
            </div>

            {/* Texte */}
            <div className="min-w-0 text-center lg:text-left">
              <h3 className="font-extrabold text-white leading-tight mb-2" style={{ fontSize: "clamp(22px, 2.2vw, 30px)" }}>
                {t("conseilsPage.ctaFinal.title")}
              </h3>
              <p className="text-[14.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                {t("conseilsPage.ctaFinal.subtitle")}
              </p>
            </div>

            {/* Boutons */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                onClick={() => setLocation("/offres")}
                className="h-12 rounded-xl px-6 font-semibold text-[15px] hover:opacity-90"
                style={{ backgroundColor: C.gold, color: C.deepGreen }}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                {t("conseilsPage.ctaFinal.jobs")}
              </Button>
              <Button
                onClick={() => setLocation("/candidat/cv")}
                variant="outline"
                className="h-12 rounded-xl px-6 font-semibold text-[15px] border-2 bg-transparent"
                style={{ borderColor: "rgba(255,255,255,0.3)", color: "#ffffff" }}
              >
                <FileText className="h-4 w-4 mr-2" />
                {t("conseilsPage.ctaFinal.createCv")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════

function CategoryPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap"
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
      {label}
    </button>
  );
}

function Badge({
  bg,
  fg,
  border,
  icon,
  label,
}: {
  bg: string;
  fg: string;
  border: string;
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide rounded-md px-2 py-1 border"
      style={{ backgroundColor: bg, color: fg, borderColor: border }}
    >
      {icon}
      {label}
    </span>
  );
}

function CategoryBadge({ categorie, t }: { categorie: string; t: (k: string) => string }) {
  const col = CAT_COLORS[categorie] || { bg: "#F1F5F9", fg: "#334155", border: "#CBD5E1" };
  return (
    <Badge
      bg={col.bg}
      fg={col.fg}
      border={col.border}
      label={t(`conseilsPage.categories.${categorie}`)}
    />
  );
}

interface ArticleCardProps {
  article: any;
  lang: string;
  t: (k: string, opts?: any) => string;
  formatDate: (d: any, format?: "long" | "short") => string;
  onClick: () => void;
}

function ArticleCard({ article, lang, t, formatDate, onClick }: ArticleCardProps) {
  const titre = localized(article, "titre", "titreEn", lang);
  const description = stripHtml(localized(article, "description", "descriptionEn", lang), 150);
  const altText = article.imageAlt || titre;

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-2xl border overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col hover:-translate-y-1"
      style={{
        borderColor: C.border,
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 30px -12px rgba(6, 63, 36, 0.22)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
      }}
    >
      {/* Image 16:9 */}
      <div
        className="aspect-video overflow-hidden bg-gray-100"
      >
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={altText}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: C.greenSoft }}
          >
            <BookOpen className="h-8 w-8" style={{ color: C.green }} />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Badge catégorie */}
        <div className="mb-2.5">
          <CategoryBadge categorie={article.categorie} t={t} />
        </div>

        {/* Titre */}
        <h3
          className="font-bold text-[15.5px] leading-snug line-clamp-2 mb-2"
          style={{ color: C.textMain }}
        >
          {titre}
        </h3>

        {/* Description */}
        <p className="text-[13px] leading-relaxed mb-3 line-clamp-2" style={{ color: C.textMuted }}>
          {description}
        </p>

        {/* Meta bottom */}
        <div className="flex items-center justify-between mt-auto pt-2 text-[11.5px]" style={{ color: C.textMuted }}>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(article.datePublication, "short")}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.tempsLecture}
          </span>
        </div>
      </div>
    </article>
  );
}
