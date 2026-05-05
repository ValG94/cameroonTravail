import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CAMEROON_REGIONS, CAMEROON_CITIES_BY_REGION, formatCameroonPhone } from "@shared/cameroon-data";
import { Loader2, Upload, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function CandidatProfil() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading } = trpc.candidat.getProfile.useQuery();
  const updateProfileMutation = trpc.candidat.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    adresse: "",
    ville: "",
    region: "",
    nationalite: "Camerounaise",
    situationMatrimoniale: "",
  });

  const [selectedRegion, setSelectedRegion] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  const uploadPhotoMutation = trpc.candidat.uploadPhoto.useMutation({
    onSuccess: (data) => {
      toast.success("Photo de profil mise à jour avec succès");
      setPhotoPreview(data.photoUrl);
      setIsUploadingPhoto(false);
      // Invalider la query auth.me pour mettre à jour le menu utilisateur
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUploadingPhoto(false);
    },
  });

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (profile) {
      setFormData({
        prenom: profile.prenom || "",
        nom: profile.nom || "",
        telephone: profile.telephone || "",
        adresse: profile.adresse || "",
        ville: profile.ville || "",
        region: profile.region || "",
        nationalite: profile.nationalite || "Camerounaise",
        situationMatrimoniale: profile.situationMatrimoniale || "",
      });
      if (profile.region) {
        setSelectedRegion(profile.region);
        const cities = CAMEROON_CITIES_BY_REGION[profile.region] || [];
        setAvailableCities(cities);
      }
      if (profile.photoUrl) {
        setPhotoPreview(profile.photoUrl);
      }
    }
  }, [profile]);
  
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La photo ne doit pas dépasser 5MB");
      return;
    }
    
    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    
    setIsUploadingPhoto(true);
    
    // Lire le fichier et créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Convertir en base64 pour l'upload
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    
    uploadPhotoMutation.mutate({
      fileData: base64.split(",")[1], // Retirer le préfixe data:image/...;base64,
      fileName: file.name,
      mimeType: file.type,
    });
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setFormData({ ...formData, region: value, ville: "" });
    const cities = CAMEROON_CITIES_BY_REGION[value] || [];
    setAvailableCities(cities);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const currentLang = i18n.language;

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("profile.personalInfo")}
          </h1>
          <p className="text-gray-600">
            Complétez vos informations personnelles pour améliorer votre profil
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Ces informations seront visibles par les employeurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo de profil */}
              <div className="space-y-4">
                <Label>Photo de profil</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Photo de profil"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Changer la photo
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Format: JPG, PNG. Taille max: 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Nom et Prénom */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">{t("profile.firstName")} *</Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">{t("profile.lastName")} *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="telephone">{t("profile.phone")} *</Label>
                <Input
                  id="telephone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={formData.telephone}
                  onChange={(e) => {
                    const formatted = formatCameroonPhone(e.target.value);
                    setFormData({ ...formData, telephone: formatted });
                  }}
                  required
                />
                <p className="text-sm text-gray-500">Format: +237 6XX XXX XXX</p>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <Label htmlFor="adresse">{t("profile.address")}</Label>
                <Textarea
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Région et Ville */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">{t("profile.region")} *</Label>
                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMEROON_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {currentLang === "fr" ? region.labelFr : region.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ville">{t("profile.city")} *</Label>
                  <Select
                    value={formData.ville}
                    onValueChange={(value) => setFormData({ ...formData, ville: value })}
                    disabled={!selectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Nationalité */}
              <div className="space-y-2">
                <Label htmlFor="nationalite">{t("profile.nationality")}</Label>
                <Input
                  id="nationalite"
                  value={formData.nationalite}
                  onChange={(e) => setFormData({ ...formData, nationalite: e.target.value })}
                />
              </div>

              {/* Situation matrimoniale */}
              <div className="space-y-2">
                <Label htmlFor="situationMatrimoniale">{t("profile.maritalStatus")}</Label>
                <Select
                  value={formData.situationMatrimoniale}
                  onValueChange={(value) => setFormData({ ...formData, situationMatrimoniale: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="celibataire">Célibataire</SelectItem>
                    <SelectItem value="marie">Marié(e)</SelectItem>
                    <SelectItem value="divorce">Divorcé(e)</SelectItem>
                    <SelectItem value="veuf">Veuf/Veuve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Boutons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1"
                >
                  {updateProfileMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("common.save")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/candidat/dashboard")}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
