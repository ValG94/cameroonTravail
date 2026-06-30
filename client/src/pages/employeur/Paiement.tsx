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
   *  "hero" = hero pleine largeur en tête + paiement empilés dessous. */
  layout: "split" | "hero";
  cardBorder: string;
  accentColor: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  checkColor: string;
  taglineColor: string;
  /** Image hero affichée à droite du bloc hero (Avantage). */
  heroImage?: string;
  /** SVG décoratif au lieu d'une image photo (Premium = couronne). */
  heroDecoration?: "crown";
  /** Background du hero band :
   *  'deepGreen' (Avantage) ou 'darkPremium' (Premium, plus noir + gold). */
  heroBg?: "deepGreen" | "darkPremium";
  /** Si true, la card récap utilise un fond sombre transparent +
   *  border or + texte blanc (Premium). */
  recapDark?: boolean;
  /** Gradient du bouton CTA principal de soumission. Par défaut
   *  vert profond → vert vif. Pour Premium : or → or sombre. */
  ctaGradient?: string;
  ctaTextColor?: string;
  /** Couleur de fond du bandeau réassurance. Dark pour Avantage +
   *  Premium, light pour Découverte. */
  reassuranceBg: "light" | "dark";
};

function getFormuleTheme(nom: string): FormuleTheme {
  const lower = nom.toLowerCase();
  if (lower.includes("premium")) {
    return {
      variant: "premium",
      layout: "hero",
      cardBorder: "rgba(246, 195, 67, 0.35)",
      accentColor: C.gold,
      accentBg: "rgba(246, 195, 67, 0.10)",
      badgeBg: "rgba(246, 195, 67, 0.15)",
      badgeText: C.gold,
      badgeBorder: "rgba(246, 195, 67, 0.40)",
      checkColor: C.gold,
      taglineColor: C.gold,
      heroDecoration: "crown",
      heroBg: "darkPremium",
      recapDark: true,
      // CTA or pour différencier de l'Avantage (vert).
      ctaGradient: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
      ctaTextColor: "#0F172A",
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
      heroBg: "deepGreen",
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
          style={{
            // Premium = quasi-noir + halo or radial ; Avantage = vert profond.
            background:
              theme.heroBg === "darkPremium"
                ? "radial-gradient(circle at 75% 25%, rgba(246,195,67,0.20), transparent 38%), linear-gradient(135deg, #031F16 0%, #063F24 55%, #020617 100%)"
                : C.deepGreen,
          }}
        >
          {/* Halo or animé en haut droite (présent sur les 2 variants) */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-[480px] h-[480px] rounded-full blur-[140px] opacity-25 pointer-events-none"
            style={{ backgroundColor: C.gold }}
          />
          {/* Particules or pour Premium uniquement */}
          {theme.heroBg === "darkPremium" && (
            <div aria-hidden="true" className="absolute top-1/3 right-1/4 grid grid-cols-6 gap-3 opacity-30 pointer-events-none">
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
              ))}
            </div>
          )}

          <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-14">
            <button
              type="button"
              onClick={handleBackToPricing}
              className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:underline"
              style={{
                color: theme.variant === "premium" ? C.gold : "rgba(255,255,255,0.85)",
              }}
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
                    color: theme.variant === "basic" ? "white" : C.gold,
                    border: `1px solid ${theme.variant === "basic" ? "rgba(255, 255, 255, 0.25)" : "rgba(246, 195, 67, 0.40)"}`,
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
                      background:
                        theme.variant === "advantage" || theme.variant === "premium"
                          ? `linear-gradient(135deg, ${C.gold} 0%, #FFE390 100%)`
                          : undefined,
                      WebkitBackgroundClip:
                        theme.variant === "advantage" || theme.variant === "premium" ? "text" : undefined,
                      WebkitTextFillColor:
                        theme.variant === "advantage" || theme.variant === "premium" ? "transparent" : undefined,
                      backgroundClip:
                        theme.variant === "advantage" || theme.variant === "premium" ? "text" : undefined,
                      color:
                        theme.variant === "advantage" || theme.variant === "premium"
                          ? undefined
                          : C.greenBright,
                    }}
                  >
                    {formule.nom}
                  </span>
                </h1>
                <p className="mt-4 text-base sm:text-[17px] text-white/85 leading-relaxed max-w-[520px]">
                  {t("bo.employerPayment.subtitle")}
                </p>
              </div>

              {/* Côté droit : image OU couronne SVG selon le tier */}
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
              {theme.heroDecoration === "crown" && <CrownSvg />}
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
          {/* Premium = card dark transparente (texte blanc, border or).
              Découverte/Avantage = card blanche. */}
          <Card
            className="rounded-3xl border-2 shadow-sm h-fit overflow-hidden"
            style={{
              borderColor: theme.cardBorder,
              backgroundColor: theme.recapDark ? "rgba(3, 31, 22, 0.78)" : undefined,
              backdropFilter: theme.recapDark ? "blur(8px)" : undefined,
              WebkitBackdropFilter: theme.recapDark ? "blur(8px)" : undefined,
              boxShadow: theme.recapDark
                ? "0 30px 80px -10px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(246, 195, 67, 0.15)"
                : undefined,
            }}
          >
            <CardContent className="p-7">
              {/* Badge tier (vert/or selon formule) */}
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
                <span
                  className="text-5xl font-extrabold tracking-tight leading-none"
                  style={{ color: theme.recapDark ? "white" : C.textMain }}
                >
                  {prix}
                </span>
                <span
                  className="text-base font-medium pb-1.5"
                  style={{ color: theme.recapDark ? "rgba(255, 255, 255, 0.65)" : C.textMuted }}
                >
                  {formule.devise}
                </span>
              </div>
              <div
                className="text-sm mb-5"
                style={{ color: theme.recapDark ? "rgba(255, 255, 255, 0.65)" : C.textMuted }}
              >
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
                      <span style={{ color: theme.recapDark ? "rgba(255, 255, 255, 0.92)" : C.textMain }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Micro-réassurance affichée uniquement en variant dark
                  (Premium) — donne le code premium avec un texte de
                  confiance discret en bas de la card. */}
              {theme.recapDark && (
                <div
                  className="mt-6 pt-5 border-t flex items-center gap-2 text-xs"
                  style={{ borderColor: "rgba(246, 195, 67, 0.20)", color: "rgba(255, 255, 255, 0.55)" }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: C.gold }} />
                  {t("bo.employerPayment.secureNote")}
                </div>
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
                  className="w-full h-13 text-base font-bold shadow-lg transition-all hover:-translate-y-0.5"
                  style={{
                    // CTA or pour Premium (différenciation visuelle),
                    // vert profond → vert vif pour les autres tiers.
                    background:
                      theme.ctaGradient ?? `linear-gradient(135deg, ${C.deepGreen} 0%, ${C.greenBright} 100%)`,
                    color: theme.ctaTextColor ?? "white",
                    boxShadow:
                      theme.variant === "premium"
                        ? "0 14px 30px rgba(246, 195, 67, 0.40)"
                        : "0 14px 30px rgba(0, 155, 90, 0.25)",
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
        // Bénéfices spécifiques par tier. Découverte = génériques.
        const items =
          theme.variant === "premium"
            ? [
                { icon: Sparkles, title: t("bo.employerPayment.premiumBenefits.b1Title"), desc: t("bo.employerPayment.premiumBenefits.b1Desc") },
                { icon: Zap, title: t("bo.employerPayment.premiumBenefits.b2Title"), desc: t("bo.employerPayment.premiumBenefits.b2Desc") },
                { icon: ShieldCheck, title: t("bo.employerPayment.premiumBenefits.b3Title"), desc: t("bo.employerPayment.premiumBenefits.b3Desc") },
                { icon: Headphones, title: t("bo.employerPayment.premiumBenefits.b4Title"), desc: t("bo.employerPayment.premiumBenefits.b4Desc") },
              ]
            : theme.variant === "advantage"
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
          // Pour Premium : fond encore plus dark (#031F16) ;
          // Avantage : vert profond #063F24.
          const bgDark = theme.variant === "premium" ? "#031F16" : C.deepGreen;
          return (
            <section
              className="relative overflow-hidden"
              style={{ backgroundColor: bgDark }}
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

// ─── Sous-composants décoratifs ──────────────────────────────────────────────

/**
 * Couronne SVG or sur halo radial pour le hero Premium.
 * Génération inline (pas de fichier image) pour rester scalable et léger.
 */
function CrownSvg() {
  return (
    <div className="relative hidden lg:flex justify-center items-center">
      <svg viewBox="0 0 240 240" className="w-[280px] h-[280px]" aria-hidden="true">
        <defs>
          <radialGradient id="crown-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F6C343" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#F6C343" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#F6C343" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="crown-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFE390" />
            <stop offset="55%" stopColor="#F6C343" />
            <stop offset="100%" stopColor="#C98A00" />
          </linearGradient>
          <linearGradient id="crown-band-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D99200" />
            <stop offset="100%" stopColor="#8C5A00" />
          </linearGradient>
        </defs>

        {/* Halo radial */}
        <circle cx="120" cy="120" r="118" fill="url(#crown-halo)" />

        {/* Cercle orbital fin */}
        <circle
          cx="120"
          cy="120"
          r="92"
          fill="none"
          stroke="#F6C343"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
        <circle
          cx="120"
          cy="120"
          r="80"
          fill="none"
          stroke="#F6C343"
          strokeOpacity="0.18"
          strokeWidth="0.5"
        />

        {/* Couronne — base + pointes */}
        <g transform="translate(120 130)">
          {/* Pointes (5 triangles + courbes liantes) */}
          <path
            d="M -52 0
               L -52 -22
               L -28 -8
               L -16 -38
               L 0 -50
               L 16 -38
               L 28 -8
               L 52 -22
               L 52 0
               Z"
            fill="url(#crown-grad)"
            stroke="#C98A00"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Bandeau base */}
          <rect
            x="-54"
            y="0"
            width="108"
            height="18"
            rx="3"
            fill="url(#crown-band-grad)"
            stroke="#8C5A00"
            strokeWidth="0.6"
          />
          {/* Gemmes sur les pointes */}
          <circle cx="-28" cy="-8" r="3.5" fill="#FFE390" stroke="#C98A00" strokeWidth="0.5" />
          <circle cx="0" cy="-44" r="5" fill="#FFE390" stroke="#C98A00" strokeWidth="0.6" />
          <circle cx="28" cy="-8" r="3.5" fill="#FFE390" stroke="#C98A00" strokeWidth="0.5" />
          {/* Gemmes sur la base */}
          <circle cx="-30" cy="9" r="2.2" fill="#FFE390" opacity="0.85" />
          <circle cx="0" cy="9" r="2.5" fill="#FFE390" opacity="0.9" />
          <circle cx="30" cy="9" r="2.2" fill="#FFE390" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}
