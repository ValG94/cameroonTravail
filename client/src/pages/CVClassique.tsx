import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  Download,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Briefcase,
  GraduationCap,
  Star,
  Globe,
  Award,
  Heart,
  FileText,
  ArrowLeft,
  Languages,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Experience {
  id: string;
  poste: string;
  entreprise: string;
  ville: string;
  dateDebut: string;
  dateFin: string;
  enCours: boolean;
  description: string;
}

interface Formation {
  id: string;
  diplome: string;
  etablissement: string;
  ville: string;
  dateDebut: string;
  dateFin: string;
  mention: string;
}

interface Competence {
  id: string;
  nom: string;
  niveau: number; // 1-5
}

interface LangueCV {
  id: string;
  nom: string;
  niveau: string; // Débutant, Intermédiaire, Avancé, Courant, Natif
}

interface CVFormData {
  prenom: string;
  nom: string;
  titre: string;
  email: string;
  telephone: string;
  adresse: string;
  siteWeb: string;
  resume: string;
  experiences: Experience[];
  formations: Formation[];
  competences: Competence[];
  languesCv: LangueCV[];
  certifications: string;
  loisirs: string;
  langue: "fr" | "en";
}

const defaultForm: CVFormData = {
  prenom: "",
  nom: "",
  titre: "",
  email: "",
  telephone: "",
  adresse: "",
  siteWeb: "",
  resume: "",
  experiences: [],
  formations: [],
  competences: [],
  languesCv: [],
  certifications: "",
  loisirs: "",
  langue: "fr",
};

