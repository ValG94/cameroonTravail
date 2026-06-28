import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { CV_TEMPLATES, type CvSectionLabels } from "@/cv-templates/registry";
import { buildTemplateData } from "@/cv-templates/dataMapper";
import type { ExperienceItem, EducationItem, LanguageItem } from "@/cv-templates/types";
import {
  captureElementAsCanvas,
  canvasToPdf,
  computeSinglePageFitFactor,
  buildCvFilename,
  SINGLE_PAGE_SHRINK_THRESHOLD,
} from "@/lib/pdfExport";
import { PdfExportDialog } from "@/components/PdfExportDialog";

const DEFAULT_LABELS: Required<CvSectionLabels> = {
  contact: "Contact",
  hardSkills: "Compétences",
  softSkills: "Qualités",
  languages: "Langues",
  interests: "Centres d'intérêt",
  experiences: "Expérience professionnelle",
  education: "Formations",
};
import {
  ArrowLeft,
  Crown,
  Download,
  Lock,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useRoute, useSearch } from "wouter";
import { toast } from "sonner";

/**
 * Éditeur de CV premium :
 *  - colonne gauche = panneau d'édition (identité + sections accordéon)
 *  - colonne droite = preview live du template
 *  - persistance dans cv_data via cv.saveData (idempotent par cvId)
 *  - les overrides cv_data prennent priorité sur les données du profil candidat
 */

interface EditableCv {
  // Identité
  fullName: string;
  title: string;
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  linkedin: string;
  // Résumé
  professionalSummary: string;
  // Sections (overrides JSON)
  experiences: ExperienceItem[];
  education: EducationItem[];
  hardSkills: string[];
  softSkills: string[];
  languages: LanguageItem[];
  interests: string[];
}

