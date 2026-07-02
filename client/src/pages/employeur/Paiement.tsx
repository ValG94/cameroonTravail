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
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Headphones,
  Info,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Users,
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
  /** "split" = recap gauche + paiement droite sur fond ivoire (Découverte).
   *  "hero"  = hero vert profond en tête + recap+paiement empilés sur
   *            fond ivoire dessous (Avantage).
   *  "premium" = page entière dark green : hero + grid 2-col
   *              recap_dark|paiement_white + bandeau dark, tout
   *              dans un seul flux sombre (Premium). */
  layout: "split" | "hero" | "premium";
  cardBorder: string;
  accentColor: string;
  accentBg: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  checkColor: string;
  taglineColor: string;
  /** Image hero affichée à droite du bloc hero (Avantage = recruteuse,
   *  Premium = couronne or). */
  heroImage?: string;
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
      layout: "premium",
      cardBorder: "rgba(246, 195, 67, 0.35)",
      accentColor: C.gold,
      accentBg: "rgba(246, 195, 67, 0.10)",
      badgeBg: "rgba(246, 195, 67, 0.15)",
      badgeText: C.gold,
      badgeBorder: "rgba(246, 195, 67, 0.40)",
      checkColor: C.gold,
      taglineColor: C.gold,
      heroImage: "/images/recruteur/offre-premium.webp",
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
      // Avantage utilise une bordure et un accent vert (pas or)
      // car toute la page reste light/ivoire pour cohérence avec
      // la maquette desktop. L'or restera réservé à Premium.
      cardBorder: "rgba(0, 155, 90, 0.25)",
      accentColor: C.greenBright,
      accentBg: "rgba(0, 155, 90, 0.06)",
      badgeBg: "rgba(246, 195, 67, 0.18)",
      badgeText: "#A37200",
      badgeBorder: "rgba(246, 195, 67, 0.40)",
      checkColor: C.greenBright,
      taglineColor: C.green,
      heroImage: "/images/recruteur/offre-avantage.webp",
      // Bandeau réassurance light (fond ivoire, pas dark green)
      reassuranceBg: "light",
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

/**
 * Mapping icône par position de fonctionnalité dans la liste,
 * pour donner un rendu plus visuel que des checkmarks répétés.
 * L'ordre des bullets dans formules_tarifaires.fonctionnalites suit
 * une logique métier cohérente (ex Découverte : offres, candidatures
 * email, tableau de bord, support standard).
 */
