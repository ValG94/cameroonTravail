import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

type NiveauCompetence = "debutant" | "intermediaire" | "avance" | "expert";

interface CompetenceForm {
  nom: string;
  niveau: NiveauCompetence;
  categorie: string;
  anneesExperience: number | null;
}

export default function CandidatCompetences() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: competences, isLoading } = trpc.candidat.getCompetences.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.candidat.createCompetence.useMutation({
    onSuccess: () => {
      toast.success("Compétence ajoutée avec succès");
      utils.candidat.getCompetences.invalidate();
      setIsAdding(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.candidat.updateCompetence.useMutation({
    onSuccess: () => {
      toast.success("Compétence mise à jour avec succès");
      utils.candidat.getCompetences.invalidate();
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.candidat.deleteCompetence.useMutation({
    onSuccess: () => {
      toast.success("Compétence supprimée avec succès");
      utils.candidat.getCompetences.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CompetenceForm>({
    nom: "",
    niveau: "intermediaire",
    categorie: "",
    anneesExperience: null,
  });

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const resetForm = () => {
    setFormData({
      nom: "",
      niveau: "intermediaire",
      categorie: "",
      anneesExperience: null,
    });
  };

  const handleEdit = (competence: any) => {
    setEditingId(competence.id);
    setFormData({
      nom: competence.nom,
      niveau: competence.niveau,
      categorie: competence.categorie || "",
      anneesExperience: competence.anneesExperience,
    });
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error("Le nom de la compétence est requis");
      return;
    }

    const data = {
      nom: formData.nom.trim(),
      niveau: formData.niveau,
      categorie: formData.categorie.trim() || undefined,
      anneesExperience: formData.anneesExperience || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette compétence ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
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

  const niveauxLabels: Record<NiveauCompetence, string> = {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    avance: "Avancé",
    expert: "Expert",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes Compétences
            </h1>
            <p className="text-gray-600">
              Gérez vos compétences professionnelles et techniques
            </p>
          </div>
          {!isAdding && !editingId && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une compétence
            </Button>
          )}
        </div>

        {/* Formulaire d'ajout/modification */}
        {(isAdding || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingId ? "Modifier la compétence" : "Ajouter une compétence"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom de la compétence *</Label>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Ex: JavaScript, Gestion de projet..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niveau">Niveau *</Label>
                    <Select
                      value={formData.niveau}
                      onValueChange={(value: NiveauCompetence) => setFormData({ ...formData, niveau: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debutant">Débutant</SelectItem>
                        <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                        <SelectItem value="avance">Avancé</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Input
                      id="categorie"
                      value={formData.categorie}
                      onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                      placeholder="Ex: Programmation, Management..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anneesExperience">Années d'expérience</Label>
                    <Input
                      id="anneesExperience"
                      type="number"
                      min="0"
                      value={formData.anneesExperience || ""}
                      onChange={(e) => setFormData({ ...formData, anneesExperience: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Ex: 3"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingId ? "Mettre à jour" : "Ajouter"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Liste des compétences */}
        <div className="space-y-4">
          {competences && competences.length > 0 ? (
            competences.map((competence) => (
              <Card key={competence.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {competence.nom}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {niveauxLabels[competence.niveau as NiveauCompetence]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {competence.categorie && (
                          <div>
                            <span className="font-medium">Catégorie:</span> {competence.categorie}
                          </div>
                        )}
                        {competence.anneesExperience !== null && (
                          <div>
                            <span className="font-medium">Expérience:</span> {competence.anneesExperience} an{competence.anneesExperience > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(competence)}
                        disabled={editingId !== null || isAdding}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(competence.id)}
                        disabled={deleteMutation.isPending || editingId !== null || isAdding}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 mb-4">Aucune compétence ajoutée pour le moment</p>
                {!isAdding && (
                  <Button onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter votre première compétence
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
