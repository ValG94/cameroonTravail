import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  HeadphonesIcon,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Page de choix du profil d'inscription — version premium.
 *
 * Direction : "Plateforme emploi premium, moderne, panafricaine, crédible".
 *
 * Layout :
 *  1. Header global
 *  2. Hero : badge + titre + sous-titre, fond ivoire avec courbes décoratives
 *  3. Deux grandes cards horizontales (Candidats vert, Recruteurs or)
 *     avec photos détourées intégrées à droite + halo coloré + hover lift
 *  4. Bandeau réassurance 4 colonnes
 *  5. Footer global
 *
 * Pré-sélection URL préservée : ?type=candidat ou ?type=employeur
 * redirige directement vers le bon formulaire.
 */

const C = {
  ivory: "#FAF7EF",
  ivoryLight: "#FFFDF7",
  deepGreen: "#063F24",
  green: "#007A3D",
  greenBright: "#009B5A",
  gold: "#F6C343",
  goldDark: "#D99200",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

export default function ChoixInscription() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const reduced = useReducedMotion();

  // Pré-sélection via ?type — préservée. Si l'URL indique déjà le type
  // de profil (depuis Espace Recruteur, Choisir ce plan, etc.), on
  // saute cet écran et on conserve les autres query params.
  useEffect(() => {
    const sp = new URLSearchParams(searchString || "");
    const type = sp.get("type");
    if (type !== "candidat" && type !== "employeur") return;
    sp.delete("type");
    const rest = sp.toString();
    setLocation(`/inscription/${type}${rest ? `?${rest}` : ""}`);
  }, [searchString, setLocation]);

  const candidateBenefits = t("chooseProfile.candidate.benefits", { returnObjects: true }) as string[];
  const recruiterBenefits = t("chooseProfile.recruiter.benefits", { returnObjects: true }) as string[];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: C.ivory, color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
    >
      <SiteHeader />

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ HERO + CARDS                                                   │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      <section className="relative overflow-hidden">
        {/* Décorations subtiles d'arrière-plan */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          {/* Courbes vert clair haut gauche */}
          <svg
            className="absolute top-0 left-0 w-[420px] h-[420px] -translate-x-1/4 -translate-y-1/4 opacity-50"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="curve-green" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={C.greenBright} stopOpacity="0.15" />
                <stop offset="100%" stopColor={C.greenBright} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q100,50 250,150 T400,250" stroke="url(#curve-green)" strokeWidth="60" fill="none" />
          </svg>
          {/* Courbes or haut droit */}
          <svg
            className="absolute top-0 right-0 w-[480px] h-[480px] translate-x-1/4 -translate-y-1/4 opacity-50"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="curve-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={C.gold} stopOpacity="0" />
                <stop offset="100%" stopColor={C.gold} stopOpacity="0.30" />
              </linearGradient>
            </defs>
            <path d="M50,300 Q150,100 300,200 T400,100" stroke="url(#curve-gold)" strokeWidth="50" fill="none" />
            <path d="M100,350 Q200,150 350,250" stroke="url(#curve-gold)" strokeWidth="2" fill="none" />
          </svg>
          {/* Petits points verts en bas gauche */}
          <div className="absolute bottom-32 left-12 grid grid-cols-4 gap-2 opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.greenBright }} />
            ))}
          </div>
          {/* Points or en haut droite (au-dessus des courbes) */}
          <div className="absolute top-40 right-24 grid grid-cols-5 gap-2 opacity-40">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
            ))}
          </div>
        </div>

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-12 lg:py-[72px]">
          {/* ─── Badge ─────────────────────────────────────────────── */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <span className="h-px w-10" style={{ backgroundColor: C.deepGreen, opacity: 0.30 }} />
            <Sparkles className="w-3.5 h-3.5" style={{ color: C.gold }} />
            <span
              className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: C.green }}
            >
              {t("chooseProfile.badge")}
            </span>
            <Sparkles className="w-3.5 h-3.5" style={{ color: C.gold }} />
            <span className="h-px w-10" style={{ backgroundColor: C.deepGreen, opacity: 0.30 }} />
          </motion.div>

          {/* ─── Titre ─────────────────────────────────────────────── */}
          <motion.h1
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-center font-extrabold tracking-tight"
            style={{
              fontSize: "clamp(38px, 5.5vw, 64px)",
              color: C.textMain,
              lineHeight: 1.05,
            }}
          >
            {t("chooseProfile.title")}
          </motion.h1>

          {/* ─── Sous-titre ────────────────────────────────────────── */}
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-center mx-auto mt-5 max-w-[680px] text-base sm:text-lg leading-relaxed"
            style={{ color: C.textMuted }}
          >
            {t("chooseProfile.subtitle")}
          </motion.p>

          {/* ─── Cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mt-14">
            {/* ─── Card Candidats ──────────────────────────────────── */}
            <ProfileCard
              variant="candidate"
              title={t("chooseProfile.candidate.title")}
              description={t("chooseProfile.candidate.description")}
              benefits={candidateBenefits}
              cta={t("chooseProfile.cta")}
              imageSrc="/images/candidate-profile.webp"
              imageAlt={t("chooseProfile.candidate.imageAlt")}
              onClick={() => setLocation("/inscription/candidat")}
              reduced={!!reduced}
            />

            {/* ─── Card Recruteurs ─────────────────────────────────── */}
            <ProfileCard
              variant="recruiter"
              title={t("chooseProfile.recruiter.title")}
              description={t("chooseProfile.recruiter.description")}
              benefits={recruiterBenefits}
              cta={t("chooseProfile.cta")}
              imageSrc="/images/recruiter-profile.webp"
              imageAlt={t("chooseProfile.recruiter.imageAlt")}
              onClick={() => setLocation("/inscription/employeur")}
              reduced={!!reduced}
            />
          </div>

          {/* ─── Bandeau réassurance ───────────────────────────────── */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
            className="mt-14 lg:mt-16 bg-white rounded-[22px] border shadow-sm overflow-hidden"
            style={{ borderColor: C.border, boxShadow: "0 4px 24px rgba(15, 23, 42, 0.04)" }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
              <ReassuranceItem
                icon={ShieldCheck}
                title={t("chooseProfile.reassurance.item1.title")}
                subtitle={t("chooseProfile.reassurance.item1.subtitle")}
              />
              <ReassuranceItem
                icon={Lock}
                title={t("chooseProfile.reassurance.item2.title")}
              />
              <ReassuranceItem
                icon={Users}
                title={t("chooseProfile.reassurance.item3.title")}
              />
              <ReassuranceItem
                icon={HeadphonesIcon}
                title={t("chooseProfile.reassurance.item4.title")}
              />
            </div>
          </motion.div>

          {/* ─── Déjà inscrit ──────────────────────────────────────── */}
          <p className="text-center mt-10 text-sm" style={{ color: C.textMuted }}>
            {t("chooseProfile.alreadyAccount")}{" "}
            <button
              type="button"
              onClick={() => setLocation("/connexion")}
              className="font-semibold underline hover:no-underline transition-all"
              style={{ color: C.green }}
            >
              {t("chooseProfile.loginLink")}
            </button>
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

/**
 * Card premium horizontale : texte/benefits/CTA à gauche (~52%), image
 * détourée à droite (~42-46%). Deux variantes : "candidate" (vert) et
 * "recruiter" (or). Hover lift + glow radial subtil + flèche CTA qui
 * se décale légèrement à droite.
 */
function ProfileCard({
  variant,
  title,
  description,
  benefits,
  cta,
  imageSrc,
  imageAlt,
  onClick,
  reduced,
}: {
  variant: "candidate" | "recruiter";
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  imageSrc: string;
  imageAlt: string;
  onClick: () => void;
  reduced: boolean;
}) {
  const isCandidate = variant === "candidate";
  const accent = isCandidate ? C.greenBright : C.goldDark;
  const accentSoft = isCandidate ? "rgba(0, 155, 90, 0.10)" : "rgba(246, 195, 67, 0.22)";
  const borderColor = isCandidate ? "rgba(0, 155, 90, 0.20)" : "rgba(246, 195, 67, 0.40)";
  const borderHover = isCandidate ? "rgba(0, 155, 90, 0.45)" : "rgba(246, 195, 67, 0.70)";
  const haloColor = isCandidate ? "rgba(0, 155, 90, 0.18)" : "rgba(246, 195, 67, 0.30)";
  const glowGradient = isCandidate
    ? "radial-gradient(circle at 75% 50%, rgba(16,185,129,0.14), transparent 45%)"
    : "radial-gradient(circle at 75% 50%, rgba(246,195,67,0.18), transparent 45%)";
  const cardBg = isCandidate
    ? "linear-gradient(135deg, #FFFFFF 0%, #F4FBF7 100%)"
    : "linear-gradient(135deg, #FFFFFF 0%, #FFFBEE 100%)";
  const buttonBg = isCandidate ? C.green : C.gold;
  const buttonBgHover = isCandidate ? C.deepGreen : C.goldDark;
  const buttonText = isCandidate ? "white" : C.textMain;
  const buttonShadow = isCandidate
    ? "0 10px 24px -8px rgba(0, 122, 61, 0.45)"
    : "0 10px 24px -8px rgba(246, 195, 67, 0.55)";
  const Icon = isCandidate ? User : Briefcase;

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: isCandidate ? 0.15 : 0.22 }}
      className="group relative overflow-hidden rounded-[32px] border bg-white transition-all duration-300 ease-out hover:-translate-y-1.5"
      style={{
        background: cardBg,
        borderColor,
        boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
        minHeight: 430,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 30px 90px rgba(15, 23, 42, 0.14)";
        el.style.borderColor = borderHover;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 20px 60px rgba(15, 23, 42, 0.08)";
        el.style.borderColor = borderColor;
      }}
    >
      {/* Glow interne très subtil (apparaît au hover) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: glowGradient }}
      />

      {/* Halo coloré derrière la personne */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute -right-16 bottom-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{ backgroundColor: haloColor, filter: "blur(8px)" }}
      />

      {/* Blob organique très pâle */}
      <svg
        aria-hidden="true"
        className="hidden md:block absolute -right-10 top-10 w-72 h-72 opacity-60 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={isCandidate ? "#E8F7EF" : "#FFF4D5"}
          d="M44.5,-58.5C57.1,-49.2,66.4,-34.7,69.1,-19.4C71.8,-4.1,68,11.9,60.1,25.6C52.2,39.3,40.3,50.5,26.4,57.3C12.6,64.1,-3.2,66.4,-18.7,63.1C-34.1,59.7,-49.2,50.7,-58.3,37.6C-67.5,24.4,-70.7,7.2,-68.7,-9C-66.8,-25.3,-59.7,-40.5,-48.2,-50C-36.7,-59.5,-20.7,-63.4,-3.7,-58.9C13.4,-54.5,31.9,-67.8,44.5,-58.5Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Points décoratifs internes (bas droit ou haut droit selon variante) */}
      {!isCandidate && (
        <div className="absolute top-6 right-10 grid grid-cols-4 gap-1.5 opacity-50 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
          ))}
        </div>
      )}
      {isCandidate && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/4 grid grid-cols-5 gap-1.5 opacity-40 pointer-events-none">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.greenBright }} />
          ))}
        </div>
      )}

      {/* Contenu — texte à gauche, image à droite */}
      <div className="relative z-10 p-7 sm:p-10 lg:p-12 flex flex-col h-full" style={{ minHeight: 430 }}>
        {/* Header — icône + titre */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: accentSoft }}
          >
            <Icon className="w-8 h-8" style={{ color: accent }} />
          </div>
          <h2
            className="font-extrabold tracking-tight"
            style={{
              fontSize: "clamp(28px, 3.2vw, 36px)",
              color: accent,
              fontFamily: "'Manrope', 'Inter', sans-serif",
            }}
          >
            {title}
          </h2>
        </div>

        {/* Block texte — limité à ~52% à partir de md pour laisser
            place à l'image. Sur mobile l'image est masquée donc le
            texte prend toute la largeur. */}
        <div className="md:max-w-[55%] lg:max-w-[52%] flex flex-col flex-1">
          <p className="text-[15px] sm:text-base leading-relaxed mb-6" style={{ color: C.textMuted }}>
            {description}
          </p>

          <ul className="space-y-2.5 mb-7">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm" style={{ color: C.textMain }}>
                <CheckCircle2
                  className="w-[18px] h-[18px] shrink-0 mt-0.5"
                  style={{ color: accent }}
                  strokeWidth={2}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            type="button"
            onClick={onClick}
            className="group/button inline-flex items-center justify-center gap-2 h-14 px-7 rounded-[14px] font-semibold text-base transition-all duration-300 self-start focus:outline-none focus:ring-4"
            style={{
              backgroundColor: buttonBg,
              color: buttonText,
              boxShadow: buttonShadow,
              minWidth: "200px",
              ["--tw-ring-color" as string]: isCandidate ? "rgba(0, 122, 61, 0.30)" : "rgba(246, 195, 67, 0.40)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = buttonBgHover;
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.backgroundColor = buttonBg;
              el.style.transform = "translateY(0)";
            }}
          >
            {cta}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Image personne — détourée, à droite */}
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="lazy"
        className="hidden md:block absolute bottom-0 right-2 lg:right-4 h-[140%] md:max-w-[48%] lg:h-[200%] lg:max-w-[55%] object-contain object-bottom pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </motion.article>
  );
}

/** Item du bandeau réassurance (icône verte + titre + sous-titre optionnel). */
function ReassuranceItem({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-6 lg:p-7">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: "rgba(0, 155, 90, 0.10)" }}
      >
        <Icon className="w-5 h-5" style={{ color: C.greenBright }} />
      </div>
      <div className="min-w-0">
        <div
          className="font-bold text-sm leading-snug"
          style={{ color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-xs leading-relaxed mt-1" style={{ color: C.textMuted }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
