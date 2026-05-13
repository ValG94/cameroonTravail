import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Award,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Languages,
  Loader2,
  Upload,
  User,
  Sparkles,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";

interface ExtractedData {
  prenom?: string;
  nom?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  ville?: string;
  region?: string;
  dateNaissance?: string;
  nationalite?: string;
  experiences: any[];
  formations: any[];
  competences: any[];
  langues: any[];
}

export default function CandidatCV() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const { data: profile } = trpc.candidat.getProfile.useQuery();

  // Lister les CV du module builder
  const { data: cvList, refetch: refetchCvList } = trpc.cv.list.useQuery();
  const deleteCvMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      toast.success("CV supprimé !");
      refetchCvList();
    },
    onError: (e) => toast.error(e.message),
  });
  const toggleVisibiliteMutation = trpc.cv.toggleVisibiliteCVtheque.useMutation({
    onSuccess: (data) => {
      toast.success(data.visible ? "CV visible dans la CVthèque" : "CV masqué de la CVthèque");
      refetchCvList();
    },
    onError: (e) => toast.error(e.message),
  });

  const uploadCVMutation = trpc.candidat.uploadCV.useMutation({
    onSuccess: async (result) => {
      toast.success("CV uploadé et analysé avec succès !");
      setExtractedData(result.extractedData);
      setIsExtracting(false);
      await utils.candidat.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsExtracting(false);
    },
  });

  const updateProfileMutation = trpc.candidat.updateProfile.useMutation();
  const createExperienceMutation = trpc.candidat.createExperience.useMutation();
  const createFormationMutation = trpc.candidat.createFormation.useMutation();
  const createCompetenceMutation = trpc.candidat.createCompetence.useMutation();
  const createLangueMutation = trpc.candidat.createLangue.useMutation();

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Format de fichier non supporté. Utilisez PDF ou Word (.docx)");
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    setExtractedData(null);

    try {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(",")[1]; // Enlever le préfixe data:...

        await uploadCVMutation.mutateAsync({
          fileData: base64Data,
          fileName: selectedFile.name,
          mimeType: selectedFile.type,
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Error uploading CV:", error);
    }
  };

  const handleSaveExtractedData = async () => {
    if (!extractedData) return;

    try {
      // Mettre à jour le profil
      if (extractedData.prenom || extractedData.nom || extractedData.telephone) {
        await updateProfileMutation.mutateAsync({
          prenom: extractedData.prenom,
          nom: extractedData.nom,
          telephone: extractedData.telephone,
          adresse: extractedData.adresse,
          ville: extractedData.ville,
          region: extractedData.region,
          nationalite: extractedData.nationalite,
        });
      }

      // Créer les expériences
      for (const exp of extractedData.experiences) {
        await createExperienceMutation.mutateAsync({
          poste: exp.poste,
          entreprise: exp.entreprise,
          ville: exp.ville,
          pays: exp.pays,
          dateDebut: new Date(exp.dateDebut),
          dateFin: exp.dateFin ? new Date(exp.dateFin) : undefined,
          enCours: exp.enCours,
          description: exp.description,
          competencesAcquises: exp.competencesAcquises,
        });
      }

      // Créer les formations
      for (const formation of extractedData.formations) {
        await createFormationMutation.mutateAsync({
          diplome: formation.diplome,
          etablissement: formation.etablissement,
          ville: formation.ville,
          pays: formation.pays,
          dateDebut: new Date(formation.dateDebut),
          dateFin: formation.dateFin ? new Date(formation.dateFin) : undefined,
          enCours: formation.enCours,
          domaine: formation.domaine,
          description: formation.description,
        });
      }

      // Créer les compétences
      for (const competence of extractedData.competences) {
        await createCompetenceMutation.mutateAsync({
          nom: competence.nom,
          niveau: competence.niveau || "intermediaire",
          categorie: competence.categorie,
        });
      }

      // Créer les langues
      for (const langue of extractedData.langues) {
        await createLangueMutation.mutateAsync({
          nom: langue.nom,
          niveauOral: langue.niveauOral || "intermediaire",
          niveauEcrit: langue.niveauEcrit || "intermediaire",
        });
      }

      toast.success("Toutes les données ont été enregistrées avec succès !");
      setLocation("/candidat/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (authLoading) {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("profile.uploadCV")}
          </h1>
          <p className="text-gray-600">
            Téléchargez votre CV et laissez l'IA extraire automatiquement vos informations
          </p>
        </div>

        {/* Bannière vers le nouveau module CV Builder */}
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800">Créez un CV professionnel en ligne</p>
              <p className="text-sm text-emerald-600">Choisissez un modèle Classique ou Moderne, personnalisez et téléchargez en PDF</p>
            </div>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
            onClick={() => setLocation("/deposer-cv")}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Créer mon CV
          </Button>
        </div>

        {/* Liste des CV du builder */}
        {cvList && cvList.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Mes CV créés</CardTitle>
              <CardDescription>Gérez vos CV créés avec le builder</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cvList.map((cv) => (
                  <div key={cv.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${cv.type === 'premium' ? 'text-amber-500' : 'text-emerald-600'}`} />
                      <div>
                        <p className="font-medium text-gray-800">{cv.nom}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            cv.type === 'classique' ? 'bg-blue-100 text-blue-700' :
                            cv.type === 'moderne' ? 'bg-violet-100 text-violet-700' :
                            cv.type === 'creatif' ? 'bg-orange-100 text-orange-700' :
                            cv.type === 'premium' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {cv.type === 'premium' ? '👑 Premium' : cv.type.charAt(0).toUpperCase() + cv.type.slice(1)}
                          </span>
                          {cv.actif && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                              Actif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Interrupteur visibilité CVthèque */}
                      <div className="flex items-center gap-1.5 border rounded-lg px-2 py-1 bg-white">
                        {cv.visibleCVtheque ? (
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-600 hidden sm:inline">CVthèque</span>
                        <Switch
                          checked={!!cv.visibleCVtheque}
                          onCheckedChange={(checked) =>
                            toggleVisibiliteMutation.mutate({ cvId: cv.id, visible: checked })
                          }
                          disabled={toggleVisibiliteMutation.isPending}
                          className="scale-75"
                        />
                      </div>
                      {(cv.type === 'classique' || cv.type === 'moderne') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setLocation(`/cv/${cv.type}?id=${cv.id}`)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Modifier
                        </Button>
                      )}
                      {cv.type === 'premium' && cv.premiumTemplateSlug && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                          onClick={() => setLocation(`/candidat/cv-premium/${cv.premiumTemplateSlug}`)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" /> Modifier
                        </Button>
                      )}
                      {cv.fileUrl && (
                        <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="text-xs">
                            Voir
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm(`Supprimer le CV "${cv.nom}" ?`)) {
                            deleteCvMutation.mutate({ cvId: cv.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        {!extractedData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Télécharger votre CV</CardTitle>
              <CardDescription>
                Formats acceptés: PDF, Word (.docx) - Taille maximale: 10MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cv-file">Sélectionnez votre CV</Label>
                  <Input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    disabled={isExtracting}
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isExtracting}
                  className="w-full"
                  size="lg"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Analyser mon CV
                    </>
                  )}
                </Button>

                {profile?.cvUrl && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Vous avez déjà un CV enregistré</span>
                    </div>
                    <a
                      href={profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-600 hover:underline mt-1 block"
                    >
                      Voir mon CV actuel
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracted Data Preview */}
        {extractedData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  Données extraites avec succès !
                </CardTitle>
                <CardDescription>
                  Vérifiez les informations ci-dessous et modifiez-les si nécessaire avant de les enregistrer
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Informations personnelles */}
            {(extractedData.prenom || extractedData.nom) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Informations personnelles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {extractedData.prenom && (
                      <div>
                        <span className="font-medium">Prénom:</span> {extractedData.prenom}
                      </div>
                    )}
                    {extractedData.nom && (
                      <div>
                        <span className="font-medium">Nom:</span> {extractedData.nom}
                      </div>
                    )}
                    {extractedData.telephone && (
                      <div>
                        <span className="font-medium">Téléphone:</span> {extractedData.telephone}
                      </div>
                    )}
                    {extractedData.ville && (
                      <div>
                        <span className="font-medium">Ville:</span> {extractedData.ville}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expériences */}
            {extractedData.experiences.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">
                      Expériences professionnelles ({extractedData.experiences.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {extractedData.experiences.map((exp, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-md">
                        <div className="font-medium text-gray-900">{exp.poste}</div>
                        <div className="text-sm text-gray-600">{exp.entreprise}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {exp.dateDebut} - {exp.dateFin || "Présent"}
                        </div>
                        {exp.description && (
                          <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formations */}
            {extractedData.formations.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">
                      Formations ({extractedData.formations.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {extractedData.formations.map((formation, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-md">
                        <div className="font-medium text-gray-900">{formation.diplome}</div>
                        <div className="text-sm text-gray-600">{formation.etablissement}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formation.dateDebut} - {formation.dateFin || "Présent"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compétences */}
            {extractedData.competences.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">
                      Compétences ({extractedData.competences.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.competences.map((comp, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                      >
                        {comp.nom}
                        {comp.niveau && ` (${comp.niveau})`}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Langues */}
            {extractedData.langues.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-lg">
                      Langues ({extractedData.langues.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {extractedData.langues.map((langue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="font-medium">{langue.nom}</span>
                        <div className="text-sm text-gray-600">
                          Oral: {langue.niveauOral} | Écrit: {langue.niveauEcrit}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleSaveExtractedData} size="lg" className="flex-1">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Enregistrer toutes les données
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setExtractedData(null);
                  setSelectedFile(null);
                }}
                size="lg"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
