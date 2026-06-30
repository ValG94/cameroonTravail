import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getArticleImage } from "@/lib/articleImages";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  HeadphonesIcon,
  Phone,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// ─── Palette stricte du brief ─────────────────────────────────────────────────
const C = {
  deepGreen: "#063F24",
  green: "#009B5A",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  orange: "#FF8A00",
  blue: "#2563EB",
  violet: "#8B5CF6",
  red: "#D62828",
  textMain: "#0F172A",
  textMuted: "#64748B",
  bgPage: "#F8FAFC",
  bgCream: "#FAFAF7",
  border: "#E2E8F0",
};

// ─── Assets locaux ────────────────────────────────────────────────────────────
const IMG_HERO = "/images/recruteur/hero-bg.webp";
const IMG_CTA = "/images/recruteur/cta-team.webp";
const IMG_MEETING = "/images/recruteur/step-meeting.webp";
const IMG_INTERVIEW = "/images/recruteur/step-interview.webp";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseFonctionnalites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [raw];
  } catch {
    return raw.split("\n").filter(Boolean);
  }
}

function formatPrix(prix: string, devise: string, periode: string) {
  const montant = parseFloat(prix);
  if (montant === 0) return { montant: "0", suffix: "" };
  const formatted = new Intl.NumberFormat("fr-FR").format(montant);
  const suffix = periode === "mensuel" ? "/mois" : periode === "annuel" ? "/an" : "";
  return { montant: `${formatted} ${devise}`, suffix };
}

