import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { API_BASE } from "@/lib/apiBase";
import { markJustLoggedIn } from "@/lib/authGrace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  FileText,
  Info,
  Lock,
  Mail,
  MapPin,
  Plus,
  Send,
  Shield,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Page d'inscription candidat refondue (Cameroon Travail).
 *
 * Direction : "Plateforme emploi premium, moderne, panafricaine, crédible".
 * Layout :
 *  1. Hero split-screen (gauche : storytelling vert / droite : form blanc)
 *  2. Section "Votre profil en quelques minutes" (3 cards parcours)
 *  3. Bandeau bénéfices candidat (4 cards)
 *  4. Micro-section sécurité
 *  5. Footer global
 *
 * Préserve la logique d'inscription existante : mutation
 * trpc.auth.register avec payload {email, password, name (concat
 * prenom+nom), profileType: "candidat", telephone}. Le backend n'est
 * pas modifié.
 */

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  deepGreen: "#063F24",
  green: "#009B5A",
  gold: "#F6C343",
  ivory: "#FAF7EF",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

// ─── Drapeau Cameroun SVG (cohérent avec EspaceRecruteur) ─────────────────────
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

// ─── Indicateur de force du mot de passe ──────────────────────────────────────
function passwordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length < 8) return 0;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

export default function InscriptionCandidat() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const strength = useMemo(() => passwordStrength(formData.password), [formData.password]);
  const strengthLabel = ["", t("signup.form.passwordStrength.weak"), t("signup.form.passwordStrength.medium"), t("signup.form.passwordStrength.strong")][strength];
  const strengthColor = ["#E2E8F0", "#EF4444", "#F59E0B", C.green][strength];

  // Mutation tRPC. Après succès : invalider `auth.me` pour que le
  // hook useAuth récupère le user fraîchement créé AVANT de naviguer
  // — sinon les guards des pages cibles (qui redirigent vers
  // /connexion si user===null) éjectent l'utilisateur. On l'envoie
  // directement sur son BO personnalisé /candidat/dashboard.
  const utils = trpc.useUtils();
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success(t("signup.form.success"));
      // Grace period : ignore les UNAUTHED durant la propagation
      // du cookie sur mobile (cf. authGrace.ts).
      markJustLoggedIn();
      await utils.auth.me.invalidate();
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLocation("/candidat/dashboard");
    },
    onError: (error: { message?: string }) => {
      const msg = error.message || t("signup.form.errors.generic");
      const lower = msg.toLowerCase();
      if (lower.includes("existe") || lower.includes("already") || lower.includes("utilisé")) {
        toast.error(t("signup.form.errors.accountExists"), {
          action: {
            label: t("signup.form.errors.forgotPassword"),
            onClick: () => setLocation("/mot-de-passe-oublie"),
          },
          duration: 8000,
        });
      } else {
        toast.error(msg);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation côté client — messages traduits.
    // Règles renforcées : prénom/nom ≥ 2 caractères (évite saisies
    // type "G"), mot de passe ≥ 8 caractères (alignement sécurité
    // avec la nouvelle politique).
    if (!formData.prenom.trim()) return toast.error(t("signup.form.errors.firstNameRequired"));
    if (formData.prenom.trim().length < 2) return toast.error(t("signup.form.errors.firstNameTooShort"));
    if (!formData.nom.trim()) return toast.error(t("signup.form.errors.lastNameRequired"));
    if (formData.nom.trim().length < 2) return toast.error(t("signup.form.errors.lastNameTooShort"));
    if (!formData.email.trim()) return toast.error(t("signup.form.errors.emailRequired"));
    if (!formData.telephone.trim()) return toast.error(t("signup.form.errors.phoneRequired"));
    if (!formData.password) return toast.error(t("signup.form.errors.passwordRequired"));
    if (formData.password.length < 8) return toast.error(t("signup.form.errors.passwordTooShort"));
    if (formData.password !== formData.confirmPassword) return toast.error(t("signup.form.errors.passwordMismatch"));
    if (!formData.acceptTerms) return toast.error(t("signup.form.errors.termsRequired"));

    // Payload INCHANGÉ
    await registerMutation.mutateAsync({
      email: formData.email,
      password: formData.password,
      name: `${formData.prenom} ${formData.nom}`.trim(),
      profileType: "candidat",
      telephone: formData.telephone,
    });
  };

  const benefits = t("signup.hero.benefits", { returnObjects: true }) as string[];
  const isLoading = registerMutation.isPending;

  return (
    <div className="min-h-screen bg-white" style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <SiteHeader />

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 1. HERO SPLIT-SCREEN — vert profond + form blanc              │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="relative">
        <div className="grid lg:grid-cols-2 min-h-[calc(100vh-100px)]">
          {/* ─── Colonne gauche : storytelling candidat ─────────── */}
          <div
            className="relative overflow-hidden text-white flex items-center"
            style={{ backgroundColor: C.deepGreen }}
          >
            {/* Image de fond candidate (fallback vert profond si manquante) */}
            <img
              src="/images/candidat/candidate-register-hero.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            {/* Overlay vert profond pour lisibilité */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(3, 52, 30, 0.92) 0%, rgba(3, 52, 30, 0.70) 50%, rgba(3, 52, 30, 0.55) 100%)",
              }}
            />
            {/* Pattern topographique subtil */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs>
                <pattern id="register-topo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <circle cx="40" cy="40" r="36" stroke={C.gold} strokeWidth="0.5" fill="none" />
                  <circle cx="40" cy="40" r="24" stroke={C.gold} strokeWidth="0.5" fill="none" />
                  <circle cx="40" cy="40" r="12" stroke={C.gold} strokeWidth="0.5" fill="none" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#register-topo)" />
            </svg>

            {/* Halo or animé */}
            <motion.div
              aria-hidden="true"
              className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-[120px]"
              style={{ backgroundColor: C.gold, opacity: 0.15 }}
              animate={reduced ? undefined : { scale: [1, 1.1, 1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 max-w-[560px] mx-auto px-6 sm:px-10 py-16 lg:py-20 w-full">
              {/* Badge */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-md border mb-7"
                style={{
                  backgroundColor: "rgba(255,255,255,0.10)",
                  borderColor: "rgba(255,255,255,0.22)",
                  color: C.gold,
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t("signup.hero.badge")}
              </motion.div>

              {/* H1 */}
              <motion.h1
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="font-extrabold leading-[1.05] tracking-tight"
                style={{
                  fontSize: "clamp(32px, 4.2vw, 48px)",
                  textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                }}
              >
                {t("signup.hero.titleStart")}
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${C.gold} 0%, #FFE390 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {t("signup.hero.titleAccent")}
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="mt-5 text-base sm:text-[17px] text-white/90 leading-relaxed max-w-md"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
              >
                {t("signup.hero.subtitle")}
              </motion.p>

              {/* Benefits */}
              <motion.ul
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.15 }}
                className="mt-8 space-y-3.5"
              >
                {[
                  { icon: BadgeCheck, label: benefits[0] },
                  { icon: Send, label: benefits[1] },
                  { icon: FileText, label: benefits[2] },
                  { icon: Bell, label: benefits[3] },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-white/95 text-sm sm:text-[15px]">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: "rgba(246, 195, 67, 0.18)", color: C.gold }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    {label}
                  </li>
                ))}
              </motion.ul>

              {/* Card flottante social proof */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-10 inline-flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-md border shadow-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderColor: "rgba(255,255,255,0.22)",
                }}
              >
                <div className="flex -space-x-2">
                  {["from-emerald-500 to-emerald-700", "from-amber-400 to-amber-600", "from-rose-400 to-rose-600"].map((g) => (
                    <div
                      key={g}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2`}
                      style={{ borderColor: C.deepGreen }}
                    />
                  ))}
                  <div
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: C.gold, color: C.deepGreen, borderColor: C.deepGreen }}
                  >
                    {t("signup.hero.socialProofCount")}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-bold text-white leading-tight">{t("signup.hero.socialProofText")}</div>
                  <div className="text-white/75 text-xs">{t("signup.hero.socialProofSubtitle")}</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ─── Colonne droite : carte formulaire ────────────────── */}
          <div className="flex items-center justify-center px-4 sm:px-8 py-12 lg:py-16" style={{ backgroundColor: "#F8FAFC" }}>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="w-full max-w-[500px] bg-white rounded-[28px] border shadow-2xl p-7 sm:p-10"
              style={{ borderColor: C.border }}
            >
              {/* Header form */}
              <div className="mb-6">
                <h2
                  className="text-2xl sm:text-3xl font-extrabold"
                  style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                >
                  {t("signup.form.title")}
                </h2>
                <p className="mt-1 text-sm" style={{ color: C.textMuted }}>
                  {t("signup.form.login")}{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/connexion")}
                    className="font-semibold hover:underline"
                    style={{ color: C.green }}
                  >
                    {t("signup.form.loginLink")}
                  </button>{" "}
                  {t("signup.form.loginEnd")}
                </p>
              </div>

              {/* Stepper visuel (3 étapes, étape 1 active) */}
              <div className="flex items-center gap-2 mb-7">
                {[
                  { n: 1, label: t("signup.form.steps.informations"), active: true },
                  { n: 2, label: t("signup.form.steps.profil"), active: false },
                  { n: 3, label: t("signup.form.steps.experience"), active: false },
                ].map((s, i) => (
                  <div key={s.n} className="flex items-center flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0"
                        style={{
                          backgroundColor: s.active ? C.green : C.border,
                          color: s.active ? "white" : C.textMuted,
                        }}
                      >
                        {s.n}
                      </span>
                      <span
                        className="text-xs font-medium truncate"
                        style={{ color: s.active ? C.textMain : C.textMuted }}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < 2 && <div className="flex-1 h-px mx-2" style={{ backgroundColor: C.border }} />}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Prénom + Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldWrapper id="prenom" label={t("signup.form.firstName")} required>
                    <Input
                      id="prenom"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="h-11"
                      style={{ borderColor: C.border }}
                      autoComplete="given-name"
                      required
                    />
                  </FieldWrapper>
                  <FieldWrapper id="nom" label={t("signup.form.lastName")} required>
                    <Input
                      id="nom"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="h-11"
                      style={{ borderColor: C.border }}
                      autoComplete="family-name"
                      required
                    />
                  </FieldWrapper>
                </div>

                {/* Email */}
                <FieldWrapper id="email" label={t("signup.form.email")} required>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 pl-10"
                      style={{ borderColor: C.border }}
                      autoComplete="email"
                      required
                    />
                  </div>
                </FieldWrapper>

                {/* Téléphone avec drapeau +237 */}
                <FieldWrapper id="telephone" label={t("signup.form.phone")} required>
                  <div
                    className="flex h-11 rounded-md border overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20"
                    style={{ borderColor: C.border }}
                  >
                    <div
                      className="flex items-center gap-2 px-3 border-r shrink-0"
                      style={{ backgroundColor: "#F8FAFC", borderColor: C.border }}
                    >
                      <CameroonFlag className="w-5 h-3.5 rounded-sm shadow-sm" />
                      <span className="text-sm font-medium" style={{ color: C.textMain }}>+237</span>
                    </div>
                    <input
                      id="telephone"
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="flex-1 min-w-0 px-3 text-sm bg-white focus:outline-none"
                      style={{ color: C.textMain }}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </FieldWrapper>

                {/* Password */}
                <FieldWrapper id="password" label={t("signup.form.password")} required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  {/* Barres de force */}
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

                {/* Confirm password */}
                <FieldWrapper id="confirmPassword" label={t("signup.form.confirmPassword")} required>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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

                {/* Acceptation conditions */}
                <div className="flex items-start gap-2.5 pt-1">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, acceptTerms: checked === true })
                    }
                    className="mt-0.5"
                  />
                  <label htmlFor="acceptTerms" className="text-xs leading-relaxed cursor-pointer" style={{ color: C.textMuted }}>
                    {t("signup.form.acceptTermsStart")}{" "}
                    <a href="#" className="font-medium underline" style={{ color: C.green }}>
                      {t("signup.form.acceptTermsLink1")}
                    </a>{" "}
                    {t("signup.form.acceptTermsAnd")}{" "}
                    <a href="#" className="font-medium underline" style={{ color: C.green }}>
                      {t("signup.form.acceptTermsLink2")}
                    </a>
                  </label>
                </div>

                {/* CTA */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold text-white gap-2 shadow-lg transition-all focus:ring-4 focus:ring-green-500/30"
                  style={{ backgroundColor: C.green }}
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("signup.form.submitting")}
                    </>
                  ) : (
                    <>
                      {t("signup.form.submit")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>

                {/* Séparateur + social */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: C.border }} />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 text-xs bg-white" style={{ color: C.textMuted }}>
                      {t("signup.form.orContinueWith")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <SocialButton
                    label={t("signup.form.google")}
                    title={t("signup.form.socialComingSoon")}
                    onClick={() => {
                      // Inscription via Google : on passe profileType=candidat
                      // pour que le backend crée la fiche candidat à la
                      // 1ère connexion (cf. server/_core/googleOAuth.ts).
                      window.location.href = `${API_BASE}/api/auth/google?profileType=candidat`;
                    }}
                    icon={
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path fill="#EA4335" d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.71 14.97.55 12 .55 7.46.55 3.55 3.14 1.64 7l3.66 2.84C6.17 7.24 8.86 5 12 5z" />
                        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.19-2.27H12v4.51h6.45c-.28 1.5-1.12 2.77-2.39 3.62l3.66 2.84c2.13-1.97 3.37-4.87 3.37-8.7z" />
                        <path fill="#FBBC05" d="M5.3 14.16c-.22-.66-.34-1.36-.34-2.16s.12-1.5.34-2.16L1.64 7C.9 8.52.5 10.21.5 12s.4 3.48 1.14 5l3.66-2.84z" />
                        <path fill="#34A853" d="M12 23.45c2.97 0 5.45-.98 7.27-2.65l-3.66-2.84c-1 .67-2.28 1.07-3.61 1.07-3.14 0-5.83-2.24-6.7-5.32L1.64 16.6C3.55 20.36 7.46 23.45 12 23.45z" />
                      </svg>
                    }
                  />
                  <SocialButton
                    label={t("signup.form.linkedin")}
                    title={t("signup.form.socialComingSoon")}
                    icon={
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#0A66C2">
                        <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                      </svg>
                    }
                  />
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 2. SECTION "VOTRE PROFIL EN QUELQUES MINUTES"                  │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="py-20 lg:py-24" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-4"
              style={{ backgroundColor: "rgba(0, 155, 90, 0.10)", color: C.green }}
            >
              <Sparkles className="w-3 h-3" />
              {t("signup.profileSection.badge")}
            </div>
            <h2
              className="font-extrabold tracking-tight"
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                color: C.textMain,
                fontFamily: "'Manrope', 'Inter', sans-serif",
              }}
            >
              {t("signup.profileSection.titleStart")}{" "}
              <span style={{ color: C.green }}>{t("signup.profileSection.titleAccent")}</span>
            </h2>
            <p className="mt-3 text-base" style={{ color: C.textMuted }}>
              {t("signup.profileSection.subtitle")}
            </p>
          </div>

          {/* Cards + flèches vertes entre elles (mock-up visuel du parcours) */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {/* Card 1 — Informations (active) */}
              <ProfileStepCard
                n={1}
                active
                title={t("signup.profileSection.cards.info.title")}
                subtitle={t("signup.profileSection.cards.info.subtitle")}
              >
                <MockField label={t("signup.form.firstName")} value="Jean" />
                <MockField label={t("signup.form.lastName")} value="Dupont" />
                <MockField label={t("signup.form.email")} value="jean.dupont@email.com" />
                <MockField
                  label={t("signup.form.phone")}
                  value="+237 6XX XX XX XX"
                  leftIcon={<CameroonFlag className="w-4 h-3 rounded-sm" />}
                />
                <MockField label={t("signup.form.password")} value="••••••••" rightIcon={<Eye className="w-3.5 h-3.5 text-gray-400" />} />
                <MockField label={t("signup.form.confirmPassword")} value="••••••••" rightIcon={<Eye className="w-3.5 h-3.5 text-gray-400" />} />
                <div className="flex items-start gap-1.5 mt-1">
                  <div
                    className="mt-0.5 w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: C.green }}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-[10px] leading-snug" style={{ color: C.textMuted }}>
                    {t("signup.form.acceptTermsStart")}{" "}
                    <span className="underline" style={{ color: C.green }}>{t("signup.form.acceptTermsLink1")}</span>{" "}
                    {t("signup.form.acceptTermsAnd")}{" "}
                    <span className="underline" style={{ color: C.green }}>{t("signup.form.acceptTermsLink2")}</span>
                  </p>
                </div>
                <MockButton label={t("signup.profileSection.cta.continue")} />
              </ProfileStepCard>

              {/* Card 2 — Profil */}
              <ProfileStepCard
                n={2}
                title={t("signup.profileSection.cards.profil.title")}
                subtitle={t("signup.profileSection.cards.profil.subtitle")}
              >
                <MockSelect label={t("signup.profileSection.preview.jobTitle")} value="Développeur Full Stack" />
                <MockSelect label={t("signup.profileSection.preview.experienceYears")} value="3 à 5 ans" />
                <MockField
                  label={t("signup.profileSection.preview.city")}
                  value="Yaoundé"
                  leftIcon={<MapPin className="w-3.5 h-3.5 text-gray-400" />}
                />
                <MockSelect label={t("signup.profileSection.preview.availability")} value="Immédiate" />
                <div
                  className="flex items-start gap-2 px-2.5 py-2 rounded-md border text-[10px] leading-snug mt-1"
                  style={{
                    backgroundColor: "rgba(0, 155, 90, 0.06)",
                    borderColor: "rgba(0, 155, 90, 0.20)",
                    color: C.textMuted,
                  }}
                >
                  <Info className="w-3 h-3 mt-0.5 shrink-0" style={{ color: C.green }} />
                  <span>{t("signup.profileSection.preview.profilNote")}</span>
                </div>
                <MockButton label={t("signup.profileSection.cta.continue")} />
              </ProfileStepCard>

              {/* Card 3 — Expérience */}
              <ProfileStepCard
                n={3}
                title={t("signup.profileSection.cards.experience.title")}
                subtitle={t("signup.profileSection.cards.experience.subtitle")}
              >
                <MockField label={t("signup.profileSection.preview.currentCompany")} value="Tech Solutions SARL" />
                <MockField label={t("signup.profileSection.preview.currentPosition")} value="Développeur Full Stack" />
                <div className="grid grid-cols-2 gap-2">
                  <MockField
                    label={t("signup.profileSection.preview.startDate")}
                    value="01/2022"
                    rightIcon={<Calendar className="w-3.5 h-3.5 text-gray-400" />}
                  />
                  <MockField
                    label={t("signup.profileSection.preview.endDate")}
                    value={t("signup.profileSection.preview.present")}
                    rightIcon={<Calendar className="w-3.5 h-3.5 text-gray-400" />}
                  />
                </div>
                <button
                  type="button"
                  disabled
                  className="w-full h-8 rounded-md border border-dashed text-[11px] font-medium flex items-center justify-center gap-1.5 mt-1 cursor-default"
                  style={{ borderColor: "rgba(0, 155, 90, 0.40)", color: C.green }}
                >
                  <Plus className="w-3 h-3" />
                  {t("signup.profileSection.preview.addExperience")}
                </button>
                <MockButton label={t("signup.profileSection.cta.createAccount")} />
              </ProfileStepCard>
            </div>

            {/* Flèches vertes entre les cards (desktop only) */}
            <div className="hidden lg:block pointer-events-none">
              <ArrowBetween left="calc(33.333% - 14px)" />
              <ArrowBetween left="calc(66.666% - 14px)" />
            </div>
          </div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 3. BANDEAU BÉNÉFICES (4 cards)                                 │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 rounded-3xl border bg-white shadow-sm overflow-hidden divide-y sm:divide-y-0 lg:divide-x"
            style={{ borderColor: C.border, ["--tw-divide-opacity" as string]: 1 }}
          >
            {[
              {
                icon: Briefcase,
                title: t("signup.benefits.card1Title"),
                desc: t("signup.benefits.card1Desc"),
                bg: "rgba(0, 155, 90, 0.10)",
                color: C.green,
              },
              {
                icon: FileText,
                title: t("signup.benefits.card2Title"),
                desc: t("signup.benefits.card2Desc"),
                bg: "rgba(246, 195, 67, 0.18)",
                color: "#A37200",
              },
              {
                icon: Bell,
                title: t("signup.benefits.card3Title"),
                desc: t("signup.benefits.card3Desc"),
                bg: "rgba(37, 99, 235, 0.10)",
                color: "#2563EB",
              },
              {
                icon: Send,
                title: t("signup.benefits.card4Title"),
                desc: t("signup.benefits.card4Desc"),
                bg: "rgba(139, 92, 246, 0.10)",
                color: "#8B5CF6",
              },
            ].map(({ icon: Icon, title, desc, bg, color }) => (
              <div key={title} className="p-6 lg:p-7 text-center sm:text-left">
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-2xl mb-3 mx-auto sm:mx-0"
                  style={{ backgroundColor: bg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3
                  className="font-bold text-base mb-1"
                  style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ 4. MICRO-SECTION SÉCURITÉ                                      │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="pb-16 lg:pb-20 bg-white">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium mb-2" style={{ color: C.green }}>
            <Shield className="w-4 h-4" />
            {t("signup.security.text")}
          </div>
          <p className="text-xs" style={{ color: C.textMuted }}>
            {t("signup.security.termsPrefix")}{" "}
            <a href="#" className="font-medium underline" style={{ color: C.green }}>
              {t("signup.security.termsLink")}
            </a>{" "}
            {t("signup.security.termsAnd")}{" "}
            <a href="#" className="font-medium underline" style={{ color: C.green }}>
              {t("signup.security.privacyLink")}
            </a>.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

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
      <Label htmlFor={id} className="text-sm font-medium mb-1.5 block" style={{ color: C.textMain }}>
        {label} {required && <span style={{ color: "#DC2626" }}>*</span>}
      </Label>
      {children}
    </div>
  );
}

function SocialButton({
  label,
  title,
  icon,
  onClick,
}: {
  label: string;
  title: string;
  icon: React.ReactNode;
  /** Si fourni, le bouton est actif et appelle onClick. Sinon
   *  rendu désactivé avec tooltip "Bientôt disponible". */
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center justify-center gap-2 h-11 rounded-md border bg-white text-sm font-medium transition-colors hover:bg-gray-50 hover:border-gray-300"
        style={{ borderColor: C.border, color: C.textMain }}
      >
        {icon}
        {label}
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled
      title={title}
      className="flex items-center justify-center gap-2 h-11 rounded-md border bg-white text-sm font-medium transition-colors cursor-not-allowed opacity-60"
      style={{ borderColor: C.border, color: C.textMain }}
    >
      {icon}
      {label}
    </button>
  );
}

/**
 * Card "aperçu d'étape" : header (numéro + titre + sous-titre) puis
 * mock-up visuel des champs du formulaire de cette étape. Non
 * interactif — c'est une démonstration du parcours, pas un vrai form.
 */
function ProfileStepCard({
  n,
  active,
  title,
  subtitle,
  children,
}: {
  n: number;
  active?: boolean;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl bg-white border p-5 lg:p-6 h-full flex flex-col transition-shadow hover:shadow-lg"
      style={{
        borderColor: active ? C.green : C.border,
        boxShadow: active ? `0 12px 30px -10px rgba(0, 155, 90, 0.25)` : undefined,
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-2xl font-extrabold text-sm shrink-0"
          style={{
            backgroundColor: active ? C.green : "rgba(0, 155, 90, 0.10)",
            color: active ? "white" : C.green,
          }}
        >
          {n}
        </span>
        <div className="min-w-0">
          <h3
            className="font-bold text-[15px] leading-tight"
            style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
          >
            {title}
          </h3>
          <p className="text-[11px]" style={{ color: C.textMuted }}>{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2.5 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

/** Champ de formulaire factice (lecture seule, design cohérent avec
 *  les vrais inputs du hero). */
function MockField({
  label,
  value,
  leftIcon,
  rightIcon,
}: {
  label: string;
  value: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-medium mb-1" style={{ color: C.textMain }}>
        {label} <span style={{ color: "#DC2626" }}>*</span>
      </div>
      <div
        className="relative flex items-center h-8 rounded-md border bg-white px-2.5"
        style={{ borderColor: C.border }}
      >
        {leftIcon && <span className="mr-2 shrink-0">{leftIcon}</span>}
        <span className="text-[11px] truncate flex-1" style={{ color: C.textMain }}>
          {value}
        </span>
        {rightIcon && <span className="ml-2 shrink-0">{rightIcon}</span>}
      </div>
    </div>
  );
}

/** Select factice avec chevron. */
function MockSelect({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium mb-1" style={{ color: C.textMain }}>
        {label} <span style={{ color: "#DC2626" }}>*</span>
      </div>
      <div
        className="relative flex items-center h-8 rounded-md border bg-white px-2.5"
        style={{ borderColor: C.border }}
      >
        <span className="text-[11px] truncate flex-1" style={{ color: C.textMain }}>
          {value}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      </div>
    </div>
  );
}

/** Bouton CTA factice (vert, full width, hauteur réduite pour les
 *  cards d'aperçu). */
function MockButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="w-full h-9 rounded-md text-xs font-semibold text-white mt-auto cursor-default"
      style={{ backgroundColor: C.green }}
    >
      {label}
    </button>
  );
}

/** Flèche verte positionnée absolument entre deux cards (desktop). */
function ArrowBetween({ left }: { left: string }) {
  return (
    <div
      aria-hidden="true"
      className="absolute top-1/2 -translate-y-1/2 z-10"
      style={{ left }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shadow-md"
        style={{ backgroundColor: C.green }}
      >
        <ArrowRight className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
    </div>
  );
}
