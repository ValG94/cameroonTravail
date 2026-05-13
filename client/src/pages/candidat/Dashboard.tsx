import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Award,
  Briefcase,
  Crown,
  Eye,
  FileText,
  GraduationCap,
  Languages,
  MapPin,
  Phone,
  Sparkles,
  TrendingUp,
  Upload,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useEffect } from "react";

export default function CandidatDashboard() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile } = trpc.candidat.getProfile.useQuery();
  const { data: experiences } = trpc.candidat.getExperiences.useQuery();
  const { data: formations } = trpc.candidat.getFormations.useQuery();
  const { data: competences } = trpc.candidat.getCompetences.useQuery();
  const { data: langues } = trpc.candidat.getLangues.useQuery();
  const { data: viewsData } = trpc.profileViews.myStats.useQuery();

  // Rediriger si pas candidat
  useEffect(() => {
    if (!loading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Calculer le pourcentage de complétion du profil
  const calculateProfileCompletion = () => {
    let score = 0;
    const maxScore = 7;

    if (profile?.prenom && profile?.nom) score++;
    if (profile?.telephone) score++;
    if (profile?.ville && profile?.region) score++;
    if (profile?.cvUrl) score++;
    if (experiences && experiences.length > 0) score++;
    if (formations && formations.length > 0) score++;
    if (competences && competences.length > 0) score++;

    return Math.round((score / maxScore) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />

      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("common.welcome")}, {profile?.prenom || user?.name} !
          </h1>
          <p className="text-gray-600">
            Gérez votre profil et recherchez des opportunités d'emploi
          </p>
        </div>

        {/* Recommandation : bibliothèque CV premium (optionnelle) */}
        <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="bg-white/20 rounded-xl p-3 shrink-0">
            <Crown className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">Multipliez vos chances avec un CV professionnel</h3>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-amber-50 text-sm">
              Démarquez-vous des autres candidats avec nos modèles premium conçus par des
              designers. Paiement unique de 1000 FCFA par modèle, accès à vie. Optionnel —
              vous pouvez aussi continuer à uploader votre propre CV.
            </p>
          </div>
          <Button
            onClick={() => setLocation("/candidat/templates")}
            className="bg-white text-orange-600 hover:bg-orange-50 shrink-0"
          >
            Découvrir
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Complétion du profil */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Complétion de votre profil</CardTitle>
            <CardDescription>
              Un profil complet augmente vos chances de trouver un emploi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-green-600">
                  {profileCompletion}%
                </span>
                <Button asChild>
                  <Link href="/candidat/profil">Compléter mon profil</Link>
                </Button>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Statistiques de vues CVthèque */}
        {viewsData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vues totales</p>
                    <p className="text-3xl font-bold text-gray-900">{viewsData.total}</p>
                    <p className="text-xs text-gray-400 mt-0.5">depuis le début</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vues (7 jours)</p>
                    <p className="text-3xl font-bold text-gray-900">{viewsData.last7Days}</p>
                    <p className="text-xs text-gray-400 mt-0.5">cette semaine</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Vues (30 jours)</p>
                    <p className="text-3xl font-bold text-gray-900">{viewsData.last30Days}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ce mois</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grille de sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Informations personnelles</CardTitle>
                  <CardDescription className="text-sm">
                    {profile?.prenom && profile?.nom ? "Complété" : "À compléter"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                {profile?.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profile.telephone}
                  </div>
                )}
                {profile?.ville && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.ville}, {profile.region}
                  </div>
                )}
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/candidat/profil">Modifier</Link>
              </Button>
            </CardContent>
          </Card>

          {/* CV */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Mon CV</CardTitle>
                  <CardDescription className="text-sm">
                    {profile?.cvUrl ? "CV téléchargé" : "Aucun CV"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profile?.cvUrl ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Votre CV est prêt à être envoyé</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/candidat/cv">Voir mon CV</Link>
                  </Button>
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/candidat/cv">
                    <Upload className="w-4 h-4 mr-2" />
                    Télécharger mon CV
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Expériences */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Expériences</CardTitle>
                  <CardDescription className="text-sm">
                    {experiences?.length || 0} expérience(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/candidat/experiences">Gérer mes expériences</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Formations */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Formations</CardTitle>
                  <CardDescription className="text-sm">
                    {formations?.length || 0} formation(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/candidat/formations">Gérer mes formations</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Compétences */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Compétences</CardTitle>
                  <CardDescription className="text-sm">
                    {competences?.length || 0} compétence(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/candidat/competences">Gérer mes compétences</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Langues */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Languages className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Langues</CardTitle>
                  <CardDescription className="text-sm">
                    {langues?.length || 0} langue(s)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/candidat/langues">Gérer mes langues</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Rechercher un emploi public</CardTitle>
              <CardDescription className="text-green-100">
                Consultez les offres de la fonction publique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/emploi-public">Voir les offres</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
            <CardHeader>
              <CardTitle className="text-white">Rechercher un emploi privé</CardTitle>
              <CardDescription className="text-red-100">
                Découvrez les opportunités dans le secteur privé
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/emploi-prive">Voir les offres</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
