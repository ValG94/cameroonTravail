import { useState } from "react";
import { useLocation } from "wouter";
import SiteFooter from "@/components/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BookOpen, Calendar, Clock, Search, Star, User, X } from "lucide-react";

const CATEGORIES = ["Tous", "Entretien", "CV", "Marché", "Négociation", "Reconversion", "Freelance"] as const;
type Categorie = "Entretien" | "CV" | "Marché" | "Négociation" | "Reconversion" | "Freelance";

const CATEGORIE_COLORS: Record<string, string> = {
  Entretien: "bg-blue-100 text-blue-700",
  CV: "bg-green-100 text-green-700",
  "Marché": "bg-purple-100 text-purple-700",
  "Négociation": "bg-orange-100 text-orange-700",
  Reconversion: "bg-pink-100 text-pink-700",
  Freelance: "bg-yellow-100 text-yellow-700",
};

export default function Conseils() {
  const [, setLocation] = useLocation();
  const [activeCategorie, setActiveCategorie] = useState<string>("Tous");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const categorieFilter = activeCategorie !== "Tous" ? (activeCategorie as Categorie) : undefined;

  const { data, isLoading } = trpc.conseils.getAll.useQuery({
    categorie: categorieFilter,
    limit: 50,
    offset: 0,
  });

  const allArticles = data?.articles ?? [];

  // Filtrage local par mot-clé
  const articles = searchQuery.trim()
    ? allArticles.filter((a) =>
        a.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.auteur.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allArticles;

  const featuredArticle = !searchQuery.trim() ? (articles.find((a) => a.featured) ?? articles[0] ?? null) : null;
  const gridArticles = searchQuery.trim() ? articles : articles.filter((a) => !a.featured || activeCategorie !== "Tous");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-6">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logocameroonTravail_ed569233.png"
              alt="Cameroon Travail"
              className="h-12 cursor-pointer"
              onClick={() => setLocation("/")}
            />
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <button onClick={() => setLocation("/")} className="hover:text-green-700 transition-colors">Accueil</button>
              <button onClick={() => setLocation("/offres")} className="hover:text-green-700 transition-colors">Emplois</button>
              <button onClick={() => setLocation("/conseils")} className="text-green-700 font-semibold border-b-2 border-green-700 pb-0.5">Conseils</button>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-3">Conseils Emploi</h1>
          <p className="text-green-100 text-lg">Nos experts partagent leurs conseils pour booster votre carrière</p>
        </div>
      </section>
      {/* ─── Filtres par catégorie + recherche ────────────────────────────────────────────────────────────────────────── */}
      <div className="border-b bg-white sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Filtres catégorie */}
            <div className="flex flex-wrap gap-2 flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategorie(cat); setSearchQuery(""); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeCategorie === cat && !searchQuery
                      ? "bg-green-700 text-white border-green-700"
                      : "bg-white text-gray-600 border-gray-300 hover:border-green-600 hover:text-green-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Champ de recherche */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveCategorie("Tous"); }}
                className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          {/* Indicateur de recherche active */}
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              {articles.length} résultat{articles.length !== 1 ? "s" : ""} pour « <span className="font-medium text-green-700">{searchQuery}</span> »
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>Aucun article dans cette catégorie.</p>
          </div>
        ) : (
          <>
            {/* Article à la une (uniquement sur "Tous") */}
            {activeCategorie === "Tous" && featuredArticle && (
              <div
                className="mb-10 bg-white border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer flex flex-col md:flex-row"
                onClick={() => setLocation(`/conseils/${featuredArticle.slug}`)}
              >
                {featuredArticle.imageUrl && (
                  <div className="md:w-1/2 h-56 md:h-auto overflow-hidden">
                    <img
                      src={featuredArticle.imageUrl}
                      alt={featuredArticle.titre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className="bg-amber-100 text-amber-700 border-0">
                      <Star className="h-3 w-3 mr-1" />
                      Article à la une
                    </Badge>
                    <Badge className={`${CATEGORIE_COLORS[featuredArticle.categorie] ?? "bg-gray-100 text-gray-700"} border-0`}>
                      {featuredArticle.categorie}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{featuredArticle.titre}</h2>
                  <p className="text-gray-600 mb-5 line-clamp-3">{featuredArticle.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                    <span className="flex items-center gap-1"><User className="h-4 w-4" />{featuredArticle.auteur}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredArticle.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{featuredArticle.tempsLecture}</span>
                  </div>
                  <Button className="bg-green-700 hover:bg-green-800 text-white w-fit gap-2">
                    <BookOpen className="h-4 w-4" />
                    Lire l'article
                  </Button>
                </div>
              </div>
            )}

            {/* Grille d'articles */}
            <div className="grid md:grid-cols-3 gap-6">
              {(activeCategorie === "Tous" ? gridArticles : articles).map((article) => {
                const color = CATEGORIE_COLORS[article.categorie] ?? "bg-gray-100 text-gray-700";
                return (
                  <Card
                    key={article.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                    onClick={() => setLocation(`/conseils/${article.slug}`)}
                  >
                    {article.imageUrl && (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.titre}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-5 flex flex-col flex-1">
                      <Badge className={`${color} border-0 text-xs mb-2 w-fit`}>{article.categorie}</Badge>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 flex-1">{article.titre}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{article.auteur}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.tempsLecture}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <button className="text-green-700 text-sm font-medium hover:underline">
                          Lire la suite →
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ─── Newsletter ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 py-12 border-t">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restez informé de nos derniers conseils</h2>
          <p className="text-gray-500 mb-6">
            Recevez chaque semaine nos meilleurs articles directement dans votre boîte mail
          </p>
          {subscribed ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 font-medium">
              Merci ! Vous êtes bien inscrit à notre newsletter.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white px-6">
                S'abonner
              </Button>
            </form>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
