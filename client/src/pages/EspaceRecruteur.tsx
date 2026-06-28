import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, useInView, type Variants } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  HeadphonesIcon,
  MessageSquare,
  Phone,
  Search,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// ─── Assets ───────────────────────────────────────────────────────────────────
const IMG_HERO = "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/recruiter-hero-bg-UbPNn3iRDnvEjfQK2Dr3Do.webp";
const IMG_HANDSHAKE = "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/recruiter-handshake-ZiUCtkpYcmVsZBGwiehpyg.webp";
const IMG_TEAM = "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/recruiter-team-iEyrGz97yfDfjAUo4GYxdx.webp";
const IMG_INTERVIEW = "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/recruiter-interview-2Dnmn7yGihgQnmEfmVU2qd.webp";

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

function formatPrix(prix: string, devise: string, periode: string): { montant: string; suffix: string } {
  const montant = parseFloat(prix);
  if (montant === 0) return { montant: "0", suffix: "" };
  const formatted = new Intl.NumberFormat("fr-FR").format(montant);
  const suffix = periode === "mensuel" ? "/mois" : periode === "annuel" ? "/an" : "";
  return { montant: `${formatted} ${devise}`, suffix };
}

// ─── Variants Framer Motion partagés ──────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardLift = {
  whileHover: { y: -6, transition: { duration: 0.2 } },
};

// ─── Reveal au scroll (wrapper réutilisable) ──────────────────────────────────
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

