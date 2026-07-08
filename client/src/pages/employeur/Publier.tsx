import { useState, useEffect, useMemo } from "react";
import { EmployeurLayout } from "@/components/EmployeurLayout";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  User,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle2,
  Send,
  X,
  Sparkles,
  Building2,
  Coins,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { regions, getVillesForRegion } from "@/../../shared/regions-villes";
import RichTextEditor from "@/components/RichTextEditor";
import { SECTEURS as secteurs } from "@/lib/secteurs";
import { JobLangBar, type Lang } from "@/components/JobLangBar";

/**
 * Page /employeur/publier — refonte premium ("Publier une offre" dans
 * la sidebar EmployeurLayout).
 *
 * Structure :
 *  1. Hero card : badge "Nouvelle offre" + titre + sous-titre + barre
 *     de progression du remplissage
 *  2. Barre langue FR/EN + traduction assistée (JobLangBar existant)
 *  3. Grid 2 col :
 *     - LEFT  : 5 sections (Général, Profil, Conditions, Localisation,
 *       Dates) en cards premium avec icônes rondes colorées
 *     - RIGHT (sticky) : aperçu candidat mini + card astuces
 *  4. Barre d'actions (Annuler + Publier)
 *
 * i18n : bo.employerPostJob.*
 */

const C = {
  green: "#009B5A",
  greenAction: "#007A3D",
  deepGreen: "#063F24",
  darkerGreen: "#031F16",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  goldSoft: "rgba(246, 195, 67, 0.15)",
  ivory: "#FAF7EF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  blue: "#1D4ED8",
  blueSoft: "#EAF3FB",
  purple: "#5B21B6",
  purpleSoft: "#F3EAFB",
  orange: "#B45309",
  orangeSoft: "#FEF3C7",
  pink: "#BE185D",
  pinkSoft: "#FCE7F3",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

const typesContrat = [
  "CDI",
  "CDD",
  "Stage",
  "Freelance",
  "Intérim",
  "Alternance",
];

export default function EmployeurPublier() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const [villesSuggestions, setVillesSuggestions] = useState<string[]>([]);

  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const duplicateId = urlParams.get("duplicateId");

  const { data: offreToDuplicate } = trpc.jobs.duplicate.useQuery(
    { id: parseInt(duplicateId || "0") },
    { enabled: !!duplicateId }
  );

  const [activeLang, setActiveLang] = useState<Lang>("fr");

  const [formData, setFormData] = useState({
    // FR (source)
    titre: "",
    description: "",
    missions: "",
    competencesRequises: "",
    experienceRequise: "",
    niveauEtude: "",
    avantages: "",
    // EN
    titreEn: "",
    descriptionEn: "",
    missionsEn: "",
    competencesRequisesEn: "",
    experienceRequiseEn: "",
    niveauEtudeEn: "",
    avantagesEn: "",
    // Métadonnées
    typeOffre: "prive" as "public" | "prive",
    typeContrat: "",
    dureeContrat: "",
    salaire: "",
    ville: "",
    region: "",
    secteur: "",
    metier: "",
    dateLimite: "",
    dateDebut: "",
    nombrePostes: 1,
  });

  const bilingualKeys = ["titre", "description", "missions", "competencesRequises", "experienceRequise", "niveauEtude", "avantages"] as const;
  type BilingualKey = typeof bilingualKeys[number];
  const getBilingual = (key: BilingualKey) => {
    const suffix = activeLang === "en" ? "En" : "";
    return (formData as any)[`${key}${suffix}`] || "";
  };
  const setBilingual = (key: BilingualKey, value: string) => {
    const targetKey = activeLang === "en" ? `${key}En` : key;
    setFormData((prev) => ({ ...prev, [targetKey]: value }));
  };

  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerPostJob.publishedToast"));
      setLocation("/employeur/offres");
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (offreToDuplicate) {
      setFormData({
        titre: offreToDuplicate.titre || "",
        description: offreToDuplicate.description || "",
        missions: offreToDuplicate.missions || "",
        competencesRequises: offreToDuplicate.competencesRequises || "",
        experienceRequise: offreToDuplicate.experienceRequise || "",
        niveauEtude: offreToDuplicate.niveauEtude || "",
        avantages: offreToDuplicate.avantages || "",
        titreEn: (offreToDuplicate as any).titreEn || "",
        descriptionEn: (offreToDuplicate as any).descriptionEn || "",
        missionsEn: (offreToDuplicate as any).missionsEn || "",
        competencesRequisesEn: (offreToDuplicate as any).competencesRequisesEn || "",
        experienceRequiseEn: (offreToDuplicate as any).experienceRequiseEn || "",
        niveauEtudeEn: (offreToDuplicate as any).niveauEtudeEn || "",
        avantagesEn: (offreToDuplicate as any).avantagesEn || "",
        typeOffre: offreToDuplicate.typeOffre || "prive",
        typeContrat: offreToDuplicate.typeContrat || "",
        dureeContrat: offreToDuplicate.dureeContrat || "",
        salaire: offreToDuplicate.salaire || "",
        ville: offreToDuplicate.ville || "",
        region: offreToDuplicate.region || "",
        secteur: offreToDuplicate.secteur || "",
        metier: offreToDuplicate.metier || "",
        dateLimite: "",
        dateDebut: "",
        nombrePostes: offreToDuplicate.nombrePostes || 1,
      });
      if (offreToDuplicate.region) {
        setVillesSuggestions(getVillesForRegion(offreToDuplicate.region));
      }
      toast.info(t("bo.employerPostJob.duplicatedToast"));
    }
  }, [offreToDuplicate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || formData.titre.length < 5) {
      toast.error(t("bo.employerPostJob.errTitleTooShort"));
      return;
    }
    if (!formData.description || formData.description.length < 50) {
      toast.error(t("bo.employerPostJob.errDescTooShort"));
      return;
    }
    if (!formData.typeContrat) {
      toast.error(t("bo.employerPostJob.errContractRequired"));
      return;
    }
    if (!formData.ville || !formData.region || !formData.secteur) {
      toast.error(t("bo.employerPostJob.errAllRequired"));
      return;
    }
    createMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "region") {
      const villes = getVillesForRegion(value);
      setVillesSuggestions(villes);
      if (formData.ville && !villes.includes(formData.ville)) {
        setFormData((prev) => ({ ...prev, ville: "" }));
      }
    }
  };

  // Progression : % de champs remplis (FR de référence)
  const completion = useMemo(() => {
    const fields = [
      formData.titre,
      formData.description,
      formData.missions,
      formData.competencesRequises,
      formData.experienceRequise,
      formData.niveauEtude,
      formData.avantages,
      formData.typeContrat,
      formData.salaire,
      formData.ville,
      formData.region,
      formData.secteur,
      formData.metier,
      formData.dateLimite,
    ];
    const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData]);

  return (
    <EmployeurLayout
      title={t("bo.employerPostJob.title")}
      subtitle={t("bo.employerPostJob.heroSubtitleShort")}
      activeKey="postJob"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* ═══ COLONNE PRINCIPALE ═══════════════════════════ */}
          <div className="space-y-5 min-w-0">
            {/* Hero card */}
            <motion.section {...animate(0)}>
              <div
                className="relative rounded-2xl overflow-hidden p-5 lg:p-6"
                style={{
                  background: `linear-gradient(120deg, ${C.deepGreen} 0%, ${C.darkerGreen} 100%)`,
                  boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.4)",
                }}
              >
                <div aria-hidden="true" className="absolute -top-20 right-20 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: C.gold }} />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border-2"
                    style={{ backgroundColor: C.green, borderColor: C.gold }}
                  >
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest mb-2" style={{ backgroundColor: C.goldSoft, color: C.gold }}>
                      <Sparkles className="h-3 w-3" />
                      {t("bo.employerPostJob.heroBadge")}
                    </div>
                    <h2 className="text-white font-extrabold text-[22px] leading-tight">
                      {t("bo.employerPostJob.title")}
                    </h2>
                    <p className="text-[13.5px] mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {t("bo.employerPostJob.heroSubtitleShort")}
                    </p>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11.5px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {t("bo.employerPostJob.sidebarProgressLabel")}
                        </span>
                        <span className="text-[13px] font-bold" style={{ color: C.gold }}>
                          {completion}%
                        </span>
                      </div>
                      <div className="relative w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                          style={{ width: `${completion}%`, backgroundColor: C.gold }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Barre langue FR/EN */}
            <motion.section {...animate(1)}>
              <JobLangBar
                activeLang={activeLang}
                setActiveLang={setActiveLang}
                values={{
                  fr: {
                    titre: formData.titre,
                    description: formData.description,
                    missions: formData.missions,
                    competencesRequises: formData.competencesRequises,
                    experienceRequise: formData.experienceRequise,
                    niveauEtude: formData.niveauEtude,
                    avantages: formData.avantages,
                  },
                  en: {
                    titre: formData.titreEn,
                    description: formData.descriptionEn,
                    missions: formData.missionsEn,
                    competencesRequises: formData.competencesRequisesEn,
                    experienceRequise: formData.experienceRequiseEn,
                    niveauEtude: formData.niveauEtudeEn,
                    avantages: formData.avantagesEn,
                  },
                }}
                onTranslated={(target, translated) => {
                  const suffix = target === "en" ? "En" : "";
                  setFormData((prev) => ({
                    ...prev,
                    [`titre${suffix}`]: translated.titre,
                    [`description${suffix}`]: translated.description,
                    [`missions${suffix}`]: translated.missions || "",
                    [`competencesRequises${suffix}`]: translated.competencesRequises || "",
                    [`experienceRequise${suffix}`]: translated.experienceRequise || "",
                    [`niveauEtude${suffix}`]: translated.niveauEtude || "",
                    [`avantages${suffix}`]: translated.avantages || "",
                  }));
                }}
              />
            </motion.section>

            {/* Informations générales */}
            <motion.section {...animate(2)}>
              <SectionCard
                icon={FileText}
                iconColor={C.green}
                iconBg={C.greenSoft}
                title={t("bo.employerPostJob.sectionGeneralTitle")}
                subtitle={t("bo.employerPostJob.sectionGeneralDesc")}
              >
                <div className="space-y-4">
                  <FormField label={t("bo.employerPostJob.titleLabel")} required>
                    <Input
                      value={getBilingual("titre")}
                      onChange={(e) => setBilingual("titre", e.target.value)}
                      placeholder={t("bo.employerPostJob.titlePh")}
                      required={activeLang === "fr"}
                      className="h-11 rounded-lg"
                    />
                  </FormField>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label={t("bo.employerPostJob.typeOffer")} required>
                      <Select
                        value={formData.typeOffre}
                        onValueChange={(value) => handleChange("typeOffre", value)}
                      >
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prive">{t("bo.employerPostJob.offerPrivate")}</SelectItem>
                          <SelectItem value="public">{t("bo.employerPostJob.offerPublic")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label={t("bo.employerPostJob.sector")} required>
                      <Select
                        value={formData.secteur}
                        onValueChange={(value) => handleChange("secteur", value)}
                      >
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue placeholder={t("bo.employerPostJob.sectorPh")} />
                        </SelectTrigger>
                        <SelectContent>
                          {secteurs.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <FormField label={t("bo.employerPostJob.job")}>
                    <Input
                      value={formData.metier}
                      onChange={(e) => handleChange("metier", e.target.value)}
                      placeholder={t("bo.employerPostJob.jobPh")}
                      className="h-11 rounded-lg"
                    />
                  </FormField>

                  <FormField label={t("bo.employerPostJob.descLabel")} required helpText={t("bo.employerPostJob.descHelp")}>
                    <RichTextEditor
                      key={`desc-${activeLang}`}
                      value={getBilingual("description")}
                      onChange={(value) => setBilingual("description", value)}
                      placeholder={t("bo.employerPostJob.descPh")}
                      minHeight="180px"
                    />
                  </FormField>

                  <FormField label={t("bo.employerPostJob.missions")}>
                    <RichTextEditor
                      key={`missions-${activeLang}`}
                      value={getBilingual("missions")}
                      onChange={(value) => setBilingual("missions", value)}
                      placeholder={t("bo.employerPostJob.missionsPh")}
                      minHeight="150px"
                    />
                  </FormField>
                </div>
              </SectionCard>
            </motion.section>

            {/* Profil recherché */}
            <motion.section {...animate(3)}>
              <SectionCard
                icon={User}
                iconColor={C.purple}
                iconBg={C.purpleSoft}
                title={t("bo.employerPostJob.sectionProfileTitle")}
                subtitle={t("bo.employerPostJob.sectionProfileDesc")}
              >
                <div className="space-y-4">
                  <FormField label={t("bo.employerPostJob.skills")}>
                    <RichTextEditor
                      key={`skills-${activeLang}`}
                      value={getBilingual("competencesRequises")}
                      onChange={(value) => setBilingual("competencesRequises", value)}
                      placeholder={t("bo.employerPostJob.skillsPh")}
                      minHeight="150px"
                    />
                  </FormField>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label={t("bo.employerPostJob.experience")}>
                      <Input
                        value={getBilingual("experienceRequise")}
                        onChange={(e) => setBilingual("experienceRequise", e.target.value)}
                        placeholder={t("bo.employerPostJob.experiencePh")}
                        className="h-11 rounded-lg"
                      />
                    </FormField>
                    <FormField label={t("bo.employerPostJob.education")}>
                      <Input
                        value={getBilingual("niveauEtude")}
                        onChange={(e) => setBilingual("niveauEtude", e.target.value)}
                        placeholder={t("bo.employerPostJob.educationPh")}
                        className="h-11 rounded-lg"
                      />
                    </FormField>
                  </div>
                </div>
              </SectionCard>
            </motion.section>

            {/* Conditions de travail */}
            <motion.section {...animate(4)}>
              <SectionCard
                icon={Briefcase}
                iconColor={C.blue}
                iconBg={C.blueSoft}
                title={t("bo.employerPostJob.sectionConditionsTitle")}
                subtitle={t("bo.employerPostJob.sectionConditionsDesc")}
              >
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label={t("bo.employerPostJob.contractType")} required>
                      <Select
                        value={formData.typeContrat}
                        onValueChange={(value) => handleChange("typeContrat", value)}
                      >
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue placeholder={t("bo.employerPostJob.contractTypePh")} />
                        </SelectTrigger>
                        <SelectContent>
                          {typesContrat.map((tc) => (
                            <SelectItem key={tc} value={tc}>{tc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    {formData.typeContrat && formData.typeContrat !== "CDI" && (
                      <FormField label={t("bo.employerPostJob.contractDuration")}>
                        <Input
                          value={formData.dureeContrat}
                          onChange={(e) => handleChange("dureeContrat", e.target.value)}
                          placeholder={t("bo.employerPostJob.contractDurationPh")}
                          className="h-11 rounded-lg"
                        />
                      </FormField>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField label={t("bo.employerPostJob.salary")}>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                        <Input
                          value={formData.salaire}
                          onChange={(e) => handleChange("salaire", e.target.value)}
                          placeholder={t("bo.employerPostJob.salaryPh")}
                          className="pl-10 h-11 rounded-lg"
                        />
                      </div>
                    </FormField>
                    <FormField label={t("bo.employerPostJob.positions")}>
                      <Input
                        type="number"
                        min="1"
                        value={formData.nombrePostes}
                        onChange={(e) => handleChange("nombrePostes", parseInt(e.target.value) || 1)}
                        className="h-11 rounded-lg"
                      />
                    </FormField>
                  </div>

                  <FormField label={t("bo.employerPostJob.benefits")}>
                    <Textarea
                      value={getBilingual("avantages")}
                      onChange={(e) => setBilingual("avantages", e.target.value)}
                      placeholder={t("bo.employerPostJob.benefitsPh")}
                      rows={3}
                      className="rounded-lg resize-none"
                    />
                  </FormField>
                </div>
              </SectionCard>
            </motion.section>

            {/* Localisation */}
            <motion.section {...animate(5)}>
              <SectionCard
                icon={MapPin}
                iconColor={C.orange}
                iconBg={C.orangeSoft}
                title={t("bo.employerPostJob.sectionLocationTitle")}
                subtitle={t("bo.employerPostJob.sectionLocationDesc")}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label={t("bo.employerPostJob.region")} required>
                    <Select
                      value={formData.region}
                      onValueChange={(value) => handleChange("region", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg">
                        <SelectValue placeholder={t("bo.employerPostJob.regionPh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField
                    label={t("bo.employerPostJob.city")}
                    required
                    helpText={!formData.region ? t("bo.employerPostJob.cityHelpEmptyRegion") : undefined}
                  >
                    {villesSuggestions.length > 0 ? (
                      <Select
                        value={formData.ville}
                        onValueChange={(value) => handleChange("ville", value)}
                      >
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue placeholder={t("bo.employerPostJob.cityPh")} />
                        </SelectTrigger>
                        <SelectContent>
                          {villesSuggestions.map((ville) => (
                            <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.ville}
                        onChange={(e) => handleChange("ville", e.target.value)}
                        placeholder={t("bo.employerPostJob.cityDisabledPh")}
                        disabled={!formData.region}
                        required
                        className="h-11 rounded-lg"
                      />
                    )}
                  </FormField>
                </div>
              </SectionCard>
            </motion.section>

            {/* Dates */}
            <motion.section {...animate(6)}>
              <SectionCard
                icon={Calendar}
                iconColor={C.pink}
                iconBg={C.pinkSoft}
                title={t("bo.employerPostJob.sectionDatesTitle")}
                subtitle={t("bo.employerPostJob.sectionDatesDesc")}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label={t("bo.employerPostJob.dateLimit")}>
                    <Input
                      type="date"
                      value={formData.dateLimite}
                      onChange={(e) => handleChange("dateLimite", e.target.value)}
                      className="h-11 rounded-lg"
                    />
                  </FormField>
                  <FormField label={t("bo.employerPostJob.dateStart")}>
                    <Input
                      type="date"
                      value={formData.dateDebut}
                      onChange={(e) => handleChange("dateDebut", e.target.value)}
                      className="h-11 rounded-lg"
                    />
                  </FormField>
                </div>
              </SectionCard>
            </motion.section>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/employeur/dashboard")}
                disabled={createMutation.isPending}
                className="h-11 rounded-xl font-semibold"
                style={{ borderColor: C.border, color: C.textMain }}
              >
                <X className="h-4 w-4 mr-1.5" />
                {t("bo.employerPostJob.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-11 rounded-xl font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: C.deepGreen }}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("bo.employerPostJob.publishing")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t("bo.employerPostJob.publishBtn")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ═══ SIDEBAR RIGHT (sticky) ═══════════════════════ */}
          <aside className="space-y-5 xl:sticky xl:top-24 self-start">
            {/* Aperçu candidat */}
            <motion.div {...animate(2)}>
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
                <h3 className="font-bold text-[14px] mb-4 flex items-center gap-2" style={{ color: C.textMain }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                    <Building2 className="h-3.5 w-3.5" style={{ color: C.green }} />
                  </div>
                  {t("bo.employerPostJob.sidebarPreviewTitle")}
                </h3>

                <div className="border rounded-xl p-3.5 bg-white" style={{ borderColor: C.border }}>
                  {/* Titre */}
                  <p className="font-bold text-[14px] leading-snug line-clamp-2" style={{ color: getBilingual("titre") ? C.textMain : C.textMuted }}>
                    {getBilingual("titre") || t("bo.employerPostJob.previewTitleFallback")}
                  </p>

                  {/* Meta line */}
                  <div className="flex flex-wrap gap-2 mt-2 text-[11.5px]" style={{ color: C.textMuted }}>
                    {formData.typeContrat && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}>
                        {formData.typeContrat}
                      </span>
                    )}
                    {formData.ville || formData.region ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[formData.ville, formData.region].filter(Boolean).join(", ")}
                      </span>
                    ) : (
                      <span className="italic">{t("bo.employerPostJob.previewLocationFallback")}</span>
                    )}
                  </div>

                  {/* Sector + salary */}
                  <div className="mt-2.5 pt-2.5 border-t space-y-1 text-[11.5px]" style={{ borderColor: C.border, color: C.textMain }}>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3 w-3 shrink-0" style={{ color: C.textMuted }} />
                      <span className="truncate">{formData.secteur || t("bo.employerPostJob.previewSectorFallback")}</span>
                    </div>
                    {formData.salaire && (
                      <div className="flex items-center gap-1.5">
                        <Coins className="h-3 w-3 shrink-0" style={{ color: C.textMuted }} />
                        <span className="truncate">{formData.salaire}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: C.textMuted }}>
                  {t("bo.employerPostJob.sidebarProgressHelp")}
                </p>
              </div>
            </motion.div>

            {/* Astuces */}
            <motion.div {...animate(3)}>
              <div
                className="rounded-2xl border p-5"
                style={{
                  background: `linear-gradient(160deg, ${C.ivory} 0%, #ffffff 100%)`,
                  borderColor: "rgba(246, 195, 67, 0.35)",
                }}
              >
                <h3 className="font-bold text-[14px] mb-3 flex items-center gap-2" style={{ color: C.textMain }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: C.goldSoft }}>
                    <Sparkles className="h-3.5 w-3.5" style={{ color: C.gold }} />
                  </div>
                  {t("bo.employerPostJob.sidebarTipsTitle")}
                </h3>
                <ul className="space-y-2.5">
                  {["sidebarTip1", "sidebarTip2", "sidebarTip3", "sidebarTip4"].map((key) => (
                    <li key={key} className="flex items-start gap-2 text-[12.5px]" style={{ color: C.textMain }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: C.greenSoft }}>
                        <CheckCircle2 className="h-3 w-3" style={{ color: C.green }} />
                      </div>
                      <span className="leading-relaxed">{t(`bo.employerPostJob.${key}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </aside>
        </div>
      </form>
    </EmployeurLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, iconColor, iconBg, title, subtitle, children }: SectionCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border p-5 lg:p-6"
      style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}
    >
      <div className="flex items-start gap-3 mb-5">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-4.5 w-4.5" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-[16px]" style={{ color: C.textMain }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-[12.5px] mt-0.5 leading-relaxed" style={{ color: C.textMuted }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

function FormField({ label, required, helpText, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-semibold" style={{ color: C.textMain }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: "#DC2626" }}>*</span>}
      </Label>
      {children}
      {helpText && (
        <p className="text-[11.5px] leading-relaxed" style={{ color: C.textMuted }}>
          {helpText}
        </p>
      )}
    </div>
  );
}
