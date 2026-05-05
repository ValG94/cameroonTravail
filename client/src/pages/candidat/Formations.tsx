import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { GraduationCap, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface FormationForm {
  id?: number;
  diplome: string;
  etablissement: string;
  ville: string;
  pays: string;
  dateDebut: string;
  dateFin: string;
  enCours: boolean;
  domaine: string;
  description: string;
}

export default function CandidatFormations() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState<FormationForm | null>(null);
  const [formData, setFormData] = useState<FormationForm>({
    diplome: "",
    etablissement: "",
    ville: "",
    pays: "Cameroun",
    dateDebut: "",
    dateFin: "",
    enCours: false,
    domaine: "",
    description: "",
  });

  const { data: formations, isLoading } = trpc.candidat.getFormations.useQuery();

  const createMutation = trpc.candidat.createFormation.useMutation({
    onSuccess: async () => {
      toast.success("Formation ajoutée avec succès !");
      await utils.candidat.getFormations.invalidate();
      await utils.candidat.getProfile.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.candidat.updateFormation.useMutation({
    onSuccess: async () => {
      toast.success("Formation modifiée avec succès !");
      await utils.candidat.getFormations.invalidate();
      await utils.candidat.getProfile.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.candidat.deleteFormation.useMutation({
    onSuccess: async () => {
      toast.success("Formation supprimée avec succès !");
      await utils.candidat.getFormations.invalidate();
      await utils.candidat.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const resetForm = () => {
    setFormData({
      diplome: "",
      etablissement: "",
      ville: "",
      pays: "Cameroun",
      dateDebut: "",
      dateFin: "",
      enCours: false,
      domaine: "",
      description: "",
    });
    setEditingFormation(null);
  };

  const handleOpenDialog = (formation?: any) => {
    if (formation) {
      setEditingFormation(formation);
      setFormData({
        id: formation.id,
        diplome: formation.diplome,
        etablissement: formation.etablissement,
        ville: formation.ville || "",
        pays: formation.pays || "Cameroun",
        dateDebut: formation.dateDebut ? new Date(formation.dateDebut).toISOString().split("T")[0] : "",
        dateFin: formation.dateFin ? new Date(formation.dateFin).toISOString().split("T")[0] : "",
        enCours: formation.enCours || false,
        domaine: formation.domaine || "",
        description: formation.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      diplome: formData.diplome,
      etablissement: formData.etablissement,
      ville: formData.ville,
      pays: formData.pays,
      dateDebut: new Date(formData.dateDebut),
      dateFin: formData.enCours || !formData.dateFin ? undefined : new Date(formData.dateFin),
      enCours: formData.enCours,
      domaine: formData.domaine,
      description: formData.description,
    };

    if (editingFormation && formData.id) {
      await updateMutation.mutateAsync({ id: formData.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      await deleteMutation.mutateAsync({ id });
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("education.title")}
            </h1>
            <p className="text-gray-600">
              Gérez vos formations et diplômes
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-5 w-5" />
            {t("education.add")}
          </Button>
        </div>

        {formations && formations.length > 0 ? (
          <div className="space-y-4">
            {formations.map((formation) => (
              <Card key={formation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-purple-600" />
                        {formation.diplome}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {formation.etablissement} • {formation.ville}, {formation.pays}
                      </CardDescription>
                      {formation.domaine && (
                        <p className="text-sm text-gray-600 mt-1">
                          Domaine: {formation.domaine}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(formation.dateDebut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        {" - "}
                        {formation.enCours
                          ? "En cours"
                          : formation.dateFin
                          ? new Date(formation.dateFin).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                          : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(formation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(formation.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {formation.description && (
                  <CardContent>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{formation.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune formation
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre première formation
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-5 w-5" />
                {t("education.add")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFormation ? "Modifier la formation" : "Ajouter une formation"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations sur votre formation
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diplome">
                    {t("education.degree")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="diplome"
                    value={formData.diplome}
                    onChange={(e) => setFormData({ ...formData, diplome: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="etablissement">
                    {t("education.institution")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="etablissement"
                    value={formData.etablissement}
                    onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domaine">{t("education.field")}</Label>
                <Input
                  id="domaine"
                  value={formData.domaine}
                  onChange={(e) => setFormData({ ...formData, domaine: e.target.value })}
                  placeholder="Ex: Informatique, Gestion, Marketing..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ville">{t("profile.city")}</Label>
                  <Input
                    id="ville"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pays">Pays</Label>
                  <Input
                    id="pays"
                    value={formData.pays}
                    onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateDebut">
                    {t("education.startDate")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateDebut"
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFin">{t("education.endDate")}</Label>
                  <Input
                    id="dateFin"
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                    disabled={formData.enCours}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enCours"
                  checked={formData.enCours}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, enCours: checked as boolean, dateFin: "" })
                  }
                />
                <Label htmlFor="enCours" className="cursor-pointer">
                  {t("education.current")}
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("education.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez votre formation, vos projets, vos réalisations..."
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending
                  ? t("common.loading")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
