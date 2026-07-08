import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { EmployeurLayout } from "@/components/EmployeurLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Crown,
  FileText,
  Headphones,
  Receipt,
  Sparkles,
  Smartphone,
  TrendingUp,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Page /employeur/mes-souscriptions — refonte premium.
 *
 * Structure :
 *  1. Hero vert profond (bannière) avec formule active + quota +
 *     date renouvellement + CTA "Renouveler" (comme sur le dashboard
 *     mais en pleine largeur ici — la page est centrée sur la
 *     souscription).
 *  2. Stats row (4 KPIs) : demandes, total dépensé, formule active,
 *     prochain renouvellement.
 *  3. Section "Historique des demandes" avec filtres pilules
 *     (Toutes / En attente / Validées / Refusées) et cards
 *     enrichies (bandeau vertical coloré selon statut, montant
 *     premium, référence en mono, blocs conditionnels détail).
 *  4. Section "Autres formules disponibles" : 3 cards Découverte /
 *     Avantage / Premium avec bénéfices, badge "Formule actuelle"
 *     sur la sienne, CTAs "Passer à …".
 *
 * i18n : bo.mySubscriptions.*
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

// Statuts demande : icône + palette
type StatutDemande = "en_attente" | "validee" | "refusee";
const STATUT_STYLE: Record<StatutDemande, { bg: string; fg: string; border: string; bar: string; icon: any; labelKey: string }> = {
  en_attente: { bg: "#FEF7E0", fg: "#8B5A00", border: C.gold, bar: C.gold, icon: Clock, labelKey: "bo.mySubscriptions.statusPending" },
  validee: { bg: C.greenSoft, fg: C.deepGreen, border: "#A7D8B9", bar: C.green, icon: CheckCircle2, labelKey: "bo.mySubscriptions.statusValidated" },
  refusee: { bg: "#FEECEC", fg: "#B91C1C", border: "#F4A5A5", bar: "#B91C1C", icon: XCircle, labelKey: "bo.mySubscriptions.statusRefused" },
};

// Config formules pour comparaison
type FormuleKey = "gratuit" | "professionnel" | "entreprise";
const FORMULES_CONFIG: {
  key: FormuleKey;
  labelKey: string;
  iconColor: string;
  iconBg: string;
  icon: any;
  quotaTotal: number;
  showQuota: boolean;
  price: string;
  priceUnit: string;
  benefits: string[];
  highlight?: boolean;
}[] = [
  {
    key: "gratuit",
    labelKey: "bo.recruiterDashboard.subscription.formulaDiscovery",
    iconColor: C.green,
    iconBg: C.greenSoft,
    icon: Sparkles,
    quotaTotal: 1,
    showQuota: true,
    price: "0",
    priceUnit: "FCFA",
    benefits: [
      "bo.mySubscriptions.formulaDiscoveryBenefit1",
      "bo.mySubscriptions.formulaDiscoveryBenefit2",
      "bo.mySubscriptions.formulaDiscoveryBenefit3",
    ],
  },
  {
    key: "professionnel",
    labelKey: "bo.recruiterDashboard.subscription.formulaAdvantage",
    iconColor: C.gold,
    iconBg: C.goldSoft,
    icon: Award,
    quotaTotal: 10,
    showQuota: true,
    price: "50 000",
    priceUnit: "FCFA / mois",
    benefits: [
      "bo.mySubscriptions.formulaAdvantageBenefit1",
      "bo.mySubscriptions.formulaAdvantageBenefit2",
      "bo.mySubscriptions.formulaAdvantageBenefit3",
      "bo.mySubscriptions.formulaAdvantageBenefit4",
    ],
    highlight: true,
  },
  {
    key: "entreprise",
    labelKey: "bo.recruiterDashboard.subscription.formulaPremium",
    iconColor: C.deepGreen,
    iconBg: C.greenSoft,
    icon: Crown,
    quotaTotal: 999,
    showQuota: false,
    price: "150 000",
    priceUnit: "FCFA / mois",
    benefits: [
      "bo.mySubscriptions.formulaPremiumBenefit1",
      "bo.mySubscriptions.formulaPremiumBenefit2",
      "bo.mySubscriptions.formulaPremiumBenefit3",
      "bo.mySubscriptions.formulaPremiumBenefit4",
    ],
  },
];

