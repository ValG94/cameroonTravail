import { useAuth } from "@/_core/hooks/useAuth";
import { EmployeurNav } from "@/components/EmployeurNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Circle,
  PartyPopper,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function BienvenueEmployeur() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: employeur } = trpc.employeur.getProfile.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: offres } = trpc.jobs.getByEmployeur.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!authLoading && (!user || (user.profileType !== "employeur" && user.role !== "admin"))) {
      setLocation("/connexion");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const profilComplete = !!(
    employeur?.nomEntreprise &&
    employeur?.secteurActivite &&
    employeur?.ville
  );
  const aPublieOffre = !!offres && offres.length > 0;

  const steps = [
    {
      id: "profil",
      number: 1,
      title: "Complétez votre profil entreprise",
      description:
        "Renseignez les informations de votre entreprise (logo, description, secteur, taille). Un profil complet rassure les candidats et booste vos candidatures.",
      icon: Building2,
      color: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100 text-blue-600",
      cta: "Compléter mon profil",
      route: "/employeur/profil",
      done: profilComplete,
    },
    {
      id: "offre",
      number: 2,
      title: "Publiez votre première offre",
      description:
        "Décrivez le poste à pourvoir, les compétences recherchées et les conditions. Votre offre sera visible par tous les candidats inscrits.",
      icon: Briefcase,
      color: "from-orange-500 to-amber-600",
      iconBg: "bg-orange-100 text-orange-600",
      cta: "Publier une offre",
      route: "/employeur/publier",
      done: aPublieOffre,
    },
    {
      id: "cvtheque",
      number: 3,
      title:
        employeur?.formuleAbonnement === "gratuit"
          ? "Débloquez la CVthèque"
          : "Explorez la CVthèque",
      description:
        employeur?.formuleAbonnement === "gratuit"
          ? "La CVthèque est réservée aux formules Pro et Entreprise. Souscrivez à une formule pour rechercher parmi des milliers de profils candidats et les contacter directement."
          : "Recherchez directement parmi les milliers de profils candidats. Filtrez par compétences, expérience, localisation et contactez les meilleurs talents.",
      icon: Search,
      color: "from-emerald-500 to-teal-600",
      iconBg: "bg-emerald-100 text-emerald-600",
      cta:
        employeur?.formuleAbonnement === "gratuit"
          ? "Découvrir les formules"
          : "Accéder à la CVthèque",
      route: employeur?.formuleAbonnement === "gratuit" ? "/tarifs" : "/cvtheque",
      done: false,
    },
  ];

  const stepsCompleted = steps.filter((s) => s.done).length;
  const progressPct = Math.round((stepsCompleted / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Hero Welcome */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-2xl p-3 shrink-0">
              <PartyPopper className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                Bienvenue {employeur?.nomEntreprise || user?.name} !
              </h1>
              <p className="text-orange-50 text-lg">
                Votre compte recruteur est créé. Suivez ce guide rapide pour démarrer
                votre première campagne de recrutement.
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 bg-white/20 rounded-full p-1">
            <div className="flex items-center justify-between text-xs font-medium mb-1 px-2">
              <span>Progression de votre démarrage</span>
              <span>
                {stepsCompleted}/{steps.length} étapes
              </span>
            </div>
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            Démarrage en 3 étapes
          </h2>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.id}
                className={`border-2 transition-all hover:shadow-md ${
                  step.done ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Status circle */}
                    <div className="shrink-0 mt-1">
                      {step.done ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      ) : (
                        <div className="relative">
                          <Circle className="w-8 h-8 text-gray-300" />
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500">
                            {step.number}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                        {step.done && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Fait
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      <Button
                        onClick={() => setLocation(step.route)}
                        className={`bg-gradient-to-r ${step.color} text-white hover:opacity-90`}
                      >
                        {step.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {/* Decorative icon */}
                    <div
                      className={`w-14 h-14 rounded-2xl ${step.iconBg} hidden md:flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Aller plus loin</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => setLocation("/employeur/dashboard")}
              className="text-left p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <Briefcase className="w-5 h-5 text-orange-500 mb-2" />
              <p className="font-semibold text-gray-900 text-sm mb-1">Tableau de bord</p>
              <p className="text-xs text-gray-500">Vue d'ensemble de votre activité</p>
            </button>
            <button
              onClick={() => setLocation("/employeur/candidatures")}
              className="text-left p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <Users className="w-5 h-5 text-orange-500 mb-2" />
              <p className="font-semibold text-gray-900 text-sm mb-1">Candidatures reçues</p>
              <p className="text-xs text-gray-500">Gérez les postulants à vos offres</p>
            </button>
            <button
              onClick={() => setLocation("/employeur/offres")}
              className="text-left p-4 rounded-xl border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
            >
              <Sparkles className="w-5 h-5 text-orange-500 mb-2" />
              <p className="font-semibold text-gray-900 text-sm mb-1">Mes offres</p>
              <p className="text-xs text-gray-500">Modifiez ou archivez vos annonces</p>
            </button>
          </div>
        </div>

        {/* Skip */}
        <div className="text-center">
          <button
            onClick={() => setLocation("/employeur/dashboard")}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Passer cette étape et accéder au tableau de bord
          </button>
        </div>
      </div>
    </div>
  );
}
