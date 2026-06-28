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
      toast.success("Offre publiée avec succès");
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
      
      toast.info("Offre dupliquée - Modifiez les informations avant de publier");
    }
  }, [offreToDuplicate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || formData.titre.length < 5) {
      toast.error("Le titre doit contenir au moins 5 caractères");
      return;
    }

    if (!formData.description || formData.description.length < 50) {
      toast.error("La description doit contenir au moins 50 caractères");
      return;
    }

    if (!formData.typeContrat) {
      toast.error("Veuillez sélectionner un type de contrat");
      return;
    }

    if (!formData.ville || !formData.region || !formData.secteur) {
      toast.error("Veuillez remplir tous les champs obligatoires");
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
          <h1 className="text-3xl font-bold text-gray-900">Publier une offre d'emploi</h1>
          <p className="text-gray-600 mt-2">
            Remplissez le formulaire ci-dessous pour publier votre offre
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
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
                    value={formData.description}
                    onChange={(value) => handleChange("description", value)}
                    placeholder="D\u00e9crivez le poste, le contexte, les responsabilit\u00e9s..."
                    minHeight="180px"
                  />
                  <p className="text-xs text-gray-500">
                    Minimum 50 caract\u00e8res. Utilisez la barre d'outils pour mettre en forme votre texte.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="missions">Missions principales</Label>
                  <RichTextEditor
                    value={formData.missions}
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
                <CardTitle>Profil recherché</CardTitle>
                <CardDescription>
                  Définissez les compétences et qualifications requises
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="competencesRequises">Comp\u00e9tences requises</Label>
                    <RichTextEditor
                      value={formData.competencesRequises}
                      onChange={(value) => handleChange("competencesRequises", value)}
                      placeholder="Listez les comp\u00e9tences techniques et comportementales attendues..."
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
                <CardTitle>Conditions de travail</CardTitle>
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
                        <SelectValue placeholder="S\u00e9lectionner un type" />
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
                      <Label htmlFor="dureeContrat">Dur\u00e9e du contrat</Label>
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
                <CardTitle>Localisation</CardTitle>
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
                          <SelectValue placeholder="S\u00e9lectionner une ville" />
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
                        placeholder="S\u00e9lectionnez d'abord une r\u00e9gion"
                        disabled={!formData.region}
                        required
                      />
                    )}
                    {!formData.region && (
                      <p className="text-xs text-gray-500">
                        Veuillez d'abord s\u00e9lectionner une r\u00e9gion
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Dates importantes</CardTitle>
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
                onClick={() => setLocation("/employeur/dashboard")}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  "Publier l'offre"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
