import { useState, useEffect, useRef } from "react";
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
  User,
  Briefcase,
  GraduationCap,
  Star,
  Globe,
  Award,
  Heart,
  FileText,
  ArrowLeft,
  Palette,
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
}

interface Competence {
  id: string;
  nom: string;
  niveau: number;
}

interface LangueCV {
  id: string;
  nom: string;
  niveau: string;
}

interface CVModerneFormData {
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
  couleurColonne: string;
}

const defaultForm: CVModerneFormData = {
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
  couleurColonne: "#1e3a5f",
};

const PRESET_COLORS = [
  "#1e3a5f", "#374151", "#065f46", "#7c3aed",
  "#b45309", "#be185d", "#0369a1", "#dc2626",
];

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── CV Moderne Preview ───────────────────────────────────────────────────────
function CVModernePreview({ data, photoUrl }: { data: CVModerneFormData; photoUrl: string | null }) {
  const col = data.couleurColonne || "#1e3a5f";
  const textOnCol = "#ffffff";

  const stars = (n: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < n ? "#ffffff" : "rgba(255,255,255,0.3)" }}>●</span>
    ));

  const progressBar = (n: number) => (
    <div className="w-full bg-white bg-opacity-20 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full bg-white"
        style={{ width: `${(n / 5) * 100}%` }}
      />
    </div>
  );

  return (
    <div
      id="cv-preview"
      className="bg-white shadow-xl font-sans"
      style={{ width: "210mm", minHeight: "297mm", display: "flex", fontSize: "9.5pt" }}
    >
      {/* Left column */}
      <div
        style={{
          width: "72mm",
          backgroundColor: col,
          color: textOnCol,
          padding: "20mm 8mm",
          flexShrink: 0,
        }}
      >
        {/* Photo */}
        {photoUrl ? (
          <div className="flex justify-center mb-4">
            <img
              src={photoUrl}
              alt="Photo"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid rgba(255,255,255,0.5)",
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <span style={{ fontSize: "28px", color: "rgba(255,255,255,0.5)" }}>👤</span>
          </div>
        )}

        {/* Name */}
        <div className="text-center mb-6">
          <p style={{ fontSize: "16pt", fontWeight: "bold", lineHeight: 1.2 }}>
            {data.prenom}
          </p>
          <p style={{ fontSize: "16pt", fontWeight: "bold", lineHeight: 1.2 }}>
            {data.nom}
          </p>
          {data.titre && (
            <p style={{ fontSize: "9pt", opacity: 0.85, marginTop: "4px" }}>{data.titre}</p>
          )}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px" }}>
            Contact
          </p>
          {data.email && <p style={{ fontSize: "8pt", marginBottom: "3px", wordBreak: "break-all" }}>✉ {data.email}</p>}
          {data.telephone && <p style={{ fontSize: "8pt", marginBottom: "3px" }}>📞 {data.telephone}</p>}
          {data.adresse && <p style={{ fontSize: "8pt", marginBottom: "3px" }}>📍 {data.adresse}</p>}
          {data.siteWeb && <p style={{ fontSize: "8pt", wordBreak: "break-all" }}>🌐 {data.siteWeb}</p>}
        </div>

        {/* Compétences */}
        {data.competences.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px" }}>
              Compétences
            </p>
            {data.competences.map((c) => (
              <div key={c.id} style={{ marginBottom: "6px" }}>
                <p style={{ fontSize: "8pt" }}>{c.nom}</p>
                {progressBar(c.niveau)}
              </div>
            ))}
          </div>
        )}

        {/* Langues */}
        {data.languesCv.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px" }}>
              Langues
            </p>
            {data.languesCv.map((l) => (
              <div key={l.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                <span style={{ fontSize: "8pt" }}>{l.nom}</span>
                <span style={{ fontSize: "7pt", opacity: 0.75 }}>{l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loisirs */}
        {data.loisirs && (
          <div>
            <p style={{ fontSize: "8pt", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, marginBottom: "6px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px" }}>
              Intérêts
            </p>
            <p style={{ fontSize: "8pt", opacity: 0.9 }}>{data.loisirs}</p>
          </div>
        )}
      </div>

      {/* Right column */}
      <div style={{ flex: 1, padding: "20mm 12mm" }}>
        {/* Résumé */}
        {data.resume && (
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "11pt", fontWeight: "bold", color: col, borderBottom: `2px solid ${col}`, paddingBottom: "4px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Profil
            </h2>
            <p style={{ fontSize: "9pt", color: "#4b5563", lineHeight: 1.6 }}>{data.resume}</p>
          </div>
        )}

        {/* Expériences */}
        {data.experiences.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "11pt", fontWeight: "bold", color: col, borderBottom: `2px solid ${col}`, paddingBottom: "4px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Expériences
            </h2>
            {data.experiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: "12px", paddingLeft: "10px", borderLeft: `3px solid ${col}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p style={{ fontWeight: "bold", fontSize: "10pt", color: "#1f2937" }}>{exp.poste}</p>
                  <p style={{ fontSize: "8pt", color: "#6b7280", flexShrink: 0, marginLeft: "8px" }}>
                    {exp.dateDebut}{exp.dateDebut && " – "}{exp.enCours ? "Présent" : exp.dateFin}
                  </p>
                </div>
                <p style={{ fontSize: "9pt", color: col, fontWeight: "500" }}>
                  {exp.entreprise}{exp.ville ? ` · ${exp.ville}` : ""}
                </p>
                {exp.description && (
                  <p style={{ fontSize: "8.5pt", color: "#4b5563", marginTop: "4px", lineHeight: 1.5, whiteSpace: "pre-line" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Formations */}
        {data.formations.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "11pt", fontWeight: "bold", color: col, borderBottom: `2px solid ${col}`, paddingBottom: "4px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Formation
            </h2>
            {data.formations.map((f) => (
              <div key={f.id} style={{ marginBottom: "10px", paddingLeft: "10px", borderLeft: `3px solid ${col}` }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p style={{ fontWeight: "bold", fontSize: "10pt", color: "#1f2937" }}>{f.diplome}</p>
                  <p style={{ fontSize: "8pt", color: "#6b7280", flexShrink: 0, marginLeft: "8px" }}>
                    {f.dateDebut}{f.dateDebut && f.dateFin && " – "}{f.dateFin}
                  </p>
                </div>
                <p style={{ fontSize: "9pt", color: col, fontWeight: "500" }}>
                  {f.etablissement}{f.ville ? ` · ${f.ville}` : ""}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications && (
          <div>
            <h2 style={{ fontSize: "11pt", fontWeight: "bold", color: col, borderBottom: `2px solid ${col}`, paddingBottom: "4px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Certifications
            </h2>
            <p style={{ fontSize: "9pt", color: "#4b5563", whiteSpace: "pre-line" }}>{data.certifications}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CVModerne() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const cvIdParam = params.get("id") ? Number(params.get("id")) : null;

  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<CVModerneFormData>(defaultForm);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [cvId, setCvId] = useState<number | null>(cvIdParam);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const createMutation = trpc.cv.create.useMutation({
    onSuccess: (data) => { setCvId(data.id); toast.success("CV créé !"); },
    onError: (e) => toast.error(e.message),
  });

  const saveDataMutation = trpc.cv.saveData.useMutation({
    onSuccess: () => { toast.success("CV sauvegardé !"); utils.cv.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

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
      couleurColonne: existingData.couleurColonne || "#1e3a5f",
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
          nom: `${form.prenom} ${form.nom} - Moderne`.trim() || "Mon CV Moderne",
          type: "moderne",
          langue: "fr",
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
        couleurColonne: form.couleurColonne,
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
      pdf.save(`CV_${form.prenom}_${form.nom}_Moderne.pdf`);
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

  const updateForm = (field: keyof CVModerneFormData, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addExp = () => updateForm("experiences", [...form.experiences, { id: uid(), poste: "", entreprise: "", ville: "", dateDebut: "", dateFin: "", enCours: false, description: "" }]);
  const updateExp = (id: string, field: keyof Experience, value: any) => updateForm("experiences", form.experiences.map((e) => e.id === id ? { ...e, [field]: value } : e));
  const removeExp = (id: string) => updateForm("experiences", form.experiences.filter((e) => e.id !== id));

  const addFormation = () => updateForm("formations", [...form.formations, { id: uid(), diplome: "", etablissement: "", ville: "", dateDebut: "", dateFin: "" }]);
  const updateFormation = (id: string, field: keyof Formation, value: any) => updateForm("formations", form.formations.map((f) => f.id === id ? { ...f, [field]: value } : f));
  const removeFormation = (id: string) => updateForm("formations", form.formations.filter((f) => f.id !== id));

  const addComp = () => updateForm("competences", [...form.competences, { id: uid(), nom: "", niveau: 3 }]);
  const updateComp = (id: string, field: keyof Competence, value: any) => updateForm("competences", form.competences.map((c) => c.id === id ? { ...c, [field]: value } : c));
  const removeComp = (id: string) => updateForm("competences", form.competences.filter((c) => c.id !== id));

  const addLang = () => updateForm("languesCv", [...form.languesCv, { id: uid(), nom: "", niveau: "Intermédiaire" }]);
  const updateLang = (id: string, field: keyof LangueCV, value: any) => updateForm("languesCv", form.languesCv.map((l) => l.id === id ? { ...l, [field]: value } : l));
  const removeLang = (id: string) => updateForm("languesCv", form.languesCv.filter((l) => l.id !== id));

  if (!authLoading && !user) {
    navigate("/connexion");
    return null;
  }

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
              <Palette className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-gray-800">CV Moderne</span>
              {cvId && <Badge variant="outline" className="text-xs">ID #{cvId}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button onClick={handleDownloadPDF} disabled={downloading} variant="outline" className="border-violet-600 text-violet-700">
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "Génération..." : "Télécharger PDF"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* ─── Form Panel ─── */}
        <div className="w-full lg:w-[420px] lg:shrink-0 space-y-6">
          {/* Couleur colonne */}
          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-violet-600" /> Couleur de la colonne
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateForm("couleurColonne", c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.couleurColonne === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Couleur personnalisée :</Label>
              <input
                type="color"
                value={form.couleurColonne}
                onChange={(e) => updateForm("couleurColonne", e.target.value)}
                className="w-10 h-8 rounded cursor-pointer border"
              />
              <span className="text-xs text-gray-500">{form.couleurColonne}</span>
            </div>
          </section>

          {/* Informations personnelles */}
          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-violet-600" /> Informations personnelles
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Prénom</Label>
                <Input value={form.prenom} onChange={(e) => updateForm("prenom", e.target.value)} placeholder="Jean" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Nom</Label>
                <Input value={form.nom} onChange={(e) => updateForm("nom", e.target.value)} placeholder="Dupont" className="mt-1" />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs">Titre / Poste visé</Label>
              <Input value={form.titre} onChange={(e) => updateForm("titre", e.target.value)} placeholder="Ingénieur logiciel" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="jean@email.com" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Téléphone</Label>
                <Input value={form.telephone} onChange={(e) => updateForm("telephone", e.target.value)} placeholder="+237 6xx xxx xxx" className="mt-1" />
              </div>
            </div>
            <div className="mt-3">
              <Label className="text-xs">Adresse</Label>
              <Input value={form.adresse} onChange={(e) => updateForm("adresse", e.target.value)} placeholder="Yaoundé, Cameroun" className="mt-1" />
            </div>
            <div className="mt-3">
              <Label className="text-xs">Site web / LinkedIn</Label>
              <Input value={form.siteWeb} onChange={(e) => updateForm("siteWeb", e.target.value)} placeholder="linkedin.com/in/jean" className="mt-1" />
            </div>
            {/* Photo */}
            <div className="mt-4 pt-4 border-t">
              <Label className="text-xs">Photo</Label>
              <div className="flex items-center gap-3 mt-2">
                {photoUrl ? (
                  <img src={photoUrl} alt="Photo" className="w-16 h-16 rounded-full object-cover border-2 border-violet-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <Button size="sm" variant="outline" onClick={() => photoInputRef.current?.click()} disabled={photoUploading} className="text-xs">
                    {photoUploading ? "Upload..." : photoUrl ? "Changer" : "Ajouter une photo"}
                  </Button>
                  {photoUrl && (
                    <Button size="sm" variant="ghost" className="text-xs text-red-500 ml-2" onClick={() => { setPhotoUrl(null); setPhotoKey(null); }}>
                      Supprimer
                    </Button>
                  )}
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
              </div>
            </div>
          </section>

          {/* Résumé */}
          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-600" /> Profil / Résumé
            </h3>
            <Textarea value={form.resume} onChange={(e) => updateForm("resume", e.target.value)} placeholder="Décrivez votre profil en 2-3 phrases..." rows={4} />
          </section>

          {/* Expériences */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-600" /> Expériences
              </h3>
              <Button size="sm" variant="outline" onClick={addExp} className="text-xs"><Plus className="w-3 h-3 mr-1" /> Ajouter</Button>
            </div>
            {form.experiences.map((exp) => (
              <div key={exp.id} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input value={exp.poste} onChange={(e) => updateExp(exp.id, "poste", e.target.value)} placeholder="Poste" className="text-sm" />
                  <Input value={exp.entreprise} onChange={(e) => updateExp(exp.id, "entreprise", e.target.value)} placeholder="Entreprise" className="text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Input value={exp.ville} onChange={(e) => updateExp(exp.id, "ville", e.target.value)} placeholder="Ville" className="text-sm" />
                  <Input value={exp.dateDebut} onChange={(e) => updateExp(exp.id, "dateDebut", e.target.value)} placeholder="Début" className="text-sm" />
                  {exp.enCours ? <span className="text-xs text-violet-600 font-medium flex items-center">Présent</span> : (
                    <Input value={exp.dateFin} onChange={(e) => updateExp(exp.id, "dateFin", e.target.value)} placeholder="Fin" className="text-sm" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" id={`encours-${exp.id}`} checked={exp.enCours} onChange={(e) => updateExp(exp.id, "enCours", e.target.checked)} className="rounded" />
                  <label htmlFor={`encours-${exp.id}`} className="text-xs text-gray-600">Poste actuel</label>
                </div>
                <Textarea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)} placeholder="Missions et réalisations..." rows={3} className="text-sm" />
                <Button size="sm" variant="ghost" className="text-red-500 text-xs mt-2" onClick={() => removeExp(exp.id)}><Trash2 className="w-3 h-3 mr-1" /> Supprimer</Button>
              </div>
            ))}
          </section>

          {/* Formations */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-600" /> Formations
              </h3>
              <Button size="sm" variant="outline" onClick={addFormation} className="text-xs"><Plus className="w-3 h-3 mr-1" /> Ajouter</Button>
            </div>
            {form.formations.map((f) => (
              <div key={f.id} className="border rounded-lg p-3 mb-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Input value={f.diplome} onChange={(e) => updateFormation(f.id, "diplome", e.target.value)} placeholder="Diplôme" className="text-sm" />
                  <Input value={f.etablissement} onChange={(e) => updateFormation(f.id, "etablissement", e.target.value)} placeholder="Établissement" className="text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={f.ville} onChange={(e) => updateFormation(f.id, "ville", e.target.value)} placeholder="Ville" className="text-sm" />
                  <Input value={f.dateDebut} onChange={(e) => updateFormation(f.id, "dateDebut", e.target.value)} placeholder="Début" className="text-sm" />
                  <Input value={f.dateFin} onChange={(e) => updateFormation(f.id, "dateFin", e.target.value)} placeholder="Fin" className="text-sm" />
                </div>
                <Button size="sm" variant="ghost" className="text-red-500 text-xs mt-2" onClick={() => removeFormation(f.id)}><Trash2 className="w-3 h-3 mr-1" /> Supprimer</Button>
              </div>
            ))}
          </section>

          {/* Compétences */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Star className="w-4 h-4 text-violet-600" /> Compétences
              </h3>
              <Button size="sm" variant="outline" onClick={addComp} className="text-xs"><Plus className="w-3 h-3 mr-1" /> Ajouter</Button>
            </div>
            {form.competences.map((c) => (
              <div key={c.id} className="flex items-center gap-2 mb-2">
                <Input value={c.nom} onChange={(e) => updateComp(c.id, "nom", e.target.value)} placeholder="Ex: Python, Excel..." className="text-sm flex-1" />
                <select value={c.niveau} onChange={(e) => updateComp(c.id, "niveau", Number(e.target.value))} className="text-sm border rounded-md px-2 py-1.5 bg-white">
                  {["Notions", "Débutant", "Intermédiaire", "Avancé", "Expert"].map((n, i) => (
                    <option key={n} value={i + 1}>{n}</option>
                  ))}
                </select>
                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => removeComp(c.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
          </section>

          {/* Langues */}
          <section className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-600" /> Langues
              </h3>
              <Button size="sm" variant="outline" onClick={addLang} className="text-xs"><Plus className="w-3 h-3 mr-1" /> Ajouter</Button>
            </div>
            {form.languesCv.map((l) => (
              <div key={l.id} className="flex items-center gap-2 mb-2">
                <Input value={l.nom} onChange={(e) => updateLang(l.id, "nom", e.target.value)} placeholder="Ex: Français..." className="text-sm flex-1" />
                <select value={l.niveau} onChange={(e) => updateLang(l.id, "niveau", e.target.value)} className="text-sm border rounded-md px-2 py-1.5 bg-white">
                  {["Débutant", "Intermédiaire", "Avancé", "Courant", "Natif"].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <Button size="sm" variant="ghost" className="text-red-400" onClick={() => removeLang(l.id)}><Trash2 className="w-3 h-3" /></Button>
              </div>
            ))}
          </section>

          {/* Certifications & Loisirs */}
          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-600" /> Certifications
            </h3>
            <Textarea value={form.certifications} onChange={(e) => updateForm("certifications", e.target.value)} placeholder="Ex: AWS Certified, PMP..." rows={3} />
          </section>

          <section className="bg-white rounded-xl border p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-violet-600" /> Centres d'intérêt
            </h3>
            <Textarea value={form.loisirs} onChange={(e) => updateForm("loisirs", e.target.value)} placeholder="Ex: Football, Lecture, Photographie..." rows={2} />
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
              <CVModernePreview data={form} photoUrl={photoUrl} />
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