// ─── Variants Framer Motion ───────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduced ? "visible" : "hidden"}
      animate={inView || reduced ? "visible" : "hidden"}
      variants={{
        ...fadeUp,
        visible: { ...fadeUp.visible, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({
  target,
  suffix = "",
  duration = 1800,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setCount(target);
      return;
    }
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
  }, [target, duration, reduced]);

  return (
    <span ref={ref}>
      {count.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/** Drapeau du Cameroun en SVG inline (vert / rouge / jaune + étoile or).
 *  Aucune dépendance externe ni emoji (interdit par le brief). */
function CameroonFlag({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 12"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Drapeau du Cameroun"
    >
      <rect width="6" height="12" fill="#007a5e" />
      <rect x="6" width="6" height="12" fill="#ce1126" />
      <rect x="12" width="6" height="12" fill="#fcd116" />
      <path
        d="M 9 4.6 L 9.5 5.95 L 10.9 5.95 L 9.77 6.78 L 10.2 8.1 L 9 7.28 L 7.8 8.1 L 8.23 6.78 L 7.1 5.95 L 8.5 5.95 Z"
        fill="#fcd116"
      />
    </svg>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function EspaceRecruteur() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({ entreprise: "", email: "", telephone: "", taille: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: formules = [], isLoading: formulesLoading } = trpc.formules.getActives.useQuery({
    cible: "employeur",
  });
  const { data: articlesData } = trpc.conseils.getAll.useQuery({ limit: 3, offset: 0 });
  const articles = articlesData?.articles ?? [];

  function handleInscription(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.entreprise || !formData.email) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    setSubmitting(true);
    const params = new URLSearchParams({ type: "employeur" });
    if (formData.entreprise) params.set("entreprise", formData.entreprise);
    if (formData.email) params.set("email", formData.email);
    if (formData.telephone) params.set("telephone", formData.telephone);
    if (formData.taille) params.set("taille", formData.taille);
    setTimeout(() => setLocation(`/inscription?${params.toString()}`), 400);
  }

  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{ backgroundColor: C.bgPage, color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
    >
      <SiteHeader />

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 1. HERO RECRUTEUR                                              │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: C.deepGreen, minHeight: "680px" }}
      >
        {/* Background ABSTRAIT (pas de photo en bg) : pattern topographique
            SVG + halos lumineux. Plus aucun risque de masquage de visages.
            La photo des recruteurs est intégrée comme card distincte dans
            la colonne droite (cf. plus bas). */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="recruteur-topo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="36" stroke={C.gold} strokeWidth="0.5" fill="none" />
              <circle cx="40" cy="40" r="24" stroke={C.gold} strokeWidth="0.5" fill="none" />
              <circle cx="40" cy="40" r="12" stroke={C.gold} strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#recruteur-topo)" />
        </svg>

        {/* Halos lumineux animés (or + vert) */}
        <motion.div
          aria-hidden="true"
          className="absolute -top-32 right-0 w-[40rem] h-[40rem] rounded-full blur-[120px]"
          style={{ backgroundColor: C.gold, opacity: 0.12 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.10, 0.16, 0.10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 -left-20 w-96 h-96 rounded-full blur-[100px]"
          style={{ backgroundColor: C.green, opacity: 0.25 }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.20, 0.30, 0.20] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Grille 52%/44% — composition équilibrée comme demandé par le brief. */}
          <div className="grid lg:grid-cols-[52%_44%] gap-10 lg:gap-16 items-center">
            {/* ─── Colonne gauche : texte + CTAs ─────────────────── */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="text-white">
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-md border mb-6"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.20)",
                  color: C.gold,
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: C.gold }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: C.gold }}
                  />
                </span>
                Plateforme de recrutement #1 au Cameroun
              </motion.div>

              {/* H1 massif */}
              <motion.h1
                variants={fadeUp}
                className="font-extrabold leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(38px, 6vw, 64px)",
                  fontFamily: "'Manrope', 'Inter', sans-serif",
                }}
              >
                Recrutez les{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${C.gold} 0%, #FFE390 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  meilleurs talents
                </span>
                <br />
                au Cameroun
              </motion.h1>

              {/* Sous-titre */}
              <motion.p
                variants={fadeUp}
                className="text-base sm:text-lg text-white/85 mt-5 max-w-xl leading-relaxed"
              >
                Accédez à des profils qualifiés, publiez vos offres et gérez vos recrutements depuis une plateforme conçue pour le marché camerounais.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-7">
                <Button
                  size="lg"
                  onClick={() => setLocation("/inscription?type=employeur")}
                  className="h-12 px-7 text-base font-semibold gap-2 shadow-xl transition-all focus:ring-4 focus:ring-yellow-400/30"
                  style={{ backgroundColor: C.gold, color: C.textMain }}
                >
                  Commencer maintenant
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base font-semibold gap-2 border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md transition-all focus:ring-4 focus:ring-white/30"
                  onClick={() => document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Phone className="w-4 h-4" />
                  Parler à un expert
                </Button>
              </motion.div>

              {/* Ligne de preuves */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80 mt-7"
              >
                {["Inscription en 2 minutes", "Sans engagement", "Support 24h/7j"].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" style={{ color: C.gold }} />
                    {label}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ─── Colonne droite : photo card showcase + formulaire ── */}
            <div className="flex flex-col gap-4 lg:gap-5 w-full max-w-[460px] mx-auto lg:mx-0 lg:ml-auto">
              {/* Photo card SHOWCASE : recruteurs visibles, jamais masqués
                  par le formulaire (le form est en dessous). */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative rounded-3xl overflow-hidden shadow-2xl hidden lg:block"
                style={{ aspectRatio: "16 / 9" }}
              >
                <img
                  src={IMG_HERO}
                  alt="Recruteurs au travail au Cameroun"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center 35%" }}
                />
                {/* Léger dégradé bottom pour transition vers le form */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, transparent 0%, rgba(3,52,30,0.20) 100%)" }}
                />
              </motion.div>

              {/* Carte formulaire */}
              <motion.div
                id="hero-form"
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
              {/* Halo */}
              <div
                aria-hidden="true"
                className="absolute -inset-2 rounded-3xl blur-2xl opacity-40"
                style={{ background: `linear-gradient(135deg, ${C.gold} 0%, ${C.green} 100%)` }}
              />
              <div
                className="relative rounded-3xl border p-7 sm:p-8 shadow-2xl backdrop-blur-md"
                style={{
                  borderColor: "rgba(255,255,255,0.40)",
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  boxShadow: "0 30px 80px rgba(0, 0, 0, 0.28)",
                }}
              >
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                >
                  Créez votre compte recruteur
                </h2>
                <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                  Rejoignez plus de 2 500 entreprises qui recrutent déjà.
                </p>

                <form onSubmit={handleInscription} className="space-y-3.5">
                  <Input
                    placeholder="Nom de l'entreprise"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                    className="h-11"
                    style={{ borderColor: C.border }}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email professionnel"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11"
                    style={{ borderColor: C.border }}
                    required
                  />
                  {/* Téléphone avec drapeau SVG (pas d'emoji) */}
                  <div
                    className="flex h-11 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20"
                    style={{ borderColor: C.border }}
                  >
                    <div
                      className="flex items-center gap-2 px-3 border-r shrink-0"
                      style={{ backgroundColor: "#F8FAFC", borderColor: C.border }}
                      aria-label="Indicatif Cameroun"
                    >
                      <CameroonFlag className="w-5 h-3.5 rounded-sm shadow-sm" />
                      <span className="text-sm font-medium" style={{ color: C.textMain }}>
                        +237
                      </span>
                    </div>
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="flex-1 min-w-0 px-3 text-sm bg-white focus:outline-none"
                      style={{ color: C.textMain }}
                    />
                  </div>
                  <select
                    value={formData.taille}
                    onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border bg-white text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    style={{ borderColor: C.border, color: C.textMuted }}
                  >
                    <option value="">Taille de l'entreprise</option>
                    <option value="1-10">1 à 10 employés</option>
                    <option value="11-50">11 à 50 employés</option>
                    <option value="51-200">51 à 200 employés</option>
                    <option value="201-1000">201 à 1000 employés</option>
                    <option value="1000+">Plus de 1000 employés</option>
                  </select>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 font-semibold text-base text-white shadow-md transition-all focus:ring-4 focus:ring-green-500/30"
                    style={{ backgroundColor: C.green }}
                  >
                    {submitting ? "Redirection..." : "Créer mon compte"}
                  </Button>
                </form>
                <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: C.textMuted }}>
                  En créant un compte, vous acceptez nos{" "}
                  <a
                    href="#"
                    className="font-medium hover:underline"
                    style={{ color: C.green }}
                  >
                    conditions d'utilisation
                  </a>
                </p>
              </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 2. BANDEAU STATISTIQUES (léger chevauchement vers le haut)     │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="relative -mt-10 lg:-mt-16 z-10">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div
              className="rounded-3xl bg-white shadow-2xl border p-7 sm:p-9"
              style={{ borderColor: C.border }}
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-7">
                {[
                  {
                    value: 2500,
                    suffix: "+",
                    label: "Entreprises partenaires",
                    icon: Building2,
                    accent: C.green,
                    bg: "rgba(0, 155, 90, 0.10)",
                  },
                  {
                    value: 95,
                    suffix: "%",
                    label: "Taux de satisfaction",
                    icon: Star,
                    accent: C.orange,
                    bg: "rgba(255, 138, 0, 0.10)",
                  },
                  {
                    value: 15,
                    suffix: "j",
                    label: "Délai moyen de recrutement",
                    icon: Clock,
                    accent: C.blue,
                    bg: "rgba(37, 99, 235, 0.10)",
                  },
                  {
                    value: 24,
                    suffix: "h",
                    label: "Support réactif",
                    icon: HeadphonesIcon,
                    accent: C.violet,
                    bg: "rgba(139, 92, 246, 0.10)",
                  },
                ].map(({ value, suffix, label, icon: Icon, accent, bg }) => (
                  <div key={label} className="text-center">
                    <div
                      className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                    <div
                      className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight leading-none mb-1"
                      style={{ color: accent }}
                    >
                      <AnimatedCounter target={value} suffix={suffix} />
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: C.textMuted }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 3. SECTION AVANTAGES — bento 6 cards                           │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="py-20 lg:py-24" style={{ backgroundColor: C.bgPage }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <Badge
              className="mb-4 px-3 py-1 border"
              style={{ backgroundColor: C.greenSoft, color: C.green, borderColor: "rgba(0, 155, 90, 0.20)" }}
            >
              Nos avantages
            </Badge>
            <h2
              className="font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                color: C.textMain,
                fontFamily: "'Manrope', 'Inter', sans-serif",
                lineHeight: 1.1,
              }}
            >
              Tout ce qu'il faut pour{" "}
              <span style={{ color: C.green }}>recruter intelligemment</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: C.textMuted }}>
              Des outils puissants conçus spécifiquement pour le marché de l'emploi camerounais.
            </p>
          </Reveal>

          {/* Grille : 6 cards alignées sur une seule ligne en desktop.
              - mobile : 1 col
              - sm     : 2 cols  (3 rangées)
              - md     : 3 cols  (2 rangées)
              - lg+    : 6 cols  (1 rangée, comme la maquette) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[
              {
                icon: Users,
                title: "CVthèque Premium",
                desc: "Accédez à des milliers de profils qualifiés filtrés par compétence, région et expérience.",
                color: C.green,
                bg: "rgba(0, 155, 90, 0.10)",
                badge: "30 000+ profils actifs",
              },
              {
                icon: Search,
                title: "Ciblage Précis",
                desc: "Filtres avancés par secteur, région, niveau d'expérience et formation.",
                color: C.blue,
                bg: "rgba(37, 99, 235, 0.10)",
              },
              {
                icon: BarChart3,
                title: "Analytics Avancés",
                desc: "Tableau de bord en temps réel pour suivre la performance de chaque offre.",
                color: C.violet,
                bg: "rgba(139, 92, 246, 0.10)",
              },
              {
                icon: HeadphonesIcon,
                title: "Support Dédié",
                desc: "Conseiller expert en recrutement camerounais à chaque étape.",
                color: C.orange,
                bg: "rgba(255, 138, 0, 0.10)",
              },
              {
                icon: Zap,
                title: "Publication Rapide",
                desc: "Publiez vos offres en moins de 5 minutes et recevez des candidatures rapidement.",
                color: C.gold,
                bg: "rgba(246, 195, 67, 0.18)",
                badge: "1ère candidature en 24h",
              },
              {
                icon: ShieldCheck,
                title: "Profils Vérifiés",
                desc: "CV et références validés en amont pour des recrutements plus fiables et sécurisés.",
                color: C.green,
                bg: "rgba(0, 155, 90, 0.10)",
              },
            ].map(({ icon: Icon, title, desc, color, bg, badge }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className="group flex flex-col rounded-2xl bg-white border p-5 transition-all hover:shadow-lg text-center lg:text-left"
                style={{ borderColor: C.border }}
              >
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 transition-transform group-hover:scale-110 mx-auto lg:mx-0"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <h3
                  className="font-bold text-[15px] mb-1.5"
                  style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                >
                  {title}
                </h3>
                <p className="text-xs leading-relaxed flex-1" style={{ color: C.textMuted }}>
                  {desc}
                </p>
                {badge && (
                  <div
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border self-center lg:self-start"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: C.textMain,
                      borderColor: C.border,
                    }}
                  >
                    <Sparkles className="w-2.5 h-2.5" style={{ color }} />
                    {badge}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 4. RECRUTEZ EN 3 ÉTAPES                                        │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Gauche : étapes */}
            <Reveal>
              <Badge
                className="mb-4 px-3 py-1 border"
                style={{ backgroundColor: "rgba(37, 99, 235, 0.10)", color: C.blue, borderColor: "rgba(37, 99, 235, 0.20)" }}
              >
                Comment ça marche
              </Badge>
              <h2
                className="font-extrabold tracking-tight leading-[1.1]"
                style={{
                  fontSize: "clamp(30px, 4.5vw, 48px)",
                  color: C.textMain,
                  fontFamily: "'Manrope', 'Inter', sans-serif",
                }}
              >
                Recrutez en
                <br />
                <span style={{ color: C.green }}>3 étapes</span> simples.
              </h2>

              <div className="space-y-5 mt-8">
                {[
                  // Numéros aux couleurs du drapeau camerounais (vert/jaune/rouge)
                  {
                    n: "01",
                    title: "Créez votre compte",
                    desc: "Inscrivez-vous et configurez votre profil entreprise en moins de 5 minutes.",
                    color: C.green,
                  },
                  {
                    n: "02",
                    title: "Publiez vos offres",
                    desc: "Rédigez et publiez vos annonces visibles par des milliers de candidats qualifiés.",
                    color: C.gold,
                  },
                  {
                    n: "03",
                    title: "Sélectionnez les talents",
                    desc: "Parcourez les candidatures, consultez les CV et contactez les profils pertinents.",
                    color: C.red,
                  },
                ].map(({ n, title, desc, color }, i) => (
                  <Reveal key={n} delay={i * 0.1}>
                    <div className="flex gap-4 group">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-white shrink-0 mt-0.5 shadow-md group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                      >
                        {n}
                      </div>
                      <div>
                        <h4
                          className="font-bold text-lg mb-1"
                          style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                        >
                          {title}
                        </h4>
                        <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                          {desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Button
                onClick={() => setLocation("/inscription?type=employeur")}
                className="mt-8 h-11 px-6 font-semibold text-white gap-2 shadow-md transition-all focus:ring-4 focus:ring-green-500/30"
                style={{ backgroundColor: C.green }}
              >
                Commencer maintenant
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Reveal>

            {/* Droite : 2 images côte-à-côte. Wrapper extérieur SANS
                overflow-hidden pour permettre aux badges de dépasser
                légèrement les coins. L'image est dans un wrapper interne
                avec overflow-hidden pour préserver les coins arrondis. */}
            <Reveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 relative">
                {/* Image 1 (gauche) : entretien — badge VERT débordant
                    légèrement le coin bas-gauche */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[4/3]"
                >
                  <div className="absolute inset-0 rounded-[24px] overflow-hidden shadow-xl">
                    <img
                      src={IMG_INTERVIEW}
                      alt="Entretien d'embauche"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Badge "+3 200" — coin bas-gauche, dépasse légèrement
                      l'image (overflow autorisé par le wrapper sans
                      overflow-hidden). Opacité 0.70 + backdrop-blur. */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 rounded-2xl px-4 py-3 text-white shadow-2xl backdrop-blur-md z-10"
                    style={{ backgroundColor: "rgba(0, 155, 90, 0.70)" }}
                  >
                    <div
                      className="text-xl sm:text-2xl font-extrabold leading-tight"
                      style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
                    >
                      +3 200
                    </div>
                    <div className="text-[11px] sm:text-xs text-white/95">
                      candidats actifs ce mois
                    </div>
                  </motion.div>
                </motion.div>

                {/* Image 2 (droite) : réunion d'équipe — badge BLANC
                    débordant légèrement le coin haut-droit */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative aspect-[4/3]"
                >
                  <div className="absolute inset-0 rounded-[24px] overflow-hidden shadow-xl">
                    <img
                      src={IMG_MEETING}
                      alt="Équipe en réunion"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Badge "+42%" — coin haut-droit, dépasse légèrement
                      l'image. Opacité 0.70 + backdrop-blur md. */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.55 }}
                    className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 rounded-xl px-3 py-2 shadow-2xl flex items-center gap-2 max-w-[170px] backdrop-blur-md z-10"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.70)" }}
                  >
                    <div
                      className="p-1 rounded-md shrink-0"
                      style={{ backgroundColor: "rgba(0, 155, 90, 0.15)" }}
                    >
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: C.green }} />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-sm font-extrabold leading-tight"
                        style={{ color: C.green, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                      >
                        +42%
                      </div>
                      <div className="text-[9px] leading-tight" style={{ color: C.textMuted }}>
                        de recrutements réussis
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 5. CONSEILS RECRUTEMENT — 3 articles                           │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      {articles.length > 0 && (
        <section className="py-20 lg:py-24" style={{ backgroundColor: C.bgPage }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
              <div>
                <h2
                  className="font-extrabold tracking-tight"
                  style={{
                    fontSize: "clamp(30px, 4vw, 44px)",
                    color: C.textMain,
                    fontFamily: "'Manrope', 'Inter', sans-serif",
                  }}
                >
                  Conseils Recrutement
                </h2>
                <p className="mt-2" style={{ color: C.textMuted }}>
                  Nos experts partagent leurs meilleures pratiques.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation("/conseils")}
                className="self-start sm:self-end gap-2 hover:bg-emerald-50"
                style={{ borderColor: C.border, color: C.green }}
              >
                Voir tous les guides
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Reveal>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((article) => {
                const imgSrc = getArticleImage(article);
                return (
                  <motion.div key={article.id} variants={fadeUp} whileHover={{ y: -4 }}>
                    <Link href={`/conseils/${article.slug}`}>
                      <div
                        className="rounded-3xl overflow-hidden border bg-white hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group"
                        style={{ borderColor: C.border }}
                      >
                        {imgSrc && (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={imgSrc}
                              alt={article.titre}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <Badge
                              className="text-xs border"
                              style={{
                                backgroundColor: C.greenSoft,
                                color: C.green,
                                borderColor: "rgba(0,155,90,0.20)",
                              }}
                            >
                              Guide
                            </Badge>
                            {article.tempsLecture && (
                              <span className="text-xs" style={{ color: C.textMuted }}>
                                {article.tempsLecture} min
                              </span>
                            )}
                          </div>
                          <h3
                            className="font-bold text-base mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors"
                            style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                          >
                            {article.titre}
                          </h3>
                          {article.description && (
                            <p
                              className="text-sm line-clamp-3 mb-4 flex-1 leading-relaxed"
                              style={{ color: C.textMuted }}
                            >
                              {article.description}
                            </p>
                          )}
                          <span
                            className="inline-flex items-center gap-1.5 text-sm font-semibold mt-auto group-hover:gap-2 transition-all"
                            style={{ color: C.green }}
                          >
                            Lire le guide
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 6. TARIFS TRANSPARENTS                                         │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section id="tarifs" className="py-20 lg:py-24 bg-white relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full blur-3xl"
          style={{ backgroundColor: C.greenSoft, opacity: 0.6 }}
        />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <Badge
              className="mb-4 px-3 py-1 border"
              style={{ backgroundColor: C.greenSoft, color: C.green, borderColor: "rgba(0,155,90,0.20)" }}
            >
              Tarification
            </Badge>
            <h2
              className="font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                color: C.textMain,
                fontFamily: "'Manrope', 'Inter', sans-serif",
              }}
            >
              Tarifs transparents
            </h2>
            <p className="mt-3 text-base sm:text-lg" style={{ color: C.textMuted }}>
              Choisissez la formule qui correspond à vos besoins.
            </p>
          </Reveal>

          {formulesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[28rem] bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : formules.length === 0 ? (
            <p className="text-center" style={{ color: C.textMuted }}>
              Tarifs en cours de mise à jour
            </p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className={`grid gap-6 max-w-5xl mx-auto ${formules.length === 1
                  ? "max-w-sm"
                  : formules.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
            >
              {formules.map((formule) => {
                const { montant, suffix } = formatPrix(formule.prix, formule.devise, formule.periode);
                const fonctionnalites = parseFonctionnalites(formule.fonctionnalites);
                const isPopulaire = formule.populaire;

                return (
                  <motion.div
                    key={formule.id}
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={`relative rounded-3xl flex flex-col transition-shadow bg-white ${
                      isPopulaire
                        ? "border-2 shadow-2xl lg:scale-105 z-10"
                        : "border shadow-sm hover:shadow-lg"
                    }`}
                    style={{
                      borderColor: isPopulaire ? C.green : C.border,
                      boxShadow: isPopulaire ? `0 25px 50px -12px rgba(0, 155, 90, 0.25)` : undefined,
                    }}
                  >
                    {isPopulaire && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span
                          className="flex items-center gap-1.5 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider"
                          style={{ backgroundColor: C.green }}
                        >
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Populaire
                        </span>
                      </div>
                    )}

                    <div className={`p-7 sm:p-8 flex flex-col flex-1 ${isPopulaire ? "pt-10" : ""}`}>
                      <div className="mb-6">
                        <p
                          className="text-xs font-semibold uppercase tracking-widest mb-2"
                          style={{ color: C.textMuted }}
                        >
                          {formule.nom}
                        </p>
                        <div className="flex items-end gap-1">
                          <span
                            className="text-4xl lg:text-5xl font-extrabold tracking-tight"
                            style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                          >
                            {montant}
                          </span>
                          <span className="text-sm mb-2" style={{ color: C.textMuted }}>
                            {suffix}
                          </span>
                        </div>
                        {formule.description && (
                          <p className="text-sm mt-3 leading-relaxed" style={{ color: C.textMuted }}>
                            {formule.description}
                          </p>
                        )}
                      </div>

                      {fonctionnalites.length > 0 && (
                        <ul className="space-y-3 flex-1 mb-7">
                          {fonctionnalites.map((f, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-sm"
                              style={{ color: C.textMain }}
                            >
                              <CheckCircle2
                                className="w-4 h-4 mt-0.5 shrink-0"
                                style={{ color: isPopulaire ? C.green : C.textMuted }}
                              />
                              <span className="leading-relaxed">{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Button
                        onClick={() => setLocation(`/inscription?type=employeur&plan=${formule.id}`)}
                        className="w-full h-11 font-semibold transition-all focus:ring-4"
                        style={
                          isPopulaire
                            ? {
                                backgroundColor: C.green,
                                color: "white",
                                boxShadow: `0 10px 25px -8px rgba(0, 155, 90, 0.5)`,
                              }
                            : { backgroundColor: C.textMain, color: "white" }
                        }
                      >
                        Choisir ce plan
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          <Reveal className="text-center mt-10" delay={0.2}>
            <p className="text-sm" style={{ color: C.textMuted }}>
              Besoin d'une offre sur mesure ?{" "}
              <a
                href="mailto:contact@cameroon-travail.cm"
                className="font-medium hover:underline"
                style={{ color: C.green }}
              >
                Contactez-nous
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 7. TÉMOIGNAGES                                                 │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="py-20 lg:py-24" style={{ backgroundColor: C.bgPage }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Badge
              className="mb-4 px-3 py-1 border"
              style={{
                backgroundColor: "rgba(246, 195, 67, 0.18)",
                color: "#A37200",
                borderColor: "rgba(246, 195, 67, 0.30)",
              }}
            >
              Témoignages
            </Badge>
            <h2
              className="font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(30px, 4.5vw, 48px)",
                color: C.textMain,
                fontFamily: "'Manrope', 'Inter', sans-serif",
              }}
            >
              Ils nous font confiance
            </h2>
            <p className="mt-3 text-base sm:text-lg" style={{ color: C.textMuted }}>
              Plus de 2 500 entreprises camerounaises recrutent avec nous.
            </p>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                nom: "Marie-Claire Ngo Biyong",
                poste: "DRH, Groupe Félix",
                texte:
                  "Grâce à Cameroon Travail, nous avons recruté 12 profils qualifiés en moins de 3 semaines. La CVthèque est exceptionnelle.",
                avatar: "MC",
                gradient: "from-emerald-500 to-emerald-700",
              },
              {
                nom: "Jean-Baptiste Essomba",
                poste: "PDG, TechCam Solutions",
                texte:
                  "La plateforme nous a permis de trouver des développeurs seniors au Cameroun. Fini les recrutements à l'étranger.",
                avatar: "JB",
                gradient: "from-blue-500 to-blue-700",
              },
              {
                nom: "Fatima Moussa",
                poste: "Responsable RH, Grande entreprise télécom",
                texte:
                  "Le support dédié est remarquable. Notre conseiller nous a guidés pour optimiser nos annonces et tripler nos candidatures.",
                avatar: "FM",
                gradient: "from-purple-500 to-purple-700",
              },
            ].map(({ nom, poste, texte, avatar, gradient }) => (
              <motion.div
                key={nom}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl p-7 border hover:shadow-xl transition-shadow"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: C.gold }} />
                  ))}
                </div>
                <p
                  className="leading-relaxed mb-6 text-[15px]"
                  style={{ color: C.textMain }}
                >
                  "{texte}"
                </p>
                <div
                  className="flex items-center gap-3 pt-4 border-t"
                  style={{ borderColor: C.border }}
                >
                  <div
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                  >
                    {avatar}
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                    >
                      {nom}
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      {poste}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 8. CTA FINAL RECRUTEUR                                         │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: "360px" }}>
        <div className="absolute inset-0">
          <img
            src={IMG_CTA}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(3, 52, 30, 0.95) 0%, rgba(5, 76, 43, 0.85) 50%, rgba(5, 76, 43, 0.60) 100%)",
            }}
          />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-2xl">
            <Reveal>
              <h2
                className="font-extrabold tracking-tight leading-tight"
                style={{
                  fontSize: "clamp(28px, 4vw, 44px)",
                  fontFamily: "'Manrope', 'Inter', sans-serif",
                }}
              >
                Prêt à transformer votre{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${C.gold} 0%, #FFE390 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  recrutement
                </span>
                {" "}?
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-base sm:text-lg text-white/85 leading-relaxed">
                Rejoignez plus de 2 500 entreprises qui nous font confiance pour trouver les meilleurs talents camerounais.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="flex flex-wrap gap-3 mt-8">
                <Button
                  size="lg"
                  onClick={() => setLocation("/inscription?type=employeur")}
                  className="h-12 px-7 text-base font-semibold gap-2 shadow-xl transition-all focus:ring-4 focus:ring-yellow-400/30"
                  style={{ backgroundColor: C.gold, color: C.textMain }}
                >
                  Commencer maintenant
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-6 text-base font-semibold gap-2 border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md transition-all focus:ring-4 focus:ring-white/30"
                  onClick={() => window.location.assign("tel:+237600000000")}
                >
                  <Phone className="w-4 h-4" />
                  Parler à un expert
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
