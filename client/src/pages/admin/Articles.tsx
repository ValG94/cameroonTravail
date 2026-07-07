import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import MDEditor from "@uiw/react-md-editor";
import {
  ArrowLeft,
  ArrowRightLeft,
  Calendar,
  Camera,
  Check,
  Edit3,
  Eye,
  ImagePlus,
  Languages,
  Loader2,
  Pencil,
  Plus,
  Save,
  Star,
  StarOff,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Page /admin/articles — CRUD bilingue premium des articles conseils.
 *
 * Modes :
 *  - Liste (?mode=list ou pas de param) : table filtrable + bouton "Nouvel article"
 *  - Édition (?mode=edit&id=42) : formulaire bilingue avec tabs FR / EN
 *  - Création (?mode=new) : formulaire vierge
 *
 * Formulaire :
 *  - Tabs FR / EN au-dessus des champs contenu (titre / slug / excerpt / content)
 *  - Bouton "Traduire vers EN" (visible sur tab FR) / "Traduire vers FR" (tab EN)
 *  - Sidebar droite : catégorie, auteur, temps de lecture, status, featured,
 *    publishedAt, upload cover + preview + alt text
 *  - CTAs bas : Enregistrer comme brouillon / Publier
 *
 * Bilinguisme :
 *  - FR = source obligatoire (titre, slug, excerpt, content)
 *  - EN = optionnel (traduction assistée via admin.translateArticle,
 *    modifiable après génération, jamais publiée automatiquement)
 */

const C = {
  green: "#009B5A",
  deepGreen: "#063F24",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  goldSoft: "rgba(246, 195, 67, 0.15)",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
};

// Catégories — enum Zod côté serveur (avec accents pour compat existant)
const CATEGORIES = ["Entretien", "CV", "Marché", "Négociation", "Reconversion", "Freelance"] as const;
type Categorie = typeof CATEGORIES[number];

// Mapping catégorie → clé i18n (les libellés viennent de conseilsPage.categories.*)
const CAT_I18N_KEY: Record<Categorie, string> = {
  Entretien: "Entretien",
  CV: "CV",
  "Marché": "Marche",
  "Négociation": "Negociation",
  Reconversion: "Reconversion",
  Freelance: "Freelance",
};

const READING_TIMES = ["3 min", "5 min", "7 min", "10 min", "15 min", "20 min"];

// Slugify : titre → slug URL-safe
function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

interface FormState {
  id?: number;
  // FR
  titre: string;
  slug: string;
  description: string;
  contenu: string;
  // EN
  titreEn: string;
  slugEn: string;
  descriptionEn: string;
  contenuEn: string;
  // Meta
  categorie: Categorie;
  auteur: string;
  tempsLecture: string;
  status: "draft" | "published";
  featured: boolean;
  imageUrl: string;
  imageAlt: string;
  datePublication: string;
}

const EMPTY_FORM: FormState = {
  titre: "",
  slug: "",
  description: "",
  contenu: "",
  titreEn: "",
  slugEn: "",
  descriptionEn: "",
  contenuEn: "",
  categorie: "Entretien",
  auteur: "",
  tempsLecture: "5 min",
  status: "draft",
  featured: false,
  imageUrl: "",
  imageAlt: "",
  datePublication: "",
};

export default function AdminArticles() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const utils = trpc.useUtils();

  // ─── Mode (list / new / edit) via query params ─────────────
  const params = new URLSearchParams(search);
  const mode = params.get("mode") || "list";
  const editId = params.get("id") ? Number(params.get("id")) : undefined;
  const isForm = mode === "new" || mode === "edit";

  return (
    <AdminLayout
      title={t("bo.adminArticles.title")}
      subtitle={t("bo.adminArticles.subtitle")}
      activeKey="articles"
      actions={
        !isForm ? (
          <Button
            className="h-10 rounded-lg text-white font-semibold hidden sm:inline-flex"
            style={{ backgroundColor: C.deepGreen }}
            onClick={() => setLocation("/admin/articles?mode=new")}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("bo.adminArticles.newArticle")}
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-10 rounded-lg hidden sm:inline-flex"
            onClick={() => setLocation("/admin/articles")}
            style={{ borderColor: C.border }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("bo.adminArticles.backToList")}
          </Button>
        )
      }
    >
      {isForm ? (
        <ArticleForm editId={editId} onDone={() => { setLocation("/admin/articles"); utils.admin.getArticles.invalidate(); }} />
      ) : (
        <ArticlesList
          onNew={() => setLocation("/admin/articles?mode=new")}
          onEdit={(id) => setLocation(`/admin/articles?mode=edit&id=${id}`)}
        />
      )}
    </AdminLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════
// LISTE des articles
// ═════════════════════════════════════════════════════════════════════

function ArticlesList({ onNew, onEdit }: { onNew: () => void; onEdit: (id: number) => void }) {
  const { t, i18n } = useTranslation();
  const utils = trpc.useUtils();
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = trpc.admin.getArticles.useQuery({ limit: 100, offset: 0 });

  const deleteMutation = trpc.admin.deleteArticle.useMutation({
    onSuccess: () => {
      toast.success(t("bo.adminArticles.list.deleted"));
      utils.admin.getArticles.invalidate();
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleFeaturedMutation = trpc.admin.toggleFeatured.useMutation({
    onSuccess: () => {
      utils.admin.getArticles.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.admin.updateArticle.useMutation({
    onSuccess: () => {
      utils.admin.getArticles.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const articles = useMemo(() => {
    const list = data?.articles ?? [];
    if (statusFilter === "all") return list;
    return list.filter((a: any) => (a.status || "published") === statusFilter);
  }, [data, statusFilter]);

  const dateLocale = i18n.language === "en" ? "en-GB" : "fr-FR";

  return (
    <>
      {/* Filtres + bouton nouveau (mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex gap-2">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
              style={{
                backgroundColor: statusFilter === s ? C.deepGreen : "#ffffff",
                color: statusFilter === s ? "#ffffff" : C.textMain,
                borderColor: statusFilter === s ? C.deepGreen : C.border,
              }}
            >
              {t(`bo.adminArticles.list.filter${s === "all" ? "All" : s === "published" ? "Published" : "Draft"}`)}
            </button>
          ))}
        </div>
        <div className="ml-auto sm:hidden">
          <Button
            onClick={onNew}
            className="rounded-lg text-white w-full"
            style={{ backgroundColor: C.deepGreen }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("bo.adminArticles.newArticle")}
          </Button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.green }} />
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16" style={{ color: C.textMuted }}>
            {t("bo.adminArticles.list.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <tr className="text-left text-[11.5px] uppercase tracking-wide font-bold" style={{ color: C.textMuted }}>
                  <th className="px-4 py-3 w-16">{t("bo.adminArticles.list.columns.image")}</th>
                  <th className="px-4 py-3">{t("bo.adminArticles.list.columns.title")}</th>
                  <th className="px-4 py-3 hidden md:table-cell">{t("bo.adminArticles.list.columns.category")}</th>
                  <th className="px-4 py-3 hidden md:table-cell">{t("bo.adminArticles.list.columns.language")}</th>
                  <th className="px-4 py-3 hidden lg:table-cell">{t("bo.adminArticles.list.columns.status")}</th>
                  <th className="px-4 py-3 hidden lg:table-cell">{t("bo.adminArticles.list.columns.date")}</th>
                  <th className="px-4 py-3 text-right">{t("bo.adminArticles.list.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((a: any) => {
                  const hasEn = !!(a.titreEn && a.contenuEn);
                  const currentStatus = (a.status || "published") as "draft" | "published";
                  return (
                    <tr key={a.id} className="border-t hover:bg-gray-50 transition-colors" style={{ borderColor: C.border }}>
                      {/* Image */}
                      <td className="px-4 py-3">
                        {a.imageUrl ? (
                          <img
                            src={a.imageUrl}
                            alt=""
                            className="w-12 h-9 rounded object-cover border"
                            style={{ borderColor: C.border }}
                          />
                        ) : (
                          <div
                            className="w-12 h-9 rounded flex items-center justify-center border"
                            style={{ backgroundColor: C.bg, borderColor: C.border }}
                          >
                            <ImagePlus className="w-4 h-4" style={{ color: C.textMuted }} />
                          </div>
                        )}
                      </td>
                      {/* Titre + featured badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="min-w-0">
                            <div className="font-semibold text-[13.5px] truncate max-w-[280px]" style={{ color: C.textMain }}>
                              {a.titre}
                            </div>
                            <div className="text-[11.5px] mt-0.5" style={{ color: C.textMuted }}>
                              {a.auteur}
                            </div>
                          </div>
                          {a.featured && (
                            <span
                              className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 border shrink-0"
                              style={{ backgroundColor: C.goldSoft, color: C.deepGreen, borderColor: C.gold }}
                            >
                              <Star className="h-2.5 w-2.5 inline mr-0.5" />
                              {t("bo.adminArticles.list.featured")}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Catégorie */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-[12px] font-medium" style={{ color: C.textMain }}>
                          {a.categorie}
                        </span>
                      </td>
                      {/* Langues */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex gap-1">
                          <span
                            className="text-[10px] font-bold rounded px-1.5 py-0.5 border"
                            style={{ backgroundColor: C.greenSoft, color: C.deepGreen, borderColor: "#A7D8B9" }}
                          >
                            {t("bo.adminArticles.list.badgeFr")}
                          </span>
                          <span
                            className="text-[10px] font-bold rounded px-1.5 py-0.5 border"
                            style={{
                              backgroundColor: hasEn ? C.greenSoft : "#F3F4F6",
                              color: hasEn ? C.deepGreen : C.textMuted,
                              borderColor: hasEn ? "#A7D8B9" : C.border,
                            }}
                          >
                            {t("bo.adminArticles.list.badgeEn")}
                          </span>
                        </div>
                      </td>
                      {/* Statut */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: a.id,
                              status: currentStatus === "published" ? "draft" : "published",
                            })
                          }
                          className="text-[11px] font-bold uppercase tracking-wide rounded px-2 py-1 border cursor-pointer transition-colors"
                          style={{
                            backgroundColor: currentStatus === "published" ? C.greenSoft : "#FDF2E3",
                            color: currentStatus === "published" ? C.deepGreen : "#8B5A00",
                            borderColor: currentStatus === "published" ? "#A7D8B9" : "#F6C343",
                          }}
                          title={t("bo.adminArticles.list.togglePublish")}
                        >
                          {currentStatus === "published"
                            ? t("bo.adminArticles.form.statusPublished")
                            : t("bo.adminArticles.form.statusDraft")}
                        </button>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 hidden lg:table-cell text-[12.5px]" style={{ color: C.textMuted }}>
                        {a.datePublication
                          ? new Date(a.datePublication).toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit", year: "numeric" })
                          : "—"}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => toggleFeaturedMutation.mutate({ id: a.id, featured: !a.featured })}
                            className="p-2 rounded hover:bg-gray-100"
                            aria-label={a.featured ? "Unfeature" : "Feature"}
                            title={a.featured ? "Retirer de la une" : "Mettre à la une"}
                          >
                            {a.featured ? (
                              <StarOff className="h-4 w-4" style={{ color: C.gold }} />
                            ) : (
                              <Star className="h-4 w-4" style={{ color: C.textMuted }} />
                            )}
                          </button>
                          <button
                            onClick={() => window.open(`/conseils/${a.slug}`, "_blank")}
                            className="p-2 rounded hover:bg-gray-100"
                            title={t("bo.adminArticles.list.view")}
                            aria-label="View"
                          >
                            <Eye className="h-4 w-4" style={{ color: C.textMuted }} />
                          </button>
                          <button
                            onClick={() => onEdit(a.id)}
                            className="p-2 rounded hover:bg-gray-100"
                            title={t("bo.adminArticles.list.edit")}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" style={{ color: C.green }} />
                          </button>
                          <button
                            onClick={() => setDeleteId(a.id)}
                            className="p-2 rounded hover:bg-red-50"
                            title={t("bo.adminArticles.list.delete")}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" style={{ color: "#DC2626" }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("bo.adminArticles.list.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("bo.adminArticles.list.confirmDeleteHint")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bo.adminArticles.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId !== null && deleteMutation.mutate({ id: deleteId })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("bo.adminArticles.list.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════
// FORMULAIRE bilingue (create / edit)
// ═════════════════════════════════════════════════════════════════════

function ArticleForm({ editId, onDone }: { editId?: number; onDone: () => void }) {
  const { t } = useTranslation();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeLang, setActiveLang] = useState<"fr" | "en">("fr");
  const [translating, setTranslating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState<"fr" | "en" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch article existant si édition
  const { data: existingList } = trpc.admin.getArticles.useQuery(
    { limit: 100, offset: 0 },
    { enabled: !!editId }
  );

  useEffect(() => {
    if (editId && existingList) {
      const found = existingList.articles.find((a: any) => a.id === editId);
      if (found) {
        setForm({
          id: found.id,
          titre: found.titre || "",
          slug: found.slug || "",
          description: found.description || "",
          contenu: found.contenu || "",
          titreEn: found.titreEn || "",
          slugEn: found.slugEn || "",
          descriptionEn: found.descriptionEn || "",
          contenuEn: found.contenuEn || "",
          categorie: (found.categorie as any) || "Entretien",
          auteur: found.auteur || "",
          tempsLecture: found.tempsLecture || "5 min",
          status: (found.status as any) || "published",
          featured: !!found.featured,
          imageUrl: found.imageUrl || "",
          imageAlt: found.imageAlt || "",
          datePublication: found.datePublication
            ? new Date(found.datePublication).toISOString().slice(0, 10)
            : "",
        });
      }
    }
  }, [editId, existingList]);

  // Auto-slug depuis le titre (uniquement si l'utilisateur n'a pas encore modifié le slug manuellement)
  const handleTitreChange = (value: string) => {
    setForm((f) => {
      const nextSlug = !f.slug || f.slug === slugify(f.titre) ? slugify(value) : f.slug;
      return { ...f, titre: value, slug: nextSlug };
    });
  };
  const handleTitreEnChange = (value: string) => {
    setForm((f) => {
      const nextSlug = !f.slugEn || f.slugEn === slugify(f.titreEn) ? slugify(value) : f.slugEn;
      return { ...f, titreEn: value, slugEn: nextSlug };
    });
  };

  // Mutations
  const createMutation = trpc.admin.createArticle.useMutation({
    onSuccess: () => {
      toast.success(t("bo.adminArticles.form.savedToast"));
      utils.admin.getArticles.invalidate();
      onDone();
    },
    onError: (err) => toast.error(err.message || t("bo.adminArticles.form.errorToast")),
  });

  const updateMutation = trpc.admin.updateArticle.useMutation({
    onSuccess: () => {
      toast.success(t("bo.adminArticles.form.savedToast"));
      utils.admin.getArticles.invalidate();
      onDone();
    },
    onError: (err) => toast.error(err.message || t("bo.adminArticles.form.errorToast")),
  });

  const translateMutation = trpc.admin.translateArticle.useMutation();

  const uploadMutation = trpc.admin.uploadArticleCover.useMutation();

  // ─── Upload cover ─────────────────────────────────────────
  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5MB)");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées");
      return;
    }
    setUploading(true);
    toast.info(t("bo.adminArticles.form.uploadingToast"));
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Read failed"));
        reader.readAsDataURL(file);
      });
      const fileData = base64.split(",")[1];
      const result = await uploadMutation.mutateAsync({
        fileData,
        fileName: file.name,
        mimeType: file.type,
      });
      setForm((f) => ({ ...f, imageUrl: result.url }));
      toast.success(t("bo.adminArticles.form.uploadedToast"));
    } catch (err: any) {
      toast.error(err?.message || t("bo.adminArticles.form.uploadErrorToast"));
    } finally {
      setUploading(false);
    }
  };

  // ─── Traduction assistée ──────────────────────────────────
  const doTranslate = async (target: "fr" | "en") => {
    const source = target === "en" ? "fr" : "en";
    const srcTitle = source === "fr" ? form.titre : form.titreEn;
    const srcExcerpt = source === "fr" ? form.description : form.descriptionEn;
    const srcContent = source === "fr" ? form.contenu : form.contenuEn;
    if (!srcTitle.trim() || !srcContent.trim()) {
      toast.error(source === "fr" ? "Renseignez d'abord le titre + contenu français" : "Fill in the English title + content first");
      return;
    }

    setTranslating(true);
    try {
      const result = await translateMutation.mutateAsync({
        sourceLanguage: source,
        targetLanguage: target,
        title: srcTitle,
        excerpt: srcExcerpt,
        content: srcContent,
      });
      setForm((f) => {
        if (target === "en") {
          return {
            ...f,
            titreEn: result.title,
            descriptionEn: result.excerpt,
            contenuEn: result.content,
            slugEn: f.slugEn || slugify(result.title),
          };
        } else {
          return {
            ...f,
            titre: result.title,
            description: result.excerpt,
            contenu: result.content,
            slug: f.slug || slugify(result.title),
          };
        }
      });
      toast.success(t("bo.adminArticles.translate.success"));
      setActiveLang(target);
    } catch (err: any) {
      toast.error(err?.message || t("bo.adminArticles.translate.error"));
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateClick = (target: "fr" | "en") => {
    // Confirmation si le champ cible contient déjà du contenu
    const hasExisting = target === "en"
      ? (form.titreEn.trim().length > 0 || form.contenuEn.trim().length > 0)
      : (form.titre.trim().length > 0 || form.contenu.trim().length > 0);
    if (hasExisting) {
      setConfirmOverwrite(target);
    } else {
      doTranslate(target);
    }
  };

  // ─── Save ──────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!form.titre.trim() || form.titre.trim().length < 3) return t("bo.adminArticles.form.missingRequired");
    if (!form.description.trim() || form.description.trim().length < 10) return t("bo.adminArticles.form.missingRequired");
    if (!form.contenu.trim() || form.contenu.trim().length < 20) return t("bo.adminArticles.form.missingRequired");
    if (!form.slug.trim() || form.slug.trim().length < 3) return t("bo.adminArticles.form.missingRequired");
    if (!form.auteur.trim() || form.auteur.trim().length < 2) return t("bo.adminArticles.form.missingRequired");
    return null;
  };

  const save = (statusOverride?: "draft" | "published") => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    const status = statusOverride || form.status;
    const payload: any = {
      titre: form.titre.trim(),
      description: form.description.trim(),
      contenu: form.contenu.trim(),
      slug: form.slug.trim(),
      titreEn: form.titreEn.trim() || null,
      descriptionEn: form.descriptionEn.trim() || null,
      contenuEn: form.contenuEn.trim() || null,
      slugEn: form.slugEn.trim() || null,
      categorie: form.categorie,
      auteur: form.auteur.trim(),
      tempsLecture: form.tempsLecture,
      imageUrl: form.imageUrl || null,
      imageAlt: form.imageAlt || null,
      status,
      featured: form.featured,
      datePublication: form.datePublication || undefined,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* ═══ COLONNE PRINCIPALE ═══════════════════════════════ */}
      <div className="space-y-6 min-w-0">
        {/* Tabs FR / EN + bouton traduire */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
          <div className="border-b flex items-center justify-between" style={{ borderColor: C.border }}>
            <div className="flex">
              <button
                onClick={() => setActiveLang("fr")}
                className="px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors"
                style={{
                  borderColor: activeLang === "fr" ? C.deepGreen : "transparent",
                  color: activeLang === "fr" ? C.deepGreen : C.textMuted,
                }}
              >
                🇫🇷 {t("bo.adminArticles.form.sectionFr")}
              </button>
              <button
                onClick={() => setActiveLang("en")}
                className="px-6 py-3.5 text-sm font-semibold border-b-2 transition-colors"
                style={{
                  borderColor: activeLang === "en" ? C.deepGreen : "transparent",
                  color: activeLang === "en" ? C.deepGreen : C.textMuted,
                }}
              >
                🇬🇧 {t("bo.adminArticles.form.sectionEn")}
              </button>
            </div>
            <div className="pr-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleTranslateClick(activeLang === "fr" ? "en" : "fr")}
                disabled={translating}
                className="rounded-lg h-9 text-sm font-semibold gap-2"
                style={{ borderColor: C.gold, color: C.deepGreen, backgroundColor: C.goldSoft }}
              >
                {translating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("bo.adminArticles.translate.loading")}
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4" />
                    {activeLang === "fr"
                      ? t("bo.adminArticles.translate.toEn")
                      : t("bo.adminArticles.translate.toFr")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Champs de la langue active */}
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <Label className="font-semibold text-[13px]">{t("bo.adminArticles.form.titleLabel")} *</Label>
              <Input
                value={activeLang === "fr" ? form.titre : form.titreEn}
                onChange={(e) =>
                  activeLang === "fr" ? handleTitreChange(e.target.value) : handleTitreEnChange(e.target.value)
                }
                placeholder={activeLang === "fr" ? "Ex : Comment réussir son entretien…" : "e.g. How to ace your interview…"}
                className="rounded-lg h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-[13px]">{t("bo.adminArticles.form.slugLabel")}</Label>
              <Input
                value={activeLang === "fr" ? form.slug : form.slugEn}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ...(activeLang === "fr" ? { slug: slugify(e.target.value) } : { slugEn: slugify(e.target.value) }),
                  }))
                }
                placeholder="ex : reussir-entretien-embauche"
                className="rounded-lg h-11 font-mono text-sm"
              />
              <p className="text-[11.5px]" style={{ color: C.textMuted }}>
                {t("bo.adminArticles.form.slugHint")}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-[13px]">{t("bo.adminArticles.form.excerptLabel")} *</Label>
              <Textarea
                value={activeLang === "fr" ? form.description : form.descriptionEn}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    ...(activeLang === "fr"
                      ? { description: e.target.value }
                      : { descriptionEn: e.target.value }),
                  }))
                }
                placeholder={activeLang === "fr" ? "Résumé affiché sur la carte…" : "Card summary…"}
                rows={3}
                className="rounded-lg resize-none"
              />
              <p className="text-[11.5px]" style={{ color: C.textMuted }}>
                {t("bo.adminArticles.form.excerptHint")}
              </p>
            </div>

            <div className="space-y-1.5" data-color-mode="light">
              <Label className="font-semibold text-[13px]">{t("bo.adminArticles.form.contentLabel")} *</Label>
              <MDEditor
                value={activeLang === "fr" ? form.contenu : form.contenuEn}
                onChange={(val) =>
                  setForm((f) => ({
                    ...f,
                    ...(activeLang === "fr" ? { contenu: val || "" } : { contenuEn: val || "" }),
                  }))
                }
                height={400}
                preview="edit"
              />
            </div>
          </div>
        </div>

        {/* Actions bas */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onDone}
            className="rounded-lg h-11"
            style={{ borderColor: C.border }}
          >
            {t("bo.adminArticles.form.cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={() => save("draft")}
            disabled={isSaving}
            className="rounded-lg h-11 font-semibold"
            style={{ borderColor: C.border, color: C.textMain }}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t("bo.adminArticles.form.saveDraft")}
          </Button>
          <Button
            onClick={() => save("published")}
            disabled={isSaving}
            className="rounded-lg h-11 font-semibold text-white"
            style={{ backgroundColor: C.deepGreen }}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {t("bo.adminArticles.form.publish")}
          </Button>
        </div>
      </div>

      {/* ═══ SIDEBAR droite ═══════════════════════════════════ */}
      <aside className="space-y-4">
        {/* Métadonnées */}
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border }}>
          <h3 className="font-bold text-[14px] mb-4" style={{ color: C.textMain }}>
            {t("bo.adminArticles.form.sectionMeta")}
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-semibold text-[12px]">{t("bo.adminArticles.form.categoryLabel")}</Label>
              <Select value={form.categorie} onValueChange={(v) => setForm((f) => ({ ...f, categorie: v as Categorie }))}>
                <SelectTrigger className="rounded-lg h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`conseilsPage.categories.${CAT_I18N_KEY[c]}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-[12px]">{t("bo.adminArticles.form.authorLabel")} *</Label>
              <Input
                value={form.auteur}
                onChange={(e) => setForm((f) => ({ ...f, auteur: e.target.value }))}
                placeholder="Marie Nguena"
                className="rounded-lg h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-[12px]">{t("bo.adminArticles.form.readingTimeLabel")}</Label>
              <Select value={form.tempsLecture} onValueChange={(v) => setForm((f) => ({ ...f, tempsLecture: v }))}>
                <SelectTrigger className="rounded-lg h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {READING_TIMES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="font-semibold text-[12px]">{t("bo.adminArticles.form.publishedAtLabel")}</Label>
              <Input
                type="date"
                value={form.datePublication}
                onChange={(e) => setForm((f) => ({ ...f, datePublication: e.target.value }))}
                className="rounded-lg h-10 text-sm"
              />
            </div>

            <div className="pt-2 border-t space-y-3" style={{ borderColor: C.border }}>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  className="rounded"
                />
                <div>
                  <div className="font-semibold" style={{ color: C.textMain }}>
                    {t("bo.adminArticles.form.featuredLabel")}
                  </div>
                  <div className="text-[11px]" style={{ color: C.textMuted }}>
                    {t("bo.adminArticles.form.featuredHint")}
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Image de couverture */}
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border }}>
          <h3 className="font-bold text-[14px] mb-4" style={{ color: C.textMain }}>
            {t("bo.adminArticles.form.sectionCover")}
          </h3>

          {form.imageUrl ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border aspect-video bg-gray-100" style={{ borderColor: C.border }}>
                <img src={form.imageUrl} alt={form.imageAlt} className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 rounded-lg h-9 text-sm"
                  style={{ borderColor: C.border }}
                >
                  <Camera className="h-4 w-4 mr-1.5" />
                  {t("bo.adminArticles.form.replaceCover")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm((f) => ({ ...f, imageUrl: "", imageAlt: "" }))}
                  disabled={uploading}
                  className="rounded-lg h-9 text-sm"
                  style={{ borderColor: "#FEE2E2", color: "#DC2626" }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full rounded-lg border-2 border-dashed aspect-video flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              style={{ borderColor: C.border, color: C.textMuted }}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.green }} />
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">{t("bo.adminArticles.form.uploadCover")}</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <p className="text-[11px] mt-3 leading-relaxed" style={{ color: C.textMuted }}>
            {t("bo.adminArticles.form.coverHint")}
          </p>

          <div className="space-y-1.5 mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
            <Label className="font-semibold text-[12px]">{t("bo.adminArticles.form.altLabel")}</Label>
            <Input
              value={form.imageAlt}
              onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
              placeholder="ex : Entretien d'embauche…"
              className="rounded-lg h-10 text-sm"
            />
            <p className="text-[11px]" style={{ color: C.textMuted }}>
              {t("bo.adminArticles.form.altHint")}
            </p>
          </div>
        </div>
      </aside>

      {/* Confirm overwrite dialog */}
      <AlertDialog open={confirmOverwrite !== null} onOpenChange={(open) => !open && setConfirmOverwrite(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" style={{ color: C.gold }} />
              {confirmOverwrite === "en"
                ? t("bo.adminArticles.translate.confirmOverwrite")
                : t("bo.adminArticles.translate.confirmOverwriteFr")}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("bo.adminArticles.form.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = confirmOverwrite!;
                setConfirmOverwrite(null);
                doTranslate(target);
              }}
              className="bg-[#063F24] hover:bg-[#009B5A]"
            >
              <Languages className="h-4 w-4 mr-2" />
              {confirmOverwrite === "en"
                ? t("bo.adminArticles.translate.toEn")
                : t("bo.adminArticles.translate.toFr")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
