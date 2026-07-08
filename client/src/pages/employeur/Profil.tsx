import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CAMEROON_REGIONS, CAMEROON_CITIES_BY_REGION } from "@shared/cameroon-data";
import {
  Building2,
  Camera,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { EmployeurLayout } from "@/components/EmployeurLayout";
import { SECTEURS } from "@/lib/secteurs";

/**
 * Page /employeur/profil — refonte premium ("Paramètres" dans la
 * sidebar EmployeurLayout).
 *
 * Structure :
 *  1. Hero : logo entreprise (avatar rond gros) + nom + secteur +
 *     progress bar de complétion du profil + CTA Enregistrer sticky
 *  2. Grid 2 col :
 *     - LEFT (2fr) : 4 sections premium (Logo, Infos générales,
 *       Coordonnées, Contact RH)
 *     - RIGHT (1fr, sticky) : card "Aperçu profil public" +
 *       card "Astuces" (comment améliorer)
 *  3. Barre d'actions en bas (Enregistrer + Annuler)
 *
 * i18n : bo.employerProfile.*
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
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function EmployeurProfil() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const TAILLES = [
    { value: "1-10", label: t("bo.employerProfile.sizeOptions.s1") },
    { value: "11-50", label: t("bo.employerProfile.sizeOptions.s2") },
    { value: "51-200", label: t("bo.employerProfile.sizeOptions.s3") },
    { value: "201-500", label: t("bo.employerProfile.sizeOptions.s4") },
    { value: "500+", label: t("bo.employerProfile.sizeOptions.s5") },
  ];

  const { data: profile, isLoading, refetch } = trpc.employeur.getProfile.useQuery();

  const updateProfileMutation = trpc.employeur.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerProfile.savedToast"));
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const uploadLogoMutation = trpc.employeur.uploadLogo.useMutation({
    onSuccess: (data) => {
      toast.success(t("bo.employerProfile.logoUpdatedToast"));
      setLogoPreview(data.logoUrl);
      refetch();
      setIsUploadingLogo(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUploadingLogo(false);
    },
  });

  const [formData, setFormData] = useState({
    nomEntreprise: "",
    secteurActivite: "",
    taille: "",
    siteWeb: "",
    telephone: "",
    adresse: "",
    ville: "",
    region: "",
    codePostal: "",
    description: "",
    nomContact: "",
    prenomContact: "",
    posteContact: "",
    emailContact: "",
    telephoneContact: "",
  });

  const [selectedRegion, setSelectedRegion] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "employeur" && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (profile) {
      setFormData({
        nomEntreprise: profile.nomEntreprise || "",
        secteurActivite: profile.secteurActivite || "",
        taille: profile.taille || "",
        siteWeb: profile.siteWeb || "",
        telephone: profile.telephone || "",
        adresse: profile.adresse || "",
        ville: profile.ville || "",
        region: profile.region || "",
        codePostal: profile.codePostal || "",
        description: profile.description || "",
        nomContact: profile.nomContact || "",
        prenomContact: profile.prenomContact || "",
        posteContact: profile.posteContact || "",
        emailContact: profile.emailContact || "",
        telephoneContact: profile.telephoneContact || "",
      });
      if (profile.region) {
        setSelectedRegion(profile.region);
        const cities = (CAMEROON_CITIES_BY_REGION as Record<string, string[]>)[profile.region] || [];
        setAvailableCities(cities);
      }
      if (profile.logoUrl) {
        setLogoPreview(profile.logoUrl);
      }
    }
  }, [profile]);

  // Complétion profil (pourcentage rempli)
  const completion = useMemo(() => {
    const fields = [
      formData.nomEntreprise,
      formData.secteurActivite,
      formData.taille,
      formData.description,
      formData.telephone,
      formData.siteWeb,
      formData.region,
      formData.ville,
      formData.adresse,
      formData.prenomContact,
      formData.nomContact,
      formData.posteContact,
      formData.emailContact,
      formData.telephoneContact,
      logoPreview,
    ];
    const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [formData, logoPreview]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("bo.employerProfile.logoTooBigToast"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error(t("bo.employerProfile.notImageToast"));
      return;
    }

    setIsUploadingLogo(true);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);

    const base64 = await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result as string);
      r.readAsDataURL(file);
    });
    uploadLogoMutation.mutate({
      fileData: base64.split(",")[1],
      fileName: file.name,
      mimeType: file.type,
    });
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setFormData({ ...formData, region: value, ville: "" });
    const cities = (CAMEROON_CITIES_BY_REGION as Record<string, string[]>)[value] || [];
    setAvailableCities(cities);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (authLoading || isLoading) {
    return (
      <EmployeurLayout title={t("bo.employerLayout.nav.settings")} activeKey="settings">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: C.green }} />
        </div>
      </EmployeurLayout>
    );
  }

  const initial = (formData.nomEntreprise || "E").charAt(0).toUpperCase();

  return (
    <EmployeurLayout
      title={t("bo.employerProfile.title")}
      subtitle={t("bo.employerProfile.subtitle")}
      activeKey="settings"
      actions={
        <Button
          onClick={handleSubmit as any}
          disabled={updateProfileMutation.isPending}
          className="h-10 rounded-lg font-semibold text-white shadow-sm hidden sm:inline-flex"
          style={{ backgroundColor: C.deepGreen }}
        >
          {updateProfileMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1.5" />
          )}
          {t("bo.employerProfile.saveBtn")}
        </Button>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
          {/* ═══ COLONNE PRINCIPALE ═══════════════════════════ */}
          <div className="space-y-5 min-w-0">
            {/* Hero card : logo + nom + progression */}
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
                  {/* Logo */}
                  <div className="relative shrink-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-20 h-20 rounded-2xl object-contain bg-white p-1.5 border-2"
                        style={{ borderColor: C.gold }}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center font-extrabold text-white text-3xl border-2"
                        style={{ backgroundColor: C.green, borderColor: C.gold }}
                      >
                        {initial}
                      </div>
                    )}
                    {isUploadingLogo && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-transform"
                      style={{ backgroundColor: C.gold }}
                      aria-label={t("bo.employerProfile.logoAdd")}
                    >
                      <Camera className="h-3.5 w-3.5" style={{ color: C.deepGreen }} />
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>

                  {/* Nom + secteur + progression */}
                  <div className="flex-1 min-w-0 w-full">
                    <h2 className="text-white font-extrabold text-[22px] leading-tight truncate">
                      {formData.nomEntreprise || t("bo.employerProfile.title")}
                    </h2>
                    {formData.secteurActivite && (
                      <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {formData.secteurActivite}
                      </p>
                    )}

                    {/* Progress bar complétion */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11.5px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                          Complétion du profil
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
                      <p className="text-[11.5px] mt-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {completion === 100
                          ? "Votre profil est complet — parfait pour attirer les meilleurs talents."
                          : "Complétez votre profil pour maximiser la visibilité de vos offres."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Informations générales */}
            <motion.section {...animate(1)}>
              <SectionCard
                icon={Building2}
                iconColor={C.green}
                iconBg={C.greenSoft}
                title={t("bo.employerProfile.generalInfo")}
                subtitle={t("bo.employerProfile.generalInfoDesc")}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label={t("bo.employerProfile.companyName")} required span={2}>
                    <Input
                      value={formData.nomEntreprise}
                      onChange={(e) => setFormData({ ...formData, nomEntreprise: e.target.value })}
                      placeholder={t("bo.employerProfile.companyNamePh")}
                      required
                      className="h-11 rounded-lg"
                    />
                  </FormField>
                  <FormField label={t("bo.employerProfile.sector")}>
                    <Select value={formData.secteurActivite} onValueChange={(v) => setFormData({ ...formData, secteurActivite: v })}>
                      <SelectTrigger className="h-11 rounded-lg">
                        <SelectValue placeholder={t("bo.employerProfile.sectorPh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTEURS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t("bo.employerProfile.size")}>
                    <Select value={formData.taille} onValueChange={(v) => setFormData({ ...formData, taille: v })}>
                      <SelectTrigger className="h-11 rounded-lg">
                        <SelectValue placeholder={t("bo.employerProfile.sizePh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {TAILLES.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t("bo.employerProfile.description")} span={2}>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t("bo.employerProfile.descriptionPh")}
                      rows={4}
                      className="rounded-lg resize-none"
                    />
                  </FormField>
                </div>
              </SectionCard>
            </motion.section>

            {/* Coordonnées */}
            <motion.section {...animate(2)}>
              <SectionCard
                icon={MapPin}
                iconColor={C.blue}
                iconBg={C.blueSoft}
                title={t("bo.employerProfile.contactSection")}
                subtitle="Comment vous joindre et où vous trouver."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label={t("bo.employerProfile.phone")}>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                      <Input
                        value={formData.telephone}
                        onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                        placeholder={t("bo.employerProfile.phonePh")}
                        className="pl-10 h-11 rounded-lg"
                      />
                    </div>
                  </FormField>
                  <FormField label={t("bo.employerProfile.website")}>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                      <Input
                        value={formData.siteWeb}
                        onChange={(e) => setFormData({ ...formData, siteWeb: e.target.value })}
                        placeholder={t("bo.employerProfile.websitePh")}
                        className="pl-10 h-11 rounded-lg"
                      />
                    </div>
                  </FormField>
                  <FormField label={t("bo.employerProfile.region")}>
                    <Select value={selectedRegion} onValueChange={handleRegionChange}>
                      <SelectTrigger className="h-11 rounded-lg">
                        <SelectValue placeholder={t("bo.employerProfile.regionPh")} />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMEROON_REGIONS.map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.labelFr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label={t("bo.employerProfile.city")}>
                    {availableCities.length > 0 ? (
                      <Select value={formData.ville} onValueChange={(v) => setFormData({ ...formData, ville: v })}>
                        <SelectTrigger className="h-11 rounded-lg">
                          <SelectValue placeholder={t("bo.employerProfile.cityPh")} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                        placeholder={t("bo.employerProfile.cityPh")}
                        className="h-11 rounded-lg"
                      />
                    )}
                  </FormField>
                  <FormField label={t("bo.employerProfile.address")} span={2}>
                    <Input
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      placeholder={t("bo.employerProfile.addressPh")}
                      className="h-11 rounded-lg"
                    />
                  </FormField>
                </div>
              </SectionCard>
            </motion.section>

            {/* Contact RH */}
            <motion.section {...animate(3)}>
              <SectionCard
                icon={Users}
                iconColor={C.purple}
                iconBg={C.purpleSoft}
                title={t("bo.employerProfile.rhSection")}
                subtitle={t("bo.employerProfile.rhDesc")}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label={t("bo.employerProfile.firstName")}>
                    <Input
                      value={formData.prenomContact}
                      onChange={(e) => setFormData({ ...formData, prenomContact: e.target.value })}
                      placeholder={t("bo.employerProfile.firstNamePh")}
                      className="h-11 rounded-lg"
                    />
                  </FormField>
                  <FormField label={t("bo.employerProfile.lastName")}>
                    <Input
                      value={formData.nomContact}
                      onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })}
                      placeholder={t("bo.employerProfile.lastNamePh")}
                      className="h-11 rounded-lg"
                    />
                  </FormField>
                  <FormField label={t("bo.employerProfile.positionContact")}>
                    <Input
                      value={formData.posteContact}
                      onChange={(e) => setFormData({ ...formData, posteContact: e.target.value })}
                      placeholder={t("bo.employerProfile.positionContactPh")}
                      className="h-11 rounded-lg"
                    />
                  </FormField>
                  <FormField label={t("bo.employerProfile.directPhone")}>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                      <Input
                        value={formData.telephoneContact}
                        onChange={(e) => setFormData({ ...formData, telephoneContact: e.target.value })}
                        placeholder={t("bo.employerProfile.phonePh")}
                        className="pl-10 h-11 rounded-lg"
                      />
                    </div>
                  </FormField>
                  <FormField label={t("bo.employerProfile.emailContact")} span={2}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: C.textMuted }} />
                      <Input
                        type="email"
                        value={formData.emailContact}
                        onChange={(e) => setFormData({ ...formData, emailContact: e.target.value })}
                        placeholder={t("bo.employerProfile.emailContactPh")}
                        className="pl-10 h-11 rounded-lg"
                      />
                    </div>
                  </FormField>
                </div>
              </SectionCard>
            </motion.section>

            {/* Actions bottom */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/employeur/dashboard")}
                className="h-11 rounded-xl font-semibold"
                style={{ borderColor: C.border, color: C.textMain }}
              >
                <X className="h-4 w-4 mr-1.5" />
                {t("bo.common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="h-11 rounded-xl font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: C.deepGreen }}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("bo.common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("bo.employerProfile.saveBtn")}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ═══ SIDEBAR RIGHT (sticky) ═══════════════════════ */}
          <aside className="space-y-5 xl:sticky xl:top-24 self-start">
            {/* Aperçu profil public */}
            <motion.div {...animate(1)}>
              <div className="bg-white rounded-2xl border p-5" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
                <h3 className="font-bold text-[14px] mb-4 flex items-center gap-2" style={{ color: C.textMain }}>
                  <User className="h-4 w-4" style={{ color: C.green }} />
                  Aperçu du profil
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="" className="w-12 h-12 rounded-lg object-contain border bg-white p-1" style={{ borderColor: C.border }} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white" style={{ backgroundColor: C.green }}>
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] truncate" style={{ color: C.textMain }}>
                      {formData.nomEntreprise || "Nom entreprise"}
                    </p>
                    <p className="text-[11.5px] truncate" style={{ color: C.textMuted }}>
                      {formData.secteurActivite || "Secteur"}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-[12.5px]" style={{ color: C.textMain }}>
                  {formData.ville && (
                    <li className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: C.textMuted }} />
                      <span className="truncate">{formData.ville}{formData.region ? `, ${formData.region}` : ""}</span>
                    </li>
                  )}
                  {formData.telephone && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: C.textMuted }} />
                      <span className="truncate">{formData.telephone}</span>
                    </li>
                  )}
                  {formData.siteWeb && (
                    <li className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 shrink-0" style={{ color: C.textMuted }} />
                      <span className="truncate">{formData.siteWeb}</span>
                    </li>
                  )}
                  {formData.emailContact && (
                    <li className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: C.textMuted }} />
                      <span className="truncate">{formData.emailContact}</span>
                    </li>
                  )}
                </ul>
              </div>
            </motion.div>

            {/* Astuces */}
            <motion.div {...animate(2)}>
              <div
                className="rounded-2xl border p-5"
                style={{
                  background: `linear-gradient(160deg, ${C.ivory} 0%, #ffffff 100%)`,
                  borderColor: "rgba(246, 195, 67, 0.35)",
                }}
              >
                <h3 className="font-bold text-[14px] mb-3 flex items-center gap-2" style={{ color: C.textMain }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: C.goldSoft }}>
                    <CheckCircle2 className="h-4 w-4" style={{ color: C.gold }} />
                  </div>
                  Astuces pour un profil complet
                </h3>
                <ul className="space-y-2.5">
                  {[
                    "Ajoutez un logo de qualité pour être reconnaissable.",
                    "Rédigez une description qui présente vos valeurs.",
                    "Complétez toutes les coordonnées pour être joignable.",
                    "Un profil à 100% attire 3x plus de candidatures.",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px]" style={{ color: C.textMain }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: C.greenSoft }}>
                        <CheckCircle2 className="h-3 w-3" style={{ color: C.green }} />
                      </div>
                      <span className="leading-relaxed">{tip}</span>
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
  span?: 1 | 2;
  children: React.ReactNode;
}

function FormField({ label, required, span, children }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${span === 2 ? "md:col-span-2" : ""}`}>
      <Label className="text-[13px] font-semibold" style={{ color: C.textMain }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: "#DC2626" }}>*</span>}
      </Label>
      {children}
    </div>
  );
}
