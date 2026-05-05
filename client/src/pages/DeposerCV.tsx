import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Sparkles,
  Palette,
  Star,
  CheckCircle,
  Trash2,
  Eye,
  EyeOff,
  Download,
  Plus,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const TEMPLATES = [
  {
    id: "classique",
    label: "CV Classique",
    description:
      "Mise en page professionnelle et épurée. Idéal pour les secteurs formels, la fonction publique et les grandes entreprises.",
    features: ["Photo optionnelle", "Bilingue FR/EN", "Téléchargement PDF", "Profil public"],
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
    badge: "Gratuit",
    badgeColor: "bg-emerald-100 text-emerald-700",
    route: "/cv/classique",
  },
  {
    id: "moderne",
    label: "CV Moderne",
    description:
      "Design contemporain avec colonne latérale colorée. Parfait pour se démarquer dans les secteurs créatifs et tech.",
    features: ["Couleur personnalisable", "Mise en page bicolonne", "Téléchargement PDF", "Profil public"],
    icon: Palette,
    color: "from-violet-500 to-purple-600",
    badge: "Gratuit",
    badgeColor: "bg-violet-100 text-violet-700",
    route: "/cv/moderne",
  },
  {
    id: "creatif",
    label: "CV Créatif",
    description:
      "Importez votre propre CV au format PDF ou image. Idéal si vous avez déjà un CV personnalisé à partager.",
    features: ["Import PDF / Image", "Visible dans la CVthèque", "Téléchargement direct"],
    icon: Upload,
    color: "from-orange-500 to-amber-600",
    badge: "Upload",
    badgeColor: "bg-orange-100 text-orange-700",
    route: null, // handled inline
  },
];

export default function DeposerCV() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: cvList, refetch } = trpc.cv.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createCvMutation = trpc.cv.create.useMutation({
    onSuccess: () => {
      toast.success("CV importé avec succès !");
      setUploadFile(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      toast.success("CV supprimé");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const setActifMutation = trpc.cv.setActif.useMutation({
    onSuccess: () => {
      toast.success("CV actif mis à jour");
      refetch();
    },
  });

  const toggleVisibiliteMutation = trpc.cv.toggleVisibiliteCVtheque.useMutation({
    onSuccess: (data) => {
      toast.success(data.visible ? "CV visible dans la CVthèque" : "CV masqué de la CVthèque");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
          <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md text-center">
            <Lock className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connexion requise</h2>
            <p className="text-gray-500 mb-6">
              Vous devez être connecté en tant que candidat pour déposer votre CV.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
              onClick={() => navigate("/connexion")}
            >
              Se connecter
            </Button>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Format non supporté. Utilisez PDF, JPG ou PNG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 5 Mo)");
      return;
    }
    setUploadFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch("/api/upload-cv", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erreur lors de l'upload");
      const { url, key } = await res.json();
      await createCvMutation.mutateAsync({
        nom: uploadFile.name.replace(/\.[^.]+$/, ""),
        type: "creatif",
        fileUrl: url,
        fileKey: key,
        langue: "fr",
      });
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const typeLabel: Record<string, string> = {
    classique: "Classique",
    moderne: "Moderne",
    creatif: "Créatif",
    upload: "Importé",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Déposez votre CV</h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
            Créez un CV professionnel avec nos modèles ou importez le vôtre. Votre CV sera visible
            par les recruteurs dans la CVthèque Cameroon Travail.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Mes CVs */}
        {user && cvList && cvList.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-600" />
              Mes CV ({cvList.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvList.map((cv) => (
                <Card
                  key={cv.id}
                  className={`border-2 transition-all ${
                    cv.actif ? "border-emerald-400 shadow-md" : "border-gray-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{cv.nom}</p>
                        <p className="text-sm text-gray-500">{formatDate(cv.createdAt)}</p>
                      </div>
                      {cv.actif && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs ml-2 shrink-0">
                          Actif
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mb-3">
                      {typeLabel[cv.type] || cv.type}
                    </Badge>
                    {/* Interrupteur visibilité CVthèque */}
                    <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-1.5">
                        {cv.visibleCVtheque ? (
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-600">
                          {cv.visibleCVtheque ? "Visible dans la CVthèque" : "Masqué de la CVthèque"}
                        </span>
                      </div>
                      <Switch
                        checked={!!cv.visibleCVtheque}
                        onCheckedChange={(checked) =>
                          toggleVisibiliteMutation.mutate({ cvId: cv.id, visible: checked })
                        }
                        disabled={toggleVisibiliteMutation.isPending}
                        className="scale-75"
                      />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {!cv.actif && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => setActifMutation.mutate({ cvId: cv.id })}
                        >
                          <Star className="w-3 h-3 mr-1" /> Activer
                        </Button>
                      )}
                      {cv.type !== "creatif" && cv.type !== "upload" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => navigate(`/cv/${cv.type}?id=${cv.id}`)}
                        >
                          <Eye className="w-3 h-3 mr-1" /> Modifier
                        </Button>
                      )}
                      {cv.fileUrl && (
                        <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="text-xs">
                            <Download className="w-3 h-3 mr-1" /> Voir
                          </Button>
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm("Supprimer ce CV ?"))
                            deleteMutation.mutate({ cvId: cv.id });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Choisir un modèle */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {cvList && cvList.length > 0 ? "Créer un nouveau CV" : "Choisissez votre modèle"}
          </h2>
          <p className="text-gray-500 mb-8">
            Sélectionnez le modèle qui correspond le mieux à votre profil et au poste visé.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <Card
                  key={tpl.id}
                  className="border-2 border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                  onClick={() => {
                    if (tpl.route) navigate(tpl.route);
                    else fileInputRef.current?.click();
                  }}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Icon header */}
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tpl.color} flex items-center justify-center mb-4 shadow-md`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{tpl.label}</h3>
                      <Badge className={`text-xs ${tpl.badgeColor}`}>{tpl.badge}</Badge>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{tpl.description}</p>

                    <ul className="space-y-1 mb-5 flex-1">
                      {tpl.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full bg-gradient-to-r ${tpl.color} text-white hover:opacity-90 group-hover:shadow-md transition-all mt-auto`}
                    >
                      {tpl.id === "creatif" ? (
                        <>
                          <Upload className="w-4 h-4 mr-2" /> Importer mon CV
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" /> Créer ce CV
                          <ArrowRight className="w-4 h-4 ml-auto" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Upload zone for Créatif */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileChange}
          />

          {uploadFile && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-4">
              <FileText className="w-8 h-8 text-orange-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{uploadFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadFile.size / 1024 / 1024).toFixed(2)} Mo
                </p>
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleUploadSubmit}
                disabled={uploading}
              >
                {uploading ? "Import en cours..." : "Confirmer l'import"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setUploadFile(null)}>
                <Trash2 className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          )}
        </div>

        {/* Info CVthèque */}
        <div className="mt-12 bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex gap-4">
          <Sparkles className="w-8 h-8 text-emerald-500 shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-gray-800 mb-1">Votre CV dans la CVthèque</h3>
            <p className="text-sm text-gray-600">
              Votre CV actif sera automatiquement visible par les recruteurs dans la CVthèque
              Cameroon Travail. Vous pouvez à tout moment désactiver cette visibilité depuis votre
              profil candidat.
            </p>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
