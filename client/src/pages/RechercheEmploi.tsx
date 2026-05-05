import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  Search,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { CandidatNav } from "@/components/CandidatNav";

interface SearchFilters {
  keywords: string;
  typeOffre?: "public" | "prive";
  secteur: string;
  region: string;
  ville: string;
  typeContrat: string;
  page: number;
}

export default function RechercheEmploi() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location] = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    keywords: "",
    secteur: "",
    region: "",
    ville: "",
    typeContrat: "",
    page: 1,
  });

  // Définir le type d'offre selon l'URL
  useEffect(() => {
    if (location === "/emploi-public") {
      setFilters(prev => ({ ...prev, typeOffre: "public" }));
    } else if (location === "/emploi-prive") {
      setFilters(prev => ({ ...prev, typeOffre: "prive" }));
    }
  }, [location]);

  const { data: searchResults, isLoading } = trpc.jobs.search.useQuery({
    keywords: filters.keywords || undefined,
    typeOffre: filters.typeOffre,
    secteur: filters.secteur || undefined,
    region: filters.region || undefined,
    ville: filters.ville || undefined,
    typeContrat: filters.typeContrat || undefined,
    page: filters.page,
    limit: 20,
  });

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
  };

  const handleResetFilters = () => {
    setFilters({
      keywords: "",
      secteur: "",
      region: "",
      ville: "",
      typeContrat: "",
      page: 1,
    });
  };

  const totalPages = searchResults ? Math.ceil(searchResults.total / 20) : 0;

  // Listes pour les filtres
  const regions = [
    "Adamaoua",
    "Centre",
    "Est",
    "Extrême-Nord",
    "Littoral",
    "Nord",
    "Nord-Ouest",
    "Ouest",
    "Sud",
    "Sud-Ouest",
  ];

  const secteurs = [
    "Administration",
    "Agriculture",
    "Banque/Finance",
    "Commerce",
    "Construction/BTP",
    "Éducation",
    "Énergie",
    "Industrie",
    "Informatique/IT",
    "Santé",
    "Télécommunications",
    "Tourisme/Hôtellerie",
    "Transport/Logistique",
  ];

  const typesContrat = [
    "CDI",
    "CDD",
    "Stage",
    "Alternance",
    "Freelance",
    "Temps partiel",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.profileType === "candidat" && <CandidatNav />}
      
      {!user?.profileType && (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logo_4636448b.png" alt="Cameroon Travail" className="h-10" />
            </Link>
            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/connexion">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/inscription-candidat">S'inscrire</Link>
              </Button>
            </div>
          </div>
        </nav>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {location === "/emploi-public" ? "Emploi Public" : location === "/emploi-prive" ? "Emploi Privé" : "Recherche d'emploi"}
          </h1>
          <p className="text-gray-600">
            {searchResults?.total || 0} offre(s) disponible(s)
          </p>
        </div>

        {/* Barre de recherche principale */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Rechercher par mots-clés (poste, compétences...)"
                    value={filters.keywords}
                    onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-5 w-5" />
                Rechercher
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-5 w-5" />
                Filtres
              </Button>
            </div>

            {/* Filtres avancés */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Type d'offre</Label>
                    <Select
                      value={filters.typeOffre || ""}
                      onValueChange={(value) =>
                        setFilters({
                          ...filters,
                          typeOffre: value ? (value as "public" | "prive") : undefined,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="public">Emploi Public</SelectItem>
                        <SelectItem value="prive">Emploi Privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Secteur</Label>
                    <Select
                      value={filters.secteur}
                      onValueChange={(value) =>
                        setFilters({ ...filters, secteur: value === "all" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les secteurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les secteurs</SelectItem>
                        {secteurs.map((secteur) => (
                          <SelectItem key={secteur} value={secteur}>
                            {secteur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Région</Label>
                    <Select
                      value={filters.region}
                      onValueChange={(value) =>
                        setFilters({ ...filters, region: value === "all" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les régions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les régions</SelectItem>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      placeholder="Ex: Yaoundé, Douala..."
                      value={filters.ville}
                      onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type de contrat</Label>
                    <Select
                      value={filters.typeContrat}
                      onValueChange={(value) =>
                        setFilters({ ...filters, typeContrat: value === "all" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les contrats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les contrats</SelectItem>
                        {typesContrat.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4 mt-4">
                  <Button onClick={handleSearch}>Appliquer les filtres</Button>
                  <Button variant="outline" onClick={handleResetFilters}>
                    Réinitialiser
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résultats */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Recherche en cours...</p>
          </div>
        ) : searchResults && searchResults.jobs.length > 0 ? (
          <>
            <div className="space-y-4">
              {searchResults.jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {job.typeOffre === "public" ? (
                            <Building2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Briefcase className="h-5 w-5 text-blue-600" />
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              job.typeOffre === "public"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {job.typeOffre === "public" ? "Emploi Public" : "Emploi Privé"}
                          </span>
                          {job.secteur && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {job.secteur}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-2">{job.titre}</CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.ville}, {job.region}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.typeContrat}
                          </span>
                          {job.salaire && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salaire} FCFA
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(job.datePublication).toLocaleDateString("fr-FR")}
                          </span>
                        </CardDescription>
                      </div>
                      <Button asChild>
                        <Link href={`/offre/${job.id}`}>Voir l'offre</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {job.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Page {filters.page} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune offre trouvée
              </h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche
              </p>
              <Button onClick={handleResetFilters}>Réinitialiser les filtres</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
