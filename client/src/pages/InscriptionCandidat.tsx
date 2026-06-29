import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Eye, EyeOff, Mail, Lock, Phone, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { getLoginUrl } from "@/const";

export default function InscriptionCandidat() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Inscription réussie ! Bienvenue sur Cameroon Travail.");
      setLocation("/");
    },
    onError: (error: any) => {
      const msg = error.message || "Erreur lors de l'inscription";
      // Si le compte existe déjà, proposer de réinitialiser le mot de passe
      if (msg.toLowerCase().includes("existe") || msg.toLowerCase().includes("already") || msg.toLowerCase().includes("utilisé")) {
        toast.error(
          msg + " — Vous pouvez réinitialiser votre mot de passe.",
          {
            action: {
              label: "Mot de passe oublié ?",
              onClick: () => setLocation("/mot-de-passe-oublie"),
            },
            duration: 8000,
          }
        );
      } else {
        toast.error(msg);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs obligatoires
    if (!formData.prenom.trim()) {
      toast.error("Le prénom est obligatoire");
      return;
    }
    if (!formData.nom.trim()) {
      toast.error("Le nom est obligatoire");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("L'adresse email est obligatoire");
      return;
    }
    if (!formData.telephone.trim()) {
      toast.error("Le numéro de téléphone est obligatoire");
      return;
    }
    if (!formData.password) {
      toast.error("Le mot de passe est obligatoire");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!formData.acceptTerms) {
      toast.error("Vous devez accepter les conditions d'utilisation");
      return;
    }

    // Inscrire le candidat
    await registerMutation.mutateAsync({
      email: formData.email,
      password: formData.password,
      name: `${formData.prenom} ${formData.nom}`,
      profileType: "candidat",
      telephone: formData.telephone,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header partagé pour cohérence inter-pages */}
      <SiteHeader />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            S'inscrire
          </h1>
          <p className="text-gray-600">
            Ou{" "}
            <button
              onClick={() => (window.location.href = getLoginUrl())}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              connectez-vous à votre compte
            </button>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prénom */}
            <div>
              <Label htmlFor="prenom">Prénom <span className="text-red-500">*</span></Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="pl-10"
                  placeholder="Jean"
                />
              </div>
            </div>

            {/* Nom */}
            <div>
              <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="pl-10"
                  placeholder="Dupont"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">{t("auth.email")} <span className="text-red-500">*</span></Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <Label htmlFor="telephone">
                {t("auth.phone")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="telephone"
                  type="tel"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="pl-10"
                  placeholder="+237 6XX XX XX XX"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <Label htmlFor="password">{t("auth.password")} <span className="text-red-500">*</span></Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Accepter les conditions */}
            <div className="flex items-start gap-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acceptTerms: checked as boolean })
                }
                className="mt-1"
              />
              <Label htmlFor="acceptTerms" className="text-xs text-gray-700 cursor-pointer leading-tight">
                J'accepte les{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/conditions")}
                  className="text-green-600 hover:text-green-700 underline"
                >
                  conditions d'utilisation
                </button>{" "}
                et la{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/confidentialite")}
                  className="text-green-600 hover:text-green-700 underline"
                >
                  politique de confidentialité
                </button>
              </Label>
            </div>

            {/* Bouton d'inscription */}
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Inscription..." : "S'inscrire"}
            </Button>

            {/* Ou connectez-vous avec */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou connectez-vous avec</span>
              </div>
            </div>

            {/* Connexion OAuth */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuer avec Google
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
