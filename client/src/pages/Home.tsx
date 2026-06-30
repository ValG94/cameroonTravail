import { useAuth } from "@/_core/hooks/useAuth";
import SiteFooter from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Bookmark,
  Compass,
  FileText,
  GraduationCap,
  Gauge,
  MapPin,
  Search,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

// ─── Palette identitaire ──────────────────────────────────────────────────────
const COLORS = {
  deepGreen: "#063F24",
  emerald: "#0F8A4C",
  gold: "#F6C343",
  goldDark: "#D4A11F",
  ivory: "#FAF7EF",
  charcoal: "#0B1220",
  cream: "#FDF6E8",
};

// ─── Données statiques ────────────────────────────────────────────────────────
// On utilise la liste centralisée (lib/secteurs) pour rester cohérent avec
// les formulaires recruteur, profil entreprise, etc. Ajout de "Tous les
// secteurs" en première position pour le sélecteur de recherche.
import { SECTEURS as ALL_SECTEURS } from "@/lib/secteurs";
const SECTEURS = ["Tous les secteurs", ...ALL_SECTEURS];

const RECHERCHES_POPULAIRES = ["Développeur", "Commercial", "Comptabilité", "Marketing", "Ressources humaines"];

const REGIONS = ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Maroua", "Bamenda", "Limbé", "Diaspora"];

// Partenaires : logos texte stylisés (PAS d'images officielles). Chaque
// logo est rendu en CSS pur avec une typographie/couleur qui évoque la
// marque. Si on obtient les vrais logos plus tard, on peut switcher pour
// des <img src="/images/partners/xxx.svg" />.
interface PartnerSpec {
  name: string;
  /** Texte affiché (peut différer du name). */
  label: string;
  /** Sous-texte optionnel (ex: 'OF AFRICA' pour BOA). */
  sub?: string;
  /** Couleur d'accent (text-color). */
  color: string;
  /** Style typographique. */
  weight: 700 | 800 | 900;
  /** Famille de police (par défaut Manrope). */
  font?: string;
  /** Italique ? */
  italic?: boolean;
  /** Tracking. */
  letterSpacing?: string;
  /** Taille du label (par défaut 1.25rem). */
  fontSize?: string;
}

