import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { SECTEURS } from "@/lib/secteurs";
import { isCameroonCity } from "@/lib/villesCameroun";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  ArrowLeft,
  Award,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Filter,
  Headphones,
  Lock,
  Mail,
  MapPin,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

/**
 * Page d'inscription recruteur — version premium B2B.
 *
 * Direction : "Plateforme emploi premium, moderne, panafricaine,
 * crédible, avec force institutionnelle et énergie digitale."
 *
 * Layout :
 *  1. SiteHeader global + bouton retour Espace Recruteur (préservé)
 *  2. Split-screen hero : storytelling recruteur à gauche (photo
 *     premium en background + overlay vert profond + bénéfices +
 *     stats card glassmorphism), formulaire premium à droite
 *     (3 sections : Entreprise / Contact / Sécurité)
 *  3. Bandeau bénéfices 4 cards (Sécurité, Vitesse, Ciblage, Marque)
 *  4. SiteFooter global
 *
 * Payload tRPC `auth.register` INCHANGÉ : {email, password, name
 * (concat prenom+nom), profileType: "employeur"}. Pré-fill via query
 * params (entreprise/email/telephone/taille) préservé.
 */

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  ivory: "#FAF7EF",
  deepGreen: "#063F24",
  green: "#007A3D",
  greenBright: "#009B5A",
  gold: "#F6C343",
  goldDark: "#D99200",
  textMain: "#0F172A",
  textMuted: "#64748B",
  textLabel: "#0F172A",
  border: "#DCE3EA",
  error: "#D62828",
};

// ─── Drapeau Cameroun SVG (cohérent avec InscriptionCandidat) ─────────────────
function CameroonFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 12" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Cameroun">
      <rect width="6" height="12" fill="#007a5e" />
      <rect x="6" width="6" height="12" fill="#ce1126" />
      <rect x="12" width="6" height="12" fill="#fcd116" />
      <path d="M 9 4.6 L 9.5 5.95 L 10.9 5.95 L 9.77 6.78 L 10.2 8.1 L 9 7.28 L 7.8 8.1 L 8.23 6.78 L 7.1 5.95 L 8.5 5.95 Z" fill="#fcd116" />
    </svg>
  );
}

function passwordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length < 8) return 0;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

