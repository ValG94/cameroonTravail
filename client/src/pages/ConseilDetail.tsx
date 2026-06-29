import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SiteFooter from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getArticleImage } from "@/lib/articleImages";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Facebook,
  Share2,
  Twitter,
  User,
} from "lucide-react";
import { useLocation, useParams } from "wouter";

// Couleurs par catégorie
const CATEGORIE_COLORS: Record<string, string> = {
  Entretien: "bg-blue-100 text-blue-700",
  CV: "bg-green-100 text-green-700",
  "Marché": "bg-purple-100 text-purple-700",
  "Négociation": "bg-orange-100 text-orange-700",
  Reconversion: "bg-pink-100 text-pink-700",
  Freelance: "bg-yellow-100 text-yellow-700",
};

// Rendu simple du Markdown (titres, gras, listes, paragraphes)
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      elements.push(
        <p key={i} className="font-semibold text-gray-800 mt-4 mb-2">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith("- ")) {
      // Collect consecutive list items
      const listItems: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        listItems.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`list-${i}`} className="list-disc list-inside space-y-1 my-3 text-gray-700 ml-4">
          {listItems.map((item, j) => {
            // Handle bold within list items
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
      // Skip empty lines
    } else {
      // Regular paragraph — handle inline bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      elements.push(
        <p key={i} className="text-gray-700 leading-relaxed mb-3">
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

export default function ConseilDetail() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const slug = params.slug;

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
    const text = encodeURIComponent(`${article?.titre} - Cameroon Travail\n${currentUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(article?.titre || "");
    const url = encodeURIComponent(currentUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareFacebook = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article introuvable</h2>
          <p className="text-gray-600 mb-6">Cet article n'existe pas ou a été supprimé.</p>
          <Button onClick={() => setLocation("/conseils")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux conseils
          </Button>
        </div>
      </div>
    );
  }

  const categorieColor = CATEGORIE_COLORS[article.categorie] || "bg-gray-100 text-gray-700";

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Header (composant partagé) ─────────────────────────────────────── */}
      <SiteHeader activePage="conseils" />

      {/* ─── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={() => setLocation("/")} className="hover:text-green-700">Accueil</button>
            <span>/</span>
            <button onClick={() => setLocation("/conseils")} className="hover:text-green-700">Conseils</button>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{article.titre}</span>
          </div>
        </div>
      </div>

      {/* ─── Hero image (avec override centralisé pour cohérence card↔détail) */}
      {(() => {
        const heroImg = getArticleImage(article);
        if (!heroImg) return null;
        return (
          <div className="w-full h-72 md:h-96 overflow-hidden">
            <img
              src={heroImg}
              alt={article.titre}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })()}

      {/* ─── Contenu principal ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          {/* Catégorie + meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className={`${categorieColor} border-0 font-medium`}>
              {article.categorie}
            </Badge>
            {article.featured && (
              <Badge className="bg-amber-100 text-amber-700 border-0 font-medium">
                Article à la une
              </Badge>
            )}
          </div>

          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            {article.titre}
          </h1>

          {/* Meta auteur / date / temps de lecture */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-6 pb-6 border-b">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {article.auteur}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {new Date(article.datePublication).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.tempsLecture} de lecture
            </span>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-600 italic mb-8 leading-relaxed">
            {article.description}
          </p>

          {/* Contenu Markdown */}
          <div className="prose-article">
            {renderMarkdown(article.contenu)}
          </div>

          {/* ─── Partage social ─────────────────────────────────────────────── */}
          <div className="mt-10 pt-8 border-t">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-2 text-gray-600 font-medium">
                <Share2 className="h-5 w-5" />
                Partager cet article :
              </span>
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
              <button
                onClick={shareTwitter}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black hover:bg-gray-800 text-white text-sm font-medium transition-colors"
              >
                <Twitter className="h-4 w-4" />
                X (Twitter)
              </button>
              <button
                onClick={shareFacebook}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </button>
            </div>
          </div>

          {/* ─── Bouton retour ──────────────────────────────────────────────── */}
          <div className="mt-8">
            <Button
              variant="outline"
              onClick={() => setLocation("/conseils")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux conseils
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Articles similaires ────────────────────────────────────────────── */}
      {similaires && similaires.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Articles similaires
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {similaires.map((sim) => {
                const color = CATEGORIE_COLORS[sim.categorie] || "bg-gray-100 text-gray-700";
                return (
                  <Card
                    key={sim.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                    onClick={() => setLocation(`/conseils/${sim.slug}`)}
                  >
                    {(() => {
                      const simImg = getArticleImage(sim);
                      if (!simImg) return null;
                      return (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={simImg}
                            alt={sim.titre}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      );
                    })()}
                    <CardContent className="p-4 flex flex-col flex-1">
                      <Badge className={`${color} border-0 text-xs mb-2 w-fit`}>
                        {sim.categorie}
                      </Badge>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 flex-1">
                        {sim.titre}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {sim.tempsLecture}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(sim.datePublication).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <button className="mt-3 text-green-700 text-sm font-medium hover:underline text-left">
                        Lire la suite →
                      </button>
                    </CardContent>
                  </Card>
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