const PARTNERS: PartnerSpec[] = [
  { name: "MTN", label: "MTN", color: "#FFCC00", weight: 900, fontSize: "1.5rem", letterSpacing: "-0.02em" },
  { name: "TotalEnergies", label: "TotalEnergies", color: "#ED0000", weight: 800, fontSize: "1.05rem", letterSpacing: "-0.03em" },
  { name: "Orange", label: "orange", color: "#FF7900", weight: 900, fontSize: "1.4rem", letterSpacing: "-0.04em" },
  { name: "Afriland", label: "Afriland", sub: "First Bank", color: "#C8102E", weight: 800, fontSize: "1rem" },
  { name: "SABC", label: "SABC", color: "#6B7280", weight: 800, fontSize: "1.35rem", letterSpacing: "0.05em" },
  { name: "BOA", label: "BOA", sub: "OF AFRICA", color: "#0B5E3C", weight: 900, fontSize: "1.35rem" },
  { name: "Eneo", label: "eneo", color: "#0F8A4C", weight: 800, fontSize: "1.5rem", italic: true, letterSpacing: "-0.03em" },
  { name: "Camair-Co", label: "Camair-Co", color: "#063F24", weight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" },
];

// Override d'images d'articles : centralisé dans lib/articleImages pour
// garantir la cohérence card ↔ page détail.
import { getArticleImage } from "@/lib/articleImages";

// ─── Variants Framer Motion ───────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ─── Reveal au scroll ─────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ ...fadeUp, visible: { ...fadeUp.visible, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Compteur animé ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString("fr-FR")}{suffix}</span>;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Home() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"candidat" | "recruteur">("candidat");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVille, setSearchVille] = useState("");
  const [searchSecteur, setSearchSecteur] = useState("Tous les secteurs");

  // Données dynamiques préservées
  const { data: latestJobs } = trpc.jobs.getLatest.useQuery({ limit: 4 });
  const { data: latestArticles } = trpc.conseils.getAll.useQuery({ limit: 3, offset: 0 });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchVille) params.set("ville", searchVille);
    if (searchSecteur && searchSecteur !== "Tous les secteurs") params.set("secteur", searchSecteur);
    setLocation(`/offres?${params.toString()}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: COLORS.emerald }} />
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">
      <SiteHeader activePage="accueil" />

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ HERO — fond carte Cameroun + tabs + recherche + quick actions │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="relative overflow-hidden">
        {/* Background image hero (carte Cameroun + skyline + or) */}
        <div className="absolute inset-0">
          <img
            src="/images/home/hero-bg.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay dégradé pour lisibilité du texte à gauche */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${COLORS.deepGreen}F2 0%, ${COLORS.deepGreen}D9 35%, ${COLORS.deepGreen}66 60%, transparent 100%)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-14 lg:pb-20">
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
            {/* ─── Colonne gauche : tout le contenu actif ────────── */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="text-white space-y-6">
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-md border"
                style={{
                  backgroundColor: "rgba(246, 195, 67, 0.12)",
                  borderColor: "rgba(246, 195, 67, 0.30)",
                  color: COLORS.gold,
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: COLORS.gold }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: COLORS.gold }} />
                </span>
                {t("landing.hero.badge")}
              </motion.div>

              {/* Titre */}
              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.2rem] font-extrabold leading-[1.08] tracking-tight"
                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                {t("landing.hero.titleStart")}
                <br />
                {t("landing.hero.titleAccent")}
              </motion.h1>

              {/* Sous-titre */}
              <motion.p variants={fadeUp} className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
                {t("landing.hero.subtitle")}
              </motion.p>

              {/* TABS Candidat / Recruteur */}
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-2 pt-1 max-w-2xl">
                <button
                  onClick={() => setMode("candidat")}
                  className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: mode === "candidat" ? COLORS.deepGreen : "rgba(255,255,255,0.08)",
                    border: `1.5px solid ${mode === "candidat" ? COLORS.gold : "rgba(255,255,255,0.15)"}`,
                    boxShadow: mode === "candidat" ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: mode === "candidat" ? COLORS.gold : "rgba(255,255,255,0.10)",
                      color: mode === "candidat" ? COLORS.charcoal : "white",
                    }}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm">{t("landing.hero.ctaJobSeeker")}</div>
                    {mode === "candidat" && (
                      <div className="text-xs text-white/70 truncate">Trouvez l'opportunité qui vous correspond</div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setMode("recruteur")}
                  className="flex-1 flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all"
                  style={{
                    backgroundColor: mode === "recruteur" ? COLORS.deepGreen : "rgba(255,255,255,0.08)",
                    border: `1.5px solid ${mode === "recruteur" ? COLORS.gold : "rgba(255,255,255,0.15)"}`,
                    boxShadow: mode === "recruteur" ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: mode === "recruteur" ? COLORS.gold : "rgba(255,255,255,0.10)",
                      color: mode === "recruteur" ? COLORS.charcoal : "white",
                    }}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-white text-sm">{t("landing.hero.ctaRecruiter")}</div>
                    {mode === "recruteur" && (
                      <div className="text-xs text-white/70 truncate">Publiez vos offres et trouvez des candidats</div>
                    )}
                  </div>
                </button>
              </motion.div>

              {/* CARD blanche : recherche + recherches populaires.
                  Grille responsive :
                  - mobile          : 1 col (stack)
                  - sm/md/lg        : 2x2 (Métier|Ville top, Secteur|Btn bottom)
                  - 2xl (1536px+)   : single row (4 éléments)
                  → évite les inputs trop étroits qui croppent le placeholder
                    sur les écrans laptop 1366px ou les preview Vercel. */}
              {mode === "candidat" ? (
                <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-[1.5fr_1fr_minmax(180px,1fr)_auto] gap-2.5">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder={t("landing.hero.searchPlaceholderJob")}
                        className="w-full h-11 pl-10 pr-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchVille}
                        onChange={(e) => setSearchVille(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder={t("landing.hero.searchPlaceholderCity")}
                        className="w-full h-11 pl-10 pr-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                    <select
                      value={searchSecteur}
                      onChange={(e) => setSearchSecteur(e.target.value)}
                      className="h-11 px-3 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 text-gray-700 min-w-0"
                    >
                      {SECTEURS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <Button
                      onClick={handleSearch}
                      className="h-11 px-6 font-semibold gap-2 shadow-md transition-all whitespace-nowrap"
                      style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                    >
                      <Search className="w-4 h-4" />
                      {t("landing.hero.searchButton")}
                    </Button>
                  </div>

                  {/* Recherches populaires */}
                  <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3.5 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500">{t("landing.hero.popularSearches")}</span>
                    {RECHERCHES_POPULAIRES.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          setTimeout(handleSearch, 50);
                        }}
                        className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-2xl p-5 max-w-2xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">Publiez votre offre d'emploi</h3>
                      <p className="text-sm text-gray-600">Atteignez des milliers de candidats qualifiés dès aujourd'hui.</p>
                    </div>
                    <Button
                      onClick={() => setLocation("/espace-recruteur")}
                      className="font-semibold gap-2 shrink-0"
                      style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                    >
                      Espace recruteur
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Quick actions : 4 boutons rapides */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-xl p-4 max-w-2xl">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    { icon: FileText, label: t("landing.hero.quickActions.createCv"), subtitle: t("landing.hero.quickActions.createCvSub"), path: user ? "/candidat/cv" : "/inscription?type=candidat" },
                    { icon: Upload, label: t("landing.hero.quickActions.uploadCv"), subtitle: "", path: user ? "/deposer-cv" : "/inscription?type=candidat" },
                    { icon: Bell, label: t("landing.hero.quickActions.jobAlerts"), subtitle: "", path: user ? "/candidat/alertes" : "/inscription?type=candidat", iconColor: COLORS.emerald },
                    { icon: GraduationCap, label: t("landing.hero.quickActions.careerAdvice"), subtitle: "", path: "/conseils" },
                  ].map(({ icon: Icon, label, subtitle, path, iconColor }, i) => (
                    <button
                      key={i}
                      onClick={() => setLocation(path)}
                      className="group flex flex-col items-start gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: iconColor ? `${iconColor}1A` : "rgba(15, 138, 76, 0.10)",
                          color: iconColor || COLORS.emerald,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-xs leading-tight">
                        <div className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {label}
                        </div>
                        {subtitle && <div className="text-gray-500">{subtitle}</div>}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* ─── Colonne droite : social proof flottant ────────── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:block relative h-full"
            >
              <div className="absolute top-32 right-0 bg-white rounded-2xl shadow-2xl p-5 max-w-[260px]">
                {/* Avatars stack */}
                <div className="flex -space-x-2 mb-3">
                  {[
                    "from-emerald-500 to-emerald-700",
                    "from-amber-400 to-amber-600",
                    "from-rose-400 to-rose-600",
                    "from-blue-400 to-blue-600",
                  ].map((c) => (
                    <div
                      key={c}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${c} border-2 border-white`}
                    />
                  ))}
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ backgroundColor: COLORS.deepGreen }}
                  >
                    +
                  </div>
                </div>
                <div className="text-lg font-extrabold text-gray-900 leading-tight">
                  {t("landing.hero.socialProof.count")}
                </div>
                <div className="text-sm text-gray-600 mb-3">{t("landing.hero.socialProof.subtitle")}</div>
                <button
                  onClick={() => setLocation("/inscription?type=candidat")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2 transition-all"
                  style={{ color: COLORS.emerald }}
                >
                  {t("landing.hero.socialProof.joinUs")}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ STATS — barre carte sous le hero                              │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-8 px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: 10000, suffix: "+", label: t("landing.stats.jobOffers"), icon: Briefcase, bg: "rgba(15, 138, 76, 0.10)", color: COLORS.emerald },
                { value: 2500, suffix: "+", label: t("landing.stats.partners"), icon: Building2, bg: "rgba(246, 195, 67, 0.18)", color: COLORS.goldDark },
                { value: 50000, suffix: "+", label: t("landing.stats.candidates"), icon: Users, bg: "rgba(15, 138, 76, 0.10)", color: COLORS.emerald },
                { value: 98, suffix: "%", label: t("landing.stats.satisfaction"), icon: Sparkles, bg: "rgba(246, 195, 67, 0.18)", color: COLORS.goldDark },
              ].map(({ value, suffix, label, icon: Icon, bg, color }, i) => (
                <Reveal key={label} delay={i * 0.06}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-2.5" style={{ backgroundColor: bg }}>
                      <Icon className="w-4.5 h-4.5" style={{ color }} />
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                      <AnimatedCounter target={value} suffix={suffix} />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">{label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ DEUX PARCOURS — vraies photos candidate / recruteur           │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
              {t("landing.parcours.sectionLabel")}
            </h2>
            <p className="text-gray-500 mt-3">
              {t("landing.parcours.title")} {t("landing.parcours.titleAccent")}
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* CANDIDAT — photo femme + texte */}
            <Reveal>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-3xl overflow-hidden shadow-sm border h-full"
                style={{ backgroundColor: "rgba(15, 138, 76, 0.04)", borderColor: "rgba(15, 138, 76, 0.18)" }}
              >
                <div className="grid grid-cols-[1.2fr_1fr] h-full min-h-[360px]">
                  <div className="p-7 lg:p-9 flex flex-col">
                    <h3 className="text-2xl font-extrabold mb-3" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                      {t("landing.parcours.candidate.title")}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {t("landing.parcours.candidate.desc")}
                    </p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {(t("landing.parcours.candidate.features", { returnObjects: true }) as string[]).map((it) => (
                        <li key={it} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: COLORS.emerald }} />
                          {it}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => setLocation("/offres")}
                      className="self-start font-semibold gap-2 shadow-md"
                      style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                    >
                      {t("landing.parcours.candidate.ctaSecondary")}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <img
                      src="/images/home/person-candidate.webp"
                      alt="Candidate"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </motion.div>
            </Reveal>

            {/* RECRUTEUR — photo homme + texte */}
            <Reveal delay={0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-3xl overflow-hidden shadow-sm border h-full"
                style={{ backgroundColor: COLORS.cream, borderColor: "rgba(246, 195, 67, 0.40)" }}
              >
                <div className="grid grid-cols-[1.2fr_1fr] h-full min-h-[360px]">
                  <div className="p-7 lg:p-9 flex flex-col">
                    <h3 className="text-2xl font-extrabold mb-3" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                      {t("landing.parcours.recruiter.title")}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-5">
                      {t("landing.parcours.recruiter.desc")}
                    </p>
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {(t("landing.parcours.recruiter.features", { returnObjects: true }) as string[]).map((it) => (
                        <li key={it} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: COLORS.goldDark }} />
                          {it}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => setLocation("/espace-recruteur")}
                      className="self-start font-semibold gap-2 shadow-md"
                      style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                    >
                      {t("landing.parcours.recruiter.ctaSecondary")}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <img
                      src="/images/home/person-recruteur.webp"
                      alt="Recruteur"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ DERNIÈRES OFFRES — 4 cards en ligne                           │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
              {t("landing.offers.title")} {t("landing.offers.titleLine2")}
            </h2>
            <button
              onClick={() => setLocation("/offres")}
              className="self-start sm:self-end text-sm font-semibold inline-flex items-center gap-1.5 hover:gap-2 transition-all"
              style={{ color: COLORS.emerald }}
            >
              {t("landing.offers.viewAll")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>

          {latestJobs && latestJobs.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {latestJobs.slice(0, 4).map((job) => (
                <motion.button
                  key={job.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  onClick={() => setLocation(`/offre/${job.id}`)}
                  className="group text-left rounded-2xl p-5 border bg-white hover:shadow-xl transition-all flex flex-col"
                  style={{ borderColor: "rgba(15, 23, 42, 0.10)" }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: COLORS.emerald }}>
                      {(job.titre || "?").split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                    </div>
                    <Bookmark className="w-4 h-4 text-gray-300 hover:text-amber-500 transition-colors" />
                  </div>

                  <h3 className="font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{job.titre}</h3>
                  {job.secteur && (
                    <p className="text-xs text-gray-500 mb-3">{job.secteur}</p>
                  )}

                  <span className="inline-block self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-3" style={{ backgroundColor: "rgba(15, 138, 76, 0.10)", color: COLORS.emerald }}>
                    CDI
                  </span>

                  {job.salaire && (
                    <p className="text-sm font-bold text-gray-900 mb-3">
                      {job.salaire} FCFA
                    </p>
                  )}

                  {/* Skills tags placeholder (à brancher quand le backend les expose) */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.secteur ? [job.secteur.split(" ")[0]] : ["Plein temps"]).slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Il y a 2 heures</span>
                    <MapPin className="w-3 h-3" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>{t("landing.offers.empty")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CV PROFESSIONNEL — fond vert + cv-stack à droite              │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-16 relative overflow-hidden text-white" style={{ backgroundColor: COLORS.deepGreen }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-10 items-center">
            <Reveal>
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded mb-4"
                style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
              >
                {t("landing.cvPremium.sectionLabel")}
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight mb-4 leading-tight" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                {t("landing.cvPremium.title")} {t("landing.cvPremium.titleAccent")}
              </h2>
              <p className="text-white/80 mb-6 max-w-lg leading-relaxed">
                {t("landing.cvPremium.desc")}
              </p>

              <div className="grid sm:grid-cols-3 gap-3 mb-7 max-w-xl">
                {[
                  { icon: GraduationCap, label: t("landing.cvPremium.features.templates") },
                  { icon: FileText, label: t("landing.cvPremium.features.pdf") },
                  { icon: Sparkles, label: t("landing.cvPremium.features.editable") },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-white/90">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: COLORS.gold }} />
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  onClick={() => (user ? setLocation("/candidat/cv") : setLocation("/inscription?type=candidat"))}
                  className="font-semibold gap-2 shadow-xl h-11 px-6"
                  style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                >
                  {t("landing.cvPremium.cta")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <span
                  className="text-xs font-semibold px-3 py-2 rounded-lg border"
                  style={{ borderColor: "rgba(246, 195, 67, 0.4)", color: COLORS.gold }}
                >
                  {t("landing.cvPremium.price")}
                </span>
              </div>
            </Reveal>

            {/* Image cv-stack */}
            <Reveal delay={0.15} className="relative">
              <motion.img
                src="/images/home/cv-stack.webp"
                alt="Modèles de CV professionnels"
                className="w-full h-auto rounded-2xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ POURQUOI CHOISIR — 4 piliers                                  │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
              {t("landing.whyUs.title")} {t("landing.whyUs.titleLine2")}
            </h2>
          </Reveal>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: MapPin, titre: t("landing.whyUs.pillar1Title"), desc: t("landing.whyUs.pillar1Desc") },
              { icon: BadgeCheck, titre: t("landing.whyUs.pillar2Title"), desc: t("landing.whyUs.pillar2Desc") },
              { icon: Gauge, titre: t("landing.whyUs.pillar3Title"), desc: t("landing.whyUs.pillar3Desc") },
              { icon: Compass, titre: t("landing.whyUs.pillar4Title"), desc: t("landing.whyUs.pillar4Desc") },
            ].map(({ icon: Icon, titre, desc }) => (
              <motion.div key={titre} variants={fadeUp} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ backgroundColor: "rgba(15, 138, 76, 0.10)" }}>
                  <Icon className="w-5 h-5" style={{ color: COLORS.emerald }} />
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                  {titre}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CONSEILS — 3 articles éditoriaux                              │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
              {t("landing.advice.title")}
            </h2>
            <button
              onClick={() => setLocation("/conseils")}
              className="self-start sm:self-end text-sm font-semibold inline-flex items-center gap-1.5 hover:gap-2 transition-all"
              style={{ color: COLORS.emerald }}
            >
              {t("landing.advice.viewAll")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>

          {latestArticles && latestArticles.articles.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-6"
            >
              {latestArticles.articles.slice(0, 3).map((article) => {
                const imgSrc = getArticleImage(article);
                return (
                <motion.button
                  key={article.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  onClick={() => setLocation(`/conseils/${article.slug}`)}
                  className="group text-left rounded-2xl overflow-hidden bg-white border hover:shadow-xl transition-shadow flex flex-col"
                  style={{ borderColor: "rgba(15, 23, 42, 0.10)" }}
                >
                  <div className="relative h-48 overflow-hidden">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={article.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: COLORS.ivory }}>
                        <BookOpen className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {article.categorie && (
                      <span
                        className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white shadow-md"
                        style={{ backgroundColor: COLORS.emerald }}
                      >
                        {article.categorie}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2 text-[11px] text-gray-400">
                      <span>{formatDate((article as { datePublication?: string | Date }).datePublication)}</span>
                      {article.tempsLecture && (
                        <>
                          <span>•</span>
                          <span>{article.tempsLecture} min</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 leading-snug line-clamp-2" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
                      {article.titre}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {article.description}
                      </p>
                    )}
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2 transition-all mt-auto"
                      style={{ color: COLORS.emerald }}
                    >
                      {t("landing.advice.readArticle")}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.button>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>{t("landing.advice.empty")}</p>
            </div>
          )}
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ PARTENAIRES — logos texte stylisés                            │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-14" style={{ backgroundColor: COLORS.ivory }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="grid lg:grid-cols-[1fr_2.2fr] gap-8 lg:gap-12 items-center">
            <div>
              <h3
                className="text-xl sm:text-2xl font-extrabold mb-2 tracking-tight leading-snug"
                style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                {t("landing.partners.title")}
                <br />
                {t("landing.partners.titleLine2")}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t("landing.partners.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-8 gap-y-5">
              {PARTNERS.map((p) => (
                <PartnerLogo key={p.name} {...p} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CTA FINAL — skyline hero-bg-alt en background complet         │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="relative py-20 overflow-hidden text-white">
        {/* Image background pleine largeur */}
        <div className="absolute inset-0">
          <img
            src="/images/home/hero-bg-alt.webp"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          {/* Overlay dégradé pour lisibilité du texte centré */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${COLORS.deepGreen}F2 0%, ${COLORS.deepGreen}D9 40%, ${COLORS.deepGreen}80 100%)`,
            }}
          />
        </div>
        <motion.div
          aria-hidden="true"
          className="absolute -top-32 right-1/4 w-[36rem] h-[36rem] rounded-full blur-[120px]"
          style={{ backgroundColor: COLORS.gold, opacity: 0.12 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 tracking-tight leading-tight" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
              {t("landing.finalCta.titleStart")} {t("landing.finalCta.titleAccent")} {t("landing.finalCta.titleEnd")}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("landing.finalCta.subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.2} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => (user ? setLocation("/candidat/dashboard") : setLocation("/inscription?type=candidat"))}
              className="text-base px-7 h-12 gap-2 shadow-xl font-semibold"
              style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
            >
              <Users className="w-4 h-4" />
              {t("landing.finalCta.ctaCandidate")}
            </Button>
            <Button
              size="lg"
              onClick={() => setLocation("/espace-recruteur")}
              variant="outline"
              className="text-base px-7 h-12 gap-2 border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md"
            >
              <Building2 className="w-4 h-4" />
              {t("landing.finalCta.ctaRecruiter")}
            </Button>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(input?: string | Date | null): string {
  if (!input) return "";
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/** Logo partenaire en texte stylisé. Pas d'image officielle utilisée :
 *  juste de la typographie + couleur de marque pour évoquer le branding.
 *  À remplacer par <img src="/images/partners/xxx.svg" /> si on obtient
 *  les vrais logos avec accord des partenaires. */
function PartnerLogo({ label, sub, color, weight, font, italic, letterSpacing, fontSize }: PartnerSpec) {
  return (
    <div className="flex flex-col items-center select-none" aria-label={label}>
      <span
        style={{
          color,
          fontWeight: weight,
          fontFamily: font || "'Manrope', 'Inter', sans-serif",
          fontStyle: italic ? "italic" : "normal",
          letterSpacing: letterSpacing || "normal",
          fontSize: fontSize || "1.25rem",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          className="mt-0.5"
          style={{
            color,
            fontSize: "0.55rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