// ─── Compteur animé (au scroll) ───────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
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
export default function EspaceRecruteur() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({ entreprise: "", email: "", telephone: "", taille: "" });
  const [submitting, setSubmitting] = useState(false);

  const { data: formules = [], isLoading: formulesLoading } = trpc.formules.getActives.useQuery({ cible: "employeur" });
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
    setTimeout(() => {
      setLocation(`/inscription?${params.toString()}`);
    }, 400);
  }

  // ─── Données bento avantages ───────────────────────────────────────────────
  const AVANTAGES = [
    {
      icon: Users,
      titre: "CVthèque Premium",
      desc: "Accédez à des milliers de profils qualifiés filtrés par compétence, région et expérience.",
      span: "lg:col-span-2 lg:row-span-2",
      bg: "from-emerald-50 to-emerald-100/40",
      iconBg: "bg-emerald-600",
      iconColor: "text-white",
      tone: "emerald",
      visualHint: "30 000+ profils actifs",
    },
    {
      icon: Search,
      titre: "Ciblage Précis",
      desc: "Filtres avancés par secteur, région, niveau d'expérience et formation.",
      span: "",
      bg: "from-blue-50 to-blue-100/40",
      iconBg: "bg-blue-600",
      iconColor: "text-white",
      tone: "blue",
    },
    {
      icon: BarChart3,
      titre: "Analytics Avancés",
      desc: "Tableaux de bord en temps réel pour suivre la performance de chaque offre.",
      span: "",
      bg: "from-purple-50 to-purple-100/40",
      iconBg: "bg-purple-600",
      iconColor: "text-white",
      tone: "purple",
    },
    {
      icon: HeadphonesIcon,
      titre: "Support Dédié",
      desc: "Conseiller expert en recrutement camerounais à chaque étape.",
      span: "",
      bg: "from-orange-50 to-orange-100/40",
      iconBg: "bg-orange-500",
      iconColor: "text-white",
      tone: "orange",
    },
    {
      icon: Zap,
      titre: "Publication Rapide",
      desc: "Publiez vos offres en moins de 5 minutes et recevez des candidatures dès le lendemain.",
      span: "lg:col-span-2",
      bg: "from-yellow-50 to-amber-100/40",
      iconBg: "bg-amber-500",
      iconColor: "text-white",
      tone: "amber",
      visualHint: "Première candidature en 24h en moyenne",
    },
    {
      icon: Shield,
      titre: "Profils Vérifiés",
      desc: "CV et références validés en amont. Vous ne perdez plus de temps avec des profils inadéquats.",
      span: "",
      bg: "from-teal-50 to-teal-100/40",
      iconBg: "bg-teal-600",
      iconColor: "text-white",
      tone: "teal",
    },
  ];

  const TEMOIGNAGES = [
    {
      nom: "Marie-Claire Ngo Biyong",
      poste: "DRH, Groupe Fokou",
      texte: "Grâce à Cameroon Travail, nous avons recruté 12 profils qualifiés en moins de 3 semaines. La CVthèque est exceptionnelle.",
      avatar: "MC",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      nom: "Jean-Baptiste Essomba",
      poste: "PDG, TechCam Solutions",
      texte: "La plateforme nous a permis de trouver des développeurs seniors au Cameroun. Fini les recrutements à l'étranger.",
      avatar: "JB",
      color: "from-blue-500 to-blue-700",
    },
    {
      nom: "Fatima Moussa",
      poste: "Responsable RH, Orange Cameroun",
      texte: "Le support dédié est remarquable. Notre conseiller nous a guidés pour optimiser nos annonces et tripler nos candidatures.",
      avatar: "FM",
      color: "from-purple-500 to-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-gray-900">
      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ NAVIGATION                                                    │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logocameroonTravail_ed569233.png"
              alt="Cameroon Travail"
              className="h-10 w-auto"
            />
            <span className="font-bold text-gray-900 text-lg tracking-tight hidden sm:block">Cameroon Travail</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Accueil</Link>
            <Link href="/emplois" className="hover:text-emerald-700 transition-colors">Emplois</Link>
            <Link href="/conseils" className="hover:text-emerald-700 transition-colors">Conseils</Link>
            <a href="#tarifs" className="hover:text-emerald-700 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => setLocation("/employeur/dashboard")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-sm"
              >
                Mon espace recruteur
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setLocation("/connexion")} className="hidden sm:flex border-gray-300">
                  Connexion
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation("/inscription?type=employeur")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Inscription
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ HERO                                                          │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="relative pt-16 min-h-[92vh] flex items-center overflow-hidden">
        {/* Background image + overlay multi-couches */}
        <div className="absolute inset-0">
          <img src={IMG_HERO} alt="Recrutement au Cameroun" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-900/85 to-emerald-800/60" />
          {/* Grain / noise pour texture */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          }} />
        </div>

        {/* Blobs lumineux décoratifs */}
        <motion.div
          aria-hidden="true"
          className="absolute top-10 right-0 w-[36rem] h-[36rem] bg-yellow-400/20 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            {/* ─── Texte gauche ─────────────────────────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-white space-y-7"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm shadow-lg shadow-emerald-900/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
                </span>
                Plateforme de recrutement #1 au Cameroun
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-[3.8rem] font-extrabold leading-[1.05] tracking-tight"
              >
                Recrutez les
                <span className="block mt-1">
                  <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                    meilleurs talents
                  </span>
                </span>
                <span className="block mt-1">au Cameroun</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-emerald-50/90 max-w-xl leading-relaxed">
                Accédez à des milliers de profils qualifiés, publiez vos offres et gérez vos recrutements depuis une seule plateforme conçue pour le marché camerounais.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3.5">
                <Button
                  size="lg"
                  onClick={() => setLocation("/inscription?type=employeur")}
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-base px-7 h-12 gap-2 shadow-xl shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all"
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md text-base px-6 h-12 gap-2 transition-all"
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Phone className="w-4 h-4" />
                  Être rappelé
                </Button>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-emerald-100/80 pt-2">
                {[
                  "Inscription en 2 minutes",
                  "Sans engagement",
                  "Support 24h/7j",
                ].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                    {label}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ─── Mini-form (carte glassmorphism) ──────────────────── */}
            <motion.div
              id="contact-form"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Lueur derrière la carte */}
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 via-emerald-400/20 to-yellow-400/30 rounded-3xl blur-2xl opacity-60" aria-hidden="true" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-7 sm:p-8 border border-white/40">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-md" />
                    <div className="relative p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">Inscription Recruteur</h2>
                    <p className="text-xs text-gray-500">Créez votre compte en quelques minutes</p>
                  </div>
                </div>
                <form onSubmit={handleInscription} className="space-y-3.5">
                  <Input
                    placeholder="Nom de l'entreprise *"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Email professionnel *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Téléphone (+237...)"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                  <select
                    value={formData.taille}
                    onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                    className="w-full h-11 px-3 rounded-md border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-colors"
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
                    className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-base shadow-md shadow-emerald-600/30 transition-all"
                  >
                    {submitting ? "Redirection..." : "Créer mon compte"}
                  </Button>
                </form>
                <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                  En créant un compte, vous acceptez nos{" "}
                  <a href="#" className="text-emerald-600 hover:underline font-medium">conditions d'utilisation</a>
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-6 h-6 rotate-90" />
        </motion.div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ STATISTIQUES                                                  │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 2500, suffix: "+", label: "Entreprises partenaires", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
              { value: 95, suffix: "%", label: "Taux de satisfaction", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
              { value: 15, suffix: "j", label: "Temps moyen de recrutement", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
              { value: 24, suffix: "h", label: "Support réactif", icon: HeadphonesIcon, color: "text-purple-600", bg: "bg-purple-50" },
            ].map(({ value, suffix, label, icon: Icon, color, bg }, i) => (
              <Reveal key={label} delay={i * 0.08}>
                <div className="text-center group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${bg} mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${color} tracking-tight mb-1`}>
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
      {/* │ AVANTAGES — BENTO GRID                                        │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4 px-3 py-1">Nos avantages</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Tout ce qu'il faut pour
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">recruter intelligemment</span>
            </h2>
            <p className="text-gray-500 text-lg">
              Des outils puissants conçus spécifiquement pour le marché de l'emploi camerounais.
            </p>
          </Reveal>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(180px,auto)] gap-5"
          >
            {AVANTAGES.map(({ icon: Icon, titre, desc, span, bg, iconBg, iconColor, visualHint }) => (
              <motion.div
                key={titre}
                variants={fadeUp}
                {...cardLift}
                className={`group relative rounded-3xl p-6 border border-gray-200/70 bg-gradient-to-br ${bg} overflow-hidden ${span}`}
              >
                {/* Lueur dégradé qui suit le hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/40 to-transparent transition-opacity duration-300 pointer-events-none" />

                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconBg} shadow-sm mb-4`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 leading-snug">{titre}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  {visualHint && (
                    <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-white/70 backdrop-blur px-2.5 py-1 rounded-full border border-gray-200/60">
                      <Sparkles className="w-3 h-3" />
                      {visualHint}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ COMMENT ÇA MARCHE — TIMELINE                                  │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal className="space-y-6">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">Comment ça marche</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Recrutez en 3 étapes
                <br />
                simples.
              </h2>

              <div className="space-y-5 pt-2">
                {[
                  { step: "01", titre: "Créez votre compte", desc: "Inscrivez-vous et configurez votre profil entreprise en moins de 5 minutes.", color: "from-emerald-500 to-emerald-700" },
                  { step: "02", titre: "Publiez vos offres", desc: "Rédigez et publiez vos annonces. Elles sont visibles par des milliers de candidats qualifiés.", color: "from-blue-500 to-blue-700" },
                  { step: "03", titre: "Sélectionnez les talents", desc: "Parcourez les candidatures, consultez les CV et contactez les profils qui vous intéressent.", color: "from-purple-500 to-purple-700" },
                ].map(({ step, titre, desc, color }, i) => (
                  <Reveal key={step} delay={i * 0.1}>
                    <div className="flex gap-4 group">
                      <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5 shadow-md group-hover:scale-105 transition-transform`}>
                        {step}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">{titre}</h4>
                        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Button
                onClick={() => setLocation("/inscription?type=employeur")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 mt-3 shadow-md shadow-emerald-600/30"
              >
                Commencer maintenant
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Reveal>

            <Reveal delay={0.2} className="relative">
              <div className="grid grid-cols-2 gap-4 relative">
                <motion.img
                  src={IMG_INTERVIEW}
                  alt="Entretien"
                  className="rounded-3xl shadow-xl w-full h-64 object-cover"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.img
                  src={IMG_TEAM}
                  alt="Équipe"
                  className="rounded-3xl shadow-xl w-full h-64 object-cover mt-8"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-5 -left-5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-2xl p-5 shadow-2xl"
              >
                <div className="text-2xl font-extrabold">+3 200</div>
                <div className="text-xs text-emerald-100">candidats actifs ce mois</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute -top-5 -right-5 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">+42%</div>
                    <div className="text-xs text-gray-500">de recrutements réussis</div>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ ARTICLES CONSEILS                                             │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      {articles.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-12">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-4 px-3 py-1">Ressources</Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Conseils Recrutement
              </h2>
              <p className="text-gray-500 text-lg">Nos experts partagent leurs meilleures pratiques</p>
            </Reveal>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((article) => (
                <motion.div key={article.id} variants={fadeUp} {...cardLift}>
                  <Link href={`/conseils/${article.slug}`}>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                      {article.imageUrl ? (
                        <div className="overflow-hidden h-48">
                          <img
                            src={article.imageUrl}
                            alt={article.titre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                          <Briefcase className="w-12 h-12 text-emerald-400" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Guide</Badge>
                          <span className="text-xs text-gray-400">
                            {article.tempsLecture ? `${article.tempsLecture} min` : ""}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                          {article.titre}
                        </h3>
                        {article.description && (
                          <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">{article.description}</p>
                        )}
                        <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Lire le guide
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <Reveal className="text-center mt-10" delay={0.3}>
              <Button
                variant="outline"
                onClick={() => setLocation("/conseils")}
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Voir tous les guides
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Reveal>
          </div>
        </section>
      )}

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ TARIFS                                                        │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section id="tarifs" className="py-24 bg-white relative overflow-hidden">
        {/* Décoration en arrière-plan */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent" />
        <div aria-hidden="true" className="absolute top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-emerald-50/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4 px-3 py-1">Tarification</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Tarifs Transparents
            </h2>
            <p className="text-gray-500 text-lg">
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
            <p className="text-center text-gray-400">Tarifs en cours de mise à jour</p>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={stagger}
              className={`grid gap-6 max-w-5xl mx-auto ${formules.length === 1 ? "max-w-sm" : formules.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
            >
              {formules.map((formule) => {
                const { montant, suffix } = formatPrix(formule.prix, formule.devise, formule.periode);
                const fonctionnalites = parseFonctionnalites(formule.fonctionnalites);
                const isPopulaire = formule.populaire;
                const isGratuit = parseFloat(formule.prix) === 0;

                return (
                  <motion.div
                    key={formule.id}
                    variants={fadeUp}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className={`relative rounded-3xl flex flex-col transition-shadow ${
                      isPopulaire
                        ? "border-2 border-emerald-500 shadow-2xl shadow-emerald-200/60 bg-white lg:scale-105 z-10"
                        : "border border-gray-200 shadow-sm bg-white hover:shadow-lg"
                    }`}
                  >
                    {/* Badge populaire */}
                    {isPopulaire && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-emerald-600/40 uppercase tracking-wider">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Populaire
                        </span>
                      </div>
                    )}

                    <div className={`p-7 sm:p-8 flex flex-col flex-1 ${isPopulaire ? "pt-10" : ""}`}>
                      {/* En-tête */}
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                          {formule.nom}
                        </p>
                        <div className="flex items-end gap-1">
                          {isGratuit ? (
                            <span className="text-4xl font-extrabold text-gray-900">0 {formule.devise}</span>
                          ) : (
                            <>
                              <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">{montant}</span>
                              <span className="text-gray-400 text-sm mb-2">{suffix}</span>
                            </>
                          )}
                        </div>
                        {formule.description && (
                          <p className="text-gray-500 text-sm mt-3 leading-relaxed">{formule.description}</p>
                        )}
                      </div>

                      {/* Fonctionnalités */}
                      {fonctionnalites.length > 0 && (
                        <ul className="space-y-3 flex-1 mb-7">
                          {fonctionnalites.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isPopulaire ? "text-emerald-600" : "text-gray-400"}`} />
                              <span className="leading-relaxed">{f}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* CTA */}
                      <Button
                        onClick={() => setLocation(`/inscription?type=employeur&plan=${formule.id}`)}
                        className={`w-full h-11 font-semibold transition-all ${
                          isPopulaire
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-600/30"
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                        }`}
                      >
                        Choisir ce plan
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          <Reveal className="text-center text-gray-400 text-sm mt-10" delay={0.2}>
            Besoin d'une offre sur mesure ?{" "}
            <a href="mailto:contact@cameroon-travail.cm" className="text-emerald-600 hover:underline font-medium">
              Contactez-nous
            </a>
          </Reveal>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ TÉMOIGNAGES                                                   │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4 px-3 py-1">Témoignages</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Ils nous font confiance
            </h2>
            <p className="text-gray-500 text-lg">
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
            {TEMOIGNAGES.map(({ nom, poste, texte, avatar, color }) => (
              <motion.div
                key={nom}
                variants={fadeUp}
                {...cardLift}
                className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-[15px]">"{texte}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{nom}</p>
                    <p className="text-gray-400 text-xs">{poste}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ CTA FINAL                                                     │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG_HANDSHAKE} alt="Partenariat" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-emerald-800/80" />
        </div>
        <motion.div
          aria-hidden="true"
          className="absolute -top-20 right-1/4 w-96 h-96 bg-yellow-400/15 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
              Prêt à transformer
              <br />
              votre <span className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">recrutement</span> ?
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-xl text-emerald-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Rejoignez plus de 2 500 entreprises qui nous font confiance pour trouver les meilleurs talents camerounais.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/inscription?type=employeur")}
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-base px-10 h-12 gap-2 shadow-xl shadow-yellow-400/40 hover:shadow-yellow-400/60 transition-all"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/5 text-white hover:bg-white/15 backdrop-blur-md text-base px-8 h-12 gap-2"
              onClick={() => window.open("tel:+237600000000")}
            >
              <Phone className="w-4 h-4" />
              Parler à un expert
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ╭──────────────────────────────────────────────────────────────╮ */}
      {/* │ FOOTER                                                        │ */}
      {/* ╰──────────────────────────────────────────────────────────────╯ */}
      <footer className="bg-gray-950 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-700/40">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">Cameroon Travail</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-400">
                La plateforme de référence pour l'emploi au Cameroun. Connectez-vous aux meilleures opportunités professionnelles.
              </p>
              <div className="flex gap-2.5 mt-5">
                {["f", "in", "tw"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-9 h-9 bg-gray-800/80 rounded-xl flex items-center justify-center text-xs hover:bg-emerald-600 hover:text-white transition-all"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Liens rapides</h4>
              <ul className="space-y-2.5 text-sm">
                {[["Accueil", "/"], ["Emplois", "/emplois"], ["Conseils", "/conseils"], ["Mon CV", "/candidat/cv"]].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-emerald-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Support</h4>
              <ul className="space-y-2.5 text-sm">
                {["Aide", "Contact", "Conditions d'utilisation", "Politique de confidentialité"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-emerald-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                  <span>123 Rue du Commerce<br />Douala, Cameroun</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>+237 6XX XX XX XX</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>contact@cameroon-travail.cm</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 Cameroon Travail. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-emerald-400 transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
