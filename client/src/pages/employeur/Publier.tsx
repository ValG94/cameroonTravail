import { useState, useEffect } from "react";
import { EmployeurNav } from "@/components/EmployeurNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { regions, getVillesForRegion } from "@/../../shared/regions-villes";
import RichTextEditor from "@/components/RichTextEditor";
import { SECTEURS as secteurs } from "@/lib/secteurs";

const typesContrat = [
  "CDI",
  "CDD",
  "Stage",
  "Freelance",
  "Intérim",
  "Alternance"
];

export default function EmployeurPublier() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [villesSuggestions, setVillesSuggestions] = useState<string[]>([]);
  
  // Récupérer l'ID de l'offre à dupliquer depuis l'URL
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const duplicateId = urlParams.get('duplicateId');
  
  // Charger les données de l'offre à dupliquer
  const { data: offreToDuplicate } = trpc.jobs.duplicate.useQuery(
    { id: parseInt(duplicateId || '0') },
    { enabled: !!duplicateId }
  );
  
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    missions: "",
    competencesRequises: "",
    experienceRequise: "",
    niveauEtude: "",
    typeOffre: "prive" as "public" | "prive",
    typeContrat: "",
    dureeContrat: "",
    salaire: "",
    avantages: "",
    ville: "",
    region: "",
    secteur: "",
    metier: "",
    dateLimite: "",
    dateDebut: "",
    nombrePostes: 1,
  });

  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerPostJob.publishedToast"));
      setLocation("/employeur/offres");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Pré-remplir le formulaire avec les données de l'offre à dupliquer
  useEffect(() => {
    if (offreToDuplicate) {
      setFormData({
        titre: offreToDuplicate.titre || "",
        description: offreToDuplicate.description || "",
        missions: offreToDuplicate.missions || "",
        competencesRequises: offreToDuplicate.competencesRequises || "",
        experienceRequise: offreToDuplicate.experienceRequise || "",
        niveauEtude: offreToDuplicate.niveauEtude || "",
        typeOffre: offreToDuplicate.typeOffre || "prive",
        typeContrat: offreToDuplicate.typeContrat || "",
        dureeContrat: offreToDuplicate.dureeContrat || "",
        salaire: offreToDuplicate.salaire || "",
        avantages: offreToDuplicate.avantages || "",
        ville: offreToDuplicate.ville || "",
        region: offreToDuplicate.region || "",
        secteur: offreToDuplicate.secteur || "",
        metier: offreToDuplicate.metier || "",
        dateLimite: "",
        dateDebut: "",
        nombrePostes: offreToDuplicate.nombrePostes || 1,
      });
      
      // Mettre à jour les suggestions de villes
      if (offreToDuplicate.region) {
        setVillesSuggestions(getVillesForRegion(offreToDuplicate.region));
      }
      
      toast.info(t("bo.employerPostJob.duplicatedToast"));
    }
  }, [offreToDuplicate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || formData.titre.length < 5) {
      toast.error(t("bo.employerPostJob.errTitleTooShort"));
      return;
    }

    if (!formData.description || formData.description.length < 50) {
      toast.error(t("bo.employerPostJob.errDescTooShort"));
      return;
    }

    if (!formData.typeContrat) {
      toast.error(t("bo.employerPostJob.errContractRequired"));
      return;
    }

    if (!formData.ville || !formData.region || !formData.secteur) {
      toast.error(t("bo.employerPostJob.errAllRequired"));
      return;
    }

    createMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mettre à jour les suggestions de villes quand la région change
    if (field === "region") {
      const villes = getVillesForRegion(value);
      setVillesSuggestions(villes);
      // Réinitialiser la ville si elle n'est pas dans la nouvelle région
      if (formData.ville && !villes.includes(formData.ville)) {
        setFormData(prev => ({ ...prev, ville: "" }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("bo.employerPostJob.title")}</h1>
          <p className="text-gray-600 mt-2">
            {t("bo.employerPostJob.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>{t("bo.employerPostJob.sectionGeneralTitle")}</CardTitle>
                <CardDescription>
                  {t("bo.employerPostJob.sectionGeneralDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">{t("bo.employerPostJob.titleLabel")} *</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => handleChange("titre", e.target.value)}
                    placeholder={t("bo.employerPostJob.titlePh")}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeOffre">{t("bo.employerPostJob.typeOffer")} *</Label>
                    <Select
                      value={formData.typeOffre}
                      onValueChange={(value) => handleChange("typeOffre", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prive">{t("bo.employerPostJob.offerPrivate")}</SelectItem>
                        <SelectItem value="public">{t("bo.employerPostJob.offerPublic")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secteur">{t("bo.employerPostJob.sector")} *</Label>
                    <Select
                      value={formData.secteur}
                      onValueChange={(value) => handleChange("secteur", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("bo.employerPostJob.sectorPh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {secteurs.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metier">{t("bo.employerPostJob.job")}</Label>
                  <Input
                    id="metier"
                    value={formData.metier}
                    onChange={(e) => handleChange("metier", e.target.value)}
                    placeholder={t("bo.employerPostJob.jobPh")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("bo.employerPostJob.descLabel")} *</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => handleChange("description", value)}
                    placeholder={t("bo.employerPostJob.descPh")}
                    minHeight="180px"
                  />
                  <p className="text-xs text-gray-500">
                    {t("bo.employerPostJob.descHelp")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="missions">{t("bo.employerPostJob.missions")}</Label>
                  <RichTextEditor
                    value={formData.missions}
                    onChange={(value) => handleChange("missions", value)}
                    placeholder={t("bo.employerPostJob.missionsPh")}
                    minHeight="150px"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Profil recherché */}
            <Card>
              <CardHeader>
                <CardTitle>{t("bo.employerPostJob.sectionProfileTitle")}</CardTitle>
                <CardDescription>
                  {t("bo.employerPostJob.sectionProfileDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="competencesRequises">{t("bo.employerPostJob.skills")}</Label>
                    <RichTextEditor
                      value={formData.competencesRequises}
                      onChange={(value) => handleChange("competencesRequises", value)}
                      placeholder={t("bo.employerPostJob.skillsPh")}
                      minHeight="150px"
                    />
                  </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceRequise">{t("bo.employerPostJob.experience")}</Label>
                    <Input
                      id="experienceRequise"
                      value={formData.experienceRequise}
                      onChange={(e) => handleChange("experienceRequise", e.target.value)}
                      placeholder={t("bo.employerPostJob.experiencePh")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niveauEtude">{t("bo.employerPostJob.education")}</Label>
                    <Input
                      id="niveauEtude"
                      value={formData.niveauEtude}
                      onChange={(e) => handleChange("niveauEtude", e.target.value)}
                      placeholder={t("bo.employerPostJob.educationPh")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conditions de travail */}
            <Card>
              <CardHeader>
                <CardTitle>{t("bo.employerPostJob.sectionConditionsTitle")}</CardTitle>
                <CardDescription>
                  {t("bo.employerPostJob.sectionConditionsDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeContrat">{t("bo.employerPostJob.contractType")} *</Label>
                    <Select
                      value={formData.typeContrat}
                      onValueChange={(value) => handleChange("typeContrat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("bo.employerPostJob.contractTypePh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {typesContrat.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.typeContrat !== "CDI" && (
                    <div className="space-y-2">
                      <Label htmlFor="dureeContrat">{t("bo.employerPostJob.contractDuration")}</Label>
                      <Input
                        id="dureeContrat"
                        value={formData.dureeContrat}
                        onChange={(e) => handleChange("dureeContrat", e.target.value)}
                        placeholder={t("bo.employerPostJob.contractDurationPh")}
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaire">{t("bo.employerPostJob.salary")}</Label>
                    <Input
                      id="salaire"
                      value={formData.salaire}
                      onChange={(e) => handleChange("salaire", e.target.value)}
                      placeholder={t("bo.employerPostJob.salaryPh")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombrePostes">{t("bo.employerPostJob.positions")}</Label>
                    <Input
                      id="nombrePostes"
                      type="number"
                      min="1"
                      value={formData.nombrePostes}
                      onChange={(e) => handleChange("nombrePostes", parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avantages">{t("bo.employerPostJob.benefits")}</Label>
                  <Textarea
                    id="avantages"
                    value={formData.avantages}
                    onChange={(e) => handleChange("avantages", e.target.value)}
                    placeholder={t("bo.employerPostJob.benefitsPh")}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Localisation */}
            <Card>
              <CardHeader>
                <CardTitle>{t("bo.employerPostJob.sectionLocationTitle")}</CardTitle>
                <CardDescription>
                  {t("bo.employerPostJob.sectionLocationDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">{t("bo.employerPostJob.region")} *</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => handleChange("region", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("bo.employerPostJob.regionPh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ville">{t("bo.employerPostJob.city")} *</Label>
                    {villesSuggestions.length > 0 ? (
                      <Select
                        value={formData.ville}
                        onValueChange={(value) => handleChange("ville", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("bo.employerPostJob.cityPh")} />
                        </SelectTrigger>
                        <SelectContent>
                          {villesSuggestions.map((ville) => (
                            <SelectItem key={ville} value={ville}>
                              {ville}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="ville"
                        value={formData.ville}
                        onChange={(e) => handleChange("ville", e.target.value)}
                        placeholder={t("bo.employerPostJob.cityDisabledPh")}
                        disabled={!formData.region}
                        required
                      />
                    )}
                    {!formData.region && (
                      <p className="text-xs text-gray-500">
                        {t("bo.employerPostJob.cityHelpEmptyRegion")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>{t("bo.employerPostJob.sectionDatesTitle")}</CardTitle>
                <CardDescription>
                  {t("bo.employerPostJob.sectionDatesDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateLimite">{t("bo.employerPostJob.dateLimit")}</Label>
                    <Input
                      id="dateLimite"
                      type="date"
                      value={formData.dateLimite}
                      onChange={(e) => handleChange("dateLimite", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateDebut">{t("bo.employerPostJob.dateStart")}</Label>
                    <Input
                      id="dateDebut"
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => handleChange("dateDebut", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/employeur/dashboard")}
                disabled={createMutation.isPending}
              >
                {t("bo.employerPostJob.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("bo.employerPostJob.publishing")}
                  </>
                ) : (
                  t("bo.employerPostJob.publishBtn")
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
