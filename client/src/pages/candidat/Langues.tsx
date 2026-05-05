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

type NiveauLangue = "debutant" | "intermediaire" | "courant" | "bilingue" | "langue_maternelle";

interface LangueForm {
  nom: string;
  niveauOral: NiveauLangue;
  niveauEcrit: NiveauLangue;
}

export default function CandidatLangues() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: langues, isLoading } = trpc.candidat.getLangues.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.candidat.createLangue.useMutation({
    onSuccess: () => {
      toast.success("Langue ajoutée avec succès");
      utils.candidat.getLangues.invalidate();
      setIsAdding(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.candidat.updateLangue.useMutation({
    onSuccess: () => {
      toast.success("Langue mise à jour avec succès");
      utils.candidat.getLangues.invalidate();
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.candidat.deleteLangue.useMutation({
    onSuccess: () => {
      toast.success("Langue supprimée avec succès");
      utils.candidat.getLangues.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<LangueForm>({
    nom: "",
    niveauOral: "intermediaire",
    niveauEcrit: "intermediaire",
  });

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const resetForm = () => {
    setFormData({
      nom: "",
      niveauOral: "intermediaire",
      niveauEcrit: "intermediaire",
    });
  };

  const handleEdit = (langue: any) => {
    setEditingId(langue.id);
    setFormData({
      nom: langue.nom,
      niveauOral: langue.niveauOral,
      niveauEcrit: langue.niveauEcrit,
    });
    setIsAdding(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim()) {
      toast.error("Le nom de la langue est requis");
      return;
    }

    const data = {
      nom: formData.nom.trim(),
      niveauOral: formData.niveauOral,
      niveauEcrit: formData.niveauEcrit,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette langue ?")) {
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

  const niveauxLabels: Record<NiveauLangue, string> = {
    debutant: "Débutant",
    intermediaire: "Intermédiaire",
    courant: "Courant",
    bilingue: "Bilingue",
    langue_maternelle: "Langue maternelle",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mes Langues
            </h1>
            <p className="text-gray-600">
              Gérez les langues que vous parlez et écrivez
            </p>
          </div>
          {!isAdding && !editingId && (
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une langue
            </Button>
          )}
        </div>

        {/* Formulaire d'ajout/modification */}
        {(isAdding || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingId ? "Modifier la langue" : "Ajouter une langue"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom de la langue *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="Ex: Français, Anglais, Espagnol..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="niveauOral">Niveau oral *</Label>
                    <Select
                      value={formData.niveauOral}
                      onValueChange={(value: NiveauLangue) => setFormData({ ...formData, niveauOral: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debutant">Débutant</SelectItem>
                        <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                        <SelectItem value="courant">Courant</SelectItem>
                        <SelectItem value="bilingue">Bilingue</SelectItem>
                        <SelectItem value="langue_maternelle">Langue maternelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="niveauEcrit">Niveau écrit *</Label>
                    <Select
                      value={formData.niveauEcrit}
                      onValueChange={(value: NiveauLangue) => setFormData({ ...formData, niveauEcrit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debutant">Débutant</SelectItem>
                        <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                        <SelectItem value="courant">Courant</SelectItem>
                        <SelectItem value="bilingue">Bilingue</SelectItem>
                        <SelectItem value="langue_maternelle">Langue maternelle</SelectItem>
                      </SelectContent>
                    </Select>
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

        {/* Liste des langues */}
        <div className="space-y-4">
          {langues && langues.length > 0 ? (
            langues.map((langue) => (
              <Card key={langue.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {langue.nom}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Niveau oral:</span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {niveauxLabels[langue.niveauOral as NiveauLangue]}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Niveau écrit:</span>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {niveauxLabels[langue.niveauEcrit as NiveauLangue]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(langue)}
                        disabled={editingId !== null || isAdding}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(langue.id)}
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
                <p className="text-gray-500 mb-4">Aucune langue ajoutée pour le moment</p>
                {!isAdding && (
                  <Button onClick={() => setIsAdding(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter votre première langue
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
