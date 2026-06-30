import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  Briefcase,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Page de connexion — refonte split-screen premium.
 *
 * Direction : cohérente avec les pages d'inscription (candidat,
 * employeur, choix profil) — hero à gauche, formulaire à droite.
 *
 * Logique préservée intégralement :
 * - Mutation tRPC `auth.login` avec payload {email, password, rememberMe}
 * - Pré-remplissage email via localStorage REMEMBER_EMAIL_KEY
 * - Redirection selon profileType : candidat → /candidat/dashboard,
 *   employeur → /employeur/dashboard, sinon → /select-profile
 * - Invalidation `auth.me` + délai de 100ms pour propagation cookie
 * - Filtrage des erreurs techniques (Failed query, ECONNREFUSED, etc.)
 *
 * Google OAuth : non implémenté côté backend → bouton désactivé avec
 * title "Bientôt disponible".
 */

const REMEMBER_EMAIL_KEY = "ct_remember_email";

// ─── Palette cohérente avec les autres pages premium ──────────────────────────
const C = {
  ivory: "#FAF7EF",
  deepGreen: "#063F24",
  green: "#007A3D",
  greenBright: "#009B5A",
  gold: "#F6C343",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#DCE3EA",
};

export default function Connexion() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const utils = trpc.useUtils();

  // Pré-remplir l'email si l'utilisateur avait coché "Se souvenir de moi"
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setFormData((prev) => ({ ...prev, email: saved, rememberMe: true }));
    }
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      toast.success(t("login.form.successToast"));

      if (formData.rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, formData.email.trim().toLowerCase());
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      await utils.auth.me.invalidate();
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (data.user.profileType === "candidat") {
        setLocation("/candidat/dashboard");
      } else if (data.user.profileType === "employeur") {
        setLocation("/employeur/dashboard");
      } else {
        setLocation("/select-profile");
      }
    },
    onError: (error) => {
      // Filtrage des erreurs techniques (cf. comportement existant)
      const raw = error.message || "";
      const looksTechnical =
        raw.includes("Failed query") ||
        raw.includes("select ") ||
        raw.includes("FROM ") ||
        raw.includes("ECONNREFUSED") ||
        raw.includes("is not defined") ||
        raw.includes("Cannot read") ||
        raw.includes("undefined") ||
        raw.startsWith("[") ||
        error.data?.code === "INTERNAL_SERVER_ERROR";
      const friendly = looksTechnical
        ? t("login.form.techError")
        : raw || t("login.form.genericError");
      toast.error(friendly);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: C.ivory, color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
    >
      <SiteHeader />

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ SPLIT-SCREEN HERO + FORM                                       │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="relative overflow-hidden">
        {/* Décorations subtiles d'arrière-plan */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {/* Courbes or haut gauche */}
          <svg
            className="absolute top-0 left-0 w-[420px] h-[420px] -translate-x-1/4 -translate-y-1/4 opacity-50"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="login-curve-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={C.gold} stopOpacity="0.30" />
                <stop offset="100%" stopColor={C.gold} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q100,50 250,150 T400,250" stroke="url(#login-curve-gold)" strokeWidth="50" fill="none" />
            <path d="M50,300 Q150,100 300,200" stroke="url(#login-curve-gold)" strokeWidth="2" fill="none" />
          </svg>
          {/* Points or à droite */}
          <div className="absolute top-40 right-24 grid grid-cols-5 gap-2 opacity-40">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
            ))}
          </div>
          {/* Points verts en bas */}
          <div className="absolute bottom-32 left-1/3 grid grid-cols-4 gap-2 opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.greenBright }} />
            ))}
          </div>
          {/* Halo vert doux */}
          <div
            className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-30"
            style={{ backgroundColor: C.greenBright }}
          />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-[72px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* ─── COLONNE GAUCHE : storytelling de retour ─────────── */}
            <motion.div
              initial={reduced ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              className="order-2 lg:order-1"
            >
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold mb-5"
                style={{
                  backgroundColor: "rgba(0, 155, 90, 0.10)",
                  color: C.green,
                  border: "1px solid rgba(0, 155, 90, 0.20)",
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t("login.hero.badge")}
              </div>

              {/* Titre */}
              <h1
                className="font-extrabold tracking-tight"
                style={{
                  fontSize: "clamp(30px, 4.2vw, 44px)",
                  color: C.textMain,
                  lineHeight: 1.1,
                }}
              >
                {t("login.hero.title")}
              </h1>

              {/* Sous-titre */}
              <p
                className="mt-4 text-base sm:text-[17px] leading-relaxed max-w-[520px]"
                style={{ color: C.textMuted }}
              >
                {t("login.hero.subtitle")}
              </p>

              {/* Bénéfices */}
              <ul className="mt-8 space-y-5 max-w-[520px]">
                {[
                  { icon: Lock, title: t("login.hero.b1Title"), desc: t("login.hero.b1Desc") },
                  { icon: Users, title: t("login.hero.b2Title"), desc: t("login.hero.b2Desc") },
                  { icon: BellRing, title: t("login.hero.b3Title"), desc: t("login.hero.b3Desc") },
                  { icon: Briefcase, title: t("login.hero.b4Title"), desc: t("login.hero.b4Desc") },
                ].map(({ icon: Icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3.5">
                    <span
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl shrink-0 mt-0.5"
                      style={{
                        backgroundColor: "rgba(0, 155, 90, 0.08)",
                        border: "1px solid rgba(0, 155, 90, 0.18)",
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: C.greenBright }} />
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-[15px] leading-tight" style={{ color: C.textMain }}>
                        {title}
                      </div>
                      <div className="text-sm leading-relaxed mt-0.5" style={{ color: C.textMuted }}>
                        {desc}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Bloc sécurité vert profond */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-10 max-w-[520px] rounded-3xl p-7 text-white relative overflow-hidden"
                style={{
                  backgroundColor: C.deepGreen,
                  boxShadow: "0 20px 60px -10px rgba(6, 63, 36, 0.40)",
                }}
              >
                {/* Halo or interne très subtil */}
                <div
                  aria-hidden="true"
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-30"
                  style={{ backgroundColor: C.gold }}
                />
                <div className="relative flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "rgba(246, 195, 67, 0.18)",
                      border: "1px solid rgba(246, 195, 67, 0.30)",
                    }}
                  >
                    <ShieldCheck className="w-6 h-6" style={{ color: C.gold }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base mb-1">{t("login.hero.securityTitle")}</h3>
                    <p className="text-sm text-white/85 leading-relaxed">{t("login.hero.securityDesc")}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* ─── COLONNE DROITE : carte formulaire ────────────────── */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="order-1 lg:order-2 flex justify-center lg:justify-end"
            >
              <div
                className="relative w-full max-w-[560px] rounded-[28px] border p-7 sm:p-10 lg:p-12"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  borderColor: C.border,
                  boxShadow: "0 30px 90px rgba(15, 23, 42, 0.12)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                {/* Motif points or haut-droite */}
                <div aria-hidden="true" className="absolute top-6 right-6 grid grid-cols-5 gap-1.5 pointer-events-none opacity-70">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
                  ))}
                </div>

                {/* Header form */}
                <div className="text-center mb-7">
                  <h2
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: C.textMain }}
                  >
                    {t("login.form.title")}
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: C.textMuted }}>
                    {t("login.form.subtitle")}
                  </p>
                  {/* Petit filet or */}
                  <div
                    aria-hidden="true"
                    className="mx-auto mt-3 h-0.5 w-12 rounded-full"
                    style={{ backgroundColor: C.gold }}
                  />
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold mb-1.5 block" style={{ color: C.textMain }}>
                      {t("login.form.email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 pl-11 text-[15px]"
                        style={{ borderColor: C.border }}
                        placeholder={t("login.form.emailPh")}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password" className="text-sm font-semibold mb-1.5 block" style={{ color: C.textMain }}>
                      {t("login.form.password")}
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="h-12 pl-11 pr-11 text-[15px]"
                        style={{ borderColor: C.border }}
                        placeholder={t("login.form.passwordPh")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Se souvenir + mot de passe oublié */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember-me"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, rememberMe: checked as boolean })
                        }
                      />
                      <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer" style={{ color: C.textMuted }}>
                        {t("login.form.rememberMe")}
                      </Label>
                    </div>
                    <Link
                      href="/mot-de-passe-oublie"
                      className="text-sm font-semibold hover:underline transition-all"
                      style={{ color: C.green }}
                    >
                      {t("login.form.forgotPassword")}
                    </Link>
                  </div>

                  {/* CTA */}
                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="relative w-full h-14 text-base font-bold text-white gap-2 shadow-lg transition-all focus:ring-4 focus:ring-emerald-500/30 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${C.deepGreen} 0%, ${C.greenBright} 100%)`,
                      boxShadow: "0 14px 30px rgba(0, 155, 90, 0.25)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      if (!loginMutation.isPending) {
                        el.style.transform = "translateY(-1px)";
                        el.style.boxShadow = "0 16px 35px rgba(0, 155, 90, 0.26)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.transform = "translateY(0)";
                      el.style.boxShadow = "0 14px 30px rgba(0, 155, 90, 0.25)";
                    }}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t("login.form.submitting")}
                      </>
                    ) : (
                      <>
                        {t("login.form.submit")}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>

                  {/* Séparateur */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: C.border }} />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-xs bg-white" style={{ color: C.textMuted }}>
                        {t("login.form.orContinueWith")}
                      </span>
                    </div>
                  </div>

                  {/* Google — désactivé (OAuth non branché) */}
                  <button
                    type="button"
                    disabled
                    title={t("login.form.googleSoon")}
                    className="w-full inline-flex items-center justify-center gap-3 h-12 border rounded-md text-sm font-semibold bg-white transition-colors cursor-not-allowed opacity-60"
                    style={{ borderColor: C.border, color: C.textMain }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                      <path fill="#EA4335" d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.71 14.97.55 12 .55 7.46.55 3.55 3.14 1.64 7l3.66 2.84C6.17 7.24 8.86 5 12 5z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.55-.19-2.27H12v4.51h6.45c-.28 1.5-1.12 2.77-2.39 3.62l3.66 2.84c2.13-1.97 3.37-4.87 3.37-8.7z" />
                      <path fill="#FBBC05" d="M5.3 14.16c-.22-.66-.34-1.36-.34-2.16s.12-1.5.34-2.16L1.64 7C.9 8.52.5 10.21.5 12s.4 3.48 1.14 5l3.66-2.84z" />
                      <path fill="#34A853" d="M12 23.45c2.97 0 5.45-.98 7.27-2.65l-3.66-2.84c-1 .67-2.28 1.07-3.61 1.07-3.14 0-5.83-2.24-6.7-5.32L1.64 16.6C3.55 20.36 7.46 23.45 12 23.45z" />
                    </svg>
                    {t("login.form.google")}
                  </button>
                </form>

                {/* Pas de compte ? */}
                <p className="text-center text-sm mt-7" style={{ color: C.textMuted }}>
                  {t("login.form.noAccount")}{" "}
                  <Link
                    href="/inscription"
                    className="font-semibold hover:underline transition-all"
                    style={{ color: C.green }}
                  >
                    {t("login.form.createAccount")}
                  </Link>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
