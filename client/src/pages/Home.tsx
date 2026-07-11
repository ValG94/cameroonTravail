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

/**
 * Partenaires réels : chaque entrée référence un fichier image dans
 * `client/public/images/partners/`. Les cards sont entourées d'un
 * contour lumineux animé (or → vert profond, charte CameroonTravail).
 * L'ordre commence par Fotchine International (partenaire prioritaire).
 */
interface PartnerSpec {
  name: string;
  /** Nom de fichier dans /images/partners/ (avec extension). */
  file: string;
}

const PARTNERS: PartnerSpec[] = [
  { name: "Fotchine International", file: "fotchine-international.png" },
  { name: "Cameron Services", file: "cameron-services.png" },
  { name: "Centrachat International", file: "centrachat-international.png" },
  { name: "Gypse", file: "gypse.png" },
  { name: "Hole Corrector", file: "hole-corrector.png" },
  { name: "Mathériauthèque", file: "materiautheque.png" },
  { name: "NomaVision", file: "nomavision.png" },
  { name: "Nomadecor", file: "nomadecor.jpeg" },
  { name: "Nomadeo Africa", file: "nomadeo-africa.png" },
  { name: "Nomadeo Paris", file: "nomadeo-paris.png" },
  { name: "Nomafloor", file: "nomafloor.jpeg" },
  { name: "Nomalight", file: "nomalight.jpeg" },
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
                    { icon: Upload, label: t("landing.hero.quickActions.uploadCv"), subtitle: "", path: user ? "/candidat/cv" : "/inscription?type=candidat" },
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
      {/* │ SPOTLIGHT — encart annonceur premium (image bg + 2 CTA)      │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <SpotlightSection setLocation={setLocation} />

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
      {/* │ PARTENAIRES — cards image avec contour lumineux animé (or)    │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-16" style={{ backgroundColor: COLORS.ivory }}>
        {/* Keyframes pour l'animation de contour lumineux. Deux points :
            un doré vif + un vert profond diamétralement opposés, qui tournent
            en boucle autour de la card. */}
        <style>{`
          @keyframes partnerHalo {
            to { transform: rotate(360deg); }
          }
          .partner-card {
            position: relative;
            border-radius: 16px;
            padding: 1.5px;
            background: transparent;
            overflow: hidden;
            isolation: isolate;
            aspect-ratio: 1 / 1;
          }
          .partner-card::before {
            content: '';
            position: absolute;
            inset: -50%;
            aspect-ratio: 1;
            background: conic-gradient(
              from 0deg,
              transparent 0deg,
              transparent 60deg,
              #F6C343 90deg,
              transparent 120deg,
              transparent 360deg
            );
            animation: partnerHalo 5s linear infinite;
            animation-delay: var(--halo-delay, 0s);
            z-index: 0;
            pointer-events: none;
          }
          .partner-card::after {
            content: '';
            position: absolute;
            inset: 1.5px;
            border-radius: calc(16px - 1.5px);
            background: #ffffff;
            z-index: 1;
          }
          .partner-card > * {
            position: relative;
            z-index: 2;
          }
          .partner-card:hover::before {
            animation-duration: 2.5s;
          }
          .partner-card:hover::after {
            background: #FEFCF6;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <h3
                className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight leading-snug"
                style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                {t("landing.partners.title")}
                {" "}
                {t("landing.partners.titleLine2")}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl mx-auto">
                {t("landing.partners.subtitle")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {PARTNERS.map((p, i) => (
                <PartnerCard key={p.name} {...p} delayIndex={i} />
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

/** Card partenaire avec contour lumineux animé (or → vert profond).
 *  Le halo est un pseudo-élément conic-gradient qui tourne autour de
 *  la card via CSS keyframes (voir <style> dans la section). Chaque
 *  card démarre à un angle de rotation différent (delay négatif)
 *  pour désynchroniser subtilement les 12 partenaires. */
function PartnerCard({ name, file, delayIndex = 0 }: PartnerSpec & { delayIndex?: number }) {
  // Décale la rotation initiale de chaque card pour un effet non-uniforme.
  const rotationOffset = -(delayIndex * 0.4);
  return (
    <div
      className="partner-card group"
      title={name}
      aria-label={name}
      style={{ ["--halo-delay" as any]: `${rotationOffset}s` }}
    >
      <div className="flex items-center justify-center w-full h-full p-3 sm:p-4 transition-transform duration-300 group-hover:scale-[1.03]">
        <img
          src={`/images/partners/${file}`}
          alt={name}
          loading="lazy"
          className="max-h-full max-w-full object-contain grayscale-[15%] group-hover:grayscale-0 transition-all duration-300"
          style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))" }}
        />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// SPOTLIGHT — encart annonceur premium en homepage
// ═════════════════════════════════════════════════════════════════════
// Une bannière pleine largeur avec :
//  - image de fond (photo de recruteurs + dégradé vert intégré)
//  - logo entreprise dans un contenant blanc à halo doré animé
//  - eyebrow doré "Entreprise à la une"
//  - titre blanc + baseline blanche
//  - CTA principal or (Voir les offres) + CTA secondaire outline optionnel
//
// Fallback si aucun spotlight actif : slot "Devenir partenaire"
// (auto-marketing pour le pack).

interface SpotlightSectionProps {
  setLocation: (href: string) => void;
}

const SPOTLIGHT_BG = "/images/recruteur/background-encarsPublicitaire.png";

function SpotlightSection({ setLocation }: SpotlightSectionProps) {
  const { t, i18n } = useTranslation();
  const { data: spotlight, isLoading } = trpc.spotlights.getActive.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return null;

  const isEn = i18n.language?.startsWith("en");

  return (
    <section className="py-14 md:py-16 bg-white">
      <style>{`
        @keyframes spotlightHalo { to { transform: rotate(360deg); } }
        .spotlight-logo {
          position: relative;
          border-radius: 18px;
          padding: 2px;
          overflow: hidden;
          isolation: isolate;
        }
        .spotlight-logo::before {
          content: '';
          position: absolute;
          inset: -50%;
          aspect-ratio: 1;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 60deg,
            #F6C343 90deg,
            transparent 120deg,
            transparent 360deg
          );
          animation: spotlightHalo 5s linear infinite;
          z-index: 0;
          pointer-events: none;
        }
        .spotlight-logo::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 16px;
          background: #FFFFFF;
          z-index: 1;
        }
        .spotlight-logo > * {
          position: relative;
          z-index: 2;
        }
        @media (prefers-reduced-motion: reduce) {
          .spotlight-logo::before { animation: none; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          {spotlight ? (
            /* ─── SPOTLIGHT ACTIF ────────────────────────────────── */
            <div
              className="relative rounded-3xl overflow-hidden shadow-xl"
              style={{
                backgroundImage: `url(${SPOTLIGHT_BG})`,
                backgroundSize: "cover",
                backgroundPosition: "center right",
                backgroundColor: COLORS.deepGreen,
                boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.5)",
              }}
            >
              {/* Overlay dégradé pour renforcer la lisibilité côté gauche */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, rgba(3, 31, 22, 0.85) 0%, rgba(6, 63, 36, 0.7) 35%, transparent 60%)`,
                }}
              />

              <div className="relative flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 p-6 md:p-8 lg:p-10 min-h-[280px] md:min-h-[260px]">
                {/* Logo entreprise avec halo doré */}
                <div className="shrink-0 spotlight-logo w-32 h-32 md:w-40 md:h-40 self-center">
                  <div className="w-full h-full flex items-center justify-center p-4">
                    {(spotlight.logoOverride || spotlight.logoUrl) ? (
                      <img
                        src={spotlight.logoOverride || spotlight.logoUrl || ""}
                        alt={spotlight.nomEntreprise}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-lg flex items-center justify-center font-extrabold text-4xl text-white"
                        style={{ backgroundColor: COLORS.deepGreen }}
                      >
                        {spotlight.nomEntreprise.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu texte + CTAs */}
                <div className="flex-1 min-w-0 flex flex-col justify-center text-center md:text-left max-w-2xl">
                  {/* Eyebrow doré */}
                  <div
                    className="text-[12px] font-bold uppercase tracking-[0.18em] mb-2"
                    style={{ color: COLORS.gold }}
                  >
                    {t("landing.spotlight.badge")}
                  </div>

                  {/* Titre */}
                  <h3
                    className="text-white font-extrabold tracking-tight leading-tight"
                    style={{
                      fontSize: "clamp(24px, 3.2vw, 36px)",
                      fontFamily: "'Manrope', 'Inter', sans-serif",
                      textShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    }}
                  >
                    {spotlight.nomEntreprise}
                  </h3>

                  {/* Baseline */}
                  <p
                    className="text-[14.5px] md:text-[15.5px] mt-3 leading-relaxed max-w-xl mx-auto md:mx-0"
                    style={{ color: "rgba(255, 255, 255, 0.88)" }}
                  >
                    {(isEn && spotlight.baselineEn) || spotlight.baseline}
                  </p>

                  {/* CTAs — le CTA principal "Voir les offres" n'est
                      affiché que si le recruteur a au moins 1 offre
                      publiée (évite d'envoyer sur une page vide).
                      Le CTA secondaire s'affiche dès qu'il est défini
                      en admin, indépendamment des offres. */}
                  {(() => {
                    const hasPublishedJobs = (spotlight.publishedJobsCount ?? 0) > 0;
                    const hasSecondary =
                      !!spotlight.ctaSecondaryHref &&
                      !!(spotlight.ctaSecondaryLabel || spotlight.ctaSecondaryLabelEn);
                    if (!hasPublishedJobs && !hasSecondary) return null;
                    // Style CTA principal doré. Si c'est le seul bouton visible,
                    // on le rend "primary". Sinon idem, le secondaire est outline.
                    return (
                      <div className="flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3 mt-5">
                        {hasPublishedJobs && (
                          <Button
                            onClick={() => {
                              const href = spotlight.ctaHref || `/entreprise/${spotlight.employeurId}`;
                              if (href.startsWith("http")) {
                                window.open(href, "_blank", "noopener,noreferrer");
                              } else {
                                setLocation(href);
                              }
                            }}
                            className="h-11 px-6 rounded-xl font-semibold shadow-md hover:opacity-90 gap-2 w-full sm:w-auto"
                            style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                          >
                            {(isEn && spotlight.ctaLabelEn) ||
                              spotlight.ctaLabel ||
                              t("landing.spotlight.defaultCta", { name: spotlight.nomEntreprise })}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        )}

                        {hasSecondary && (
                          <Button
                            onClick={() => {
                              const href = spotlight.ctaSecondaryHref!;
                              if (href.startsWith("http")) {
                                window.open(href, "_blank", "noopener,noreferrer");
                              } else {
                                setLocation(href);
                              }
                            }}
                            /* Si le secondaire est seul, on lui donne le look
                               "primary" (fond or) pour ne pas laisser une
                               bannière sans CTA visible. Sinon outline blanc. */
                            variant={hasPublishedJobs ? "outline" : undefined}
                            className={
                              hasPublishedJobs
                                ? "h-11 px-5 rounded-xl font-semibold gap-2 w-full sm:w-auto border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md"
                                : "h-11 px-6 rounded-xl font-semibold shadow-md hover:opacity-90 gap-2 w-full sm:w-auto"
                            }
                            style={
                              hasPublishedJobs
                                ? undefined
                                : { backgroundColor: COLORS.gold, color: COLORS.charcoal }
                            }
                          >
                            {(isEn && spotlight.ctaSecondaryLabelEn) || spotlight.ctaSecondaryLabel}
                            {!hasPublishedJobs && <ArrowRight className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            /* ─── FALLBACK : slot "Devenir partenaire" ──────────── */
            <div
              className="relative rounded-3xl overflow-hidden shadow-xl"
              style={{
                backgroundImage: `url(${SPOTLIGHT_BG})`,
                backgroundSize: "cover",
                backgroundPosition: "center right",
                backgroundColor: COLORS.deepGreen,
              }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, rgba(3, 31, 22, 0.9) 0%, rgba(6, 63, 36, 0.75) 40%, transparent 65%)`,
                }}
              />
              <div className="relative flex flex-col md:flex-row items-center md:items-stretch gap-6 md:gap-8 p-6 md:p-8 lg:p-10 min-h-[260px]">
                <div className="shrink-0 spotlight-logo w-28 h-28 md:w-36 md:h-36 self-center">
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <Sparkles className="h-12 w-12 md:h-14 md:w-14" style={{ color: COLORS.gold }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center text-center md:text-left max-w-2xl">
                  <div className="text-[12px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: COLORS.gold }}>
                    {t("landing.spotlight.emptyBadge")}
                  </div>
                  <h3
                    className="text-white font-extrabold tracking-tight leading-tight"
                    style={{ fontSize: "clamp(22px, 2.8vw, 32px)", fontFamily: "'Manrope', 'Inter', sans-serif" }}
                  >
                    {t("landing.spotlight.emptyTitle")}
                  </h3>
                  <p className="text-[14.5px] mt-3 leading-relaxed max-w-xl mx-auto md:mx-0" style={{ color: "rgba(255, 255, 255, 0.88)" }}>
                    {t("landing.spotlight.emptySubtitle")}
                  </p>
                  <div className="mt-5">
                    <Button
                      onClick={() => setLocation("/espace-recruteur")}
                      className="h-11 px-6 rounded-xl font-semibold shadow-md hover:opacity-90 gap-2"
                      style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                    >
                      {t("landing.spotlight.emptyCta")}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
