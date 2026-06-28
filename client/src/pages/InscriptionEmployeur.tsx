import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { SECTEURS } from "@/lib/secteurs";
import { Eye, EyeOff, Mail, Lock, Phone, User, Building2, MapPin } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { LanguageSelector } from "@/components/LanguageSelector";
import { getLoginUrl } from "@/const";

export default function InscriptionEmployeur() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nomEntreprise: "",
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    poste: "",
    tailleEntreprise: "",
    secteur: "",
    ville: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: true,
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Inscription réussie ! Bienvenue sur Cameroon Travail.");
      setLocation("/employeur/bienvenue");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'inscription");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!formData.acceptTerms) {
      toast.error("Vous devez accepter les conditions d'utilisation");
      return;
    }

    // Inscrire l'employeur
    await registerMutation.mutateAsync({
      email: formData.email,
      password: formData.password,
      name: `${formData.prenom} ${formData.nom}`,
      profileType: "employeur",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm mb-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setLocation("/")} className="flex items-center gap-3">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logocameroonTravail_ed569233.png" alt="Cameroon Travail" className="h-12" />
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer votre compte recruteur
          </h1>
          <p className="text-gray-600">
            Rejoignez plus de 2,500 entreprises qui recrutent avec Cameroon Travail
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations sur l'entreprise */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Informations sur l'entreprise
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="nomEntreprise">Nom de l'entreprise *</Label>
                  <div className="relative mt-2">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="nomEntreprise"
                      type="text"
                      required
                      value={formData.nomEntreprise}
                      onChange={(e) => setFormData({ ...formData, nomEntreprise: e.target.value })}
                      className="pl-10"
                      placeholder="Ex: Tech Solutions Cameroun"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secteur">Secteur d'activité *</Label>
                  <Select
                    value={formData.secteur}
                    onValueChange={(value) => setFormData({ ...formData, secteur: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Sélectionner un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTEURS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tailleEntreprise">Taille de l'entreprise *</Label>
                  <Select
                    value={formData.tailleEntreprise}
                    onValueChange={(value) => setFormData({ ...formData, tailleEntreprise: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Sélectionner la taille" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employés</SelectItem>
                      <SelectItem value="11-50">11-50 employés</SelectItem>
                      <SelectItem value="51-200">51-200 employés</SelectItem>
                      <SelectItem value="201-1000">201-1000 employés</SelectItem>
                      <SelectItem value="1000+">1000+ employés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="ville">Ville *</Label>
                  <div className="relative mt-2">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="ville"
                      type="text"
                      required
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="pl-10"
                      placeholder="Ex: Douala"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personne de contact */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personne de contact</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="prenom">Prénom *</Label>
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

                <div>
                  <Label htmlFor="nom">Nom *</Label>
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

                <div>
                  <Label htmlFor="poste">Poste occupé *</Label>
                  <Input
                    id="poste"
                    type="text"
                    required
                    value={formData.poste}
                    onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                    className="mt-2"
                    placeholder="Ex: Responsable RH"
                  />
                </div>

                <div>
                  <Label htmlFor="telephone">Téléphone *</Label>
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

                <div className="md:col-span-2">
                  <Label htmlFor="email">Email professionnel *</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-10"
                      placeholder="jean.dupont@entreprise.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sécurité du compte */}
            <div className="pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité du compte</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
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

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                      }
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions */}
            <div className="space-y-3">
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
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    conditions d'utilisation
                  </button>{" "}
                  et la{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/confidentialite")}
                    className="text-orange-600 hover:text-orange-700 underline"
                  >
                    politique de confidentialité
                  </button>
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, newsletter: checked as boolean })
                  }
                  className="mt-1"
                />
                <Label htmlFor="newsletter" className="text-xs text-gray-700 cursor-pointer leading-tight">
                  Je souhaite recevoir les conseils recrutement et les actualités de Cameroon
                  Travail
                </Label>
              </div>
            </div>

            {/* Bouton d'inscription */}
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              size="lg"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending
                ? "Création du compte..."
                : "Créer mon compte recruteur"}
            </Button>

            {/* Déjà un compte */}
            <div className="text-center text-sm text-gray-600">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => (window.location.href = getLoginUrl())}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Se connecter
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