export default function CvPremiumEditor() {
  const [, params] = useRoute<{ slug: string }>("/candidat/cv-premium/:slug");
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { user, loading: authLoading } = useAuth();
  const utils = trpc.useUtils();

  const slug = params?.slug || "";
  const meta = CV_TEMPLATES[slug];

  // cvId peut venir de l'URL (query param après l'achat) — priorité au query param
  // car cv.list.useQuery peut être stale après une mutation
  const queryCvId = useMemo(() => {
    const sp = new URLSearchParams(searchString || "");
    const v = sp.get("cvId");
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [searchString]);

  // Vérification d'accès serveur
  const accessQuery = trpc.cvTemplates.checkAccess.useQuery(
    { slug },
    { enabled: !!slug && !!user, retry: false }
  );

  // Récupérer le cvDocument premium correspondant (fallback si pas de query param)
  const { data: cvList } = trpc.cv.list.useQuery(undefined, { enabled: !!user });
  const cvDocumentFromList = useMemo(
    () => cvList?.find((c) => c.type === "premium" && c.premiumTemplateSlug === slug),
    [cvList, slug]
  );

  // Mutation pour garantir l'existence du cv_documents (idempotent côté serveur).
  // Appelée si on arrive sur l'éditeur sans cvId en URL ET sans cv dans cv.list.
  const ensureMutation = trpc.cvTemplates.ensurePremiumDocument.useMutation({
    onSuccess: () => {
      utils.cv.list.invalidate();
    },
    onError: (e) => {
      // Sanitise : pas d'exposition de SQL brut à l'utilisateur
      const raw = e.message || "";
      const looksTechnical =
        raw.includes("Failed query") ||
        raw.includes("insert into") ||
        raw.includes("invalid input") ||
        raw.startsWith("[");
      toast.error(
        looksTechnical
          ? "Impossible d'initialiser le CV. Contactez le support si le problème persiste."
          : raw || "Erreur d'initialisation"
      );
    },
  });
  const [ensuredCvId, setEnsuredCvId] = useState<number | null>(null);

  const cvDocumentId = queryCvId ?? cvDocumentFromList?.id ?? ensuredCvId ?? null;

  // Déclenche l'ensure une fois que tout est chargé et qu'on a vraiment rien
  useEffect(() => {
    if (
      slug &&
      user &&
      accessQuery.data?.hasAccess &&
      cvList !== undefined && // cv.list a chargé
      !queryCvId &&
      !cvDocumentFromList &&
      !ensuredCvId &&
      !ensureMutation.isPending
    ) {
      ensureMutation.mutate(
        { slug },
        { onSuccess: (data) => setEnsuredCvId(data.cvDocumentId) }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, user, accessQuery.data?.hasAccess, cvList, queryCvId, cvDocumentFromList, ensuredCvId]);

  // Charger cv_data (overrides existants)
  const { data: savedCvData } = trpc.cv.getData.useQuery(
    { cvId: cvDocumentId ?? 0 },
    { enabled: !!cvDocumentId }
  );

  // Données profil (fallback)
  const { data: profile } = trpc.candidat.getProfile.useQuery(undefined, { enabled: !!user });
  const { data: experiences } = trpc.candidat.getExperiences.useQuery(undefined, { enabled: !!user });
  const { data: formations } = trpc.candidat.getFormations.useQuery(undefined, { enabled: !!user });
  const { data: competences } = trpc.candidat.getCompetences.useQuery(undefined, { enabled: !!user });
  const { data: langues } = trpc.candidat.getLangues.useQuery(undefined, { enabled: !!user });

  // Construire les données affichées (cv_data prioritaire, profil en fallback)
  const computedData = useMemo(
    () =>
      buildTemplateData({
        user: user ? { name: user.name, email: user.email } : null,
        candidat: profile,
        cvData: savedCvData,
        experiences: experiences || [],
        formations: formations || [],
        competences: competences || [],
        langues: langues || [],
      }),
    [user, profile, savedCvData, experiences, formations, competences, langues]
  );

  // State éditable (initialisé depuis computedData puis modifiable)
  const [editing, setEditing] = useState<EditableCv | null>(null);
  const [accentColor, setAccentColor] = useState<string>(meta?.defaultAccent || "#10b981");
  const [labels, setLabels] = useState<Required<CvSectionLabels>>(DEFAULT_LABELS);
  const [isDirty, setIsDirty] = useState(false);

  // Charge les labels personnalisés depuis cv_data.certifications (réutilisé)
  // si présents au moment du chargement.
  useEffect(() => {
    if (savedCvData?.certifications) {
      try {
        const parsed = JSON.parse(savedCvData.certifications);
        if (parsed && typeof parsed === "object" && parsed.__customLabels) {
          setLabels({ ...DEFAULT_LABELS, ...parsed.__customLabels });
        }
      } catch {
        // pas du JSON valide — on ignore
      }
    }
  }, [savedCvData?.certifications]);

  // Re-init de l'état éditable quand computedData change (chargement initial)
  useEffect(() => {
    if (!editing && computedData.fullName !== undefined) {
      setEditing({
        fullName: computedData.fullName,
        title: computedData.title,
        email: computedData.email,
        phoneNumber: computedData.phoneNumber,
        city: computedData.city,
        country: computedData.country,
        linkedin: computedData.linkedin || "",
        professionalSummary: computedData.professionalSummary || "",
        experiences: computedData.experiences,
        education: computedData.education,
        hardSkills: computedData.hardSkills,
        softSkills: computedData.softSkills,
        languages: computedData.languages,
        interests: computedData.interests,
      });
    }
  }, [computedData, editing]);

  useEffect(() => {
    if (meta) setAccentColor(meta.defaultAccent);
  }, [meta]);

  const saveMutation = trpc.cv.saveData.useMutation({
    onSuccess: () => {
      toast.success("Modifications enregistrées");
      setIsDirty(false);
      utils.cv.getData.invalidate();
    },
    onError: (e) => toast.error(e.message || "Erreur d'enregistrement"),
  });

  const update = <K extends keyof EditableCv>(key: K, value: EditableCv[K]) => {
    if (!editing) return;
    setEditing({ ...editing, [key]: value });
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!editing || !cvDocumentId) return;
    // Diff par rapport aux defaults : on stocke uniquement les labels modifiés
    const customLabels: Partial<CvSectionLabels> = {};
    (Object.keys(DEFAULT_LABELS) as Array<keyof CvSectionLabels>).forEach((k) => {
      if (labels[k] && labels[k] !== DEFAULT_LABELS[k]) {
        customLabels[k] = labels[k];
      }
    });
    saveMutation.mutate({
      cvId: cvDocumentId,
      // Identité (mappée sur les champs cv_data correspondants)
      prenom: editing.fullName.split(" ")[0] || "",
      nom: editing.fullName.split(" ").slice(1).join(" ") || "",
      titre: editing.title,
      email: editing.email,
      telephone: editing.phoneNumber,
      adresse: [editing.city, editing.country].filter(Boolean).join(", "),
      siteWeb: editing.linkedin || undefined,
      couleurColonne: accentColor,
      resume: editing.professionalSummary,
      // Sections : JSON-encoded overrides
      experiences: JSON.stringify(editing.experiences),
      formations: JSON.stringify(editing.education),
      competences: JSON.stringify([...editing.hardSkills, ...editing.softSkills]),
      languesCv: JSON.stringify(editing.languages),
      loisirs: JSON.stringify(editing.interests),
      // Champ certifications réutilisé pour stocker les labels personnalisés
      // (les templates premium ne consomment pas certifications par ailleurs)
      certifications: JSON.stringify({ __customLabels: customLabels }),
    });
  };

  const [exportingPdf, setExportingPdf] = useState(false);
  // État du dialog de choix single-page vs multi-page : ouvert quand le
  // CV nécessite un shrink trop important pour rester lisible sur une page.
  const [pdfPreview, setPdfPreview] = useState<{
    canvas: HTMLCanvasElement;
    fitFactor: number;
    filename: string;
  } | null>(null);

  const handleExportPdf = async () => {
    if (exportingPdf) return;
    const node = document.getElementById("cv-render-root") as HTMLElement | null;
    if (!node) {
      toast.error("Aperçu du CV introuvable");
      return;
    }
    setExportingPdf(true);
    try {
      const canvas = await captureElementAsCanvas(node);
      const fitFactor = computeSinglePageFitFactor(canvas);
      const filename = buildCvFilename(editing?.fullName || "", slug);

      if (fitFactor >= SINGLE_PAGE_SHRINK_THRESHOLD) {
        // CV tient sur 1 page sans déformation notable : export direct.
        canvasToPdf(canvas, { filename, mode: "single-page" });
        toast.success("CV téléchargé");
      } else {
        // Shrink trop important pour rester lisible : on laisse le candidat
        // choisir entre rester sur 1 page (avec réduction) ou étaler.
        setPdfPreview({ canvas, fitFactor, filename });
      }
    } catch (e) {
      console.error("[CvPremiumEditor] export PDF a échoué:", e);
      toast.error("Échec de l'export PDF");
    } finally {
      setExportingPdf(false);
    }
  };

  const handlePdfChoice = (mode: "single-page" | "multi-page") => {
    if (!pdfPreview) return;
    try {
      canvasToPdf(pdfPreview.canvas, { filename: pdfPreview.filename, mode });
      toast.success("CV téléchargé");
    } catch (e) {
      console.error("[CvPremiumEditor] export PDF a échoué:", e);
      toast.error("Échec de l'export PDF");
    } finally {
      setPdfPreview(null);
    }
  };

  const updateLabel = (key: keyof CvSectionLabels, value: string) => {
    setLabels({ ...labels, [key]: value });
    setIsDirty(true);
  };

  if (authLoading || accessQuery.isLoading || !editing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidatNav />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Modèle introuvable</h2>
          <p className="text-gray-600 mb-4">Le modèle « {slug} » n'existe pas.</p>
          <Button onClick={() => setLocation("/candidat/templates")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la bibliothèque
          </Button>
        </div>
      </div>
    );
  }

  if (accessQuery.data && !accessQuery.data.hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidatNav />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <Lock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Modèle verrouillé</h2>
          <p className="text-gray-600 mb-4">Vous devez débloquer ce modèle avant de l'utiliser.</p>
          <Button onClick={() => setLocation("/candidat/templates")} className="bg-amber-500 hover:bg-amber-600 text-white">
            Voir la bibliothèque
          </Button>
        </div>
      </div>
    );
  }

  const { Component } = meta;

  // Données injectées dans le template (state éditable, ré-affichées en temps réel)
  const dataForTemplate = {
    fullName: editing.fullName,
    title: editing.title,
    email: editing.email,
    phoneNumber: editing.phoneNumber,
    city: editing.city,
    country: editing.country,
    linkedin: editing.linkedin,
    photoUrl: computedData.photoUrl,
    professionalSummary: editing.professionalSummary,
    experiences: editing.experiences,
    education: editing.education,
    hardSkills: editing.hardSkills,
    softSkills: editing.softSkills,
    languages: editing.languages,
    interests: editing.interests,
    references: [],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <CandidatNav />

      {/* Toolbar */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/candidat/templates")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-900">{meta.nom}</h1>
                <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                  <Crown className="w-3 h-3 mr-1" /> Premium
                </Badge>
                {isDirty && (
                  <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                    Modifications non enregistrées
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">Éditez votre CV — les modifications n'affectent pas votre profil global</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 flex items-center gap-2">
              Couleur :
              <input
                type="color"
                value={accentColor}
                onChange={(e) => {
                  setAccentColor(e.target.value);
                  setIsDirty(true);
                }}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
              />
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              disabled={!isDirty || saveMutation.isPending || !cvDocumentId}
            >
              <Save className="w-4 h-4 mr-1" />
              {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleExportPdf}
              disabled={exportingPdf || !editing}
            >
              <Download className="w-4 h-4 mr-1" />
              {exportingPdf ? "Génération..." : "PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Layout 2 colonnes */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        {/* Panneau d'édition */}
        <aside className="w-full lg:w-[400px] shrink-0">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-bold text-sm uppercase tracking-wide text-gray-700 mb-3">
                Édition du CV
              </h2>

              <Accordion type="multiple" defaultValue={["identite", "resume"]} className="w-full">
                {/* Identité */}
                <AccordionItem value="identite">
                  <AccordionTrigger className="text-sm font-semibold">Identité</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <FieldInput label="Nom complet" value={editing.fullName} onChange={(v) => update("fullName", v)} />
                    <FieldInput label="Poste recherché" value={editing.title} onChange={(v) => update("title", v)} placeholder="Ex : Développeur Full Stack" />
                    <FieldInput label="Email" value={editing.email} onChange={(v) => update("email", v)} />
                    <FieldInput label="Téléphone" value={editing.phoneNumber} onChange={(v) => update("phoneNumber", v)} />
                    <FieldInput label="Ville" value={editing.city} onChange={(v) => update("city", v)} />
                    <FieldInput label="Pays / Région" value={editing.country} onChange={(v) => update("country", v)} />
                    <FieldInput label="LinkedIn / Site" value={editing.linkedin} onChange={(v) => update("linkedin", v)} placeholder="https://..." />
                  </AccordionContent>
                </AccordionItem>

                {/* Résumé */}
                <AccordionItem value="resume">
                  <AccordionTrigger className="text-sm font-semibold">Résumé / Accroche</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <Textarea
                      value={editing.professionalSummary}
                      onChange={(e) => update("professionalSummary", e.target.value)}
                      placeholder="2-3 phrases pour vous présenter"
                      rows={4}
                      className="text-sm"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Expériences */}
                <AccordionItem value="experiences">
                  <AccordionTrigger className="text-sm font-semibold">
                    Expériences ({editing.experiences.length})
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    {editing.experiences.map((exp, i) => (
                      <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">#{i + 1}</span>
                          <button
                            onClick={() =>
                              update("experiences", editing.experiences.filter((_, j) => j !== i))
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <FieldInput label="Poste" value={exp.position} onChange={(v) => updateListItem("experiences", i, { position: v }, editing, update)} />
                        <FieldInput label="Entreprise" value={exp.company} onChange={(v) => updateListItem("experiences", i, { company: v }, editing, update)} />
                        <FieldInput label="Lieu" value={exp.location || ""} onChange={(v) => updateListItem("experiences", i, { location: v }, editing, update)} />
                        <div className="grid grid-cols-2 gap-2">
                          <FieldInput label="Début" value={exp.startDate || ""} onChange={(v) => updateListItem("experiences", i, { startDate: v }, editing, update)} placeholder="2023-01" />
                          <FieldInput label="Fin" value={exp.endDate || ""} onChange={(v) => updateListItem("experiences", i, { endDate: v }, editing, update)} placeholder="2024-12" />
                        </div>
                        <Textarea
                          value={exp.description || ""}
                          onChange={(e) => updateListItem("experiences", i, { description: e.target.value }, editing, update)}
                          placeholder="Description / missions"
                          rows={3}
                          className="text-xs"
                        />
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        update("experiences", [
                          ...editing.experiences,
                          { company: "", position: "", description: "" },
                        ])
                      }
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter une expérience
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Formations */}
                <AccordionItem value="formations">
                  <AccordionTrigger className="text-sm font-semibold">
                    Formations ({editing.education.length})
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    {editing.education.map((ed, i) => (
                      <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">#{i + 1}</span>
                          <button
                            onClick={() => update("education", editing.education.filter((_, j) => j !== i))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <FieldInput label="Diplôme" value={ed.degree} onChange={(v) => updateListItem("education", i, { degree: v }, editing, update)} />
                        <FieldInput label="Domaine" value={ed.field || ""} onChange={(v) => updateListItem("education", i, { field: v }, editing, update)} />
                        <FieldInput label="École" value={ed.school} onChange={(v) => updateListItem("education", i, { school: v }, editing, update)} />
                        <div className="grid grid-cols-2 gap-2">
                          <FieldInput label="Début" value={ed.startDate || ""} onChange={(v) => updateListItem("education", i, { startDate: v }, editing, update)} placeholder="2020-09" />
                          <FieldInput label="Fin" value={ed.endDate || ""} onChange={(v) => updateListItem("education", i, { endDate: v }, editing, update)} placeholder="2023-06" />
                        </div>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        update("education", [
                          ...editing.education,
                          { school: "", degree: "" },
                        ])
                      }
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter une formation
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Compétences */}
                <AccordionItem value="competences">
                  <AccordionTrigger className="text-sm font-semibold">Compétences</AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <CsvField
                      label="Techniques (séparées par virgule)"
                      value={editing.hardSkills}
                      onChange={(arr) => update("hardSkills", arr)}
                      placeholder="React, Node.js, TypeScript"
                    />
                    <CsvField
                      label="Qualités (séparées par virgule)"
                      value={editing.softSkills}
                      onChange={(arr) => update("softSkills", arr)}
                      placeholder="Leadership, Communication"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Langues */}
                <AccordionItem value="langues">
                  <AccordionTrigger className="text-sm font-semibold">
                    Langues ({editing.languages.length})
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    {editing.languages.map((l, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <Input
                          value={l.name}
                          onChange={(e) =>
                            update(
                              "languages",
                              editing.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                            )
                          }
                          placeholder="Langue"
                          className="text-xs flex-1"
                        />
                        <Input
                          value={l.level}
                          onChange={(e) =>
                            update(
                              "languages",
                              editing.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x))
                            )
                          }
                          placeholder="Niveau"
                          className="text-xs flex-1"
                        />
                        <button
                          onClick={() => update("languages", editing.languages.filter((_, j) => j !== i))}
                          className="text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => update("languages", [...editing.languages, { name: "", level: "courant" }])}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Ajouter une langue
                    </Button>
                  </AccordionContent>
                </AccordionItem>

                {/* Loisirs */}
                <AccordionItem value="loisirs">
                  <AccordionTrigger className="text-sm font-semibold">Centres d'intérêt</AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <CsvField
                      label=""
                      value={editing.interests}
                      onChange={(arr) => update("interests", arr)}
                      placeholder="Lecture, Sport, Voyages..."
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Personnaliser les libellés des sections */}
                <AccordionItem value="labels">
                  <AccordionTrigger className="text-sm font-semibold">
                    Personnaliser les libellés
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-2">
                    <p className="text-[11px] text-gray-500 mb-2">
                      Renommez les en-têtes des sections (ex: « Compétences » → « Skills »).
                      Laissez vide pour utiliser le libellé par défaut.
                    </p>
                    <FieldInput label="Contact" value={labels.contact} onChange={(v) => updateLabel("contact", v)} placeholder="Contact" />
                    <FieldInput label="Compétences" value={labels.hardSkills} onChange={(v) => updateLabel("hardSkills", v)} placeholder="Compétences" />
                    <FieldInput label="Qualités" value={labels.softSkills} onChange={(v) => updateLabel("softSkills", v)} placeholder="Qualités" />
                    <FieldInput label="Langues" value={labels.languages} onChange={(v) => updateLabel("languages", v)} placeholder="Langues" />
                    <FieldInput label="Centres d'intérêt" value={labels.interests} onChange={(v) => updateLabel("interests", v)} placeholder="Centres d'intérêt" />
                    <FieldInput label="Expériences" value={labels.experiences} onChange={(v) => updateLabel("experiences", v)} placeholder="Expérience professionnelle" />
                    <FieldInput label="Formations" value={labels.education} onChange={(v) => updateLabel("education", v)} placeholder="Formations" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </aside>

        {/* Preview */}
        <main className="flex-1 flex justify-center overflow-x-auto">
          <div className="origin-top scale-75 lg:scale-90 xl:scale-100">
            <Suspense
              fallback={
                <div className="w-[210mm] min-h-[297mm] bg-white shadow flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400" />
                </div>
              }
            >
              <Component data={dataForTemplate} accentColor={accentColor} labels={labels} />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Dialog de choix pour les CVs trop longs : single-page (réduit) vs
          multi-page (taille originale). Apparait uniquement quand le shrink
          nécessaire dépasse le seuil de lisibilité (cf. pdfExport). */}
      <PdfExportDialog
        canvas={pdfPreview?.canvas ?? null}
        fitFactor={pdfPreview?.fitFactor ?? 1}
        onChoose={handlePdfChoice}
        onClose={() => setPdfPreview(null)}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-gray-600">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-xs mt-1"
      />
    </div>
  );
}

/**
 * Champ texte qui pilote un array de strings via une saisie CSV.
 * Garde un state local string pour permettre virgules et espaces pendant la saisie ;
 * convertit en array uniquement au blur. Synchronise depuis le parent si la valeur
 * externe change vraiment (ex : reload des données).
 */
function CsvField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const externalString = value.join(", ");
  const [localText, setLocalText] = useState(externalString);

  // Re-sync local quand la prop externe change de "vraie" valeur
  useEffect(() => {
    setLocalText(externalString);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalString]);

  const commit = () => {
    const arr = localText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    // N'appelle onChange que si le contenu effectif a changé
    if (arr.join("|") !== value.join("|")) onChange(arr);
  };

  return (
    <div>
      {label && <Label className="text-xs text-gray-600">{label}</Label>}
      <Textarea
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={commit}
        rows={2}
        className={`text-xs ${label ? "mt-1" : ""}`}
        placeholder={placeholder}
      />
    </div>
  );
}

/** Helper pour modifier un item dans un tableau du state éditable */
function updateListItem<K extends "experiences" | "education">(
  key: K,
  index: number,
  patch: Partial<EditableCv[K][number]>,
  editing: EditableCv,
  update: <T extends keyof EditableCv>(k: T, v: EditableCv[T]) => void
) {
  const list = editing[key] as any[];
  const newList = list.map((item, i) => (i === index ? { ...item, ...patch } : item));
  update(key, newList as any);
}
