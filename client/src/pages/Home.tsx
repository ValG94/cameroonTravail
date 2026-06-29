import { useAuth } from "@/_core/hooks/useAuth";
import SiteFooter from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { motion, useInView, type Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  Compass,
  FileText,
  Gauge,
  GraduationCap,
  MapPin,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

// ─── Palette identitaire (cohérente avec la charte Cameroon Travail) ──────────
const COLORS = {
  deepGreen: "#063F24",
  emerald: "#0F8A4C",
  gold: "#F6C343",
  ivory: "#FAF7EF",
  charcoal: "#0B1220",
};

// ─── Variants Framer Motion partagés ──────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ─── Reveal au scroll (wrapper réutilisable) ──────────────────────────────────
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
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        ...fadeUp,
        visible: {
          ...fadeUp.visible,
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Compteur animé au scroll ─────────────────────────────────────────────────
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

  return (
    <span ref={ref}>
      {count.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVille, setSearchVille] = useState("");

  // Données dynamiques préservées (mêmes appels tRPC qu'avant la refonte)
  const { data: latestJobs } = trpc.jobs.getLatest.useQuery({ limit: 6 });
  const { data: latestArticles } = trpc.conseils.getAll.useQuery({ limit: 3, offset: 0 });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchVille) params.set("ville", searchVille);
    setLocation(`/offres?${params.toString()}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: COLORS.emerald }}
          />
          <p className="mt-4 text-gray-600">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">
      <SiteHeader activePage="accueil" />

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ HERO — vert profond + halo or + topographie SVG              │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: COLORS.deepGreen }}
      >
        {/* Topographie SVG décorative en fond */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="topographic"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="40" cy="40" r="36" stroke="#F6C343" strokeWidth="0.5" fill="none" />
              <circle cx="40" cy="40" r="24" stroke="#F6C343" strokeWidth="0.5" fill="none" />
              <circle cx="40" cy="40" r="12" stroke="#F6C343" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topographic)" />
        </svg>

        {/* Halos lumineux animés */}
        <motion.div
          aria-hidden="true"
          className="absolute -top-32 -right-20 w-[40rem] h-[40rem] rounded-full blur-[120px]"
          style={{ backgroundColor: COLORS.gold, opacity: 0.18 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 -left-20 w-96 h-96 rounded-full blur-[100px]"
          style={{ backgroundColor: COLORS.emerald, opacity: 0.3 }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 lg:pt-16 lg:pb-32">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            {/* ─── Colonne gauche : titre + recherche + CTAs ──────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-white"
            >
              {/* Badge institutionnel */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium mb-6 backdrop-blur-md border"
                style={{
                  backgroundColor: "rgba(246, 195, 67, 0.12)",
                  borderColor: "rgba(246, 195, 67, 0.30)",
                  color: COLORS.gold,
                }}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                Plateforme nationale de l'emploi au Cameroun
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                Le marché de l'emploi camerounais,
                <span
                  className="block mt-2"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, #FFE390 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  enfin connecté aux bons talents.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-white/85 mb-8 max-w-xl leading-relaxed"
              >
                Trouvez un emploi, créez un CV professionnel, postulez plus vite. Recruteurs : publiez vos offres et identifiez les meilleurs profils.
              </motion.p>

              {/* Moteur de recherche unifié */}
              <motion.div variants={fadeUp} className="relative mb-6">
                {/* Halo */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-2xl blur-xl opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.emerald} 100%)`,
                  }}
                />
                <div className="relative bg-white rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Métier, compétence, entreprise…"
                      className="w-full pl-10 pr-3 py-3 sm:py-3.5 text-sm border-0 focus:outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
                    />
                  </div>
                  <div className="hidden sm:block w-px bg-gray-200 mx-1" />
                  <div className="relative sm:max-w-[180px] sm:w-[180px]">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchVille}
                      onChange={(e) => setSearchVille(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Ville, région"
                      className="w-full pl-10 pr-3 py-3 sm:py-3.5 text-sm border-0 focus:outline-none text-gray-900 placeholder:text-gray-400 bg-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-auto sm:h-12 px-6 font-semibold text-white shadow-md transition-all"
                    style={{ backgroundColor: COLORS.emerald }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <span>Suggestions :</span>
                {["Comptable", "Développeur", "Marketing", "Logistique"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSearchQuery(s);
                      setTimeout(handleSearch, 50);
                    }}
                    className="px-3 py-1 rounded-full border border-white/15 hover:border-white/40 hover:bg-white/5 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </motion.div>

              {/* CTA double parcours */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-8">
                <Button
                  size="lg"
                  onClick={() =>
                    user ? setLocation("/candidat/dashboard") : setLocation("/inscription?type=candidat")
                  }
                  className="text-base px-6 h-12 gap-2 shadow-xl transition-all font-semibold text-white"
                  style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                >
                  <Users className="w-4 h-4" />
                  Je cherche un emploi
                </Button>
                <Button
                  size="lg"
                  onClick={() => setLocation("/espace-recruteur")}
                  variant="outline"
                  className="text-base px-6 h-12 gap-2 border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  Je recrute
                </Button>
              </motion.div>
            </motion.div>

            {/* ─── Colonne droite : carte centrale + mini-cards flottantes ──── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Carte centrale : matching */}
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-2 rounded-3xl blur-2xl opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, ${COLORS.emerald} 100%)`,
                  }}
                />
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-white/40">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: COLORS.emerald }}
                    >
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: COLORS.emerald }}>
                        Matching CV
                      </div>
                      <div className="text-sm font-bold text-gray-900">Ingénieur Data, Douala</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: "Compétences techniques", value: 92, color: COLORS.emerald },
                      { label: "Expérience requise", value: 85, color: COLORS.emerald },
                      { label: "Localisation", value: 100, color: COLORS.gold },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600">{m.label}</span>
                          <span className="font-bold text-gray-900">{m.value}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${m.value}%` }}
                            transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: m.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="font-semibold" style={{ color: COLORS.emerald }}>
                      Profil compatible à 92 %
                    </span>
                    <ArrowRight className="w-4 h-4" style={{ color: COLORS.emerald }} />
                  </div>
                </div>
              </div>

              {/* Mini-card flottante : nouvelle offre */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="absolute -top-8 -left-12 bg-white rounded-2xl shadow-xl p-3 pr-4 flex items-center gap-3 border border-gray-100 max-w-[260px]"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(246, 195, 67, 0.18)" }}
                >
                  <Briefcase className="w-4 h-4" style={{ color: "#A37200" }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">Chef de projet IT</div>
                  <div className="text-[11px] text-gray-500 truncate">MTN Cameroun · Yaoundé</div>
                </div>
              </motion.div>

              {/* Mini-card flottante : candidats actifs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-3.5 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex -space-x-1.5">
                    {[
                      "from-emerald-500 to-emerald-700",
                      "from-amber-400 to-amber-600",
                      "from-rose-500 to-rose-700",
                    ].map((c) => (
                      <div
                        key={c}
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${c} border-2 border-white`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-900">+3 200</span>
                </div>
                <div className="text-[11px] text-gray-500">candidats actifs ce mois</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ STATS                                                         │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 10000, suffix: "+", label: "Offres d'emploi", icon: Briefcase, bg: "rgba(15, 138, 76, 0.10)", color: COLORS.emerald },
              { value: 2500, suffix: "+", label: "Entreprises partenaires", icon: Building2, bg: "rgba(246, 195, 67, 0.18)", color: "#A37200" },
              { value: 50000, suffix: "+", label: "Candidats inscrits", icon: Users, bg: "rgba(15, 138, 76, 0.10)", color: COLORS.emerald },
              { value: 95, suffix: "%", label: "Satisfaction recruteurs", icon: Sparkles, bg: "rgba(246, 195, 67, 0.18)", color: "#A37200" },
            ].map(({ value, suffix, label, icon: Icon, bg, color }, i) => (
              <Reveal key={label} delay={i * 0.08}>
                <div className="text-center">
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-1"
                    style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                  >
                    <AnimatedCounter target={value} suffix={suffix} />
                  </div>
                  <div className="text-sm text-gray-500">{label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ DEUX PARCOURS, UNE PLATEFORME                                 │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-24" style={{ backgroundColor: COLORS.ivory }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: COLORS.emerald }}
            >
              Deux parcours, une plateforme
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
            >
              Que vous cherchiez un emploi ou les meilleurs talents,
              <br />
              vous êtes au bon endroit.
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Carte CANDIDAT */}
            <Reveal>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="group relative h-full rounded-3xl p-8 lg:p-10 overflow-hidden border bg-white"
                style={{ borderColor: "rgba(15, 23, 42, 0.10)" }}
              >
                {/* Bandeau d'accent vert */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: COLORS.emerald }}
                />
                {/* Halo de hover */}
                <div
                  aria-hidden="true"
                  className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ backgroundColor: COLORS.emerald }}
                />

                <div className="relative">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 text-white"
                    style={{ backgroundColor: COLORS.emerald }}
                  >
                    <Users className="w-7 h-7" />
                  </div>
                  <h3
                    className="text-2xl font-extrabold mb-2"
                    style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                  >
                    Candidats
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Construisez un profil solide, créez un CV professionnel et postulez aux opportunités qui vous correspondent vraiment.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Recherche d'offres avec filtres avancés",
                      "Profil candidat complet et structuré",
                      "CV professionnel téléchargeable en PDF",
                      "Alertes personnalisées par email",
                    ].map((it) => (
                      <li key={it} className="flex items-start gap-3 text-sm text-gray-700">
                        <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: COLORS.emerald }} />
                        {it}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setLocation("/inscription?type=candidat")}
                      className="font-semibold text-white shadow-md"
                      style={{ backgroundColor: COLORS.emerald }}
                    >
                      Créer mon compte
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                    <Button variant="outline" onClick={() => setLocation("/offres")}>
                      Voir les offres
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Reveal>

            {/* Carte RECRUTEUR */}
            <Reveal delay={0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className="group relative h-full rounded-3xl p-8 lg:p-10 overflow-hidden border bg-white"
                style={{ borderColor: "rgba(15, 23, 42, 0.10)" }}
              >
                <div
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: COLORS.gold }}
                />
                <div
                  aria-hidden="true"
                  className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-25 transition-opacity duration-500"
                  style={{ backgroundColor: COLORS.gold }}
                />

                <div className="relative">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                    style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                  >
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3
                    className="text-2xl font-extrabold mb-2"
                    style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                  >
                    Recruteurs
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Publiez vos offres, recevez des candidatures structurées et identifiez les profils les plus pertinents en quelques clics.
                  </p>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Publication d'offres en moins de 5 minutes",
                      "Accès à une CVthèque qualifiée",
                      "Outils de gestion des candidatures",
                      "Conseiller dédié pour vous accompagner",
                    ].map((it) => (
                      <li key={it} className="flex items-start gap-3 text-sm text-gray-700">
                        <BadgeCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#A37200" }} />
                        {it}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setLocation("/espace-recruteur")}
                      className="font-semibold shadow-md"
                      style={{ backgroundColor: COLORS.charcoal, color: "#fff" }}
                    >
                      Espace recruteur
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                    <Button variant="outline" onClick={() => setLocation("/inscription?type=employeur")}>
                      Publier une offre
                    </Button>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ DERNIÈRES OFFRES                                              │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div>
              <div
                className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: COLORS.emerald }}
              >
                Offres récentes
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
                style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                Les dernières opportunités
                <br />
                publiées sur la plateforme.
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/offres")}
              className="self-start sm:self-end gap-2 border-gray-300"
            >
              Voir toutes les offres
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Reveal>

          {latestJobs && latestJobs.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {latestJobs.slice(0, 6).map((job) => (
                <motion.button
                  key={job.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  onClick={() => setLocation(`/offre/${job.id}`)}
                  className="group text-left rounded-3xl p-6 border bg-white hover:shadow-xl transition-all flex flex-col"
                  style={{ borderColor: "rgba(15, 23, 42, 0.10)" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span
                      className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor:
                          job.typeOffre === "public"
                            ? "rgba(15, 138, 76, 0.12)"
                            : "rgba(214, 40, 40, 0.10)",
                        color: job.typeOffre === "public" ? COLORS.emerald : "#B91C1C",
                      }}
                    >
                      {job.typeOffre === "public" ? "Emploi public" : "Emploi privé"}
                    </span>
                    {(job as any).createdAt && (
                      <span className="text-[11px] text-gray-400">
                        {formatRelativeDate((job as any).createdAt)}
                      </span>
                    )}
                  </div>

                  <h3
                    className="font-extrabold text-lg leading-snug mb-1.5 line-clamp-2 group-hover:underline decoration-2"
                    style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                  >
                    {job.titre}
                  </h3>
                  {job.secteur && (
                    <p className="text-sm font-medium mb-3" style={{ color: COLORS.emerald }}>
                      {job.secteur}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600 mb-5">
                    {job.ville && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.ville}
                      </span>
                    )}
                    {job.salaire && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                        {job.salaire} FCFA
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-2 transition-all" style={{ color: COLORS.emerald }}>
                      Voir l'offre
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Aucune offre disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CV PROFESSIONNEL                                              │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section
        className="relative py-24 overflow-hidden text-white"
        style={{ backgroundColor: COLORS.deepGreen }}
      >
        {/* Topographie en fond */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="100%" height="100%" fill="url(#topographic)" />
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
            <Reveal>
              <div
                className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: COLORS.gold }}
              >
                CV Professionnel
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-[1.1]"
                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                Un CV professionnel peut faire
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.gold} 0%, #FFE390 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  toute la différence.
                </span>
              </h2>
              <p className="text-lg text-white/85 mb-8 leading-relaxed max-w-xl">
                Choisissez un modèle, complétez vos informations et téléchargez votre CV en PDF, prêt à envoyer. Adapté au marché camerounais.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-8 max-w-xl">
                {[
                  { icon: GraduationCap, label: "10 modèles premium" },
                  { icon: FileText, label: "Téléchargement PDF" },
                  { icon: Shield, label: "Données sécurisées" },
                  { icon: Zap, label: "Modifiable à volonté" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 text-sm text-white/90">
                    <Icon className="w-4 h-4" style={{ color: COLORS.gold }} />
                    {label}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  onClick={() =>
                    user ? setLocation("/candidat/cv") : setLocation("/inscription?type=candidat")
                  }
                  className="text-base px-7 h-12 gap-2 shadow-xl font-semibold"
                  style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
                >
                  Créer mon CV professionnel
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <div className="text-sm text-white/70">
                  À partir de <strong className="text-white">1 000 FCFA</strong> par modèle
                </div>
              </div>
            </Reveal>

            {/* Mockup de stack de CVs */}
            <Reveal delay={0.15}>
              <div className="relative h-[420px] hidden sm:block">
                {[
                  { offsetX: 0, offsetY: 0, rotate: -6, accent: COLORS.gold, opacity: 1, zIndex: 30, label: "Moderne" },
                  { offsetX: 50, offsetY: 30, rotate: 3, accent: "#E53935", opacity: 0.92, zIndex: 20, label: "Créatif" },
                  { offsetX: 100, offsetY: 60, rotate: 10, accent: COLORS.charcoal, opacity: 0.82, zIndex: 10, label: "Executive" },
                ].map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30, rotate: 0 }}
                    whileInView={{ opacity: card.opacity, y: 0, rotate: card.rotate }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute rounded-2xl bg-white shadow-2xl overflow-hidden"
                    style={{
                      top: `${card.offsetY}px`,
                      left: `${card.offsetX}px`,
                      width: "210px",
                      height: "297px",
                      zIndex: card.zIndex,
                    }}
                  >
                    {/* Mini-template */}
                    <div className="h-12 flex items-center px-3" style={{ backgroundColor: card.accent }}>
                      <div className="w-7 h-7 rounded-full bg-white/30" />
                      <div className="ml-2.5 space-y-1">
                        <div className="h-1.5 w-16 bg-white/70 rounded" />
                        <div className="h-1 w-10 bg-white/40 rounded" />
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-1 w-12 rounded" style={{ backgroundColor: card.accent }} />
                      <div className="h-1 w-full bg-gray-200 rounded" />
                      <div className="h-1 w-4/5 bg-gray-200 rounded" />
                      <div className="h-1 w-3/4 bg-gray-200 rounded" />
                      <div className="pt-2 h-1 w-10 rounded" style={{ backgroundColor: card.accent }} />
                      <div className="h-1 w-full bg-gray-200 rounded" />
                      <div className="h-1 w-2/3 bg-gray-200 rounded" />
                      <div className="pt-2 grid grid-cols-2 gap-1">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="h-1 bg-gray-200 rounded" />
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white" style={{ backgroundColor: card.accent }}>
                      {card.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ POURQUOI CAMEROON TRAVAIL — 4 piliers                         │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: COLORS.emerald }}
            >
              Pourquoi Cameroon Travail
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
            >
              La plateforme pensée pour
              <br />
              le marché de l'emploi camerounais.
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
              {
                icon: MapPin,
                titre: "Offres locales qualifiées",
                desc: "Annonces vérifiées, ancrées dans les réalités du marché camerounais et de la diaspora.",
              },
              {
                icon: BadgeCheck,
                titre: "Profil candidat complet",
                desc: "Mettez en avant vos compétences, expériences, formations et CV professionnel.",
              },
              {
                icon: Gauge,
                titre: "Matching intelligent",
                desc: "Nos algorithmes rapprochent vos critères des offres et profils les plus pertinents.",
              },
              {
                icon: Building2,
                titre: "Recrutement simplifié",
                desc: "Outils pensés pour les entreprises camerounaises : suivi, CVthèque, conseiller dédié.",
              },
            ].map(({ icon: Icon, titre, desc }) => (
              <motion.div
                key={titre}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="rounded-3xl p-6 border bg-white"
                style={{ borderColor: "rgba(15, 23, 42, 0.10)" }}
              >
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4 text-white"
                  style={{ backgroundColor: COLORS.emerald }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3
                  className="font-bold text-lg mb-2"
                  style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                >
                  {titre}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CONSEILS EMPLOI — éditorial premium                           │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-24" style={{ backgroundColor: COLORS.ivory }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
            <div>
              <div
                className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: COLORS.emerald }}
              >
                Magazine
              </div>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
                style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                Conseils carrière & recrutement
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/conseils")}
              className="self-start sm:self-end gap-2 border-gray-300"
            >
              Tous les articles
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Reveal>

          {latestArticles && latestArticles.articles.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className="grid lg:grid-cols-[1.4fr_1fr_1fr] gap-6"
            >
              {latestArticles.articles.slice(0, 3).map((article, i) => (
                <motion.button
                  key={article.id}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  onClick={() => setLocation(`/conseils/${article.slug}`)}
                  className={`group text-left rounded-3xl overflow-hidden bg-white border hover:shadow-xl transition-shadow flex flex-col ${
                    i === 0 ? "lg:row-span-2" : ""
                  }`}
                  style={{ borderColor: "rgba(15, 23, 42, 0.10)" }}
                >
                  <div className={`relative overflow-hidden ${i === 0 ? "h-64 lg:h-80" : "h-44"}`}>
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.titre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.ivory }}
                      >
                        <BookOpen className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 lg:p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      {article.categorie && (
                        <span
                          className="text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: COLORS.emerald }}
                        >
                          {article.categorie}
                        </span>
                      )}
                      {article.tempsLecture && (
                        <>
                          <span className="text-[11px] text-gray-300">•</span>
                          <span className="text-[11px] text-gray-400">
                            {article.tempsLecture} min de lecture
                          </span>
                        </>
                      )}
                    </div>
                    <h3
                      className={`font-extrabold mb-2 leading-snug ${
                        i === 0 ? "text-xl lg:text-2xl" : "text-base"
                      }`}
                      style={{
                        color: COLORS.deepGreen,
                        fontFamily: "'Manrope', 'Inter', sans-serif",
                      }}
                    >
                      {article.titre}
                    </h3>
                    {article.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1 leading-relaxed">
                        {article.description}
                      </p>
                    )}
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2 transition-all mt-auto"
                      style={{ color: COLORS.emerald }}
                    >
                      Lire l'article
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucun article pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CONFIANCE / TERRITOIRE                                        │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: COLORS.emerald }}
            >
              Pensé pour le Cameroun
            </div>
            <h3
              className="text-xl sm:text-2xl font-bold mb-7 max-w-2xl mx-auto"
              style={{ color: COLORS.deepGreen, fontFamily: "'Manrope', 'Inter', sans-serif" }}
            >
              Une plateforme au service de tous les talents et les entreprises du territoire.
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda", "Maroua", "Limbé", "Diaspora"].map(
                (ville) => (
                  <span
                    key={ville}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border bg-white"
                    style={{
                      borderColor: "rgba(15, 23, 42, 0.10)",
                      color: COLORS.deepGreen,
                    }}
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: COLORS.emerald }} />
                    {ville}
                  </span>
                )
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CTA FINAL — vert profond + accent or                          │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section
        className="relative py-24 overflow-hidden text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepGreen} 0%, #0A2818 100%)`,
        }}
      >
        <motion.div
          aria-hidden="true"
          className="absolute -top-32 right-1/4 w-[36rem] h-[36rem] rounded-full blur-[120px]"
          style={{ backgroundColor: COLORS.gold, opacity: 0.15 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-[100px]"
          style={{ backgroundColor: COLORS.emerald, opacity: 0.3 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: COLORS.gold }}
            >
              Votre prochaine étape
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-[1.1]"
              style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
            >
              Votre prochaine{" "}
              <span
                style={{
                  background: `linear-gradient(135deg, ${COLORS.gold} 0%, #FFE390 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                opportunité
              </span>{" "}
              commence ici.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez la plateforme qui connecte les meilleurs talents aux entreprises camerounaises et internationales.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() =>
                user ? setLocation("/candidat/dashboard") : setLocation("/inscription?type=candidat")
              }
              className="text-base px-7 h-12 gap-2 shadow-xl font-semibold"
              style={{ backgroundColor: COLORS.gold, color: COLORS.charcoal }}
            >
              <Users className="w-4 h-4" />
              Créer mon compte candidat
            </Button>
            <Button
              size="lg"
              onClick={() => setLocation("/espace-recruteur")}
              variant="outline"
              className="text-base px-7 h-12 gap-2 border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md"
            >
              <Building2 className="w-4 h-4" />
              Publier une offre
            </Button>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "hier";
  if (diffDays < 7) return `il y a ${diffDays} j`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `il y a ${Math.floor(diffDays / 30)} mois`;
  return `il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? "s" : ""}`;
}