const LABELS = {
  fr: {
    experience: "Expériences professionnelles",
    formation: "Formations",
    competences: "Compétences",
    langues: "Langues",
    certifications: "Certifications",
    loisirs: "Centres d'intérêt",
    resume: "Profil / Résumé",
    present: "Présent",
    niveau: ["Débutant", "Intermédiaire", "Avancé", "Courant", "Natif"],
    niveauComp: ["Notions", "Débutant", "Intermédiaire", "Avancé", "Expert"],
  },
  en: {
    experience: "Work Experience",
    formation: "Education",
    competences: "Skills",
    langues: "Languages",
    certifications: "Certifications",
    loisirs: "Interests",
    resume: "Profile / Summary",
    present: "Present",
    niveau: ["Beginner", "Intermediate", "Advanced", "Fluent", "Native"],
    niveauComp: ["Basic", "Beginner", "Intermediate", "Advanced", "Expert"],
  },
};

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── CV Preview Component ─────────────────────────────────────────────────────
function CVPreview({ data, photoUrl }: { data: CVFormData; photoUrl: string | null }) {
  const L = LABELS[data.langue];
  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < n ? "text-gray-800" : "text-gray-300"}>
        ●
      </span>
    ));

  return (
    <div
      id="cv-preview"
      className="bg-white shadow-xl font-sans text-gray-800"
      style={{ width: "210mm", minHeight: "297mm", padding: "20mm 18mm", fontSize: "10pt", lineHeight: "1.5" }}
    >
      {/* Header */}
      <div className="flex items-start gap-6 mb-6 pb-4 border-b-2 border-gray-800">
        {photoUrl && (
          <img
            src={photoUrl}
            alt="Photo"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shrink-0"
          />
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {data.prenom} {data.nom}
          </h1>
          {data.titre && (
            <p className="text-lg text-emerald-700 font-medium mt-1">{data.titre}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
            {data.email && <span>✉ {data.email}</span>}
            {data.telephone && <span>📞 {data.telephone}</span>}
            {data.adresse && <span>📍 {data.adresse}</span>}
            {data.siteWeb && <span>🌐 {data.siteWeb}</span>}
          </div>
        </div>
      </div>

      {/* Résumé */}
      {data.resume && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2 border-b border-emerald-200 pb-1">
            {L.resume}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{data.resume}</p>
        </div>
      )}

      {/* Expériences */}
      {data.experiences.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2 border-b border-emerald-200 pb-1">
            {L.experience}
          </h2>
          {data.experiences.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-900">{exp.poste}</p>
                  <p className="text-sm text-gray-600">
                    {exp.entreprise}
                    {exp.ville ? ` — ${exp.ville}` : ""}
                  </p>
                </div>
                <p className="text-xs text-gray-500 shrink-0 ml-4">
                  {exp.dateDebut}
                  {exp.dateDebut && " – "}
                  {exp.enCours ? L.present : exp.dateFin}
                </p>
              </div>
              {exp.description && (
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formations */}
      {data.formations.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2 border-b border-emerald-200 pb-1">
            {L.formation}
          </h2>
          {data.formations.map((f) => (
            <div key={f.id} className="mb-2 flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">{f.diplome}</p>
                <p className="text-sm text-gray-600">
                  {f.etablissement}
                  {f.ville ? ` — ${f.ville}` : ""}
                  {f.mention ? ` · ${f.mention}` : ""}
                </p>
              </div>
              <p className="text-xs text-gray-500 shrink-0 ml-4">
                {f.dateDebut}
                {f.dateDebut && f.dateFin && " – "}
                {f.dateFin}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Compétences & Langues côte à côte */}
      <div className="flex gap-8 mb-5">
        {data.competences.length > 0 && (
          <div className="flex-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2 border-b border-emerald-200 pb-1">
              {L.competences}
            </h2>
            {data.competences.map((c) => (
              <div key={c.id} className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">{c.nom}</span>
                <span className="text-xs flex gap-0.5">{stars(c.niveau)}</span>
              </div>
            ))}
          </div>
        )}
        {data.languesCv.length > 0 && (
          <div className="flex-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2 border-b border-emerald-200 pb-1">
              {L.langues}
            </h2>
            {data.languesCv.map((l) => (
              <div key={l.id} className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">{l.nom}</span>
                <span className="text-xs text-gray-500">{l.niveau}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications */}
      {data.certifications && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2 border-b border-emerald-200 pb-1">
            {L.certifications}
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{data.certifications}</p>
        </div>
      )}

      {/* Loisirs */}
      {data.loisirs && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-700 mb-2 border-b border-emerald-200 pb-1">
            {L.loisirs}
          </h2>
          <p className="text-sm text-gray-700">{data.loisirs}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CVClassique() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const cvIdParam = params.get("id") ? Number(params.get("id")) : null;

  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<CVFormData>(defaultForm);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [cvId, setCvId] = useState<number | null>(cvIdParam);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const createMutation = trpc.cv.create.useMutation({
    onSuccess: (data) => {
      setCvId(data.id);
      toast.success("CV créé !");
    },
    onError: (e) => toast.error(e.message),
  });

  const saveDataMutation = trpc.cv.saveData.useMutation({
    onSuccess: () => {
      toast.success("CV sauvegardé !");
      utils.cv.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Load existing CV data
  const { data: existingData } = trpc.cv.getData.useQuery(
    { cvId: cvId ?? 0 },
    { enabled: !!cvId && !!user }
  );

  useEffect(() => {
    if (!existingData) return;
    setForm((prev) => ({
      ...prev,
      prenom: existingData.prenom || "",
      nom: existingData.nom || "",
      titre: existingData.titre || "",
      email: existingData.email || "",
      telephone: existingData.telephone || "",
      adresse: existingData.adresse || "",
      siteWeb: existingData.siteWeb || "",
      resume: existingData.resume || "",
      certifications: existingData.certifications || "",
      loisirs: existingData.loisirs || "",
      experiences: existingData.experiences ? JSON.parse(existingData.experiences) : [],
      formations: existingData.formations ? JSON.parse(existingData.formations) : [],
      competences: existingData.competences ? JSON.parse(existingData.competences) : [],
      languesCv: existingData.languesCv ? JSON.parse(existingData.languesCv) : [],
    }));
    if (existingData.photoUrl) setPhotoUrl(existingData.photoUrl);
    if (existingData.photoKey) setPhotoKey(existingData.photoKey);
  }, [existingData]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let currentCvId: number | null = cvId;
      if (!currentCvId) {
        const result = await createMutation.mutateAsync({
          nom: `${form.prenom} ${form.nom} - Classique`.trim() || "Mon CV Classique",
          type: "classique",
          langue: form.langue,
        });
        currentCvId = result.id;
        setCvId(currentCvId);
      }
      if (!currentCvId) return;
      await saveDataMutation.mutateAsync({
        cvId: currentCvId,
        prenom: form.prenom,
        nom: form.nom,
        titre: form.titre,
        email: form.email,
        telephone: form.telephone,
        adresse: form.adresse,
        siteWeb: form.siteWeb,
        resume: form.resume,
        certifications: form.certifications,
        loisirs: form.loisirs,
        experiences: JSON.stringify(form.experiences),
        formations: JSON.stringify(form.formations),
        competences: JSON.stringify(form.competences),
        languesCv: JSON.stringify(form.languesCv),
        photoUrl: photoUrl || undefined,
        photoKey: photoKey || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const element = document.getElementById("cv-preview");
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CV_${form.prenom}_${form.nom}_Classique.pdf`);
      toast.success("PDF téléchargé !");
    } catch (e) {
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG, WebP)");
      return;
    }
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-cv", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload échoué");
      const { url, key } = await res.json();
      setPhotoUrl(url);
      setPhotoKey(key);
      toast.success("Photo uploadée !");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const updateForm = (field: keyof CVFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Experience helpers
  const addExp = () =>
    updateForm("experiences", [
      ...form.experiences,
      { id: uid(), poste: "", entreprise: "", ville: "", dateDebut: "", dateFin: "", enCours: false, description: "" },
    ]);
  const updateExp = (id: string, field: keyof Experience, value: any) =>
    updateForm(
      "experiences",
      form.experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  const removeExp = (id: string) =>
    updateForm("experiences", form.experiences.filter((e) => e.id !== id));

  // Formation helpers
  const addForm = () =>
    updateForm("formations", [
      ...form.formations,
      { id: uid(), diplome: "", etablissement: "", ville: "", dateDebut: "", dateFin: "", mention: "" },
    ]);
  const updateFormation = (id: string, field: keyof Formation, value: any) =>
    updateForm(
      "formations",
      form.formations.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  const removeFormation = (id: string) =>
    updateForm("formations", form.formations.filter((f) => f.id !== id));

  // Competence helpers
  const addComp = () =>
    updateForm("competences", [...form.competences, { id: uid(), nom: "", niveau: 3 }]);
  const updateComp = (id: string, field: keyof Competence, value: any) =>
    updateForm(
      "competences",
      form.competences.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  const removeComp = (id: string) =>
    updateForm("competences", form.competences.filter((c) => c.id !== id));

  // Langue helpers
  const addLang = () =>
    updateForm("languesCv", [...form.languesCv, { id: uid(), nom: "", niveau: "Intermédiaire" }]);
  const updateLang = (id: string, field: keyof LangueCV, value: any) =>
    updateForm(
      "languesCv",
      form.languesCv.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  const removeLang = (id: string) =>
    updateForm("languesCv", form.languesCv.filter((l) => l.id !== id));

  if (!authLoading && !user) {
    navigate("/connexion");
    return null;
  }

  const L = LABELS[form.langue];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/deposer-cv")}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-gray-800">CV Classique</span>
              {cvId && <Badge variant="outline" className="text-xs">ID #{cvId}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Langue toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={form.langue === "fr" ? "default" : "ghost"}
                className={`text-xs h-7 ${form.langue === "fr" ? "bg-emerald-600 text-white" : ""}`}
                onClick={() => updateForm("langue", "fr")}
              >
                FR
              </Button>
              <Button
                size="sm"
                variant={form.langue === "en" ? "default" : "ghost"}
                className={`text-xs h-7 ${form.langue === "en" ? "bg-emerald-600 text-white" : ""}`}
                onClick={() => updateForm("langue", "en")}
              >
                EN
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={downloading}
              variant="outline"
              className="border-emerald-600 text-emerald-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "Génération..." : "Télécharger PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* ─── Form Panel ─── */}
        <div className="w-full lg:w-[420px] lg:shrink-0 space-y-6">
          {/* Informations personnelles */}
          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" /> Informations personnelles
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Prénom</Label>
                <Input
                  value={form.prenom}
                  onChange={(e) => updateForm("prenom", e.target.value)}
                  placeholder="Jean"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Nom</Label>
                <Input
                  value={form.nom}
                  onChange={(e) => updateForm("nom", e.target.value)}
                  placeholder="Dupont"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs">Titre / Poste visé</Label>
              <Input
                value={form.titre}
                onChange={(e) => updateForm("titre", e.target.value)}
                placeholder="Ingénieur logiciel"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-xs">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="jean@email.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={form.telephone}
                  onChange={(e) => updateForm("telephone", e.target.value)}
                  placeholder="+237 6xx xxx xxx"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs">Adresse</Label>
              <Input
                value={form.adresse}
                onChange={(e) => updateForm("adresse", e.target.value)}
                placeholder="Yaoundé, Cameroun"
                className="mt-1"
              />
            </div>
            <div className="mt-3">
              <Label className="text-xs">Site web / LinkedIn</Label>
              <Input
                value={form.siteWeb}
                onChange={(e) => updateForm("siteWeb", e.target.value)}
                placeholder="linkedin.com/in/jean"
                className="mt-1"
              />
            </div>

            {/* Photo */}
            <div className="mt-4 pt-4 border-t">
              <Label className="text-xs">Photo (optionnelle)</Label>
              <div className="flex items-center gap-3 mt-2">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Photo"
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={photoUploading}
                    className="text-xs"
                  >
                    {photoUploading ? "Upload..." : photoUrl ? "Changer" : "Ajouter une photo"}
                  </Button>
                  {photoUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-red-500 ml-2"
                      onClick={() => { setPhotoUrl(null); setPhotoKey(null); }}
                    >
                      Supprimer
                    </Button>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Résumé */}
          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" /> {L.resume}
            </h3>
            <Textarea
              value={form.resume}
              onChange={(e) => updateForm("resume", e.target.value)}
              placeholder="Décrivez votre profil en 2-3 phrases..."
              rows={4}
            />
          </section>

          {/* Expériences */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" /> {L.experience}
              </h3>
              <Button size="sm" variant="outline" onClick={addExp} className="text-xs">
                <Plus className="w-3 h-3 mr-1" /> Ajouter
              </Button>
            </div>
            {form.experiences.map((exp) => (
              <div key={exp.id} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    value={exp.poste}
                    onChange={(e) => updateExp(exp.id, "poste", e.target.value)}
                    placeholder="Poste"
                    className="text-sm"
                  />
                  <Input
                    value={exp.entreprise}
                    onChange={(e) => updateExp(exp.id, "entreprise", e.target.value)}
                    placeholder="Entreprise"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    value={exp.ville}
                    onChange={(e) => updateExp(exp.id, "ville", e.target.value)}
                    placeholder="Ville"
                    className="text-sm"
                  />
                  <Input
                    value={exp.dateDebut}
                    onChange={(e) => updateExp(exp.id, "dateDebut", e.target.value)}
                    placeholder="Début (ex: 2020)"
                    className="text-sm"
                  />
                  {exp.enCours ? (
                    <div className="flex items-center">
                      <span className="text-xs text-emerald-600 font-medium">{L.present}</span>
                    </div>
                  ) : (
                    <Input
                      value={exp.dateFin}
                      onChange={(e) => updateExp(exp.id, "dateFin", e.target.value)}
                      placeholder="Fin (ex: 2023)"
                      className="text-sm"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id={`encours-${exp.id}`}
                    checked={exp.enCours}
                    onChange={(e) => updateExp(exp.id, "enCours", e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor={`encours-${exp.id}`} className="text-xs text-gray-600">
                    Poste actuel
                  </label>
                </div>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExp(exp.id, "description", e.target.value)}
                  placeholder="Décrivez vos missions et réalisations..."
                  rows={3}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 text-xs mt-2"
                  onClick={() => removeExp(exp.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                </Button>
              </div>
            ))}
            {form.experiences.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Aucune expérience ajoutée
              </p>
            )}
          </section>

          {/* Formations */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" /> {L.formation}
              </h3>
              <Button size="sm" variant="outline" onClick={addForm} className="text-xs">
                <Plus className="w-3 h-3 mr-1" /> Ajouter
              </Button>
            </div>
            {form.formations.map((f) => (
              <div key={f.id} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    value={f.diplome}
                    onChange={(e) => updateFormation(f.id, "diplome", e.target.value)}
                    placeholder="Diplôme"
                    className="text-sm"
                  />
                  <Input
                    value={f.etablissement}
                    onChange={(e) => updateFormation(f.id, "etablissement", e.target.value)}
                    placeholder="Établissement"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={f.ville}
                    onChange={(e) => updateFormation(f.id, "ville", e.target.value)}
                    placeholder="Ville"
                    className="text-sm"
                  />
                  <Input
                    value={f.dateDebut}
                    onChange={(e) => updateFormation(f.id, "dateDebut", e.target.value)}
                    placeholder="Début"
                    className="text-sm"
                  />
                  <Input
                    value={f.dateFin}
                    onChange={(e) => updateFormation(f.id, "dateFin", e.target.value)}
                    placeholder="Fin"
                    className="text-sm"
                  />
                </div>
                <Input
                  value={f.mention}
                  onChange={(e) => updateFormation(f.id, "mention", e.target.value)}
                  placeholder="Mention (ex: Très bien)"
                  className="text-sm mt-2"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 text-xs mt-2"
                  onClick={() => removeFormation(f.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                </Button>
              </div>
            ))}
          </section>

          {/* Compétences */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-600" /> {L.competences}
              </h3>
              <Button size="sm" variant="outline" onClick={addComp} className="text-xs">
                <Plus className="w-3 h-3 mr-1" /> Ajouter
              </Button>
            </div>
            {form.competences.map((c) => (
              <div key={c.id} className="flex items-center gap-2 mb-2">
                <Input
                  value={c.nom}
                  onChange={(e) => updateComp(c.id, "nom", e.target.value)}
                  placeholder="Ex: React, Excel..."
                  className="text-sm flex-1"
                />
                <select
                  value={c.niveau}
                  onChange={(e) => updateComp(c.id, "niveau", Number(e.target.value))}
                  className="text-sm border rounded-md px-2 py-1.5 bg-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {L.niveauComp[n - 1]}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => removeComp(c.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </section>

          {/* Langues */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" /> {L.langues}
              </h3>
              <Button size="sm" variant="outline" onClick={addLang} className="text-xs">
                <Plus className="w-3 h-3 mr-1" /> Ajouter
              </Button>
            </div>
            {form.languesCv.map((l) => (
              <div key={l.id} className="flex items-center gap-2 mb-2">
                <Input
                  value={l.nom}
                  onChange={(e) => updateLang(l.id, "nom", e.target.value)}
                  placeholder="Ex: Français, Anglais..."
                  className="text-sm flex-1"
                />
                <select
                  value={l.niveau}
                  onChange={(e) => updateLang(l.id, "niveau", e.target.value)}
                  className="text-sm border rounded-md px-2 py-1.5 bg-white"
                >
                  {L.niveau.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400"
                  onClick={() => removeLang(l.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </section>

          {/* Certifications & Loisirs */}
          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" /> {L.certifications}
            </h3>
            <Textarea
              value={form.certifications}
              onChange={(e) => updateForm("certifications", e.target.value)}
              placeholder="Ex: AWS Certified Developer, DALF C1..."
              rows={3}
            />
          </section>

          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-600" /> {L.loisirs}
            </h3>
            <Textarea
              value={form.loisirs}
              onChange={(e) => updateForm("loisirs", e.target.value)}
              placeholder="Ex: Football, Lecture, Photographie..."
              rows={2}
            />
          </section>
        </div>

        {/* ─── Preview Panel ─── */}
        <div className="flex-1 min-w-0">
          <div className="lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Aperçu en temps réel</h3>
              <Badge variant="outline" className="text-xs">Format A4</Badge>
            </div>
            <div className="overflow-auto max-h-[85vh] rounded-xl shadow-2xl border">
              <CVPreview data={form} photoUrl={photoUrl} />
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
