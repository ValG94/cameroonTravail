import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArticleImage } from "@/lib/articleImages";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Facebook,
  Share2,
  Twitter,
  User,
} from "lucide-react";
import { useLocation, useParams } from "wouter";

const C = {
  green: "#009B5A",
  deepGreen: "#063F24",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  goldSoft: "rgba(246, 195, 67, 0.15)",
  ivory: "#FAF7EF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
};

// Palette pilule catégorie
const CAT_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  Entretien: { bg: "#EAF3FB", fg: "#1D4ED8", border: "#93C5FD" },
  CV: { bg: "#EAF8F1", fg: "#063F24", border: "#A7D8B9" },
  Marche: { bg: "#F3EAFB", fg: "#5B21B6", border: "#D8B4F8" },
  Negociation: { bg: "#FDF2E3", fg: "#8B5A00", border: "#F6C343" },
  Reconversion: { bg: "#FDECEC", fg: "#B91C1C", border: "#F4A5A5" },
  Freelance: { bg: "#FEF7E0", fg: "#8B5A00", border: "#F6C343" },
};

// Rendu Markdown simple (titres, gras, listes, paragraphes). Préservé de
// l'ancienne implémentation pour ne pas casser les articles existants
// stockés en Markdown maison.
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold mt-8 mb-4" style={{ color: C.textMain }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-xl font-semibold mt-6 mb-3" style={{ color: C.textMain }}>
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <p key={i} className="font-semibold mt-4 mb-2" style={{ color: C.textMain }}>
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith("- ")) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="list-disc list-inside space-y-1.5 my-4 ml-4" style={{ color: C.textMain }}>
          {listItems.map((item, j) => {
            const parts = item.split(/\*\*(.*?)\*\*/g);
            return (
              <li key={j}>
                {parts.map((part, k) =>
                  k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                )}
              </li>
            );
          })}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      // skip empty
    } else {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={i} className="leading-relaxed mb-3 text-[15.5px]" style={{ color: C.textMain }}>
          {parts.map((part, k) =>
            k % 2 === 1 ? <strong key={k}>{part}</strong> : part
          )}
        </p>
      );
    }
    i++;
  }

  return elements;
}

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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function ConseilDetail() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const slug = params.slug;
  const lang = i18n.language;
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const { data: article, isLoading, error } = trpc.conseils.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: similaires } = trpc.conseils.getSimilaires.useQuery(
    {
      categorie: article?.categorie || "",
      excludeSlug: slug || "",
      limit: 3,
    },
    { enabled: !!article }
  );

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${article ? localized(article, "titre", "titreEn", lang) : ""} - Cameroon Travail\n${currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };
  const shareTwitter = () => {
    const text = encodeURIComponent(article ? localized(article, "titre", "titreEn", lang) : "");
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };
  const shareFacebook = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  const dateLocale = lang === "en" ? "en-GB" : "fr-FR";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader activePage="conseils" />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: C.green }} />
            <p style={{ color: C.textMuted }}>{t("conseilsPage.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader activePage="conseils" />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: C.greenSoft }}
          >
            <BookOpen className="h-6 w-6" style={{ color: C.green }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: C.textMain }}>
            {t("conseilsPage.detail.notFound")}
          </h2>
          <Button
            onClick={() => setLocation("/conseils")}
            className="rounded-xl text-white"
            style={{ backgroundColor: C.deepGreen }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("conseilsPage.detail.backHome")}
          </Button>
        </div>
      </div>
    );
  }

  const titre = localized(article, "titre", "titreEn", lang);
  const description = localized(article, "description", "descriptionEn", lang);
  const contenu = localized(article, "contenu", "contenuEn", lang);
  const heroImg = getArticleImage(article);
  const catCol = CAT_COLORS[article.categorie] || { bg: "#F1F5F9", fg: "#334155", border: "#CBD5E1" };

  const formattedDate = new Date(article.datePublication).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <SiteHeader activePage="conseils" />

      {/* ─── Breadcrumb + back ─────────────────────────────────── */}
      <div className="border-b" style={{ backgroundColor: C.bg, borderColor: C.border }}>
        <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-3">
          <button
            onClick={() => setLocation("/conseils")}
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: C.deepGreen }}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("conseilsPage.detail.back")}
          </button>
        </div>
      </div>

      {/* ─── Hero image ────────────────────────────────────────
          Aspect 16/9 (au lieu de 16/6) + max-h relevée à 540px
          pour montrer davantage de la photo et ne pas la cropper
          agressivement sur les images plus proches d'un format
          carré/portrait. object-center + object-cover garde le
          sujet centré. */}
      {heroImg && (
        <div className="w-full aspect-video max-h-[540px] overflow-hidden bg-gray-100">
          <img
            src={heroImg}
            alt={article.imageAlt || titre}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      {/* ─── Contenu principal ─────────────────────────────────── */}
      <motion.article {...animate(0)} className="max-w-[860px] mx-auto px-4 lg:px-6 py-10 lg:py-14">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span
            className="inline-flex items-center text-[11px] font-bold uppercase tracking-wide rounded-md px-2.5 py-1 border"
            style={{ backgroundColor: catCol.bg, color: catCol.fg, borderColor: catCol.border }}
          >
            {t(`conseilsPage.categories.${article.categorie}`)}
          </span>
          {article.featured && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide rounded-md px-2.5 py-1 border"
              style={{ backgroundColor: C.goldSoft, color: C.deepGreen, borderColor: C.gold }}
            >
              {t("conseilsPage.featured.badge")}
            </span>
          )}
        </div>

        {/* Titre */}
        <h1
          className="font-extrabold tracking-tight leading-tight mb-5"
          style={{ fontSize: "clamp(28px, 3.6vw, 44px)", color: C.textMain }}
        >
          {titre}
        </h1>

        {/* Meta */}
        <div
          className="flex flex-wrap items-center gap-5 text-sm mb-6 pb-6 border-b"
          style={{ color: C.textMuted, borderColor: C.border }}
        >
          <span className="flex items-center gap-1.5">
            <User className="h-4 w-4" style={{ color: C.green }} />
            {article.auteur}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" style={{ color: C.green }} />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" style={{ color: C.green }} />
            {t("conseilsPage.detail.readingTime", { time: article.tempsLecture })}
          </span>
        </div>

        {/* Description (accroche) */}
        <p
          className="text-[17px] italic leading-relaxed mb-10 pl-4 border-l-4"
          style={{ color: C.textMain, borderColor: C.gold }}
        >
          {description}
        </p>

        {/* Contenu Markdown rendu */}
        <div className="prose-article">{renderMarkdown(contenu)}</div>

        {/* Partage */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: C.border }}>
          <p className="flex items-center gap-2 font-semibold mb-3" style={{ color: C.textMain }}>
            <Share2 className="h-5 w-5" style={{ color: C.green }} />
            {t("conseilsPage.detail.share")}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#25D366" }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.172-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </button>
            <button
              onClick={shareTwitter}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#0F172A" }}
            >
              <Twitter className="h-4 w-4" />
              X
            </button>
            <button
              onClick={shareFacebook}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-colors"
              style={{ backgroundColor: "#1877F2" }}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </button>
          </div>
        </div>
      </motion.article>

      {/* ─── Articles similaires ──────────────────────────────── */}
      {similaires && similaires.length > 0 && (
        <section className="py-12 lg:py-16 border-t" style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <div className="max-w-[1200px] mx-auto px-4 lg:px-6">
            <h2 className="font-bold text-center mb-8" style={{ fontSize: "clamp(22px, 2.4vw, 30px)", color: C.textMain }}>
              {t("conseilsPage.detail.similar")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {similaires.map((sim) => {
                const simTitre = localized(sim, "titre", "titreEn", lang);
                const simImg = getArticleImage(sim);
                const simCat = CAT_COLORS[sim.categorie] || { bg: "#F1F5F9", fg: "#334155", border: "#CBD5E1" };
                const simSlug = lang === "en" && sim.slugEn ? sim.slugEn : sim.slug;
                return (
                  <article
                    key={sim.id}
                    className="bg-white rounded-2xl border overflow-hidden cursor-pointer flex flex-col group transition-all hover:-translate-y-1"
                    style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
                    onClick={() => setLocation(`/conseils/${simSlug}`)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 30px -12px rgba(6, 63, 36, 0.22)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
                    }}
                  >
                    {simImg && (
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={simImg}
                          alt={sim.imageAlt || simTitre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <span
                        className="inline-block text-[11px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 border w-fit mb-2"
                        style={{ backgroundColor: simCat.bg, color: simCat.fg, borderColor: simCat.border }}
                      >
                        {t(`conseilsPage.categories.${sim.categorie}`)}
                      </span>
                      <h3 className="font-bold text-[15.5px] leading-snug line-clamp-2 mb-2" style={{ color: C.textMain }}>
                        {simTitre}
                      </h3>
                      <div className="flex items-center gap-3 text-xs mt-auto pt-2" style={{ color: C.textMuted }}>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {sim.tempsLecture}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sim.datePublication).toLocaleDateString(dateLocale, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <button
                        className="mt-3 text-sm font-semibold hover:underline text-left flex items-center gap-1"
                        style={{ color: C.deepGreen }}
                      >
                        {t("conseilsPage.card.readMore")}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