const FEATURE_ICONS = [Briefcase, Mail, BarChart3, Headphones, Star, Users];
function getFeatureIcon(index: number) {
  return FEATURE_ICONS[index % FEATURE_ICONS.length];
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

  // ─── Données formule traduites ──────────────────────────────────────
  // La DB stocke nom/description/fonctionnalites en FR uniquement.
  // On utilise les versions traduites du namespace formuleData si
  // disponibles (matching basé sur le variant déduit du nom), sinon
  // fallback sur les données DB.
  const formuleKey = theme.variant === "basic" ? "basic"
    : theme.variant === "advantage" ? "advantage"
    : "premium";
  const translatedShortName = t(`bo.formuleData.${formuleKey}.shortName`);
  const translatedDescription = t(`bo.formuleData.${formuleKey}.description`);
  const translatedFeatures = t(`bo.formuleData.${formuleKey}.features`, { returnObjects: true }) as string[];
  const translatedFullName = t(`bo.formuleData.${formuleKey}.name`);

  // Fonctionnalités : priorité aux traductions i18n. Fallback parsing
  // DB (JSON array stringifié OU texte multilignes).
  const fonctionnalites = Array.isArray(translatedFeatures) && translatedFeatures.length > 0
    ? translatedFeatures
    : (() => {
        const raw = formule.fonctionnalites;
        if (!raw) return [] as string[];
        try {
          const parsed = JSON.parse(String(raw));
          if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
        } catch {
          /* fall through */
        }
        return String(raw).split("\n").map((s) => s.trim()).filter(Boolean);
      })();

  // Handler partagé : retour vers /tarifs avec scroll smooth sur la
  // section #tarifs. On utilise l'URL hash + un handler côté
  // EspaceRecruteur (qui écoute hashchange + initial mount). Plus
  // robuste qu'un setTimeout aveugle car EspaceRecruteur a beaucoup
  // d'animations et de queries qui décalent son render.
  const handleBackToPricing = () => {
    setLocation("/tarifs");
    // Force le hash après que wouter ait navigué — EspaceRecruteur
    // détecte le hash et scroll quand sa section #tarifs est prête.
    setTimeout(() => {
      window.location.hash = "tarifs";
    }, 40);
  };

  // Background global : NOIR premium pour Premium — donne un effet
  // haut de gamme, ambiance nocturne. Halo or subtil autour de la
  // couronne pour l'effet 'wahoo'. Ivoire pour Découverte/Avantage.
  const pageBackground =
    theme.layout === "premium"
      ? "radial-gradient(circle at 50% 25%, rgba(246,195,67,0.15), transparent 40%), linear-gradient(180deg, #000000 0%, #0A0A0A 50%, #000000 100%)"
      : C.ivory;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: pageBackground,
        // Pas de color ici — le SiteHeader (rendu ci-dessous) doit
        // garder ses propres couleurs. La couleur du contenu Premium
        // est appliquée localement plus bas via un wrapper interne.
        color: C.textMain,
        fontFamily: "'Manrope', 'Inter', sans-serif",
      }}
    >
      {/* Décorations élégantes en arrière-plan pour les layouts light
          (split + hero). Halo radial vert flouté en bas + petits
          points + ligne courbe stylisée. Donne du relief à la page
          sans la surcharger. */}
      {theme.layout !== "premium" && (
        <>
          {/* Halo radial vert flouté en bas-gauche */}
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-32 w-[520px] h-[520px] rounded-full blur-[100px] opacity-[0.18] pointer-events-none"
            style={{ backgroundColor: C.greenBright }}
          />
          {/* Halo radial vert flouté en bas-droite */}
          <div
            aria-hidden="true"
            className="absolute -bottom-40 -right-40 w-[480px] h-[480px] rounded-full blur-[100px] opacity-[0.15] pointer-events-none"
            style={{ backgroundColor: C.greenBright }}
          />
          {/* Halo or très subtil en haut centré */}
          <div
            aria-hidden="true"
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[280px] rounded-full blur-[120px] opacity-[0.12] pointer-events-none"
            style={{ backgroundColor: C.gold }}
          />
          {/* Courbes organiques SVG */}
          <svg
            aria-hidden="true"
            className="absolute bottom-0 left-0 w-[600px] h-[400px] opacity-[0.10] pointer-events-none"
            viewBox="0 0 600 400"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMinYMax meet"
          >
            <path
              d="M -50 400 C 80 350 150 280 200 200 C 240 130 280 80 350 60 C 420 40 480 80 540 120"
              stroke={C.greenBright}
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M -20 380 C 100 340 180 290 240 230 C 280 190 320 150 380 130"
              stroke={C.greenBright}
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </svg>
          <svg
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-[500px] h-[360px] opacity-[0.10] pointer-events-none"
            viewBox="0 0 500 360"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMaxYMax meet"
          >
            <path
              d="M 540 360 C 420 320 340 260 290 200 C 250 140 220 100 160 80 C 100 60 60 80 20 110"
              stroke={C.greenBright}
              strokeWidth="2"
              fill="none"
            />
          </svg>
          {/* Grille de petits points or en haut-gauche */}
          <div
            aria-hidden="true"
            className="absolute top-32 left-12 grid grid-cols-5 gap-2.5 opacity-30 pointer-events-none"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
            ))}
          </div>
          {/* Grille de petits points verts en bas-milieu */}
          <div
            aria-hidden="true"
            className="absolute bottom-48 left-1/3 grid grid-cols-4 gap-2 opacity-30 pointer-events-none"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.greenBright }} />
            ))}
          </div>
        </>
      )}

      <div className="relative z-10">
        <SiteHeader />

      {/* Wrapper interne : applique la couleur white pour Premium
          sur tout le contenu de la page SAUF le SiteHeader (qui doit
          garder ses couleurs propres). */}
      <div style={{ color: theme.layout === "premium" ? "white" : C.textMain }}>

      {/* Layout "hero" (Avantage) : pas de hero band vert au-dessus
          contrairement aux premières itérations. Le header (retour
          + badge + titre + desc) est rendu DANS la 1ère colonne du
          grid 3-col ci-dessous, sur fond ivoire. */}

      {/* Premium : le hero band séparé a été supprimé. Le titre + le
          badge + la couronne + la recap card sont désormais rendus
          dans le grid 3-col ci-dessous (même structure qu'Avantage).
          Seules les particules or restent en décoration flottante. */}
      {theme.layout === "premium" && (
        <div aria-hidden="true" className="absolute top-32 right-32 grid grid-cols-5 gap-3 opacity-30 pointer-events-none hidden lg:grid z-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: C.gold }} />
          ))}
        </div>
      )}

      <div className={
        theme.layout === "premium" || theme.layout === "hero"
          ? "max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12"
          : "max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14"
      }>
        {/* Header bouton retour — pour tous les 3 layouts. Couleur
            adaptée : or pour Premium (dark bg), vert pour Avantage
            (ivoire bg), muted pour Découverte. */}
        <button
          type="button"
          onClick={handleBackToPricing}
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:underline"
          style={{
            color:
              theme.variant === "premium"
                ? C.gold
                : theme.variant === "advantage"
                ? C.green
                : C.textMuted,
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("bo.employerPayment.backToPrices")}
        </button>

        {/* Header titre — uniquement "split" (Découverte). 2 lignes :
            'Souscription' puis 'Offre [shortName]' avec shortName en
            vert (selon la maquette). */}
        {theme.layout === "split" && (
          <div className="max-w-[680px] mb-10">
            <h1
              className="font-extrabold tracking-tight leading-[1.05] mb-3"
              style={{ fontSize: "clamp(40px, 5vw, 56px)", color: C.textMain }}
            >
              <span className="block">{t("bo.employerPayment.title")}</span>
              <span className="block">
                {t("bo.employerPayment.titleSecondLine")}{" "}
                <span style={{ color: C.green }}>{translatedShortName}</span>
              </span>
            </h1>
            <p className="text-base sm:text-[17px] leading-relaxed" style={{ color: C.textMuted }}>
              {t("bo.employerPayment.subtitle")}
            </p>
          </div>
        )}

        {/* Grid layout par variante :
            - basic       : split 2-col recap | paiement (Découverte)
            - hero/premium : 3-col [titre+recap] | [image/couronne] | [paiement]
              (Avantage sur ivoire, Premium sur noir) */}
        <div
          className={
            theme.layout === "hero" || theme.layout === "premium"
              ? "grid grid-cols-1 lg:grid-cols-[1fr_1.1fr_1fr] lg:grid-rows-[auto_1fr] gap-6 lg:gap-8 items-stretch"
              : // split (Découverte) : recap plus étroit (1) que paiement (1.5)
                "grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 lg:gap-8 items-start"
          }
        >
          {/* Pour layout="hero" : badge + titre + desc en tête de la
              colonne 1, AVANT la recap card (qui suit ci-dessous via
              le rendu existant). Pour split/premium, ce bloc est dans
              le header au-dessus. */}
          {(theme.layout === "hero" || theme.layout === "premium") && (
            <div className="flex flex-col gap-6">
              <div>
                <Badge
                  className="mb-4 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] inline-block"
                  style={{
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                    border: `1px solid ${theme.badgeBorder}`,
                  }}
                >
                  {translatedFullName.toUpperCase()}
                </Badge>
                <h1
                  className="font-extrabold leading-[1.05] tracking-tight"
                  style={{
                    fontSize: "clamp(34px, 4vw, 48px)",
                    color: theme.variant === "premium" ? "white" : C.textMain,
                  }}
                >
                  <span className="block">{t("bo.employerPayment.title")}</span>
                  <span className="block">
                    {t("bo.employerPayment.titleSecondLine")}{" "}
                    {theme.variant === "premium" ? (
                      <span
                        style={{
                          background: `linear-gradient(135deg, ${C.gold} 0%, #FFE390 100%)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {translatedShortName}
                      </span>
                    ) : (
                      <span style={{ color: C.green }}>{translatedShortName}</span>
                    )}
                  </span>
                </h1>
                <p
                  className="mt-3 text-sm leading-relaxed"
                  style={{
                    color: theme.variant === "premium" ? "rgba(255, 255, 255, 0.75)" : C.textMuted,
                  }}
                >
                  {t("bo.employerPayment.subtitle")}
                </p>
              </div>
            </div>
          )}

          {/* Col 2 row-span 2 : image (photo Avantage / couronne Premium).
              - Avantage : photo recruteuse, object-cover, rounded-3xl
              - Premium  : couronne agrandie, object-contain, halo or
                radial en arrière-plan pour l'effet 'wahoo' */}
          {(theme.layout === "hero" || theme.layout === "premium") && theme.heroImage && (
            <div
              className={`hidden lg:flex justify-center order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 relative ${
                // Premium : couronne alignée en haut pour matcher le
                // haut des 2 autres blocs (titre col 1, paiement col 3).
                // Avantage : photo pleine hauteur (items-stretch).
                theme.variant === "premium" ? "items-start" : "items-stretch"
              }`}
            >
              {theme.variant === "premium" ? (
                <div className="relative flex justify-center">
                  {/* Halo or radial derrière la couronne (effet lumineux) */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div
                      className="w-[560px] h-[560px] rounded-full blur-[80px]"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(246,195,67,0.35) 0%, rgba(246,195,67,0.15) 40%, transparent 70%)",
                      }}
                    />
                  </div>
                  <img
                    src={theme.heroImage}
                    alt=""
                    aria-hidden="true"
                    className="relative w-[440px] h-[440px] lg:w-[540px] lg:h-[540px] xl:w-[620px] xl:h-[620px] object-contain drop-shadow-[0_0_60px_rgba(246,195,67,0.4)]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <img
                  src={theme.heroImage}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover rounded-3xl shadow-xl"
                  style={{ minHeight: "100%" }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          )}

          {/* ─── Récap formule (thème par tier) ─────────────────── */}
          {/* Premium = card dark transparente (texte blanc, border or).
              Découverte/Avantage = card blanche.
              Pour layout "hero" ou "premium" : col 1 row 2 (sous titre). */}
          <Card
            className={`rounded-3xl border-2 shadow-sm h-fit overflow-hidden ${
              theme.layout === "hero" || theme.layout === "premium"
                ? "lg:col-start-1 lg:row-start-2"
                : ""
            }`}
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
              {/* Badge tier (vert/or selon formule).
                  Utilise le nom traduit (FR : 'Offre Découverte',
                  EN : 'Starter Plan'), pas le nom DB. */}
              <Badge
                className="mb-5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em]"
                style={{
                  backgroundColor: theme.badgeBg,
                  color: theme.badgeText,
                  border: `1px solid ${theme.badgeBorder}`,
                }}
              >
                {translatedFullName}
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

              {/* Tagline (description courte) en accent color du tier.
                  Utilise la traduction i18n (FR/EN), pas la DB. */}
              {translatedDescription && (
                <p className="text-sm font-medium mb-6" style={{ color: theme.taglineColor }}>
                  {translatedDescription}
                </p>
              )}

              {/* Liste fonctionnalités. Premium = checkmarks or sur
                  fond dark. Découverte/Avantage = icônes thématiques
                  (Briefcase, Mail, BarChart, Headphones) dans des
                  cercles vert pâle, plus visuel et moins répétitif
                  que 4 checkmarks identiques. Séparée par dividers
                  fins pour aérer. */}
              {fonctionnalites.length > 0 && (
                <ul className={theme.recapDark ? "space-y-3" : "space-y-1"}>
                  {fonctionnalites.map((f, i) => {
                    if (theme.recapDark) {
                      // Premium : checkmarks or simples sur fond dark
                      return (
                        <li key={i} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2
                            className="w-[18px] h-[18px] mt-0.5 shrink-0"
                            style={{ color: theme.checkColor }}
                          />
                          <span style={{ color: "rgba(255, 255, 255, 0.92)" }}>{f}</span>
                        </li>
                      );
                    }
                    // Découverte + Avantage : icônes en cercles
                    const Icon = getFeatureIcon(i);
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-3 py-2.5 border-b last:border-0"
                        style={{ borderColor: "rgba(0, 155, 90, 0.10)" }}
                      >
                        <span
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accentBg }}
                        >
                          <Icon className="w-4 h-4" style={{ color: theme.checkColor }} />
                        </span>
                        <span className="text-sm font-medium" style={{ color: C.textMain }}>
                          {f}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Micro-réassurance "paiement vérifié manuellement"
                  affichée sous le recap pour les 3 tiers, adaptée
                  selon le variant dark/light. */}
              {theme.recapDark ? (
                <div
                  className="mt-6 pt-5 border-t flex items-center gap-2 text-xs"
                  style={{ borderColor: "rgba(246, 195, 67, 0.20)", color: "rgba(255, 255, 255, 0.55)" }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: C.gold }} />
                  {t("bo.employerPayment.secureNote")}
                </div>
              ) : (
                <div
                  className="mt-5 pt-4 border-t flex items-center gap-2 text-xs"
                  style={{ borderColor: "rgba(0, 155, 90, 0.15)", color: C.textMuted }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.checkColor }} />
                  {t("bo.employerPayment.secureNote")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Form paiement ────────────────────────────────────
              Pour layout "hero"/"premium" : col 3 row-span 2 (full
              height, alignée avec [titre + recap card] sur la col 1).
              Pour layout "split" : h-full pour prendre la hauteur
              du grid (titre + recap colonne 1). */}
          <Card
            className={`rounded-3xl border shadow-lg ${
              theme.layout === "hero" || theme.layout === "premium"
                ? "lg:col-start-3 lg:row-start-1 lg:row-span-2 h-full"
                : theme.layout === "split"
                ? "lg:h-full"
                : ""
            }`}
            style={{ borderColor: C.border }}
          >
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
                      {
                        key: "orange_money",
                        label: t("bo.employerPayment.methodOrange"),
                        logo: "/images/orange-money-logo.webp",
                      },
                      {
                        key: "mtn_momo",
                        label: t("bo.employerPayment.methodMtn"),
                        logo: "/images/mtn-momo-logo.webp",
                      },
                      {
                        key: "autre",
                        label: t("bo.employerPayment.methodOther"),
                        logo: null,
                      },
                    ].map((m) => {
                      const active = methodePaiement === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setMethodePaiement(m.key as any)}
                          className="relative flex items-center gap-2 min-h-[3rem] px-2.5 py-2 rounded-xl border-2 text-xs sm:text-[13px] font-semibold transition-all text-left leading-tight"
                          style={{
                            borderColor: active ? theme.accentColor : C.border,
                            backgroundColor: active ? theme.accentBg : "white",
                            color: C.textMain,
                          }}
                        >
                          {m.logo ? (
                            <img
                              src={m.logo}
                              alt=""
                              className="w-5 h-5 object-contain shrink-0"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Smartphone className="w-4 h-4 shrink-0" style={{ color: C.textMuted }} />
                          )}
                          <span className="flex-1 min-w-0">{m.label}</span>
                          {active && (
                            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: theme.accentColor }} />
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
          // Premium : bandeau noir cohérent avec la page noire.
          // Avantage : vert profond #063F24 (contraste avec l'ivoire).
          const bgDark = theme.variant === "premium" ? "#0A0A0A" : C.deepGreen;
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

        // Variant light (Découverte + Avantage) : 4 items horizontaux
        // aérés sur fond ivoire avec icônes vertes circulaires
        // (cohérent avec maquette).
        const containerWidth = theme.layout === "hero" ? "max-w-[1280px]" : "max-w-[1100px]";
        return (
          <div className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-10 pb-12 lg:pb-16`}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-8 px-4 lg:px-8 rounded-3xl border bg-white/50"
              style={{ borderColor: "rgba(0, 155, 90, 0.15)" }}
            >
              {items.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2"
                    style={{
                      backgroundColor: "rgba(0, 155, 90, 0.06)",
                      borderColor: "rgba(0, 155, 90, 0.25)",
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: C.greenBright }} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[15px]" style={{ color: C.textMain }}>{title}</div>
                    <div className="text-xs mt-1 leading-relaxed" style={{ color: C.textMuted }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      </div>{/* fin wrapper couleur Premium interne */}

      <SiteFooter />
      </div>
    </div>
  );
}