export default function MesSouscriptions() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const [filter, setFilter] = useState<"all" | StatutDemande>("all");

  const { data: employeur } = trpc.employeur.getProfile.useQuery();
  const { data: demandes, isLoading } = trpc.employeur.mesDemandesSouscription.useQuery();

  const demandesList = Array.isArray(demandes) ? demandes : [];

  // Stats globales
  const stats = useMemo(() => {
    const total = demandesList.length;
    const totalSpent = demandesList
      .filter((d: any) => d.statut === "validee")
      .reduce((sum: number, d: any) => sum + (Number(d.montant) || 0), 0);
    const currency = demandesList[0]?.devise || "FCFA";
    return { total, totalSpent, currency };
  }, [demandesList]);

  // Filtrage
  const filtered = useMemo(() => {
    if (filter === "all") return demandesList;
    return demandesList.filter((d: any) => d.statut === filter);
  }, [demandesList, filter]);

  const dateLocale = i18n.language === "en" ? "en-GB" : "fr-FR";
  const formatDate = (d: any) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });
  };
  const formatDateTime = (d: any) => {
    if (!d) return "—";
    return new Date(d).toLocaleString(dateLocale, { dateStyle: "long", timeStyle: "short" });
  };

  const currentFormule = (employeur?.formuleAbonnement || "gratuit") as FormuleKey;
  const currentConfig = FORMULES_CONFIG.find((f) => f.key === currentFormule) || FORMULES_CONFIG[0];
  const IconFormula = currentConfig.icon;
  const remainingOffers = employeur?.nombreOffresRestantes ?? 0;
  const dateFin = employeur?.dateFinAbonnement;

  const goTarifs = () => {
    setLocation("/tarifs");
    setTimeout(() => {
      document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <EmployeurLayout
      title={t("bo.mySubscriptions.title")}
      subtitle={t("bo.mySubscriptions.subtitle")}
      activeKey="subscriptions"
      actions={
        <Button
          onClick={goTarifs}
          className="h-10 rounded-lg font-semibold text-white shadow-sm hidden sm:inline-flex"
          style={{ backgroundColor: C.deepGreen }}
        >
          <Wallet className="h-4 w-4 mr-1.5" />
          {t("bo.mySubscriptions.newSubBtn")}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* ═══ 1. HERO — Formule active ═══════════════════════ */}
        <motion.section {...animate(0)}>
          <div
            className="relative rounded-2xl overflow-hidden p-6 lg:p-8"
            style={{
              background: `linear-gradient(120deg, ${C.deepGreen} 0%, ${C.darkerGreen} 100%)`,
              boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.4)",
            }}
          >
            <div aria-hidden="true" className="absolute -top-20 right-40 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: C.gold }} />
            <img
              src="/logo-cameroon-travail.webp"
              alt=""
              aria-hidden="true"
              className="hidden md:block absolute pointer-events-none select-none"
              style={{ right: "40px", top: "50%", transform: "translateY(-50%) rotate(-8deg)", width: "180px", opacity: 0.08 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-center">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: C.goldSoft }}
                >
                  <IconFormula className="h-8 w-8" style={{ color: C.gold }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.55)" }}>
                      {t("bo.mySubscriptions.hero.currentFormula")}
                    </p>
                    <span
                      className="text-[10.5px] font-bold uppercase tracking-wide rounded px-2 py-0.5"
                      style={{ backgroundColor: C.gold, color: C.deepGreen }}
                    >
                      {t("bo.mySubscriptions.hero.badge")}
                    </span>
                  </div>
                  <h2 className="text-white font-extrabold leading-tight" style={{ fontSize: "clamp(26px, 3vw, 34px)" }}>
                    {t(currentConfig.labelKey)}
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {currentFormule === "entreprise"
                      ? t("bo.recruiterDashboard.subscription.benefitsPremium")
                      : currentFormule === "professionnel"
                        ? t("bo.recruiterDashboard.subscription.benefitsAdvantage")
                        : t("bo.recruiterDashboard.subscription.benefitsDiscovery")}
                  </p>

                  {/* Bloc 2 stats côte à côte */}
                  <div className="mt-5 flex flex-wrap gap-6 lg:gap-10">
                    {currentConfig.showQuota && (
                      <div>
                        <p className="text-[10.5px] uppercase tracking-widest font-bold mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                          {t("bo.mySubscriptions.hero.quotaLabel")}
                        </p>
                        <div className="text-white font-extrabold flex items-baseline gap-1" style={{ fontSize: "clamp(20px, 2.2vw, 26px)" }}>
                          {remainingOffers}
                          <span className="text-[14px] font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>
                            / {currentConfig.quotaTotal}
                          </span>
                        </div>
                      </div>
                    )}
                    {dateFin && (
                      <div>
                        <p className="text-[10.5px] uppercase tracking-widest font-bold mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                          {t("bo.mySubscriptions.hero.renewalLabel")}
                        </p>
                        <div className="text-white font-semibold text-[14px] flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {formatDate(dateFin)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  onClick={goTarifs}
                  className="rounded-xl h-12 px-6 font-bold hover:opacity-90"
                  style={{ backgroundColor: C.gold, color: C.deepGreen }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {t("bo.mySubscriptions.hero.renewCta")}
                </Button>
                {currentFormule !== "entreprise" && (
                  <button
                    onClick={goTarifs}
                    className="text-[12.5px] font-semibold flex items-center justify-center gap-1 hover:opacity-80"
                    style={{ color: C.gold }}
                  >
                    {t("bo.mySubscriptions.hero.upgradeCta")}
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══ 2. STATS ROW (4 KPIs) ═════════════════════════ */}
        <motion.section {...animate(1)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            icon={Receipt}
            iconBg={C.blueSoft}
            iconColor={C.blue}
            label={t("bo.mySubscriptions.stats.totalRequests")}
            value={stats.total}
            desc={t("bo.mySubscriptions.stats.totalRequestsDesc")}
          />
          <StatCard
            icon={TrendingUp}
            iconBg={C.greenSoft}
            iconColor={C.green}
            label={t("bo.mySubscriptions.stats.totalSpent")}
            value={`${Number(stats.totalSpent).toLocaleString(dateLocale)}`}
            unit={stats.currency}
            desc={t("bo.mySubscriptions.stats.totalSpentDesc")}
          />
          <StatCard
            icon={Award}
            iconBg={C.goldSoft}
            iconColor="#8B5A00"
            label={t("bo.mySubscriptions.stats.activeFormula")}
            value={t(currentConfig.labelKey).replace(/Formule\s?/i, "").replace(/plan\s?/i, "").trim()}
            desc={t("bo.mySubscriptions.stats.activeFormulaDesc")}
            small
          />
          <StatCard
            icon={Calendar}
            iconBg={C.purpleSoft}
            iconColor={C.purple}
            label={t("bo.mySubscriptions.stats.nextRenewal")}
            value={dateFin ? formatDate(dateFin) : "—"}
            desc={t("bo.mySubscriptions.stats.nextRenewalDesc")}
            small
          />
        </motion.section>

        {/* ═══ 3. HISTORIQUE avec filtres pilules ═════════════ */}
        <motion.section {...animate(2)}>
          <div className="bg-white rounded-2xl border p-5 lg:p-6" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h3 className="font-bold text-[17px]" style={{ color: C.textMain }}>
                {t("bo.mySubscriptions.historyTitle")}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(["all", "en_attente", "validee", "refusee"] as const).map((f) => (
                  <FilterPill
                    key={f}
                    active={filter === f}
                    label={t(
                      f === "all"
                        ? "bo.mySubscriptions.filters.all"
                        : f === "en_attente"
                          ? "bo.mySubscriptions.filters.pending"
                          : f === "validee"
                            ? "bo.mySubscriptions.filters.validated"
                            : "bo.mySubscriptions.filters.refused"
                    )}
                    onClick={() => setFilter(f)}
                    count={
                      f === "all"
                        ? demandesList.length
                        : demandesList.filter((d: any) => d.statut === f).length
                    }
                  />
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-5 animate-pulse" style={{ borderColor: C.border }}>
                    <div className="flex gap-4">
                      <div className="h-5 w-24 rounded" style={{ backgroundColor: C.border }} />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded" style={{ backgroundColor: C.border }} />
                        <div className="h-3 w-1/2 rounded" style={{ backgroundColor: C.border }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                  <Wallet className="h-6 w-6" style={{ color: C.green }} />
                </div>
                <h4 className="font-bold text-base mb-1" style={{ color: C.textMain }}>
                  {t("bo.mySubscriptions.emptyTitle")}
                </h4>
                <p className="text-sm max-w-md mx-auto mb-5" style={{ color: C.textMuted }}>
                  {t("bo.mySubscriptions.emptyDesc")}
                </p>
                <Button
                  onClick={goTarifs}
                  className="rounded-xl h-11 font-semibold text-white"
                  style={{ backgroundColor: C.deepGreen }}
                >
                  {t("bo.mySubscriptions.emptyCta")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((d: any) => (
                  <DemandeCard
                    key={d.id}
                    demande={d}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                    t={t}
                    dateLocale={dateLocale}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* ═══ 4. AUTRES FORMULES DISPONIBLES ═════════════════ */}
        <motion.section {...animate(3)}>
          <div className="mb-4">
            <h3 className="font-bold text-[17px] mb-1" style={{ color: C.textMain }}>
              {t("bo.mySubscriptions.othersTitle")}
            </h3>
            <p className="text-[13px]" style={{ color: C.textMuted }}>
              {t("bo.mySubscriptions.othersSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FORMULES_CONFIG.map((formula) => (
              <FormulaCard
                key={formula.key}
                formula={formula}
                isCurrent={formula.key === currentFormule}
                onSelect={goTarifs}
                t={t}
              />
            ))}
          </div>
        </motion.section>
      </div>
    </EmployeurLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  unit?: string;
  desc: string;
  small?: boolean;
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, unit, desc, small }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border p-4 lg:p-5" style={{ borderColor: C.border, boxShadow: "0 4px 24px -16px rgba(15, 23, 42, 0.06)" }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <span className="text-[11.5px] leading-tight font-medium" style={{ color: C.textMuted }}>
          {label}
        </span>
      </div>
      <div className="font-extrabold truncate" style={{ fontSize: small ? "clamp(15px, 1.4vw, 18px)" : "clamp(22px, 2.2vw, 28px)", color: C.textMain }}>
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-semibold" style={{ color: C.textMuted }}>{unit}</span>
        )}
      </div>
      <p className="text-[11.5px] mt-1" style={{ color: C.textMuted }}>
        {desc}
      </p>
    </div>
  );
}

interface FilterPillProps {
  active: boolean;
  label: string;
  onClick: () => void;
  count: number;
}

function FilterPill({ active, label, onClick, count }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-3 py-1.5 border transition-colors"
      style={{
        backgroundColor: active ? C.deepGreen : "#ffffff",
        color: active ? "#ffffff" : C.textMain,
        borderColor: active ? C.deepGreen : C.border,
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.greenSoft;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ffffff";
      }}
    >
      {label}
      <span
        className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-[10.5px] font-bold"
        style={{
          backgroundColor: active ? "rgba(255,255,255,0.2)" : C.greenSoft,
          color: active ? "#ffffff" : C.deepGreen,
        }}
      >
        {count}
      </span>
    </button>
  );
}

interface DemandeCardProps {
  demande: any;
  formatDate: (d: any) => string;
  formatDateTime: (d: any) => string;
  t: (k: string, opts?: any) => string;
  dateLocale: string;
}

function DemandeCard({ demande, formatDate, formatDateTime, t, dateLocale }: DemandeCardProps) {
  const style = STATUT_STYLE[demande.statut as StatutDemande] || STATUT_STYLE.en_attente;
  const StyleIcon = style.icon;

  const methodLabel = ({
    orange_money: t("bo.employerPayment.methodOrange"),
    mtn_momo: t("bo.employerPayment.methodMtn"),
    autre: t("bo.employerPayment.methodOther"),
  } as Record<string, string>)[demande.methodePaiement] || "—";

  return (
    <article
      className="bg-white rounded-2xl border overflow-hidden flex hover:shadow-lg transition-shadow"
      style={{ borderColor: C.border, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
    >
      <div className="w-1.5 shrink-0" style={{ backgroundColor: style.bar }} />
      <div className="flex-1 p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 border"
                style={{ backgroundColor: style.bg, color: style.fg, borderColor: style.border }}
              >
                <StyleIcon className="h-2.5 w-2.5" />
                {t(style.labelKey)}
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5 border"
                style={{ backgroundColor: C.bg, color: C.textMain, borderColor: C.border }}
              >
                <Smartphone className="h-2.5 w-2.5" />
                {methodLabel}
              </span>
            </div>
            <h4 className="font-bold text-[16px]" style={{ color: C.textMain }}>
              {demande.nomFormule || "—"}
            </h4>
            <p className="text-[11.5px] mt-0.5" style={{ color: C.textMuted }}>
              {t("bo.mySubscriptions.reqOn", { date: formatDateTime(demande.createdAt) })}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10.5px] uppercase tracking-widest font-bold" style={{ color: C.textMuted }}>
              {t("bo.mySubscriptions.amountLabel")}
            </div>
            <div className="font-extrabold" style={{ fontSize: "clamp(20px, 2vw, 26px)", color: C.textMain }}>
              {Number(demande.montant).toLocaleString(dateLocale)}
              <span className="ml-1 text-[13px] font-semibold" style={{ color: C.textMuted }}>{demande.devise}</span>
            </div>
          </div>
        </div>

        {/* Référence */}
        <div className="rounded-lg p-3 border flex items-center gap-2" style={{ backgroundColor: C.bg, borderColor: C.border }}>
          <span className="text-[10.5px] uppercase tracking-widest font-bold" style={{ color: C.textMuted }}>
            {t("bo.mySubscriptions.refLabel")}
          </span>
          <span className="font-mono text-[13px]" style={{ color: C.textMain }}>
            {demande.referenceTransaction || "—"}
          </span>
        </div>

        {/* Détails conditionnels */}
        {demande.statut === "refusee" && demande.raisonRefus && (
          <div className="mt-3 p-3 rounded-lg border text-[12.5px]" style={{ backgroundColor: "#FEECEC", borderColor: "#F4A5A5", color: "#B91C1C" }}>
            <span className="font-bold">{t("bo.mySubscriptions.refusalReason")} </span>
            {demande.raisonRefus}
          </div>
        )}
        {demande.statut === "validee" && demande.validatedAt && (
          <p className="mt-3 text-[12.5px] font-medium flex items-center gap-1.5" style={{ color: C.green }}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("bo.mySubscriptions.activatedOn", { date: formatDateTime(demande.validatedAt) })}
          </p>
        )}
        {demande.statut === "en_attente" && (
          <p className="mt-3 text-[12px]" style={{ color: "#8B5A00" }}>
            {t("bo.mySubscriptions.pendingNote")}
          </p>
        )}
      </div>
    </article>
  );
}

interface FormulaCardProps {
  formula: typeof FORMULES_CONFIG[number];
  isCurrent: boolean;
  onSelect: () => void;
  t: (k: string, opts?: any) => string;
}

function FormulaCard({ formula, isCurrent, onSelect, t }: FormulaCardProps) {
  const Icon = formula.icon;
  const formulaName = t(formula.labelKey);

  return (
    <div
      className="bg-white rounded-2xl border p-5 flex flex-col relative overflow-hidden"
      style={{
        borderColor: isCurrent ? C.green : formula.highlight ? C.gold : C.border,
        boxShadow: isCurrent
          ? `0 12px 30px -12px ${C.green}40`
          : formula.highlight
            ? `0 12px 30px -12px ${C.gold}30`
            : "0 4px 24px -16px rgba(15, 23, 42, 0.05)",
        borderWidth: isCurrent || formula.highlight ? 2 : 1,
      }}
    >
      {/* Badge si formule active */}
      {isCurrent && (
        <span
          className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 border"
          style={{ backgroundColor: C.greenSoft, color: C.deepGreen, borderColor: C.green }}
        >
          {t("bo.mySubscriptions.formulaCurrentBadge")}
        </span>
      )}
      {formula.highlight && !isCurrent && (
        <span
          className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5"
          style={{ backgroundColor: C.goldSoft, color: C.deepGreen }}
        >
          <Sparkles className="h-2.5 w-2.5 inline mr-0.5" />
          Populaire
        </span>
      )}

      {/* Icon + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: formula.iconBg }}>
          <Icon className="h-5 w-5" style={{ color: formula.iconColor }} />
        </div>
        <div>
          <h4 className="font-bold text-[16px] leading-tight" style={{ color: C.textMain }}>
            {formulaName}
          </h4>
        </div>
      </div>

      {/* Prix */}
      <div className="mb-4 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="flex items-baseline gap-1">
          <span className="font-extrabold" style={{ fontSize: "clamp(24px, 2.4vw, 30px)", color: C.textMain }}>
            {formula.price}
          </span>
          <span className="text-[12px] font-medium" style={{ color: C.textMuted }}>
            {formula.priceUnit}
          </span>
        </div>
      </div>

      {/* Bénéfices */}
      <ul className="space-y-2 mb-5 flex-1">
        {formula.benefits.map((benefitKey) => (
          <li key={benefitKey} className="flex items-start gap-2 text-[13px]" style={{ color: C.textMain }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: C.greenSoft }}>
              <CheckCircle2 className="h-3 w-3" style={{ color: C.green }} />
            </div>
            <span>{t(benefitKey)}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isCurrent ? (
        <Button
          variant="outline"
          disabled
          className="w-full rounded-xl h-11 font-semibold cursor-default"
          style={{ borderColor: C.green, color: C.deepGreen, backgroundColor: C.greenSoft, opacity: 1 }}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {t("bo.mySubscriptions.formulaCurrentBadge")}
        </Button>
      ) : (
        <Button
          onClick={onSelect}
          className="w-full rounded-xl h-11 font-semibold hover:opacity-90"
          style={{
            backgroundColor: formula.highlight ? C.gold : C.deepGreen,
            color: formula.highlight ? C.deepGreen : "#ffffff",
          }}
        >
          {t("bo.mySubscriptions.formulaSwitchTo", { formula: formulaName })}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
}