export default function InscriptionEmployeur() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Pré-fill via query params (préservé du composant original).
  // Lazy initializer pour que le Select tailleEntreprise reflète bien
  // la valeur préremplie dès le 1er render.
  const [formData, setFormData] = useState(() => {
    const sp = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    return {
      nomEntreprise: sp.get("entreprise") ?? "",
      prenom: "",
      nom: "",
      email: sp.get("email") ?? "",
      telephone: sp.get("telephone") ?? "",
      poste: "",
      tailleEntreprise: sp.get("taille") ?? "",
      secteur: "",
      ville: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      newsletter: true,
    };
  });

  const strength = useMemo(() => passwordStrength(formData.password), [formData.password]);
  const strengthLabel = [
    "",
    t("employerRegister.form.passwordStrength.weak"),
    t("employerRegister.form.passwordStrength.medium"),
    t("employerRegister.form.passwordStrength.strong"),
  ][strength];
  const strengthColor = ["#E2E8F0", "#EF4444", "#F59E0B", C.greenBright][strength];

  // Mutation tRPC — le payload backend reçoit aussi les infos
  // entreprise (cf. server/routers.ts auth.register).
  // /!\ Race condition critique : la page /employeur/bienvenue a un
  // guard qui redirige vers /connexion si `user` est null. Or après
  // register, useAuth (basé sur trpc.auth.me) garde encore son
  // ancienne valeur null. On invalide DONC la query auth.me et on
  // attend qu'elle ait refetch AVANT de naviguer — sinon le guard
  // de la page d'arrivée éjecte l'utilisateur vers la connexion.
  const utils = trpc.useUtils();
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success(t("employerRegister.form.success"));
      await utils.auth.me.invalidate();
      setLocation("/employeur/bienvenue");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || t("employerRegister.form.errors.generic"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validations renforcées : prénom/nom ≥ 2 caractères, mot de
    // passe ≥ 8 caractères, ville obligatoirement camerounaise (la
    // plateforme est dédiée à l'emploi au Cameroun).
    if (formData.prenom.trim().length < 2) {
      toast.error(t("employerRegister.form.errors.firstNameTooShort"));
      return;
    }
    if (formData.nom.trim().length < 2) {
      toast.error(t("employerRegister.form.errors.lastNameTooShort"));
      return;
    }
    if (!isCameroonCity(formData.ville)) {
      toast.error(t("employerRegister.form.errors.cityNotCameroon"));
      return;
    }
    if (formData.password.length < 8) {
      toast.error(t("employerRegister.form.errors.passwordTooShort"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("employerRegister.form.errors.passwordMismatch"));
      return;
    }
    if (!formData.acceptTerms) {
      toast.error(t("employerRegister.form.errors.termsRequired"));
      return;
    }
    // Payload étendu : on envoie aussi les infos entreprise + contact
    // pour que le dashboard recruteur soit pré-rempli dès la première
    // connexion (sinon le recruteur devrait tout ressaisir). Le backend
    // mappe ces champs sur la table `employeurs`.
    await registerMutation.mutateAsync({
      email: formData.email,
      password: formData.password,
      name: `${formData.prenom} ${formData.nom}`.trim(),
      profileType: "employeur",
      telephone: formData.telephone,
      nomEntreprise: formData.nomEntreprise,
      secteurActivite: formData.secteur,
      taille: formData.tailleEntreprise,
      ville: formData.ville,
      posteContact: formData.poste,
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ivory, color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <SiteHeader />

      {/* ─── Bouton retour Espace Recruteur (préservé) ────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 pt-5">
        <button
          type="button"
          onClick={() => setLocation("/espace-recruteur")}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
          style={{ color: C.textMuted }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.green)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = C.textMuted)}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("employerRegister.backToRecruiterSpace")}
        </button>
      </div>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ HERO SPLIT-SCREEN                                              │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="relative">
        <div className="grid lg:grid-cols-2 lg:min-h-[calc(100vh-160px)]">
          {/* ─── Colonne gauche : storytelling recruteur ─────────── */}
          <div
            className="relative overflow-hidden text-white flex items-center"
            style={{ backgroundColor: C.deepGreen }}
          >
            {/* Image background recruteuse */}
            <img
              src="/images/recruteur/employer-register-hero.webp"
              alt={t("employerRegister.hero.imageAlt")}
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
            {/* Overlay vert profond pour lisibilité */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(3, 52, 30, 0.92) 0%, rgba(3, 52, 30, 0.72) 50%, rgba(3, 52, 30, 0.55) 100%)",
              }}
            />
            {/* Pattern topographique subtil */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id="emp-topo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <circle cx="40" cy="40" r="36" stroke={C.gold} strokeWidth="0.5" fill="none" />
                  <circle cx="40" cy="40" r="24" stroke={C.gold} strokeWidth="0.5" fill="none" />
                  <circle cx="40" cy="40" r="12" stroke={C.gold} strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#emp-topo)" />
            </svg>

            {/* Halo or animé */}
            <motion.div
              aria-hidden="true"
              className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full blur-[140px]"
              style={{ backgroundColor: C.gold, opacity: 0.18 }}
              animate={reduced ? undefined : { scale: [1, 1.08, 1] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Ligne courbe or en bas */}
            <svg
              className="absolute bottom-0 left-0 w-full h-32 opacity-30 pointer-events-none"
              viewBox="0 0 600 100"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path d="M0,80 Q150,20 300,60 T600,40" stroke={C.gold} strokeWidth="1.5" fill="none" />
            </svg>

            <div className="relative z-10 max-w-[600px] mx-auto px-6 sm:px-10 py-14 lg:py-16 w-full">
              {/* Badge */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md border mb-7"
                style={{
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderColor: "rgba(246,195,67,0.40)",
                  color: C.gold,
                }}
              >
                <Award className="w-3.5 h-3.5" />
                {t("employerRegister.hero.badge")}
              </motion.div>

              {/* H1 */}
              <motion.h1
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="font-extrabold leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(34px, 4.4vw, 52px)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.45)",
                }}
              >
                {t("employerRegister.hero.titleStart")}{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${C.gold} 0%, #FFE390 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t("employerRegister.hero.titleAccent")}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="mt-5 text-base sm:text-[17px] text-white/90 leading-relaxed max-w-[520px]"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
              >
                {t("employerRegister.hero.subtitle")}
              </motion.p>

              {/* Bénéfices */}
              <motion.ul
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="mt-8 space-y-4"
              >
                {[
                  { icon: Users, title: t("employerRegister.hero.benefits.b1Title"), desc: t("employerRegister.hero.benefits.b1Desc") },
                  { icon: TrendingUp, title: t("employerRegister.hero.benefits.b2Title"), desc: t("employerRegister.hero.benefits.b2Desc") },
                  { icon: Headphones, title: t("employerRegister.hero.benefits.b3Title"), desc: t("employerRegister.hero.benefits.b3Desc") },
                  { icon: Settings2, title: t("employerRegister.hero.benefits.b4Title"), desc: t("employerRegister.hero.benefits.b4Desc") },
                ].map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3.5">
                    <span
                      className="inline-flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 mt-0.5"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.12)", border: "1px solid rgba(246, 195, 67, 0.25)" }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ color: C.gold }} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-[15px] leading-tight text-white">{title}</div>
                      <div className="text-[13px] text-white/75 leading-snug mt-0.5">{desc}</div>
                    </div>
                  </li>
                ))}
              </motion.ul>

              {/* Stats card glassmorphism */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 rounded-2xl border shadow-xl backdrop-blur-xl px-5 py-4"
                style={{
                  backgroundColor: "rgba(6, 63, 36, 0.82)",
                  borderColor: "rgba(246, 195, 67, 0.22)",
                }}
              >
                <div className="grid grid-cols-3 gap-2 divide-x divide-white/10">
                  <Stat icon={Building2} value="2 500+" label={t("employerRegister.hero.stats.companies")} />
                  <Stat icon={Award} value="95%" label={t("employerRegister.hero.stats.satisfaction")} accent />
                  <Stat icon={Users} value="250K+" label={t("employerRegister.hero.stats.talents")} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* ─── Colonne droite : formulaire recruteur premium ──── */}
          <div className="flex items-center justify-center px-4 sm:px-8 lg:px-10 py-12 lg:py-14" style={{ backgroundColor: "#F8FAFC" }}>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative w-full max-w-[660px] bg-white rounded-[28px] border shadow-2xl p-7 sm:p-10"
              style={{ borderColor: C.border, boxShadow: "0 30px 90px rgba(15, 23, 42, 0.12)" }}
            >
              {/* Motif points or en haut droite */}
              <div aria-hidden="true" className="absolute top-6 right-6 grid grid-cols-5 gap-1.5 pointer-events-none opacity-70">
                {Array.from({ length: 15 }).map((_, i) => (
                  <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
                ))}
              </div>

              {/* Header form */}
              <div className="mb-7">
                <h2
                  className="text-2xl sm:text-[28px] font-extrabold tracking-tight"
                  style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                >
                  {t("employerRegister.form.title")}
                </h2>
                <p className="mt-1.5 text-sm" style={{ color: C.textMuted }}>
                  {t("employerRegister.form.subtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* ─── Section A : Entreprise ──────────────────── */}
                <FormSection icon={Building2} title={t("employerRegister.form.sections.company")}>
                  <FieldWrapper id="nomEntreprise" label={t("employerRegister.form.fields.companyName")} required>
                    <Input
                      id="nomEntreprise"
                      value={formData.nomEntreprise}
                      onChange={(e) => setFormData({ ...formData, nomEntreprise: e.target.value })}
                      placeholder={t("employerRegister.form.placeholders.companyName")}
                      className="h-11"
                      style={{ borderColor: C.border }}
                      required
                    />
                  </FieldWrapper>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldWrapper id="secteur" label={t("employerRegister.form.fields.sector")} required>
                      <Select
                        value={formData.secteur}
                        onValueChange={(value) => setFormData({ ...formData, secteur: value })}
                      >
                        <SelectTrigger className="h-11" style={{ borderColor: C.border }}>
                          <SelectValue placeholder={t("employerRegister.form.placeholders.sector")} />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTEURS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FieldWrapper>

                    <FieldWrapper id="tailleEntreprise" label={t("employerRegister.form.fields.size")} required>
                      <Select
                        value={formData.tailleEntreprise}
                        onValueChange={(value) => setFormData({ ...formData, tailleEntreprise: value })}
                      >
                        <SelectTrigger className="h-11" style={{ borderColor: C.border }}>
                          <SelectValue placeholder={t("employerRegister.form.placeholders.size")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 {t("employerRegister.form.employees")}</SelectItem>
                          <SelectItem value="11-50">11-50 {t("employerRegister.form.employees")}</SelectItem>
                          <SelectItem value="51-200">51-200 {t("employerRegister.form.employees")}</SelectItem>
                          <SelectItem value="201-1000">201-1000 {t("employerRegister.form.employees")}</SelectItem>
                          <SelectItem value="1000+">1000+ {t("employerRegister.form.employees")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FieldWrapper>
                  </div>

                  <FieldWrapper id="ville" label={t("employerRegister.form.fields.city")} required>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        id="ville"
                        value={formData.ville}
                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                        placeholder={t("employerRegister.form.placeholders.city")}
                        className="h-11 pl-10"
                        style={{ borderColor: C.border }}
                        required
                      />
                    </div>
                  </FieldWrapper>
                </FormSection>

                {/* ─── Section B : Contact ─────────────────────── */}
                <FormSection icon={User} title={t("employerRegister.form.sections.contact")}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldWrapper id="prenom" label={t("employerRegister.form.fields.firstName")} required>
                      <Input
                        id="prenom"
                        value={formData.prenom}
                        onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                        placeholder={t("employerRegister.form.placeholders.firstName")}
                        className="h-11"
                        style={{ borderColor: C.border }}
                        autoComplete="given-name"
                        required
                      />
                    </FieldWrapper>
                    <FieldWrapper id="nom" label={t("employerRegister.form.fields.lastName")} required>
                      <Input
                        id="nom"
                        value={formData.nom}
                        onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                        placeholder={t("employerRegister.form.placeholders.lastName")}
                        className="h-11"
                        style={{ borderColor: C.border }}
                        autoComplete="family-name"
                        required
                      />
                    </FieldWrapper>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldWrapper id="poste" label={t("employerRegister.form.fields.position")} required>
                      <Input
                        id="poste"
                        value={formData.poste}
                        onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                        placeholder={t("employerRegister.form.placeholders.position")}
                        className="h-11"
                        style={{ borderColor: C.border }}
                        required
                      />
                    </FieldWrapper>
                    <FieldWrapper id="telephone" label={t("employerRegister.form.fields.phone")} required>
                      <div
                        className="flex h-11 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20"
                        style={{ borderColor: C.border }}
                      >
                        <div
                          className="flex items-center gap-1.5 px-2.5 border-r shrink-0"
                          style={{ backgroundColor: "#F8FAFC", borderColor: C.border }}
                        >
                          <CameroonFlag className="w-4 h-3 rounded-sm shadow-sm" />
                          <span className="text-xs font-medium" style={{ color: C.textMain }}>+237</span>
                        </div>
                        <input
                          id="telephone"
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          placeholder={t("employerRegister.form.placeholders.phone")}
                          className="flex-1 min-w-0 px-3 text-sm bg-white focus:outline-none"
                          style={{ color: C.textMain }}
                          autoComplete="tel"
                          required
                        />
                      </div>
                    </FieldWrapper>
                  </div>

                  <FieldWrapper id="email" label={t("employerRegister.form.fields.email")} required>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("employerRegister.form.placeholders.email")}
                        className="h-11 pl-10"
                        style={{ borderColor: C.border }}
                        autoComplete="email"
                        required
                      />
                    </div>
                  </FieldWrapper>
                </FormSection>

                {/* ─── Section C : Sécurité ────────────────────── */}
                <FormSection icon={Lock} title={t("employerRegister.form.sections.security")}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldWrapper id="password" label={t("employerRegister.form.fields.password")} required>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="h-11 pl-10 pr-10"
                          style={{ borderColor: C.border }}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {formData.password && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-1 flex-1 rounded-full transition-colors"
                                style={{ backgroundColor: i <= strength ? strengthColor : C.border }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                        </div>
                      )}
                    </FieldWrapper>

                    <FieldWrapper id="confirmPassword" label={t("employerRegister.form.fields.confirmPassword")} required>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="h-11 pl-10 pr-10"
                          style={{ borderColor: C.border }}
                          autoComplete="new-password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          tabIndex={-1}
                          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FieldWrapper>
                  </div>
                </FormSection>

                {/* ─── Checkboxes ──────────────────────────────── */}
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id="acceptTerms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked === true })}
                      className="mt-0.5"
                    />
                    <label htmlFor="acceptTerms" className="text-xs leading-relaxed cursor-pointer" style={{ color: C.textMuted }}>
                      {t("employerRegister.form.acceptTermsStart")}{" "}
                      <a href="#" className="font-semibold underline" style={{ color: C.green }}>
                        {t("employerRegister.form.acceptTermsLink1")}
                      </a>{" "}
                      {t("employerRegister.form.acceptTermsAnd")}{" "}
                      <a href="#" className="font-semibold underline" style={{ color: C.green }}>
                        {t("employerRegister.form.acceptTermsLink2")}
                      </a>
                    </label>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id="newsletter"
                      checked={formData.newsletter}
                      onCheckedChange={(checked) => setFormData({ ...formData, newsletter: checked === true })}
                      className="mt-0.5"
                    />
                    <label htmlFor="newsletter" className="text-xs leading-relaxed cursor-pointer" style={{ color: C.textMuted }}>
                      {t("employerRegister.form.newsletterLabel")}
                    </label>
                  </div>
                </div>

                {/* ─── CTA principal ──────────────────────────── */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full h-14 text-base font-bold text-white gap-2 shadow-lg transition-all focus:ring-4 focus:ring-emerald-500/30 overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${C.deepGreen} 0%, ${C.greenBright} 100%)`,
                    boxShadow: "0 14px 30px rgba(0, 155, 90, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    if (!isLoading) {
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow = "0 20px 40px rgba(0, 155, 90, 0.35)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "0 14px 30px rgba(0, 155, 90, 0.25)";
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("employerRegister.form.submitting")}
                    </>
                  ) : (
                    <>
                      {t("employerRegister.form.submit")}
                      <Sparkles className="w-4 h-4 ml-1" style={{ color: C.gold }} />
                    </>
                  )}
                </Button>

                {/* ─── Déjà inscrit ────────────────────────────── */}
                <p className="text-center text-sm" style={{ color: C.textMuted }}>
                  {t("employerRegister.form.alreadyAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => (window.location.href = getLoginUrl())}
                    className="font-semibold underline hover:no-underline transition-all"
                    style={{ color: C.green }}
                  >
                    {t("employerRegister.form.loginLink")}
                  </button>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ BANDEAU BÉNÉFICES                                             │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="bg-white py-10 lg:py-12 border-t" style={{ borderColor: "#E2E8F0" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-slate-100">
            {[
              { icon: ShieldCheck, title: t("employerRegister.reassurance.b1Title"), desc: t("employerRegister.reassurance.b1Desc") },
              { icon: Zap, title: t("employerRegister.reassurance.b2Title"), desc: t("employerRegister.reassurance.b2Desc") },
              { icon: Target, title: t("employerRegister.reassurance.b3Title"), desc: t("employerRegister.reassurance.b3Desc") },
              { icon: Filter, title: t("employerRegister.reassurance.b4Title"), desc: t("employerRegister.reassurance.b4Desc") },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 px-5 lg:px-6 py-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(246, 195, 67, 0.18)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: C.goldDark }} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm" style={{ color: C.textMain }}>{title}</div>
                  <div className="text-xs mt-1 leading-relaxed" style={{ color: C.textMuted }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3.5">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{ backgroundColor: "rgba(0, 122, 61, 0.10)" }}
        >
          <Icon className="w-4 h-4" style={{ color: C.green }} />
        </span>
        <h3 className="text-[15px] font-bold tracking-tight" style={{ color: C.deepGreen }}>
          {title}
        </h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FieldWrapper({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-[13px] font-semibold mb-1.5 block" style={{ color: C.textLabel }}>
        {label} {required && <span style={{ color: C.error }}>*</span>}
      </Label>
      {children}
    </div>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <Icon className="w-5 h-5 shrink-0" style={{ color: accent ? C.gold : "rgba(255,255,255,0.85)" }} />
      <div className="min-w-0">
        <div className="font-extrabold text-lg leading-none" style={{ color: accent ? C.gold : "white" }}>
          {value}
        </div>
        <div className="text-[10px] text-white/70 leading-tight mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// Ré-export pour permettre de garder l'import non-utilisé `CheckCircle2`
// dans l'arbre sans warning si jamais on l'ajoute en check visuel.
void CheckCircle2;
