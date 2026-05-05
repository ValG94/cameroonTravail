import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  Star,
  Users,
  Briefcase,
  BarChart3,
  HeadphonesIcon,
  Search,
  ArrowRight,
  Phone,
  ChevronRight,
  Building2,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

// ─── URLs des images CDN ──────────────────────────────────────────────────────
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
  if (montant === 0) return { montant: "Gratuit", suffix: "" };
  const formatted = new Intl.NumberFormat("fr-FR").format(montant);
  const suffix = periode === "mensuel" ? "/mois" : periode === "annuel" ? "/an" : "";
  return { montant: `${formatted} ${devise}`, suffix };
}

// ─── Compteur animé ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
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
    // Rediriger vers l'inscription employeur avec les données pré-remplies
    setTimeout(() => {
      setLocation("/inscription?type=employeur&email=" + encodeURIComponent(formData.email) + "&entreprise=" + encodeURIComponent(formData.entreprise));
    }, 500);
  }

  const FONCTIONNALITES = [
    {
      icon: Users,
      titre: "CVthèque Premium",
      desc: "Accédez à des milliers de profils qualifiés filtrés selon vos critères précis",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Search,
      titre: "Ciblage Précis",
      desc: "Trouvez les candidats parfaits grâce à nos filtres avancés par compétence, région et expérience",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: BarChart3,
      titre: "Analytics Avancés",
      desc: "Suivez les performances de vos offres en temps réel avec des tableaux de bord détaillés",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: HeadphonesIcon,
      titre: "Support Dédié",
      desc: "Un conseiller expert en recrutement camerounais pour vous accompagner à chaque étape",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: Zap,
      titre: "Publication Rapide",
      desc: "Publiez vos offres en moins de 5 minutes et recevez des candidatures dès le lendemain",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      icon: Shield,
      titre: "Profils Vérifiés",
      desc: "Tous les candidats ont des profils validés avec CV et références vérifiées",
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  const TEMOIGNAGES = [
    {
      nom: "Marie-Claire Ngo Biyong",
      poste: "DRH, Groupe Fokou",
      texte: "Grâce à Cameroon Travail, nous avons recruté 12 profils qualifiés en moins de 3 semaines. La CVthèque est exceptionnelle.",
      avatar: "MC",
      color: "bg-green-600",
    },
    {
      nom: "Jean-Baptiste Essomba",
      poste: "PDG, TechCam Solutions",
      texte: "La plateforme nous a permis de trouver des développeurs seniors au Cameroun. Fini les recrutements à l'étranger !",
      avatar: "JB",
      color: "bg-blue-600",
    },
    {
      nom: "Fatima Moussa",
      poste: "Responsable RH, Orange Cameroun",
      texte: "Le support dédié est remarquable. Notre conseiller nous a guidés pour optimiser nos annonces et tripler nos candidatures.",
      avatar: "FM",
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVIGATION ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Cameroon Travail" className="h-10 w-auto" onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }} />
            <span className="font-bold text-gray-900 text-lg hidden sm:block">Cameroon Travail</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-green-700 transition-colors">Accueil</Link>
            <Link href="/emplois" className="hover:text-green-700 transition-colors">Emplois</Link>
            <Link href="/conseils" className="hover:text-green-700 transition-colors">Conseils</Link>
            <a href="#tarifs" className="hover:text-green-700 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button
                onClick={() => setLocation("/employeur/dashboard")}
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                Mon espace recruteur
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setLocation("/connexion")} className="hidden sm:flex">
                  Connexion
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation("/inscription?type=employeur")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Inscription gratuite
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative pt-16 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image avec overlay */}
        <div className="absolute inset-0">
          <img
            src={IMG_HERO}
            alt="Recrutement au Cameroun"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-green-700/60" />
        </div>

        {/* Décoration géométrique */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-300/10 rounded-full blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Texte gauche */}
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Plateforme de recrutement #1 au Cameroun
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                Recrutez les
                <span className="text-yellow-400"> meilleurs talents</span>
                <br />au Cameroun
              </h1>
              <p className="text-lg text-green-100 max-w-lg leading-relaxed">
                Accédez à des milliers de profils qualifiés, publiez vos offres et gérez vos recrutements depuis une seule plateforme conçue pour le marché camerounais.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => setLocation("/inscription?type=employeur")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-base px-8 gap-2 shadow-lg"
                >
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm text-base px-6 gap-2"
                  onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Phone className="w-4 h-4" />
                  Être rappelé
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  Essai gratuit 30 jours
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  Sans engagement
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-400" />
                  Support 24h/7j
                </div>
              </div>
            </div>

            {/* Formulaire d'inscription rapide */}
            <div id="contact-form" className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Inscription Recruteur</h2>
                  <p className="text-xs text-gray-500">Gratuit pendant 30 jours</p>
                </div>
              </div>
              <form onSubmit={handleInscription} className="space-y-4">
                <Input
                  placeholder="Nom de l'entreprise *"
                  value={formData.entreprise}
                  onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                  className="h-11"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email professionnel *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11"
                  required
                />
                <Input
                  type="tel"
                  placeholder="Téléphone (+237...)"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="h-11"
                />
                <select
                  value={formData.taille}
                  onChange={(e) => setFormData({ ...formData, taille: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Taille de l'entreprise</option>
                  <option value="1-10">1 à 10 employés</option>
                  <option value="11-50">11 à 50 employés</option>
                  <option value="51-200">51 à 200 employés</option>
                  <option value="201+">Plus de 200 employés</option>
                </select>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold text-base"
                >
                  {submitting ? "Redirection..." : "Créer mon compte gratuit"}
                </Button>
              </form>
              <p className="text-xs text-gray-400 text-center mt-3">
                En créant un compte, vous acceptez nos{" "}
                <a href="#" className="text-green-600 hover:underline">conditions d'utilisation</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATISTIQUES ── */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 2500, suffix: "+", label: "Entreprises partenaires", icon: Building2, color: "text-green-600" },
              { value: 95, suffix: "%", label: "Taux de satisfaction", icon: Star, color: "text-yellow-500" },
              { value: 15, suffix: "j", label: "Temps moyen de recrutement", icon: Clock, color: "text-blue-600" },
              { value: 24, suffix: "h", label: "Support réactif", icon: HeadphonesIcon, color: "text-purple-600" },
            ].map(({ value, suffix, label, icon: Icon, color }) => (
              <div key={label} className="text-center group">
                <div className={`text-4xl sm:text-5xl font-extrabold ${color} mb-2`}>
                  <AnimatedCounter target={value} suffix={suffix} />
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <Icon className={`w-4 h-4 ${color}`} />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POURQUOI NOUS CHOISIR ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">Nos avantages</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Pourquoi choisir Cameroon Travail ?
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Des outils puissants conçus spécifiquement pour le marché de l'emploi camerounais
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FONCTIONNALITES.map(({ icon: Icon, titre, desc, color, bg }) => (
              <div
                key={titre}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION VISUELLE ── */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">Comment ça marche</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Recrutez en 3 étapes simples
              </h2>
              <div className="space-y-6">
                {[
                  { step: "01", titre: "Créez votre compte", desc: "Inscrivez-vous gratuitement et configurez votre profil entreprise en moins de 5 minutes.", color: "bg-green-600" },
                  { step: "02", titre: "Publiez vos offres", desc: "Rédigez et publiez vos annonces d'emploi. Elles sont visibles par des milliers de candidats qualifiés.", color: "bg-blue-600" },
                  { step: "03", titre: "Sélectionnez les talents", desc: "Parcourez les candidatures, consultez les CV et contactez directement les profils qui vous intéressent.", color: "bg-purple-600" },
                ].map(({ step, titre, desc, color }) => (
                  <div key={step} className="flex gap-4">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1`}>
                      {step}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{titre}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setLocation("/inscription?type=employeur")}
                className="bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                Commencer maintenant
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src={IMG_INTERVIEW} alt="Entretien" className="rounded-2xl shadow-lg w-full h-64 object-cover" />
                <img src={IMG_TEAM} alt="Équipe" className="rounded-2xl shadow-lg w-full h-64 object-cover mt-8" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-600 text-white rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-extrabold">+3 200</div>
                <div className="text-xs text-green-200">candidats actifs ce mois</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-bold text-gray-900">+42%</div>
                    <div className="text-xs text-gray-500">de recrutements réussis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTICLES CONSEILS ── */}
      {articles.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 mb-4">Ressources</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Conseils Recrutement
              </h2>
              <p className="text-gray-500 text-lg">
                Nos experts partagent leurs meilleures pratiques
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link key={article.id} href={`/conseils/${article.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.titre}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <Briefcase className="w-12 h-12 text-green-400" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                          Guide
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {article.tempsLecture ? `${article.tempsLecture} min` : ""}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
                        {article.titre}
                      </h3>
                      {article.description && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{article.description}</p>
                      )}
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Lire le guide
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button
                variant="outline"
                onClick={() => setLocation("/conseils")}
                className="gap-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                Voir tous les guides
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── TARIFS ── */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="bg-green-100 text-green-700 border-green-200 mb-4">Tarification</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Tarifs Transparents
            </h2>
            <p className="text-gray-500 text-lg">
              Choisissez la formule qui correspond à vos besoins
            </p>
          </div>

          {formulesLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : formules.length === 0 ? (
            <p className="text-center text-gray-400">Tarifs en cours de mise à jour</p>
          ) : (
            <div className={`grid gap-6 max-w-5xl mx-auto ${formules.length === 1 ? "max-w-sm" : formules.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
              {formules.map((formule) => {
                const { montant, suffix } = formatPrix(formule.prix, formule.devise, formule.periode);
                const fonctionnalites = parseFonctionnalites(formule.fonctionnalites);
                const isPopulaire = formule.populaire;
                const isGratuit = parseFloat(formule.prix) === 0;

                return (
                  <div
                    key={formule.id}
                    className={`relative rounded-2xl flex flex-col transition-all duration-200 ${
                      isPopulaire
                        ? "border-2 border-green-500 shadow-xl shadow-green-100 scale-105 bg-white"
                        : "border border-gray-200 shadow-sm bg-white hover:shadow-md"
                    }`}
                  >
                    {/* Badge populaire */}
                    {isPopulaire && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <span className="flex items-center gap-1.5 bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Populaire
                        </span>
                      </div>
                    )}

                    <div className={`p-7 flex flex-col flex-1 ${isPopulaire ? "pt-9" : ""}`}>
                      {/* En-tête */}
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                          {formule.nom}
                        </p>
                        <div className="flex items-end gap-1">
                          {isGratuit ? (
                            <span className="text-4xl font-extrabold text-gray-900">Gratuit</span>
                          ) : (
                            <>
                              <span className="text-4xl font-extrabold text-gray-900">{montant}</span>
                              <span className="text-gray-400 text-sm mb-1">{suffix}</span>
                            </>
                          )}
                        </div>
                        {formule.description && (
                          <p className="text-gray-500 text-sm mt-2">{formule.description}</p>
                        )}
                      </div>

                      {/* Fonctionnalités */}
                      {fonctionnalites.length > 0 && (
                        <ul className="space-y-3 flex-1 mb-6">
                          {fonctionnalites.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isPopulaire ? "text-green-500" : "text-gray-400"}`} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* CTA */}
                      <Button
                        onClick={() => setLocation(isGratuit ? "/inscription?type=employeur" : "/inscription?type=employeur&plan=" + formule.id)}
                        className={`w-full font-semibold ${
                          isPopulaire
                            ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                        }`}
                      >
                        {isGratuit ? "Commencer" : "Choisir ce plan"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-8">
            Besoin d'une offre sur mesure ?{" "}
            <a href="mailto:contact@cameroon-travail.cm" className="text-green-600 hover:underline font-medium">
              Contactez-nous
            </a>
          </p>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 mb-4">Témoignages</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-gray-500 text-lg">
              Plus de 2 500 entreprises camerounaises recrutent avec nous
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMOIGNAGES.map(({ nom, poste, texte, avatar, color }) => (
              <div key={nom} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{texte}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{nom}</p>
                    <p className="text-gray-400 text-xs">{poste}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG_HANDSHAKE} alt="Partenariat" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 to-green-700/90" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">
            Prêt à transformer votre recrutement ?
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Rejoignez plus de 2 500 entreprises qui nous font confiance pour trouver les meilleurs talents camerounais
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/inscription?type=employeur")}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-base px-10 gap-2 shadow-xl"
            >
              Essai gratuit 30 jours
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 text-base px-8 gap-2"
              onClick={() => window.open("tel:+237600000000")}
            >
              <Phone className="w-4 h-4" />
              Parler à un expert
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Logo & desc */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">Cameroon Travail</span>
              </div>
              <p className="text-sm leading-relaxed">
                La plateforme de référence pour l'emploi au Cameroun. Connectez-vous aux meilleures opportunités professionnelles.
              </p>
              <div className="flex gap-3 mt-4">
                {["f", "in", "tw"].map((s) => (
                  <a key={s} href="#" className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-xs hover:bg-green-600 hover:text-white transition-colors">
                    {s}
                  </a>
                ))}
              </div>
            </div>

            {/* Liens rapides */}
            <div>
              <h4 className="text-white font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-sm">
                {[["Accueil", "/"], ["Emplois", "/emplois"], ["Conseils", "/conseils"], ["Mon CV", "/candidat/cv"]].map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="hover:text-green-400 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                {["Aide", "Contact", "Conditions d'utilisation", "Politique de confidentialité"].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-green-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                  <span>123 Rue du Commerce<br />Douala, Cameroun</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500 shrink-0" />
                  <span>+237 6XX XX XX XX</span>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-500 shrink-0" />
                  <span>contact@cameroon-travail.cm</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2024 Cameroon Travail. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-green-400 transition-colors">Conditions d'utilisation</a>
              <a href="#" className="hover:text-green-400 transition-colors">Politique de confidentialité</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
