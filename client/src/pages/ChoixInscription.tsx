import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, User } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";

export default function ChoixInscription() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const searchString = useSearch();

  // Si l'URL pré-sélectionne déjà un type de profil (ex: ?type=employeur depuis
  // Espace Recruteur ou Choisir ce plan), on saute cet écran de choix et on
  // redirige directement vers le bon formulaire, en préservant les autres
  // query params (plan, email, entreprise, etc.).
  useEffect(() => {
    const sp = new URLSearchParams(searchString || "");
    const type = sp.get("type");
    if (type !== "candidat" && type !== "employeur") return;
    sp.delete("type");
    const rest = sp.toString();
    setLocation(`/inscription/${type}${rest ? `?${rest}` : ""}`);
  }, [searchString, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-red-50">
      {/* Header partagé pour cohérence inter-pages */}
      <SiteHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("register.chooseProfile")}
            </h1>
            <p className="text-lg text-gray-600">
              {t("register.chooseProfileDescription")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Candidat Card */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-green-500">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <CardTitle className="text-2xl">{t("auth.candidate")}</CardTitle>
                <CardDescription className="text-base">
                  {t("register.candidateDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t("register.candidateFeature1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t("register.candidateFeature2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t("register.candidateFeature3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{t("register.candidateFeature4")}</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setLocation("/inscription/candidat")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {t("register.registerAsCandidate")}
                </Button>
              </CardContent>
            </Card>

            {/* Employeur Card */}
            <Card className="hover:shadow-xl transition-shadow cursor-pointer border-2 hover:border-orange-500">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                  <Briefcase className="h-10 w-10 text-orange-600" />
                </div>
                <CardTitle className="text-2xl">{t("auth.employer")}</CardTitle>
                <CardDescription className="text-base">
                  {t("register.employerDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>{t("register.employerFeature1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>{t("register.employerFeature2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>{t("register.employerFeature3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">✓</span>
                    <span>{t("register.employerFeature4")}</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setLocation("/inscription/employeur")}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  size="lg"
                >
                  {t("register.registerAsEmployer")}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              {t("register.alreadyHaveAccount")}{" "}
              <button
                onClick={() => setLocation("/")}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {t("auth.login")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
