import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import SiteFooter from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Phone,
  Search,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

export default function Home() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVille, setSearchVille] = useState("");

  // Récupérer les dernières offres d'emploi
  const { data: latestJobs } = trpc.jobs.getLatest.useQuery({ limit: 6 }, {
    enabled: true,
  });

  // Récupérer les derniers articles de conseils depuis la BDD
  const { data: latestArticles } = trpc.conseils.getAll.useQuery({ limit: 2 }, {
    enabled: true,
  });

  // Mutation de déconnexion
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  // Carrousel automatique
  useEffect(() => {
    if (!latestJobs || latestJobs.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(latestJobs.length / 3));
    }, 5000);
    return () => clearInterval(interval);
  }, [latestJobs]);

  const nextSlide = () => {
    if (!latestJobs) return;
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(latestJobs.length / 3));
  };

  const prevSlide = () => {
    if (!latestJobs) return;
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(latestJobs.length / 3)) % Math.ceil(latestJobs.length / 3));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchVille) params.set("ville", searchVille);
    setLocation(`/offres?${params.toString()}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <SiteHeader activePage="accueil" />

      {/* ─── Hero Section ────────────────────────────────────────────────────── */}
      <section
        className="py-14 px-4 relative"
        style={{
          backgroundImage: `url('https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/Gemini_Generated_Image_699ei3699ei3699e_d98180fa.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#0d4a2a",
        }}
      >
        {/* Overlay sombre pour lisibilité */}
        <div className="absolute inset-0 bg-green-950/60" />
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Titre centré */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              Trouvez votre emploi au Cameroun
            </h1>
            <p className="text-green-100 text-lg">
              Plus de 10 000 offres d'emploi dans tous les secteurs
            </p>
          </div>

          {/* Deux cartes côte à côte */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Carte Candidat */}
            <div className="bg-white rounded-2xl p-7 shadow-lg">
              <div className="flex flex-col items-center mb-5">
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center mb-3">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Je cherche un emploi</h2>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Trouvez votre prochain emploi parmi des milliers d'offres
                </p>
              </div>

              {/* Champs de recherche */}
              <div className="space-y-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Métier, compétence, entreprise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ville, région..."
                    value={searchVille}
                    onChange={(e) => setSearchVille(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                  onClick={handleSearch}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-50"
                  onClick={() => setLocation("/inscription?type=candidat")}
                >
                  Créer mon compte candidat
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => user ? setLocation("/deposer-cv") : setLocation("/inscription?type=candidat")}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Déposer mon CV
                </Button>
              </div>
            </div>

            {/* Carte Employeur */}
            <div className="bg-white rounded-2xl p-7 shadow-lg">
              <div className="flex flex-col items-center mb-5">
                <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center mb-3">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Je recrute</h2>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Trouvez les meilleurs talents pour votre entreprise
                </p>
              </div>

              {/* Avantages */}
              <ul className="space-y-3 mb-6">
                {[
                  "Accès à notre CVthèque",
                  "Publication d'offres illimitée",
                  "Outils de gestion des candidatures",
                  "Support dédié",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  onClick={() => setLocation("/inscription?type=employeur")}
                >
                  Créer mon compte recruteur
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => setLocation("/espace-recruteur")}
                >
                  Découvrir l'espace pro
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-500 hover:bg-gray-50 text-sm"
                  onClick={() => setLocation("/connexion")}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Être rappelé par un conseiller
                </Button>
              </div>
            </div>
          </div>

          {/* Stats sous les cartes */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: Briefcase, value: "10 000+", label: "Offres d'emploi" },
              { icon: Building2, value: "2 500+", label: "Entreprises" },
              { icon: Users, value: "50 000+", label: "Candidats" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-white">{value}</div>
                <div className="text-green-100 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Dernières offres d'emploi ───────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dernières offres</h2>
            <p className="text-gray-500">Découvrez les dernières opportunités d'emploi</p>
          </div>

          {latestJobs && latestJobs.length > 0 ? (
            <>
              <div className="relative">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {Array.from({ length: Math.ceil(latestJobs.length / 3) }).map((_, slideIndex) => (
                      <div key={slideIndex} className="min-w-full">
                        <div className="grid md:grid-cols-3 gap-5">
                          {latestJobs.slice(slideIndex * 3, slideIndex * 3 + 3).map((job) => (
            <Card
                            key={job.id}
                            className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-white flex flex-col"
                            onClick={() => setLocation(`/offre/${job.id}`)}
                          >
                            <CardContent className="p-5 flex flex-col flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-1">
                                    {job.titre}
                                  </h3>
                                  <p className="text-green-600 text-sm font-medium truncate">{job.secteur}</p>
                                </div>
                                <span className={`ml-2 shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                                  job.typeOffre === "public"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}>
                                  {job.typeOffre === "public" ? "CDI" : "CDI"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{job.ville}</span>
                              </div>

                              {job.salaire && (
                                <p className="text-sm text-gray-600 mb-3 font-medium">
                                  {job.salaire} FCFA
                                </p>
                              )}

                              <div className="mt-auto pt-3">
                                <Button
                                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLocation(`/offre/${job.id}`);
                                  }}
                                >
                                  Voir les détails
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {latestJobs.length > 3 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 border"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 border"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>
                  </>
                )}
              </div>

              {/* Bouton voir toutes les offres */}
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50 px-8 gap-2"
                  onClick={() => setLocation("/offres")}
                >
                  Voir toutes les offres
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>Aucune offre disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Conseils emploi (dynamique depuis BDD) ─────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Conseils emploi</h2>
            <p className="text-gray-500">Nos experts vous accompagnent dans votre recherche d'emploi</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {latestArticles && latestArticles.articles.length > 0 ? (
              latestArticles.articles.slice(0, 2).map((article: NonNullable<typeof latestArticles>["articles"][0]) => (
                <Card
                  key={article.id}
                  className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  onClick={() => setLocation(`/conseils/${article.slug}`)}
                >
                  <div className="h-44 relative overflow-hidden">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-green-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">{article.categorie}</span>
                    <h3 className="font-semibold text-gray-900 text-base mb-2">{article.titre}</h3>
                    <p className="text-sm text-gray-500 mb-3 flex-1 line-clamp-2">{article.description}</p>
                    <button className="flex items-center gap-1.5 text-sm text-green-600 font-medium hover:underline mt-auto">
                      Lire la suite
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              ))
            ) : (
              [{
                img: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-entretien-6CeVb2GcWVUbmTRDXkFj6M.webp",
                titre: "Comment réussir son entretien d'embauche",
                desc: "Nos conseils pour faire bonne impression lors de votre entretien...",
                slug: "",
              }, {
                img: "https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/conseil-cv-jtHqb8L2PnGEUGbd3iACKb.webp",
                titre: "Rédiger un CV qui se démarque",
                desc: "Les clés pour créer un CV attractif et professionnel...",
                slug: "",
              }].map((c, i) => (
                <Card
                  key={i}
                  className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                  onClick={() => setLocation("/conseils")}
                >
                  <div className="h-44 relative overflow-hidden">
                    <img src={c.img} alt={c.titre} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 text-base mb-2">{c.titre}</h3>
                    <p className="text-sm text-gray-500 mb-3 flex-1">{c.desc}</p>
                    <button className="flex items-center gap-1.5 text-sm text-green-600 font-medium hover:underline mt-auto">
                      Lire la suite
                      <BookOpen className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8 gap-2"
              onClick={() => setLocation("/conseils")}
            >
              Tous nos conseils
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── CTA finale ──────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à décrocher votre prochain emploi ?</h2>
          <p className="text-blue-100 mb-8">
            Rejoignez des milliers de professionnels qui ont trouvé leur emploi grâce à Cameroon Travail
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-700 font-semibold"
              onClick={() => setLocation("/inscription")}
            >
              Créer mon compte
            </Button>
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold"
              onClick={() => user ? setLocation("/deposer-cv") : setLocation("/inscription?type=candidat")}
            >
              Déposer mon CV
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
