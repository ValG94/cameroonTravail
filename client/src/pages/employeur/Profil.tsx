import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { CAMEROON_REGIONS, CAMEROON_CITIES_BY_REGION } from "@shared/cameroon-data";
import { Building2, Globe, Loader2, Mail, MapPin, Phone, Upload, User } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { EmployeurNav } from "@/components/EmployeurNav";
import { SECTEURS } from "@/lib/secteurs";

const TAILLES = [
  { value: "1-10", label: "1 à 10 employés (TPE)" },
  { value: "11-50", label: "11 à 50 employés (PME)" },
  { value: "51-200", label: "51 à 200 employés" },
  { value: "201-500", label: "201 à 500 employés" },
  { value: "500+", label: "Plus de 500 employés (Grande entreprise)" },
];

export default function EmployeurProfil() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading, refetch } = trpc.employeur.getProfile.useQuery();

  const updateProfileMutation = trpc.employeur.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const uploadLogoMutation = trpc.employeur.uploadLogo.useMutation({
    onSuccess: (data) => {
      toast.success("Logo mis à jour avec succès");
      setLogoPreview(data.logoUrl);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUploadingLogo(false);
    },
  });

  const [formData, setFormData] = useState({
    nomEntreprise: "",
    secteurActivite: "",
    taille: "",
    siteWeb: "",
    telephone: "",
    adresse: "",
    ville: "",
    region: "",
    codePostal: "",
    description: "",
    nomContact: "",
    prenomContact: "",
    posteContact: "",
    emailContact: "",
    telephoneContact: "",
  });

  const [selectedRegion, setSelectedRegion] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "employeur" && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (profile) {
      setFormData({
        nomEntreprise: profile.nomEntreprise || "",
        secteurActivite: profile.secteurActivite || "",
        taille: profile.taille || "",
        siteWeb: profile.siteWeb || "",
        telephone: profile.telephone || "",
        adresse: profile.adresse || "",
        ville: profile.ville || "",
        region: profile.region || "",
        codePostal: profile.codePostal || "",
        description: profile.description || "",
        nomContact: profile.nomContact || "",
        prenomContact: profile.prenomContact || "",
        posteContact: profile.posteContact || "",
        emailContact: profile.emailContact || "",
        telephoneContact: profile.telephoneContact || "",
      });
      if (profile.region) {
        setSelectedRegion(profile.region);
        const cities = (CAMEROON_CITIES_BY_REGION as Record<string, string[]>)[profile.region] || [];
        setAvailableCities(cities);
      }
      if (profile.logoUrl) {
        setLogoPreview(profile.logoUrl);
      }
    }
  }, [profile]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le logo ne doit pas dépasser 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setIsUploadingLogo(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const base64 = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(file);
    });

    uploadLogoMutation.mutate({
      fileData: base64.split(",")[1],
      fileName: file.name,
      mimeType: file.type,
    });

    setIsUploadingLogo(false);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setFormData({ ...formData, region: value, ville: "" });
    // CAMEROON_CITIES_BY_REGION peut utiliser la valeur ou le label
    const cities = (CAMEROON_CITIES_BY_REGION as Record<string, string[]>)[value] || [];
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil de l'entreprise</h1>
          <p className="text-gray-600">
            Complétez les informations de votre entreprise pour attirer les meilleurs talents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo de l'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Logo de l'entreprise
              </CardTitle>
              <CardDescription>
                Ajoutez le logo de votre entreprise (PNG, JPG, max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo entreprise"
                      className="w-24 h-24 rounded-lg object-contain border-2 border-gray-200 bg-white p-1"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Building2 className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  {isUploadingLogo && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    {logoPreview ? "Changer le logo" : "Ajouter un logo"}
                  </Button>
                  <p className="text-xs text-gray-500">Format recommandé : carré, min 200x200px</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Informations générales
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos offres d'emploi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="nomEntreprise">Nom de l'entreprise *</Label>
                  <Input
                    id="nomEntreprise"
                    value={formData.nomEntreprise}
                    onChange={(e) => setFormData({ ...formData, nomEntreprise: e.target.value })}
                    placeholder="Ex : Cameroon Digital Solutions"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secteurActivite">Secteur d'activité</Label>
                  <Select
                    value={formData.secteurActivite}
                    onValueChange={(value) => setFormData({ ...formData, secteurActivite: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTEURS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taille">Taille de l'entreprise</Label>
                  <Select
                    value={formData.taille}
                    onValueChange={(value) => setFormData({ ...formData, taille: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nombre d'employés" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAILLES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description de l'entreprise</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez votre entreprise, sa mission, ses valeurs..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="telephone"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      placeholder="+237 6XX XXX XXX"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteWeb">Site web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="siteWeb"
                      value={formData.siteWeb}
                      onChange={(e) => setFormData({ ...formData, siteWeb: e.target.value })}
                      placeholder="https://www.monentreprise.cm"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
                  <Select value={selectedRegion} onValueChange={handleRegionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMEROON_REGIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.labelFr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ville">Ville</Label>
                  {availableCities.length > 0 ? (
                    <Select
                      value={formData.ville}
                      onValueChange={(value) => setFormData({ ...formData, ville: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="ville"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      placeholder="Ville"
                    />
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="adresse">Adresse</Label>
                  <Input
                    id="adresse"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    placeholder="Rue, quartier, BP..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact RH */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Contact RH / Recrutement
              </CardTitle>
              <CardDescription>
                La personne en charge du recrutement dans votre entreprise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenomContact">Prénom</Label>
                  <Input
                    id="prenomContact"
                    value={formData.prenomContact}
                    onChange={(e) => setFormData({ ...formData, prenomContact: e.target.value })}
                    placeholder="Prénom du contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nomContact">Nom</Label>
                  <Input
                    id="nomContact"
                    value={formData.nomContact}
                    onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })}
                    placeholder="Nom du contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="posteContact">Poste / Fonction</Label>
                  <Input
                    id="posteContact"
                    value={formData.posteContact}
                    onChange={(e) => setFormData({ ...formData, posteContact: e.target.value })}
                    placeholder="Ex : Directeur RH, Responsable recrutement"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephoneContact">Téléphone direct</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="telephoneContact"
                      value={formData.telephoneContact}
                      onChange={(e) => setFormData({ ...formData, telephoneContact: e.target.value })}
                      placeholder="+237 6XX XXX XXX"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="emailContact">Email de contact</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="emailContact"
                      type="email"
                      value={formData.emailContact}
                      onChange={(e) => setFormData({ ...formData, emailContact: e.target.value })}
                      placeholder="recrutement@monentreprise.cm"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end gap-4 pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/employeur/dashboard")}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
