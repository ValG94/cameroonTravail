import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Briefcase, UserCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SelectProfile() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const selectProfileMutation = trpc.auth.selectProfileType.useMutation({
    onSuccess: () => {
      toast.success(t('common.success'));
      // Recharger pour obtenir le profil mis à jour
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSelectProfile = (profileType: "candidat" | "employeur") => {
    selectProfileMutation.mutate({ profileType });
  };

  // Si l'utilisateur a déjà un profil, rediriger
  if (user?.profileType) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-yellow-50 to-red-50 p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logo_4636448b.png" 
            alt="Cameroon Travail" 
            className="h-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.selectProfile')}
          </h1>
        </div>

        {/* Cartes de sélection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Candidat */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-green-600"
            onClick={() => handleSelectProfile("candidat")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserCircle className="w-12 h-12 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">
                {t('auth.candidate')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('auth.candidateDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                size="lg" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={selectProfileMutation.isPending}
              >
                {selectProfileMutation.isPending ? t('common.loading') : t('common.register')}
              </Button>
            </CardContent>
          </Card>

          {/* Employeur */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-red-600"
            onClick={() => handleSelectProfile("employeur")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-12 h-12 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-700">
                {t('auth.employer')}
              </CardTitle>
              <CardDescription className="text-base">
                {t('auth.employerDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                size="lg" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={selectProfileMutation.isPending}
              >
                {selectProfileMutation.isPending ? t('common.loading') : t('common.register')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
