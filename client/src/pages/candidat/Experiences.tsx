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
import { Briefcase, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface ExperienceForm {
  id?: number;
  poste: string;
  entreprise: string;
  ville: string;
  pays: string;
  dateDebut: string;
  dateFin: string;
  enCours: boolean;
  description: string;
  competencesAcquises: string;
}

export default function CandidatExperiences() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<ExperienceForm | null>(null);
  const [formData, setFormData] = useState<ExperienceForm>({
    poste: "",
    entreprise: "",
    ville: "",
    pays: "Cameroun",
    dateDebut: "",
    dateFin: "",
    enCours: false,
    description: "",
    competencesAcquises: "",
  });

  const { data: experiences, isLoading } = trpc.candidat.getExperiences.useQuery();

  const createMutation = trpc.candidat.createExperience.useMutation({
    onSuccess: async () => {
      toast.success("Expérience ajoutée avec succès !");
      await utils.candidat.getExperiences.invalidate();
      await utils.candidat.getProfile.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.candidat.updateExperience.useMutation({
    onSuccess: async () => {
      toast.success("Expérience modifiée avec succès !");
      await utils.candidat.getExperiences.invalidate();
      await utils.candidat.getProfile.invalidate();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.candidat.deleteExperience.useMutation({
    onSuccess: async () => {
      toast.success("Expérience supprimée avec succès !");
      await utils.candidat.getExperiences.invalidate();
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
      poste: "",
      entreprise: "",
      ville: "",
      pays: "Cameroun",
      dateDebut: "",
      dateFin: "",
      enCours: false,
      description: "",
      competencesAcquises: "",
    });
    setEditingExperience(null);
  };

  const handleOpenDialog = (experience?: any) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        id: experience.id,
        poste: experience.poste,
        entreprise: experience.entreprise,
        ville: experience.ville || "",
        pays: experience.pays || "Cameroun",
        dateDebut: experience.dateDebut ? new Date(experience.dateDebut).toISOString().split("T")[0] : "",
        dateFin: experience.dateFin ? new Date(experience.dateFin).toISOString().split("T")[0] : "",
        enCours: experience.enCours || false,
        description: experience.description || "",
        competencesAcquises: experience.competencesAcquises || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      poste: formData.poste,
      entreprise: formData.entreprise,
      ville: formData.ville,
      pays: formData.pays,
      dateDebut: new Date(formData.dateDebut),
      dateFin: formData.enCours || !formData.dateFin ? undefined : new Date(formData.dateFin),
      enCours: formData.enCours,
      description: formData.description,
      competencesAcquises: formData.competencesAcquises,
    };

    if (editingExperience && formData.id) {
      await updateMutation.mutateAsync({ id: formData.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) {
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
              {t("experience.title")}
            </h1>
            <p className="text-gray-600">
              Gérez vos expériences professionnelles
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-5 w-5" />
            {t("experience.add")}
          </Button>
        </div>

        {experiences && experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.map((exp) => (
              <Card key={exp.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        {exp.poste}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {exp.entreprise} • {exp.ville}, {exp.pays}
                      </CardDescription>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(exp.dateDebut).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                        {" - "}
                        {exp.enCours
                          ? "Présent"
                          : exp.dateFin
                          ? new Date(exp.dateFin).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
                          : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(exp)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(exp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(exp.description || exp.competencesAcquises) && (
                  <CardContent>
                    {exp.description && (
                      <div className="mb-3">
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Description</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{exp.description}</p>
                      </div>
                    )}
                    {exp.competencesAcquises && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Compétences acquises</h4>
                        <p className="text-sm text-gray-600">{exp.competencesAcquises}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune expérience professionnelle
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par ajouter votre première expérience professionnelle
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-5 w-5" />
                {t("experience.add")}
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
              {editingExperience ? "Modifier l'expérience" : "Ajouter une expérience"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations sur votre expérience professionnelle
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poste">
                    {t("experience.position")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="poste"
                    value={formData.poste}
                    onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entreprise">
                    {t("experience.company")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="entreprise"
                    value={formData.entreprise}
                    onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                    required
                  />
                </div>
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
                    {t("experience.startDate")} <span className="text-red-500">*</span>
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
                  <Label htmlFor="dateFin">{t("experience.endDate")}</Label>
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
                  {t("experience.current")}
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("experience.description")}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder="Décrivez vos missions et responsabilités..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="competencesAcquises">{t("experience.skills")}</Label>
                <Textarea
                  id="competencesAcquises"
                  value={formData.competencesAcquises}
                  onChange={(e) => setFormData({ ...formData, competencesAcquises: e.target.value })}
                  rows={3}
                  placeholder="Listez les compétences acquises durant cette expérience..."
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
