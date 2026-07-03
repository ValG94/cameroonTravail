import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CAMEROON_REGIONS, CAMEROON_CITIES_BY_REGION, formatCameroonPhone } from "@shared/cameroon-data";
import {
  Bell,
  Briefcase,
  Camera,
  ChevronLeft,
  Crown,
  Eye,
  FileText,
  GraduationCap,
  Info,
  Loader2,
  Lock,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  User,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Page /candidat/profil — refonte premium (sidebar + hero + main + secure).
 *
 * Layout :
 *  - Sidebar gauche (280px) : back Dashboard + nav sections PROFIL/COMPTE
 *    + card Boost Premium bas
 *  - Contenu droite :
 *      1) Hero blanche avec carnet en overflow (repris du Dashboard)
 *      2) Grid 2 col : formulaire principal (2fr) + card "Vos infos
 *         sont sécurisées" (1fr)
 *      3) Bandeau info bas ("Garder profil à jour…")
 *
 * i18n : namespace profile.account.*
 */

const C = {
  green: "#009B5A",
  deepGreen: "#063F24",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  ivory: "#FAF7EF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function CandidatProfil() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const { data: profile, isLoading } = trpc.candidat.getProfile.useQuery();
  const updateProfileMutation = trpc.candidat.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("profile.account.updateSuccess"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    adresse: "",
    ville: "",
    region: "",
    nationalite: "Camerounaise",
    situationMatrimoniale: "",
  });

  const [selectedRegion, setSelectedRegion] = useState("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const uploadPhotoMutation = trpc.candidat.uploadPhoto.useMutation({
    onSuccess: (data) => {
      toast.success(t("profile.account.updateSuccess"));
      setPhotoPreview(data.photoUrl);
      setIsUploadingPhoto(false);
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setIsUploadingPhoto(false);
    },
  });

  useEffect(() => {
    if (!authLoading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  useEffect(() => {
    if (profile) {
      setFormData({
        prenom: profile.prenom || "",
        nom: profile.nom || "",
        telephone: profile.telephone || "",
        adresse: profile.adresse || "",
        ville: profile.ville || "",
        region: profile.region || "",
        nationalite: profile.nationalite || "Camerounaise",
        situationMatrimoniale: profile.situationMatrimoniale || "",
      });
      if (profile.region) {
        setSelectedRegion(profile.region);
        const cities = CAMEROON_CITIES_BY_REGION[profile.region] || [];
        setAvailableCities(cities);
      }
      if (profile.photoUrl) {
        setPhotoPreview(profile.photoUrl);
      }
    }
  }, [profile]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La photo ne doit pas dépasser 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }

    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    uploadPhotoMutation.mutate({
      fileData: base64.split(",")[1],
      fileName: file.name,
      mimeType: file.type,
    });
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setFormData({ ...formData, region: value, ville: "" });
    const cities = CAMEROON_CITIES_BY_REGION[value] || [];
    setAvailableCities(cities);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: C.green }}></div>
          <p className="mt-4" style={{ color: C.textMuted }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const currentLang = i18n.language;

  // Nav sidebar — item actif matche l'URL courante
  const profileNav = [
    { href: "/candidat/profil", label: t("profile.account.sidebar.personalInfo"), icon: User },
    { href: "/candidat/cv", label: t("profile.account.sidebar.myCv"), icon: FileText },
    { href: "/candidat/experiences", label: t("profile.account.sidebar.experiences"), icon: Briefcase },
    { href: "/candidat/formations", label: t("profile.account.sidebar.education"), icon: GraduationCap },
    { href: "/candidat/competences", label: t("profile.account.sidebar.skills"), icon: Star },
    { href: "/candidat/langues", label: t("profile.account.sidebar.languages"), icon: Sparkles },
  ];
  const accountNav = [
    { href: "/candidat/alertes", label: t("profile.account.sidebar.notifications"), icon: Bell },
    { href: "/candidat/profil?tab=privacy", label: t("profile.account.sidebar.privacy"), icon: Shield },
    { href: "/candidat/profil?tab=settings", label: t("profile.account.sidebar.settings"), icon: Settings },
  ];

  const isActive = (href: string) => {
    const [path] = href.split("?");
    return location === path;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <CandidatNav />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Grid principal [sidebar | contenu] — l'items-stretch fait
            que la sidebar occupe toute la hauteur du contenu droit,
            donc la card Boost (mt-auto) s'aligne naturellement au
            bas du form principal. Le bandeau info bas est OUT du
            grid pour ne pas décaler cette alignement. */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 lg:gap-8 items-stretch">
          {/* ─── SIDEBAR gauche (fond vert profond entier) ────── */}
          <motion.aside
            {...animate(0)}
            className="relative rounded-2xl p-5 flex flex-col overflow-hidden"
            style={{
              backgroundColor: C.deepGreen,
              minHeight: "100%",
            }}
          >
            {/* Décor : léger halo or en haut-droit */}
            <div
              aria-hidden="true"
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ backgroundColor: C.gold }}
            />

            {/* Back to dashboard (en haut de la sidebar) */}
            <Link href="/candidat/dashboard">
              <button
                className="relative flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80 mb-5"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("profile.account.sidebar.backDashboard")}
              </button>
            </Link>

            {/* Section PROFIL */}
            <p
              className="relative px-2 pb-2 text-[11px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {t("profile.account.sidebar.sectionProfile")}
            </p>
            <ul className="relative space-y-0.5 mb-5">
              {profileNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                          color: active ? "#ffffff" : "rgba(255,255,255,0.75)",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) (e.currentTarget as HTMLSpanElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          if (!active) (e.currentTarget as HTMLSpanElement).style.backgroundColor = "transparent";
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: active ? C.gold : "rgba(255,255,255,0.75)" }} />
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Section COMPTE */}
            <p
              className="relative px-2 pb-2 text-[11px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {t("profile.account.sidebar.sectionAccount")}
            </p>
            <ul className="relative space-y-0.5">
              {accountNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <span
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                        style={{
                          backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                          color: active ? "#ffffff" : "rgba(255,255,255,0.75)",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) (e.currentTarget as HTMLSpanElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                        }}
                        onMouseLeave={(e) => {
                          if (!active) (e.currentTarget as HTMLSpanElement).style.backgroundColor = "transparent";
                        }}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ color: active ? C.gold : "rgba(255,255,255,0.75)" }} />
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Card Boost Premium — mt-auto → pousse tout en bas
                pour aligner avec le bas du form principal. */}
            <div
              className="relative mt-auto pt-8"
            >
              <div
                className="relative rounded-2xl p-7 text-center border overflow-hidden"
                style={{
                  backgroundColor: "rgba(0,0,0,0.25)",
                  borderColor: C.gold,
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-25 pointer-events-none"
                  style={{ backgroundColor: C.gold }}
                />
                <div
                  className="relative w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(246, 195, 67, 0.15)" }}
                >
                  <Crown className="h-8 w-8" style={{ color: C.gold }} />
                </div>
                <h3 className="relative text-white font-bold text-[16px] leading-snug mb-2.5">
                  {t("profile.account.sidebar.boostTitle")}
                </h3>
                <p className="relative text-[12.5px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {t("profile.account.sidebar.boostSubtitle")}
                </p>
                <Link href="/candidat/templates">
                  <Button
                    className="relative w-full font-semibold rounded-xl h-11 text-[13px] hover:opacity-90"
                    style={{ backgroundColor: C.gold, color: C.deepGreen }}
                  >
                    {t("profile.account.sidebar.boostCta")}
                    <span className="ml-1">→</span>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* ─── CONTENU principal droite ───────────────────────── */}
          <div className="min-w-0 space-y-6">
            {/* HERO blanche + carnet overflow (repris du Dashboard) */}
            <motion.div {...animate(1)} className="relative rounded-3xl">
              <div
                className="relative bg-white rounded-3xl border p-6 lg:p-8 overflow-hidden"
                style={{ borderColor: C.border, minHeight: "180px" }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-40 pointer-events-none"
                  style={{ backgroundColor: C.greenSoft }}
                />
                <div
                  aria-hidden="true"
                  className="absolute top-14 right-1/3 w-2 h-2 rounded-full opacity-60 pointer-events-none hidden lg:block"
                  style={{ backgroundColor: C.gold }}
                />
                <img
                  src="/images/candidat/candidate-dashboard.webp"
                  alt=""
                  aria-hidden="true"
                  className="hidden md:block absolute select-none pointer-events-none"
                  style={{
                    right: "-30px",
                    top: "50%",
                    transform: "translateY(-50%) rotate(8deg)",
                    width: "clamp(240px, 26vw, 380px)",
                    height: "auto",
                    filter: "drop-shadow(0 20px 40px rgba(15, 23, 42, 0.15))",
                    maskImage:
                      "radial-gradient(ellipse 62% 62% at 50% 50%, black 55%, transparent 92%)",
                    WebkitMaskImage:
                      "radial-gradient(ellipse 62% 62% at 50% 50%, black 55%, transparent 92%)",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="relative z-10 max-w-[65%] md:max-w-[55%]">
                  <h1
                    className="font-extrabold tracking-tight mb-2"
                    style={{ fontSize: "clamp(22px, 2.6vw, 30px)", color: C.textMain }}
                  >
                    {t("profile.account.hero.title")}
                  </h1>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: C.textMuted }}>
                    {t("profile.account.hero.subtitle")}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* GRID 2 cols : formulaire (2fr) + secure card (1fr) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              {/* ─── Formulaire principal ───────────────────── */}
              <motion.div {...animate(2)}>
                <div
                  className="bg-white rounded-2xl border p-6 lg:p-8"
                  style={{ borderColor: C.border }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1" style={{ color: C.textMain }}>
                      {t("profile.account.card.title")}
                    </h2>
                    <p className="text-sm" style={{ color: C.green }}>
                      {t("profile.account.card.subtitle")}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Photo profil */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold" style={{ color: C.textMain }}>
                        {t("profile.account.card.photo")}
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt=""
                              className="w-20 h-20 rounded-full object-cover border-2"
                              style={{ borderColor: C.border }}
                            />
                          ) : (
                            <div
                              className="w-20 h-20 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: C.greenSoft }}
                            >
                              <User className="w-10 h-10" style={{ color: C.green }} />
                            </div>
                          )}
                          <div
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
                            style={{ backgroundColor: C.green }}
                          >
                            <Camera className="w-3.5 h-3.5 text-white" />
                          </div>
                          {isUploadingPhoto && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingPhoto}
                            className="rounded-xl"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {t("profile.account.card.photoBtn")}
                          </Button>
                          <p className="text-xs mt-1.5" style={{ color: C.textMuted }}>
                            {t("profile.account.card.photoFormat")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prénom / Nom */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="prenom" className="text-sm font-semibold" style={{ color: C.textMain }}>
                          {t("profile.firstName")} <span style={{ color: "#EF4444" }}>*</span>
                        </Label>
                        <Input
                          id="prenom"
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          required
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="nom" className="text-sm font-semibold" style={{ color: C.textMain }}>
                          {t("profile.lastName")} <span style={{ color: "#EF4444" }}>*</span>
                        </Label>
                        <Input
                          id="nom"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          required
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-1.5">
                      <Label htmlFor="telephone" className="text-sm font-semibold" style={{ color: C.textMain }}>
                        {t("profile.phone")} <span style={{ color: "#EF4444" }}>*</span>
                      </Label>
                      <Input
                        id="telephone"
                        type="tel"
                        placeholder={t("profile.account.card.phonePlaceholder")}
                        value={formData.telephone}
                        onChange={(e) => {
                          const formatted = formatCameroonPhone(e.target.value);
                          setFormData({ ...formData, telephone: formatted });
                        }}
                        required
                        className="rounded-xl h-11"
                      />
                      <p className="text-xs" style={{ color: C.textMuted }}>
                        {t("profile.account.card.phoneFormat")}
                      </p>
                    </div>

                    {/* Adresse */}
                    <div className="space-y-1.5">
                      <Label htmlFor="adresse" className="text-sm font-semibold" style={{ color: C.textMain }}>
                        {t("profile.address")}
                      </Label>
                      <Textarea
                        id="adresse"
                        value={formData.adresse}
                        onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                        rows={2}
                        className="rounded-xl resize-none"
                      />
                    </div>

                    {/* Région / Ville */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="region" className="text-sm font-semibold" style={{ color: C.textMain }}>
                          {t("profile.region")} <span style={{ color: "#EF4444" }}>*</span>
                        </Label>
                        <Select value={selectedRegion} onValueChange={handleRegionChange}>
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder={t("profile.account.card.regionPh")} />
                          </SelectTrigger>
                          <SelectContent>
                            {CAMEROON_REGIONS.map((region) => (
                              <SelectItem key={region.value} value={region.value}>
                                {currentLang === "fr" ? region.labelFr : region.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="ville" className="text-sm font-semibold" style={{ color: C.textMain }}>
                          {t("profile.city")} <span style={{ color: "#EF4444" }}>*</span>
                        </Label>
                        <Select
                          value={formData.ville}
                          onValueChange={(value) => setFormData({ ...formData, ville: value })}
                          disabled={!selectedRegion}
                        >
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder={t("profile.account.card.cityPh")} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Nationalité / Situation matrimoniale */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="nationalite" className="text-sm font-semibold" style={{ color: C.textMain }}>
                          {t("profile.nationality")}
                        </Label>
                        <Input
                          id="nationalite"
                          value={formData.nationalite}
                          onChange={(e) => setFormData({ ...formData, nationalite: e.target.value })}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="situationMatrimoniale" className="text-sm font-semibold" style={{ color: C.textMain }}>
                          {t("profile.maritalStatus")}
                        </Label>
                        <Select
                          value={formData.situationMatrimoniale}
                          onValueChange={(value) => setFormData({ ...formData, situationMatrimoniale: value })}
                        >
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder={t("profile.account.card.maritalPh")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="celibataire">{t("profile.account.marital.single")}</SelectItem>
                            <SelectItem value="marie">{t("profile.account.marital.married")}</SelectItem>
                            <SelectItem value="divorce">{t("profile.account.marital.divorced")}</SelectItem>
                            <SelectItem value="veuf">{t("profile.account.marital.widowed")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Boutons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex-1 rounded-xl h-12 font-semibold text-white hover:opacity-90"
                        style={{ backgroundColor: C.deepGreen }}
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        {t("profile.account.card.save")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/candidat/dashboard")}
                        className="rounded-xl h-12 font-semibold sm:w-40"
                      >
                        {t("profile.account.card.cancel")}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>

              {/* ─── Card "Vos informations sont sécurisées" ─── */}
              <motion.aside {...animate(3)} className="lg:sticky lg:top-[92px] self-start">
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    borderColor: C.border,
                    background: `linear-gradient(180deg, ${C.greenSoft} 0%, #ffffff 100%)`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(0, 155, 90, 0.12)" }}
                  >
                    <ShieldCheck className="w-5 h-5" style={{ color: C.green }} />
                  </div>
                  <h3 className="text-[15px] font-bold mb-2" style={{ color: C.deepGreen }}>
                    {t("profile.account.secure.title")}
                  </h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: C.textMuted }}>
                    {t("profile.account.secure.subtitle")}
                  </p>
                  <ul className="space-y-2.5">
                    {[
                      { icon: Eye, key: "bullet1" },
                      { icon: Briefcase, key: "bullet2" },
                      { icon: Lock, key: "bullet3" },
                    ].map(({ icon: Icon, key }) => (
                      <li key={key} className="flex items-start gap-2.5 text-[13px]" style={{ color: C.textMain }}>
                        <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.green }} />
                        <span>{t(`profile.account.secure.${key}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.aside>
            </div>

          </div>
        </div>

        {/* Bandeau info bas — OUT du grid pour que la sidebar
            (h-full via items-stretch) s'arrête au niveau du form/
            secure et que la Boost card s'aligne avec leur bas. */}
        <motion.div {...animate(4)} className="mt-6">
          <div
            className="rounded-2xl border px-5 py-4 flex items-start gap-3"
            style={{
              borderColor: C.border,
              backgroundColor: C.greenSoft,
            }}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: C.green }} />
            <p className="text-[13px] leading-relaxed" style={{ color: C.deepGreen }}>
              {t("profile.account.footerReminder")}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
