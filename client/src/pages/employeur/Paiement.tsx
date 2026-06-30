import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Headphones,
  Info,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Page de demande de souscription (Option B : paiement manuel).
 *
 * Workflow :
 *  1. Le recruteur arrive depuis EspaceRecruteur (bouton "Choisir ce
 *     plan") avec ?plan=X dans l'URL.
 *  2. La page affiche le récap de la formule choisie + les coordonnées
 *     de paiement Orange Money / MTN MoMo.
 *  3. Le recruteur effectue le paiement sur son téléphone, puis saisit
 *     la référence de transaction reçue et son numéro de paiement.
 *  4. Submit → mutation trpc.employeur.demanderSouscription crée la
 *     ligne dans demandes_souscription (statut "en_attente").
 *  5. L'admin reçoit la demande dans /admin/souscriptions, vérifie le
 *     paiement réel et valide → formule activée automatiquement sur
 *     la fiche employeur.
 */

// ─── Coordonnées de paiement (à personnaliser) ────────────────────────────────
// TODO : remplacer par les vrais numéros marchands Cameroon Travail
const PAYMENT_NUMBERS = {
  orange_money: "+237 6XX XX XX XX",
  mtn_momo: "+237 6XX XX XX XX",
};

const C = {
  ivory: "#FAF7EF",
  deepGreen: "#063F24",
  green: "#007A3D",
  greenBright: "#009B5A",
  gold: "#F6C343",
  goldDark: "#D99200",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

/**
 * Thème visuel par formule. Mapping basé sur le nom commercial
 * (insensible à la casse) :
 *  - "découverte" → green basic (entrée de gamme)
 *  - "avantage"   → gold accent (intermédiaire)
 *  - "premium"    → violet/indigo (haut de gamme)
 * Tout est isolé ici pour permettre d'étendre facilement les visuels
 * de chaque tier au fil des maquettes reçues.
 */
type FormuleTheme = {
  variant: "basic" | "advantage" | "premium";
  /** "split" = recap à gauche + paiement à droite (Découverte).
   *  "hero" = hero pleine largeur vert profond + paiement centré
   *  dessous (Avantage, future Premium). */
  layout: "split" | "hero";
  cardBorder: string;
  accentColor: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  checkColor: string;
  taglineColor: string;
  /** Image hero affichée à droite du bloc vert si layout === "hero". */
  heroImage?: string;
  /** Couleur de fond du bandeau réassurance. Dark pour Avantage,
   *  light pour Découverte. */
  reassuranceBg: "light" | "dark";
};

function getFormuleTheme(nom: string): FormuleTheme {
  const lower = nom.toLowerCase();
  if (lower.includes("premium")) {
    return {
      variant: "premium",
      layout: "hero",
      cardBorder: "rgba(124, 58, 237, 0.30)",
      accentColor: "#7C3AED",
      accentBg: "rgba(124, 58, 237, 0.06)",
      badgeBg: "rgba(124, 58, 237, 0.10)",
      badgeText: "#6D28D9",
      badgeBorder: "rgba(124, 58, 237, 0.25)",
      checkColor: "#7C3AED",
      taglineColor: "#7C3AED",
      reassuranceBg: "dark",
    };
  }
  if (lower.includes("avantage")) {
    return {
      variant: "advantage",
      layout: "hero",
      cardBorder: "rgba(246, 195, 67, 0.45)",
      accentColor: C.goldDark,
      accentBg: "rgba(246, 195, 67, 0.08)",
      badgeBg: "rgba(246, 195, 67, 0.18)",
      badgeText: "#A37200",
      badgeBorder: "rgba(246, 195, 67, 0.40)",
      checkColor: C.goldDark,
      taglineColor: C.goldDark,
      heroImage: "/images/recruteur/offre-avantage.webp",
      reassuranceBg: "dark",
    };
  }
  // Default : Découverte (basique, vert)
  return {
    variant: "basic",
    layout: "split",
    cardBorder: "rgba(0, 155, 90, 0.30)",
    accentColor: C.greenBright,
    accentBg: "rgba(0, 155, 90, 0.06)",
    badgeBg: "rgba(0, 155, 90, 0.10)",
    badgeText: C.green,
    badgeBorder: "rgba(0, 155, 90, 0.25)",
    checkColor: C.greenBright,
    taglineColor: C.green,
    reassuranceBg: "light",
  };
}

export default function PaiementEmployeur() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { user, loading: authLoading } = useAuth();

  const planId = useMemo(() => {
    const sp = new URLSearchParams(searchString || "");
    const v = sp.get("plan");
    return v ? Number(v) : null;
  }, [searchString]);

  const [methodePaiement, setMethodePaiement] = useState<"orange_money" | "mtn_momo" | "autre">("orange_money");
  const [referenceTransaction, setReferenceTransaction] = useState("");

  // Garde : doit être authentifié + employeur
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLocation(`/connexion?redirect=/employeur/paiement?plan=${planId ?? ""}`);
      return;
    }
    if (user.profileType !== "employeur" && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, authLoading, planId, setLocation]);

  // Force scroll en haut au mount : sinon wouter préserve la position
  // du scroll de la page précédente (si on vient de /tarifs en cliquant
  // 'Choisir ce plan' depuis la grille en bas, on arrive ici au niveau
  // du footer au lieu d'en haut).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const formulesQuery = trpc.formules.getActives.useQuery({ cible: "employeur" });
  const formule = useMemo(
    () => formulesQuery.data?.find((f: any) => f.id === planId),
    [formulesQuery.data, planId]
  );

  const demanderMutation = trpc.employeur.demanderSouscription.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerPayment.sentToast"));
      setLocation("/employeur/dashboard");
    },
    onError: (e: { message?: string }) => {
      toast.error(e.message || t("bo.employerPayment.sentToast"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formule) {
      toast.error(t("bo.employerPayment.formulaNotFound"));
      return;
    }
    if (referenceTransaction.trim().length < 3) {
      toast.error(t("bo.employerPayment.refTooShort"));
      return;
    }
    await demanderMutation.mutateAsync({
      formuleId: formule.id,
      methodePaiement,
      referenceTransaction: referenceTransaction.trim(),
    });
  };

  if (authLoading || formulesQuery.isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.ivory }}>
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: C.green }} />
        </div>
      </div>
    );
  }

  if (!planId || !formule) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.ivory, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-3" style={{ color: C.textMain }}>{t("bo.employerPayment.noFormulaTitle")}</h1>
          <p className="mb-6" style={{ color: C.textMuted }}>
            {t("bo.employerPayment.noFormulaDesc")}
          </p>
          <Button
            onClick={() => setLocation("/tarifs")}
            style={{ backgroundColor: C.green, color: "white" }}
          >
            {t("bo.employerPayment.seePrices")}
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const prix = Number(formule.prix).toLocaleString("fr-FR");
  const numero = methodePaiement === "autre" ? null : PAYMENT_NUMBERS[methodePaiement];
  const theme = getFormuleTheme(formule.nom);
  // Liste des fonctionnalités stockées dans formule.fonctionnalites
  // (string multilignes, une par ligne). Parsée 1 fois.
  const fonctionnalites = formule.fonctionnalites
    ? String(formule.fonctionnalites).split("\n").map((s) => s.trim()).filter(Boolean)
    : [];

  // Handler partagé : retour vers /tarifs avec scroll smooth sur #tarifs
  const handleBackToPricing = () => {
    setLocation("/tarifs");
    setTimeout(() => {
      document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ivory, color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <SiteHeader />

      {/* ╭───────────────────────────────────────────────────────────────╮ */}
      {/* │ HERO BAND vert profond — uniquement layout "hero" (Avantage/  │ */}
      {/* │ Premium). En basic (Découverte), header simple dans le        │ */}
      {/* │ container ci-dessous.                                          │ */}
      {/* ╰───────────────────────────────────────────────────────────────╯ */}
      {theme.layout === "hero" && (
        <section
          className="relative overflow-hidden text-white"
          style={{ backgroundColor: C.deepGreen }}
        >
          {/* Halo or animé subtil */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full blur-[140px] opacity-25 pointer-events-none"
            style={{ backgroundColor: C.gold }}
          />
          <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-14">
            <button
              type="button"
              onClick={handleBackToPricing}
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 text-white/85 hover:text-white hover:underline transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("bo.employerPayment.backToPrices")}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Côté gauche : titre + prix + tagline */}
              <div>
                <Badge
                  className="mb-5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.10)",
                    color: theme.variant === "advantage" ? C.gold : "white",
                    border: `1px solid ${theme.variant === "advantage" ? "rgba(246, 195, 67, 0.40)" : "rgba(255, 255, 255, 0.25)"}`,
                  }}
                >
                  {formule.nom}
                </Badge>
                <h1
                  className="font-extrabold leading-[1.05] tracking-tight"
                  style={{ fontSize: "clamp(34px, 4.6vw, 52px)" }}
                >
                  {t("bo.employerPayment.title")}{" "}
                  <span
                    style={{
                      background: theme.variant === "advantage"
                        ? `linear-gradient(135deg, ${C.gold} 0%, #FFE390 100%)`
                        : undefined,
                      WebkitBackgroundClip: theme.variant === "advantage" ? "text" : undefined,
                      WebkitTextFillColor: theme.variant === "advantage" ? "transparent" : undefined,
                      backgroundClip: theme.variant === "advantage" ? "text" : undefined,
                      color: theme.variant === "advantage" ? undefined : C.greenBright,
                    }}
                  >
                    {formule.nom}
                  </span>
                </h1>
                <p className="mt-4 text-base sm:text-[17px] text-white/85 leading-relaxed max-w-[520px]">
                  {t("bo.employerPayment.subtitle")}
                </p>
              </div>

              {/* Côté droit : image hero (Avantage : photo recruteur) */}
              {theme.heroImage && (
                <div className="relative hidden lg:flex justify-end">
                  <img
                    src={theme.heroImage}
                    alt=""
                    aria-hidden="true"
                    className="max-h-[340px] w-auto object-contain rounded-2xl shadow-2xl"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        {/* Header simple — uniquement layout "basic" (Découverte).
            En "hero", le header est déjà rendu dans la bande verte
            au-dessus. */}
        {theme.layout === "split" && (
          <>
            <button
              type="button"
              onClick={handleBackToPricing}
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:underline"
              style={{ color: C.textMuted }}
            >
              <ArrowLeft className="w-4 h-4" />
              {t("bo.employerPayment.backToPrices")}
            </button>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              {t("bo.employerPayment.title")} <span style={{ color: C.green }}>{formule.nom}</span>
            </h1>
            <p className="mb-10 text-base" style={{ color: C.textMuted }}>
              {t("bo.employerPayment.subtitle")}
            </p>
          </>
        )}

        {/* Grid layout : split pour basic, vertical stack pour hero
            (recap full-width au-dessus, paiement plus large dessous) */}
        <div
          className={
            theme.layout === "hero"
              ? "flex flex-col gap-8 max-w-[820px] mx-auto"
              : "grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8"
          }
        >
          {/* ─── Récap formule (thème par tier) ─────────────────── */}
          <Card
            className="rounded-3xl border-2 shadow-sm h-fit overflow-hidden"
            style={{ borderColor: theme.cardBorder }}
          >
            <CardContent className="p-7">
              {/* Badge tier (vert/or/violet selon formule) */}
              <Badge
                className="mb-5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                  border: `1px solid ${theme.badgeBorder}`,
                }}
              >
                {formule.nom}
              </Badge>

              {/* Prix + période */}
              <div className="flex items-end gap-1.5 mb-2">
                <span className="text-5xl font-extrabold tracking-tight leading-none" style={{ color: C.textMain }}>
                  {prix}
                </span>
                <span className="text-base font-medium pb-1.5" style={{ color: C.textMuted }}>
                  {formule.devise}
                </span>
              </div>
              <div className="text-sm mb-5" style={{ color: C.textMuted }}>
                /
                {" "}
                {formule.periode === "annuel"
                  ? t("bo.employerPayment.periodYear")
                  : formule.periode === "unique"
                  ? t("bo.employerPayment.periodOnce")
                  : t("bo.employerPayment.periodMonth")}
              </div>

              {/* Tagline (description courte) en accent color du tier */}
              {formule.description && (
                <p className="text-sm font-medium mb-6" style={{ color: theme.taglineColor }}>
                  {formule.description}
                </p>
              )}

              {/* Liste fonctionnalités avec checkmarks colorés selon
                  le tier. Si la liste est vide, on n'affiche rien. */}
              {fonctionnalites.length > 0 && (
                <ul className="space-y-3">
                  {fonctionnalites.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2
                        className="w-[18px] h-[18px] mt-0.5 shrink-0"
                        style={{ color: theme.checkColor }}
                      />
                      <span style={{ color: C.textMain }}>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* ─── Form paiement ──────────────────────────────────── */}
          <Card className="rounded-3xl border shadow-lg" style={{ borderColor: C.border }}>
            <CardContent className="p-7 sm:p-9">
              <h2 className="text-xl font-bold mb-1" style={{ color: C.textMain }}>
                {t("bo.employerPayment.howToPay")}
              </h2>
              <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                {t("bo.employerPayment.howToPayDesc")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Choix méthode */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t("bo.employerPayment.method")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { key: "orange_money", label: t("bo.employerPayment.methodOrange"), color: "#FF7900" },
                      { key: "mtn_momo", label: t("bo.employerPayment.methodMtn"), color: "#FFC500" },
                      { key: "autre", label: t("bo.employerPayment.methodOther"), color: C.textMuted },
                    ].map((m) => {
                      const active = methodePaiement === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setMethodePaiement(m.key as any)}
                          className="relative flex items-center gap-2.5 h-12 px-3 rounded-xl border-2 text-sm font-semibold transition-all"
                          style={{
                            borderColor: active ? theme.accentColor : C.border,
                            backgroundColor: active ? theme.accentBg : "white",
                            color: C.textMain,
                          }}
                        >
                          <Smartphone className="w-4 h-4" style={{ color: m.color }} />
                          {m.label}
                          {active && (
                            <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: theme.accentColor }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions paiement (couleur tier-aware) */}
                {numero && (
                  <div
                    className="rounded-xl border p-4"
                    style={{ borderColor: theme.badgeBorder, backgroundColor: theme.accentBg }}
                  >
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: theme.accentColor }} />
                      <div className="text-sm leading-relaxed" style={{ color: C.textMain }}>
                        <p className="font-semibold mb-2">{t("bo.employerPayment.instructionsTitle")}</p>
                        <ol className="list-decimal pl-4 space-y-1.5 text-[13px]" style={{ color: C.textMuted }}>
                          <li>{t("bo.employerPayment.instructionStep1")}</li>
                          <li>
                            {t("bo.employerPayment.instructionStep2", { amount: prix, currency: formule.devise, number: numero })}
                          </li>
                          <li>{t("bo.employerPayment.instructionStep3")}</li>
                          <li>{t("bo.employerPayment.instructionStep4")}</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {methodePaiement === "autre" && (
                  <div
                    className="rounded-xl border p-4 text-sm"
                    style={{ borderColor: "rgba(246, 195, 67, 0.40)", backgroundColor: "rgba(246, 195, 67, 0.08)" }}
                  >
                    {t("bo.employerPayment.otherMethod")}
                  </div>
                )}

                {/* Référence transaction */}
                <div>
                  <Label htmlFor="ref" className="text-sm font-semibold mb-1.5 block">
                    {t("bo.employerPayment.referenceLabel")} <span style={{ color: "#DC2626" }}>*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="ref"
                      value={referenceTransaction}
                      onChange={(e) => setReferenceTransaction(e.target.value)}
                      placeholder={t("bo.employerPayment.referencePh")}
                      className="h-12 pl-10"
                      style={{ borderColor: C.border }}
                      required
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: C.textMuted }}>
                    {t("bo.employerPayment.referenceHelp")}
                  </p>
                </div>

                {/* Récap final */}
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: "#F8FAFC", border: `1px solid ${C.border}` }}
                >
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: C.textMuted }}>
                      {t("bo.employerPayment.totalToPay")}
                    </div>
                    <div className="text-2xl font-extrabold mt-1" style={{ color: C.textMain }}>
                      {prix} <span className="text-sm font-medium" style={{ color: C.textMuted }}>{formule.devise}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
                    <Clock className="w-3.5 h-3.5" />
                    {t("bo.employerPayment.activatedIn")}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={demanderMutation.isPending}
                  className="w-full h-13 text-base font-bold text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${C.deepGreen} 0%, ${C.greenBright} 100%)`,
                    height: "52px",
                  }}
                >
                  {demanderMutation.isPending ? t("bo.employerPayment.submitting") : t("bo.employerPayment.submitBtn")}
                </Button>

                <p className="text-xs text-center" style={{ color: C.textMuted }}>
                  {t("bo.employerPayment.emailNote")}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ─── Bandeau réassurance 4 items — variant par tier ──────────
          - basic (Découverte) : fond blanc/light, icônes vertes,
            bénéfices génériques (sécurité, activation, etc.)
          - advantage (Avantage) : fond vert profond pleine largeur,
            icônes or, bénéfices spécifiques recrutement (visibilité,
            talents, gain de temps, accompagnement) — donne la
            sensation premium recherchée. */}
      {(() => {
        const isDark = theme.reassuranceBg === "dark";
        // Bénéfices spécifiques Avantage si tier === "advantage",
        // sinon génériques (Découverte + Premium fallback).
        const items = theme.variant === "advantage"
          ? [
              { icon: Sparkles, title: t("bo.employerPayment.advantageBenefits.b1Title"), desc: t("bo.employerPayment.advantageBenefits.b1Desc") },
              { icon: ShieldCheck, title: t("bo.employerPayment.advantageBenefits.b2Title"), desc: t("bo.employerPayment.advantageBenefits.b2Desc") },
              { icon: Zap, title: t("bo.employerPayment.advantageBenefits.b3Title"), desc: t("bo.employerPayment.advantageBenefits.b3Desc") },
              { icon: Headphones, title: t("bo.employerPayment.advantageBenefits.b4Title"), desc: t("bo.employerPayment.advantageBenefits.b4Desc") },
            ]
          : [
              { icon: ShieldCheck, title: t("bo.employerPayment.reassurance.b1Title"), desc: t("bo.employerPayment.reassurance.b1Desc") },
              { icon: Zap, title: t("bo.employerPayment.reassurance.b2Title"), desc: t("bo.employerPayment.reassurance.b2Desc") },
              { icon: Sparkles, title: t("bo.employerPayment.reassurance.b3Title"), desc: t("bo.employerPayment.reassurance.b3Desc") },
              { icon: Headphones, title: t("bo.employerPayment.reassurance.b4Title"), desc: t("bo.employerPayment.reassurance.b4Desc") },
            ];

        if (isDark) {
          return (
            <section
              className="relative overflow-hidden"
              style={{ backgroundColor: C.deepGreen }}
            >
              <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {items.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="text-white">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                        style={{
                          backgroundColor: "rgba(246, 195, 67, 0.18)",
                          border: "1px solid rgba(246, 195, 67, 0.30)",
                        }}
                      >
                        <Icon className="w-5 h-5" style={{ color: C.gold }} />
                      </div>
                      <div className="font-bold text-base mb-1">{title}</div>
                      <div className="text-sm text-white/75 leading-relaxed">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // Variant light (Découverte) : cards blanches avec dividers
        return (
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 pb-12 lg:pb-16">
            <div
              className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden"
              style={{ backgroundColor: C.border }}
            >
              {items.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white p-5 lg:p-6 flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(0, 155, 90, 0.10)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: C.greenBright }} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm" style={{ color: C.textMain }}>{title}</div>
                    <div className="text-xs mt-0.5 leading-relaxed" style={{ color: C.textMuted }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <SiteFooter />
    </div>
  );
}
