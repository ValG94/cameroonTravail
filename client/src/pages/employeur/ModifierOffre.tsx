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
import { Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "wouter";
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

export default function ModifierOffre() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const offreId = parseInt(params.id || "0");
  const [villesSuggestions, setVillesSuggestions] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

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

  // Charger les données de l'offre existante
  const { data: offre, isLoading } = trpc.jobs.getById.useQuery(
    { id: offreId },
    { enabled: offreId > 0 }
  );

  // Pré-remplir le formulaire avec les données de l'offre
  useEffect(() => {
    if (offre && !initialized) {
      const formatDate = (date: Date | string | null) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setFormData({
        titre: offre.titre || "",
        description: offre.description || "",
        missions: offre.missions || "",
        competencesRequises: offre.competencesRequises || "",
        experienceRequise: offre.experienceRequise || "",
        niveauEtude: offre.niveauEtude || "",
        typeOffre: offre.typeOffre || "prive",
        typeContrat: offre.typeContrat || "",
        dureeContrat: offre.dureeContrat || "",
        salaire: offre.salaire || "",
        avantages: offre.avantages || "",
        ville: offre.ville || "",
        region: offre.region || "",
        secteur: offre.secteur || "",
        metier: offre.metier || "",
        dateLimite: formatDate(offre.dateLimite),
        dateDebut: formatDate(offre.dateDebut),
        nombrePostes: offre.nombrePostes || 1,
      });

      if (offre.region) {
        setVillesSuggestions(getVillesForRegion(offre.region));
      }

      setInitialized(true);
    }
  }, [offre, initialized]);

  const updateMutation = trpc.jobs.update.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerEditJob.updatedToast"));
      setLocation("/employeur/offres");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

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

    updateMutation.mutate({ id: offreId, ...formData });
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === "region") {
      const villes = getVillesForRegion(value);
      setVillesSuggestions(villes);
      if (formData.ville && !villes.includes(formData.ville)) {
        setFormData(prev => ({ ...prev, ville: "" }));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeurNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">{t("bo.employerEditJob.loadingJob")}</p>
        </div>
      </div>
    );
  }

  if (!offre) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeurNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">{t("bo.employerEditJob.jobNotFound")}</p>
          <Button className="mt-4" onClick={() => setLocation("/employeur/offres")}>
            {t("bo.employerEditJob.backToJobs")}
          </Button>
        </div>
      </div>
    );
  }

  // Attendre que le formulaire soit initialisé avec les données de l'offre
  // avant de rendre les RichTextEditor, pour garantir leur pré-remplissage
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeurNav />
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">{t("bo.employerEditJob.preparingForm")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/employeur/offres")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("bo.employerEditJob.backToJobs")}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{t("bo.employerEditJob.title")}</h1>
          <p className="text-gray-600 mt-2">
            {t("bo.employerEditJob.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>{t("bo.employerPostJob.sectionGeneralTitle")}</CardTitle>
                <CardDescription>
                  Décrivez le poste que vous proposez
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre du poste *</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => handleChange("titre", e.target.value)}
                    placeholder="Ex: Développeur Full Stack"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeOffre">Type d'offre *</Label>
                    <Select
                      value={formData.typeOffre}
                      onValueChange={(value) => handleChange("typeOffre", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prive">Emploi Privé</SelectItem>
                        <SelectItem value="public">Emploi Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secteur">Secteur d'activité *</Label>
                    <Select
                      value={formData.secteur}
                      onValueChange={(value) => handleChange("secteur", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un secteur" />
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
                  <Label htmlFor="metier">Métier / Fonction</Label>
                  <Input
                    id="metier"
                    value={formData.metier}
                    onChange={(e) => handleChange("metier", e.target.value)}
                    placeholder="Ex: Développement web"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description du poste *</Label>
                  <RichTextEditor
                    key={`description-${offreId}`}
                    value={formData.description}
                    initialValue={formData.description}
                    onChange={(value) => handleChange("description", value)}
                    placeholder="Décrivez le poste, le contexte, les responsabilités..."
                    minHeight="180px"
                  />
                  <p className="text-xs text-gray-500">
                    Minimum 50 caractères. Utilisez la barre d'outils pour mettre en forme votre texte.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="missions">Missions principales</Label>
                  <RichTextEditor
                    key={`missions-${offreId}`}
                    value={formData.missions}
                    initialValue={formData.missions}
                    onChange={(value) => handleChange("missions", value)}
                    placeholder="Listez les principales missions du poste..."
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
                  Définissez les compétences et qualifications requises
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="competencesRequises">Compétences requises</Label>
                  <RichTextEditor
                    key={`competences-${offreId}`}
                    value={formData.competencesRequises}
                    initialValue={formData.competencesRequises}
                    onChange={(value) => handleChange("competencesRequises", value)}
                    placeholder="Listez les compétences techniques et comportementales attendues..."
                    minHeight="150px"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceRequise">Expérience requise</Label>
                    <Input
                      id="experienceRequise"
                      value={formData.experienceRequise}
                      onChange={(e) => handleChange("experienceRequise", e.target.value)}
                      placeholder="Ex: 3 ans minimum"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niveauEtude">Niveau d'études</Label>
                    <Input
                      id="niveauEtude"
                      value={formData.niveauEtude}
                      onChange={(e) => handleChange("niveauEtude", e.target.value)}
                      placeholder="Ex: Bac+5"
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
                  Précisez les conditions d'emploi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeContrat">Type de contrat *</Label>
                    <Select
                      value={formData.typeContrat}
                      onValueChange={(value) => handleChange("typeContrat", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un type" />
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
                      <Label htmlFor="dureeContrat">Durée du contrat</Label>
                      <Input
                        id="dureeContrat"
                        value={formData.dureeContrat}
                        onChange={(e) => handleChange("dureeContrat", e.target.value)}
                        placeholder="Ex: 6 mois, 1 an..."
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaire">Salaire (FCFA)</Label>
                    <Input
                      id="salaire"
                      value={formData.salaire}
                      onChange={(e) => handleChange("salaire", e.target.value)}
                      placeholder="Ex: 500 000 - 700 000 FCFA"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombrePostes">Nombre de postes</Label>
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
                  <Label htmlFor="avantages">Avantages</Label>
                  <Textarea
                    id="avantages"
                    value={formData.avantages}
                    onChange={(e) => handleChange("avantages", e.target.value)}
                    placeholder="Listez les avantages offerts (primes, assurance, formation...)"
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
                  Où se situe le poste ?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="region">Région *</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => handleChange("region", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une région" />
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
                    <Label htmlFor="ville">Ville *</Label>
                    {villesSuggestions.length > 0 ? (
                      <Select
                        value={formData.ville}
                        onValueChange={(value) => handleChange("ville", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une ville" />
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
                        placeholder="Sélectionnez d'abord une région"
                        disabled={!formData.region}
                        required
                      />
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
                  Définissez les dates clés de l'offre
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateLimite">Date limite de candidature</Label>
                    <Input
                      id="dateLimite"
                      type="date"
                      value={formData.dateLimite}
                      onChange={(e) => handleChange("dateLimite", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateDebut">Date de début souhaitée</Label>
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
                onClick={() => setLocation("/employeur/offres")}
                disabled={updateMutation.isPending}
              >
                {t("bo.employerPostJob.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("bo.employerEditJob.updating")}
                  </>
                ) : (
                  t("bo.employerEditJob.updateBtn")
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
