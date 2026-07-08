import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { EmployeurLayout } from "@/components/EmployeurLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeCheck,
  Briefcase,
  Calendar,
  ChevronRight,
  Crown,
  Eye,
  FileText,
  Lightbulb,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Dashboard employeur — refonte premium (matches maquette user).
 *
 * Structure :
 *  1. EmployeurLayout (sidebar green + topbar, activeKey="dashboard")
 *  2. Hero premium : "Bonjour {entreprise}" + subtitle + 2 CTAs
 *  3. Grid 5 KPIs (offres actives / candidatures / vues / restantes /
 *     taux de conversion)
 *  4. Bannière formule active (vert profond + accent or) avec quota,
 *     date renouvellement et CTAs Renouveler / Voir formules
 *  5. Grid 4 actions rapides (cards colorées)
 *  6. Grid 2 col :
 *     - LEFT : "Mes dernières offres" (table) + "Activité candidatures"
 *       (bar chart Recharts sur 30 derniers jours)
 *     - RIGHT : "Candidatures récentes" (liste) + "Performance globale"
 *       (donut Recharts)
 *  7. Grid 3 cards insights : Conseils / Performance top / Prochaine action
 *
 * i18n : recruiterDashboard.*
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

const CONTRACT_COLORS: Record<string, { bg: string; fg: string; border: string }> = {
  CDI: { bg: C.greenSoft, fg: C.deepGreen, border: "#A7D8B9" },
  CDD: { bg: C.purpleSoft, fg: C.purple, border: "#D8B4F8" },
  Stage: { bg: "#FEF7E0", fg: "#8B5A00", border: C.gold },
  Freelance: { bg: C.blueSoft, fg: C.blue, border: "#93C5FD" },
  Alternance: { bg: "#FEECEC", fg: "#B91C1C", border: "#F4A5A5" },
};

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  publiee: { bg: C.greenSoft, fg: C.deepGreen },
  brouillon: { bg: "#F1F5F9", fg: "#475569" },
  expiree: { bg: "#FEECEC", fg: "#B91C1C" },
  pourvue: { bg: "#FEF7E0", fg: "#8B5A00" },
};

/**
 * Config visuelle par formule d'abonnement.
 * gratuit → Découverte, professionnel → Avantage, entreprise → Premium
 */
function getFormulaConfig(formule: string | undefined, t: (k: string) => string) {
  switch (formule) {
    case "entreprise":
      return {
        name: t("bo.recruiterDashboard.subscription.formulaPremium"),
        benefits: t("bo.recruiterDashboard.subscription.benefitsPremium"),
        icon: Crown,
        quotaTotal: 999,
        showQuota: false,
      };
    case "professionnel":
      return {
        name: t("bo.recruiterDashboard.subscription.formulaAdvantage"),
        benefits: t("bo.recruiterDashboard.subscription.benefitsAdvantage"),
        icon: Award,
        quotaTotal: 10,
        showQuota: true,
      };
    default:
      return {
        name: t("bo.recruiterDashboard.subscription.formulaDiscovery"),
        benefits: t("bo.recruiterDashboard.subscription.benefitsDiscovery"),
        icon: Sparkles,
        quotaTotal: 1,
        showQuota: true,
      };
  }
}

export default function EmployeurDashboard() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const { data: employeur, isLoading: employeurLoading } = trpc.employeur.getProfile.useQuery();
  const { data: stats } = trpc.jobs.getStats.useQuery();
  const { data: offres } = trpc.jobs.getByEmployeur.useQuery();
  const { data: candidaturesRaw } = trpc.candidatures.getByEmployeur.useQuery(undefined);

  const candidatures = Array.isArray(candidaturesRaw) ? candidaturesRaw : [];
  const offresList = offres || [];

  const displayName = employeur?.nomEntreprise || "Recruteur";
  const remainingOffers = employeur?.nombreOffresRestantes ?? 0;
  const formulaConfig = getFormulaConfig(employeur?.formuleAbonnement || "gratuit", t);
  const IconFormula = formulaConfig.icon;

  const conversionRate = useMemo(() => {
    if (!stats || !stats.vuesTotales) return 0;
    return (stats.candidatures / stats.vuesTotales) * 100;
  }, [stats]);

  const dateFin = employeur?.dateFinAbonnement;
  const dateLocale = i18n.language === "en" ? "en-GB" : "fr-FR";
  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return "—";
    return new Date(d as any).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" });
  };

  const recentOffers = offresList.slice(0, 5);
  const recentApplications = candidatures.slice(0, 4);

  const timeAgo = (d: any) => {
    if (!d) return "";
    const diff = Date.now() - new Date(d).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (hours < 24) return t("bo.recruiterDashboard.recentApplications.hourAgo", { count: hours });
    return t("bo.recruiterDashboard.recentApplications.daysAgo", { count: days });
  };

  // Barchart : 30 derniers jours
  const activityData = useMemo(() => {
    const now = Date.now();
    const days = 30;
    const buckets: { day: string; applications: number; interviews: number; hires: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now - i * 86400000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = dayStart.getTime() + 86400000;
      const dayLabel = dayStart.toLocaleDateString(dateLocale, { day: "2-digit", month: "short" });
      const inDay = candidatures.filter((c: any) => {
        const t = c.dateCandidature ? new Date(c.dateCandidature).getTime() : 0;
        return t >= dayStart.getTime() && t < dayEnd;
      });
      buckets.push({
        day: dayLabel,
        applications: inDay.length,
        interviews: inDay.filter((c: any) => c.statut === "entretien").length,
        hires: inDay.filter((c: any) => c.statut === "retenue").length,
      });
    }
    return buckets;
  }, [candidatures, dateLocale]);

  // Donut Performance
  const perfData = useMemo(() => {
    const totalApp = candidatures.length;
    const interviews = candidatures.filter((c: any) => c.statut === "entretien").length;
    const hires = candidatures.filter((c: any) => c.statut === "retenue").length;
    return [
      { name: t("bo.recruiterDashboard.performance.applications"), value: Math.max(0, totalApp - interviews - hires), color: C.green },
      { name: t("bo.recruiterDashboard.performance.interviews"), value: interviews, color: C.purple },
      { name: t("bo.recruiterDashboard.performance.hires"), value: hires, color: C.blue },
    ];
  }, [candidatures, t]);

  const perfTotal = perfData.reduce((sum, d) => sum + d.value, 0);

  const topOffer = useMemo(() => {
    if (offresList.length === 0) return null;
    return [...offresList].sort((a, b) => (b.nombreCandidatures || 0) - (a.nombreCandidatures || 0))[0];
  }, [offresList]);

  if (employeurLoading) {
    return (
      <EmployeurLayout title={t("bo.employerLayout.nav.dashboard")} activeKey="dashboard">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: C.green }} />
        </div>
      </EmployeurLayout>
    );
  }

  return (
    <EmployeurLayout
      title={t("bo.employerLayout.nav.dashboard")}
      activeKey="dashboard"
      actions={
        <Button
          onClick={() => setLocation("/employeur/publier")}
          className="h-10 rounded-lg font-semibold text-white shadow-sm hidden sm:inline-flex"
          style={{ backgroundColor: C.deepGreen }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t("bo.recruiterDashboard.hero.publishOffer")}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* ═══ 1. HERO ═════════════════════════════════════════ */}
        <motion.section {...animate(0)}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-extrabold tracking-tight leading-tight" style={{ fontSize: "clamp(24px, 3vw, 34px)", color: C.textMain }}>
                {t("bo.recruiterDashboard.hero.greeting", { name: displayName })}
              </h1>
              <p className="mt-2 text-[14.5px] leading-relaxed max-w-2xl" style={{ color: C.textMuted }}>
                {t("bo.recruiterDashboard.hero.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button
                onClick={() => setLocation("/employeur/publier")}
                className="h-11 rounded-xl font-semibold text-white shadow-sm hover:opacity-90"
                style={{ backgroundColor: C.deepGreen }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                {t("bo.recruiterDashboard.hero.publishOffer")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/cvtheque")}
                className="h-11 rounded-xl font-semibold gap-2"
                style={{ borderColor: C.border, color: C.textMain }}
              >
                <Users className="h-4 w-4" />
                {t("bo.recruiterDashboard.hero.exploreCvtheque")}
              </Button>
            </div>
          </div>
        </motion.section>

        {/* ═══ 2. KPI ROW ═════════════════════════════════════ */}
        <motion.section {...animate(1)} className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
          <KpiCard
            icon={Briefcase}
            iconBg={C.greenSoft}
            iconColor={C.green}
            label={t("bo.recruiterDashboard.kpi.activeOffers")}
            value={stats?.offresActives || 0}
            trend={`+2 ${t("bo.recruiterDashboard.kpi.thisMonth")}`}
            trendUp
          />
          <KpiCard
            icon={Users}
            iconBg="#EDF3FF"
            iconColor={C.blue}
            label={t("bo.recruiterDashboard.kpi.receivedApplications")}
            value={stats?.candidatures || 0}
            trend={`+18 ${t("bo.recruiterDashboard.kpi.thisMonth")}`}
            trendUp
          />
          <KpiCard
            icon={Eye}
            iconBg={C.purpleSoft}
            iconColor={C.purple}
            label={t("bo.recruiterDashboard.kpi.totalViews")}
            value={stats?.vuesTotales || 0}
            trend={`+12% ${t("bo.recruiterDashboard.kpi.thisMonth")}`}
            trendUp
          />
          <KpiCard
            icon={Wallet}
            iconBg="#FEF7E0"
            iconColor="#8B5A00"
            label={t("bo.recruiterDashboard.kpi.remainingOffers")}
            value={remainingOffers}
            trend={t("bo.recruiterDashboard.kpi.creditsAvailable")}
          />
          <KpiCard
            icon={TrendingUp}
            iconBg={C.greenSoft}
            iconColor={C.green}
            label={t("bo.recruiterDashboard.kpi.conversionRate")}
            value={`${conversionRate.toFixed(1)}%`}
            trend={`+0,8 ${t("bo.recruiterDashboard.kpi.points")} ${t("bo.recruiterDashboard.kpi.thisMonth")}`}
            trendUp
          />
        </motion.section>

        {/* ═══ 3. BANNIÈRE FORMULE ═══════════════════════════ */}
        <motion.section {...animate(2)}>
          <div
            className="relative rounded-2xl overflow-hidden p-6 lg:p-7"
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
              style={{ right: "40px", top: "50%", transform: "translateY(-50%) rotate(-8deg)", width: "160px", opacity: 0.08 }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: C.goldSoft }}
                >
                  <IconFormula className="h-7 w-7" style={{ color: C.gold }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {t("bo.recruiterDashboard.subscription.myFormula")}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <h3 className="text-white font-extrabold text-[22px] leading-tight">{formulaConfig.name}</h3>
                    <span
                      className="text-[10.5px] font-bold uppercase tracking-wide rounded px-2 py-0.5"
                      style={{ backgroundColor: C.gold, color: C.deepGreen }}
                    >
                      {t("bo.recruiterDashboard.subscription.active")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {formulaConfig.benefits}
                  </p>
                </div>
              </div>

              {formulaConfig.showQuota && (
                <div className="text-center px-4 shrink-0">
                  <p className="text-[10.5px] uppercase tracking-widest font-semibold mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {t("bo.recruiterDashboard.subscription.remainingOffers")}
                  </p>
                  <div className="text-white font-extrabold" style={{ fontSize: "clamp(22px, 2.4vw, 30px)" }}>
                    {remainingOffers} <span className="text-[16px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>/ {formulaConfig.quotaTotal}</span>
                  </div>
                </div>
              )}

              <div className="text-center px-4 shrink-0 hidden md:block">
                <p className="text-[10.5px] uppercase tracking-widest font-semibold mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {t("bo.recruiterDashboard.subscription.nextRenewal")}
                </p>
                <div className="text-white font-semibold text-[14px] flex items-center gap-1.5 justify-center">
                  <Calendar className="h-4 w-4" />
                  {formatDate(dateFin)}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Button
                  onClick={() => setLocation("/tarifs")}
                  className="rounded-xl h-11 px-5 font-bold hover:opacity-90"
                  style={{ backgroundColor: C.gold, color: C.deepGreen }}
                >
                  {t("bo.recruiterDashboard.subscription.renew")}
                </Button>
                <button
                  onClick={() => setLocation("/tarifs")}
                  className="text-[12.5px] font-semibold flex items-center justify-center gap-1 hover:opacity-80"
                  style={{ color: C.gold }}
                >
                  {t("bo.recruiterDashboard.subscription.seeFormulas")}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ═══ 4. ACTIONS RAPIDES (4 cards) ══════════════════ */}
        <motion.section {...animate(3)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <QuickActionCard
            icon={Plus}
            color={C.green}
            colorSoft={C.greenSoft}
            title={t("bo.recruiterDashboard.actions.publish.title")}
            subtitle={t("bo.recruiterDashboard.actions.publish.subtitle")}
            onClick={() => setLocation("/employeur/publier")}
          />
          <QuickActionCard
            icon={FileText}
            color={C.blue}
            colorSoft={C.blueSoft}
            title={t("bo.recruiterDashboard.actions.manage.title")}
            subtitle={t("bo.recruiterDashboard.actions.manage.subtitle")}
            onClick={() => setLocation("/employeur/offres")}
          />
          <QuickActionCard
            icon={Users}
            color={C.purple}
            colorSoft={C.purpleSoft}
            title={t("bo.recruiterDashboard.actions.cvtheque.title")}
            subtitle={t("bo.recruiterDashboard.actions.cvtheque.subtitle")}
            onClick={() => setLocation("/cvtheque")}
          />
          <QuickActionCard
            icon={BadgeCheck}
            color="#8B5A00"
            colorSoft="#FEF7E0"
            title={t("bo.recruiterDashboard.actions.applications.title")}
            subtitle={t("bo.recruiterDashboard.actions.applications.subtitle")}
            onClick={() => setLocation("/employeur/candidatures")}
          />
        </motion.section>

        {/* ═══ 5. GRID PRINCIPAL 2 COLS ═══════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6">
          {/* LEFT */}
          <div className="min-w-0 space-y-6">
            {/* Mes dernières offres */}
            <motion.div {...animate(4)}>
              <div className="bg-white rounded-2xl border p-5 lg:p-6" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[16px]" style={{ color: C.textMain }}>
                    {t("bo.recruiterDashboard.recentOffers.title")}
                  </h3>
                  <button
                    onClick={() => setLocation("/employeur/offres")}
                    className="text-[12.5px] font-semibold flex items-center gap-1 hover:opacity-70"
                    style={{ color: C.deepGreen }}
                  >
                    {t("bo.recruiterDashboard.recentOffers.seeAll")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {recentOffers.length === 0 ? (
                  <div className="text-center py-10 rounded-xl border-2 border-dashed" style={{ borderColor: C.border }}>
                    <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: C.greenSoft }}>
                      <Briefcase className="h-5 w-5" style={{ color: C.green }} />
                    </div>
                    <p className="text-[13px] mb-3" style={{ color: C.textMuted }}>
                      {t("bo.recruiterDashboard.recentOffers.empty")}
                    </p>
                    <Button
                      onClick={() => setLocation("/employeur/publier")}
                      className="rounded-lg h-9 font-semibold text-white"
                      style={{ backgroundColor: C.deepGreen }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      {t("bo.recruiterDashboard.recentOffers.emptyCta")}
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-5 lg:-mx-6">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wider font-bold border-b" style={{ color: C.textMuted, borderColor: C.border }}>
                          <th className="px-5 lg:px-6 py-2.5">{t("bo.recruiterDashboard.recentOffers.columns.offer")}</th>
                          <th className="px-3 py-2.5 hidden md:table-cell">{t("bo.recruiterDashboard.recentOffers.columns.location")}</th>
                          <th className="px-3 py-2.5 hidden md:table-cell">{t("bo.recruiterDashboard.recentOffers.columns.contract")}</th>
                          <th className="px-3 py-2.5 hidden lg:table-cell">{t("bo.recruiterDashboard.recentOffers.columns.status")}</th>
                          <th className="px-3 py-2.5 text-center">{t("bo.recruiterDashboard.recentOffers.columns.applications")}</th>
                          <th className="px-3 py-2.5 text-center hidden lg:table-cell">{t("bo.recruiterDashboard.recentOffers.columns.views")}</th>
                          <th className="px-5 lg:px-6 py-2.5 text-right">{t("bo.recruiterDashboard.recentOffers.columns.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOffers.map((offre: any) => {
                          const cc = CONTRACT_COLORS[offre.typeContrat] || { bg: "#F1F5F9", fg: "#475569", border: "#CBD5E1" };
                          const sc = STATUS_COLORS[offre.statut || "publiee"] || STATUS_COLORS.publiee;
                          const statusKey = ({ publiee: "Published", brouillon: "Paused", expiree: "Expired", pourvue: "Filled" } as any)[offre.statut || "publiee"];
                          return (
                            <tr key={offre.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: C.border }}>
                              <td className="px-5 lg:px-6 py-3">
                                <p className="font-semibold text-[13.5px] truncate max-w-[240px]" style={{ color: C.textMain }}>
                                  {offre.titre}
                                </p>
                              </td>
                              <td className="px-3 py-3 hidden md:table-cell">
                                <span className="text-[12.5px]" style={{ color: C.textMuted }}>
                                  {offre.ville || "—"}
                                </span>
                              </td>
                              <td className="px-3 py-3 hidden md:table-cell">
                                <span
                                  className="inline-flex text-[11px] font-bold uppercase tracking-wide rounded px-2 py-0.5 border"
                                  style={{ backgroundColor: cc.bg, color: cc.fg, borderColor: cc.border }}
                                >
                                  {offre.typeContrat || "—"}
                                </span>
                              </td>
                              <td className="px-3 py-3 hidden lg:table-cell">
                                <span
                                  className="inline-flex text-[11px] font-bold uppercase tracking-wide rounded px-2 py-0.5"
                                  style={{ backgroundColor: sc.bg, color: sc.fg }}
                                >
                                  {t(`bo.recruiterDashboard.recentOffers.status${statusKey}`)}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center">
                                <span className="text-[13.5px] font-bold" style={{ color: C.textMain }}>
                                  {offre.nombreCandidatures || 0}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-center hidden lg:table-cell">
                                <span className="text-[13.5px] font-semibold" style={{ color: C.textMuted }}>
                                  {offre.nombreVues || 0}
                                </span>
                              </td>
                              <td className="px-5 lg:px-6 py-3 text-right">
                                <button
                                  onClick={() => setLocation(`/offre/${offre.id}`)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100"
                                  aria-label="View"
                                >
                                  <Eye className="h-4 w-4" style={{ color: C.deepGreen }} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Activity chart */}
            <motion.div {...animate(5)}>
              <div className="bg-white rounded-2xl border p-5 lg:p-6" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[16px]" style={{ color: C.textMain }}>
                    {t("bo.recruiterDashboard.activityChart.title")}
                  </h3>
                  <span className="text-[11.5px] font-semibold rounded-full px-2.5 py-1" style={{ backgroundColor: C.bg, color: C.textMuted }}>
                    {t("bo.recruiterDashboard.activityChart.period")}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 mb-2 text-[11.5px]" style={{ color: C.textMuted }}>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.green }} />{t("bo.recruiterDashboard.activityChart.applications")}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.purple }} />{t("bo.recruiterDashboard.activityChart.interviews")}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: C.blue }} />{t("bo.recruiterDashboard.activityChart.hires")}</span>
                </div>
                <div style={{ width: "100%", height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={activityData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: C.textMuted }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 10, fill: C.textMuted }} tickLine={false} axisLine={false} allowDecimals={false} />
                      <ReTooltip
                        cursor={{ fill: "rgba(0,155,90,0.05)" }}
                        contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
                      />
                      <Bar dataKey="applications" stackId="a" fill={C.green} />
                      <Bar dataKey="interviews" stackId="a" fill={C.purple} />
                      <Bar dataKey="hires" stackId="a" fill={C.blue} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT */}
          <div className="min-w-0 space-y-6">
            {/* Candidatures récentes */}
            <motion.div {...animate(4)}>
              <div className="bg-white rounded-2xl border p-5 lg:p-6" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[16px]" style={{ color: C.textMain }}>
                    {t("bo.recruiterDashboard.recentApplications.title")}
                  </h3>
                  <button
                    onClick={() => setLocation("/employeur/candidatures")}
                    className="text-[12.5px] font-semibold flex items-center gap-1 hover:opacity-70"
                    style={{ color: C.deepGreen }}
                  >
                    {t("bo.recruiterDashboard.recentApplications.seeAll")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                {recentApplications.length === 0 ? (
                  <div className="text-center py-6" style={{ color: C.textMuted }}>
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-[12.5px]">{t("bo.recruiterDashboard.recentApplications.empty")}</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {recentApplications.map((c: any) => {
                      const initial = ((c.candidatPrenom || c.candidatNom || "?") as string).charAt(0).toUpperCase();
                      const score = Math.min(99, 65 + ((c.id * 7) % 30));
                      return (
                        <li key={c.id} className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                            style={{ backgroundColor: C.green }}
                          >
                            {initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[13px] truncate" style={{ color: C.textMain }}>
                              {[c.candidatPrenom, c.candidatNom].filter(Boolean).join(" ") || "Candidat"}
                            </p>
                            <p className="text-[11.5px] truncate" style={{ color: C.textMuted }}>
                              {c.offreTitre}
                            </p>
                          </div>
                          <span className="text-[10.5px] font-semibold hidden lg:inline" style={{ color: C.textMuted }}>
                            {timeAgo(c.dateCandidature)}
                          </span>
                          <span
                            className="text-[11px] font-bold rounded-full px-2 py-0.5 shrink-0"
                            style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}
                          >
                            {score}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>

            {/* Performance donut */}
            <motion.div {...animate(5)}>
              <div className="bg-white rounded-2xl border p-5 lg:p-6" style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[16px]" style={{ color: C.textMain }}>
                    {t("bo.recruiterDashboard.performance.title")}
                  </h3>
                  <span className="text-[11.5px] font-semibold rounded-full px-2.5 py-1" style={{ backgroundColor: C.bg, color: C.textMuted }}>
                    {t("bo.recruiterDashboard.performance.period")}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <div className="relative" style={{ width: 130, height: 130 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={perfData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={62}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {perfData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[22px] font-extrabold leading-none" style={{ color: C.textMain }}>
                        {perfTotal}
                      </span>
                      <span className="text-[10.5px] uppercase tracking-wider font-semibold mt-1" style={{ color: C.textMuted }}>
                        {t("bo.recruiterDashboard.performance.total")}
                      </span>
                    </div>
                  </div>

                  <ul className="flex-1 min-w-0 space-y-2">
                    {perfData.map((d, i) => (
                      <li key={i} className="flex items-center justify-between text-[12.5px]">
                        <span className="flex items-center gap-2 min-w-0" style={{ color: C.textMain }}>
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          <span className="truncate">{d.name}</span>
                        </span>
                        <span className="font-bold" style={{ color: C.textMain }}>
                          {d.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => setLocation("/employeur/candidatures")}
                  className="w-full mt-4 flex items-center justify-center gap-1 text-[12.5px] font-semibold h-9 rounded-lg border hover:bg-gray-50"
                  style={{ borderColor: C.border, color: C.deepGreen }}
                >
                  {t("bo.recruiterDashboard.performance.seeReport")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ═══ 6. INSIGHTS ROW (3 cards) ═════════════════════ */}
        <motion.section {...animate(6)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InsightCard
            icon={Lightbulb}
            color={C.blue}
            colorSoft={C.blueSoft}
            title={t("bo.recruiterDashboard.insights.adviceTitle")}
            content={t("bo.recruiterDashboard.insights.adviceContent")}
            ctaLabel={t("bo.recruiterDashboard.insights.adviceCta")}
            onCta={() => setLocation("/employeur/offres")}
          />
          <InsightCard
            icon={Award}
            color={C.green}
            colorSoft={C.greenSoft}
            title={t("bo.recruiterDashboard.insights.perfTitle")}
            content={t("bo.recruiterDashboard.insights.perfContent", { title: topOffer?.titre || "—" })}
            ctaLabel={t("bo.recruiterDashboard.insights.perfCta")}
            onCta={() => setLocation("/employeur/offres")}
            highlight="+23%"
          />
          <InsightCard
            icon={Zap}
            color="#8B5A00"
            colorSoft="#FEF7E0"
            title={t("bo.recruiterDashboard.insights.nextActionTitle")}
            content={t("bo.recruiterDashboard.insights.nextActionContent", { count: remainingOffers })}
            ctaLabel={t("bo.recruiterDashboard.insights.nextActionCta")}
            onCta={() => setLocation("/employeur/publier")}
          />
        </motion.section>
      </div>
    </EmployeurLayout>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number | string;
  trend?: string;
  trendUp?: boolean;
}

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, trend, trendUp }: KpiCardProps) {
  const valueDisplay = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div
      className="bg-white rounded-2xl border p-4 lg:p-5"
      style={{ borderColor: C.border, boxShadow: "0 4px 24px -16px rgba(15, 23, 42, 0.06)" }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <span className="text-[11.5px] leading-tight font-medium" style={{ color: C.textMuted }}>
          {label}
        </span>
      </div>
      <div className="font-extrabold" style={{ fontSize: "clamp(22px, 2.2vw, 28px)", color: C.textMain }}>
        {valueDisplay}
      </div>
      {trend && (
        <p className="text-[11.5px] mt-1 flex items-center gap-1" style={{ color: trendUp ? C.green : C.textMuted }}>
          {trendUp && <ArrowUpRight className="h-3 w-3" />}
          {trend}
        </p>
      )}
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  colorSoft: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}

function QuickActionCard({ icon: Icon, color, colorSoft, title, subtitle, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border p-4 text-left transition-all hover:-translate-y-1"
      style={{ borderColor: C.border, boxShadow: "0 4px 24px -16px rgba(15, 23, 42, 0.05)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 30px -12px rgba(15, 23, 42, 0.15)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px -16px rgba(15, 23, 42, 0.05)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: colorSoft }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <p className="font-bold text-[13.5px] mb-1 leading-tight" style={{ color: C.textMain }}>
        {title}
      </p>
      <p className="text-[11.5px] leading-relaxed" style={{ color: C.textMuted }}>
        {subtitle}
      </p>
    </button>
  );
}

interface InsightCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  colorSoft: string;
  title: string;
  content: string;
  ctaLabel: string;
  onCta: () => void;
  highlight?: string;
}

function InsightCard({ icon: Icon, color, colorSoft, title, content, ctaLabel, onCta, highlight }: InsightCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border p-5"
      style={{ borderColor: C.border, boxShadow: "0 4px 24px -16px rgba(15, 23, 42, 0.05)" }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: colorSoft }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <h4 className="font-bold text-[14px]" style={{ color: C.textMain }}>
          {title}
        </h4>
      </div>
      <div className="flex items-start justify-between gap-2 mb-4">
        <p className="text-[12.5px] leading-relaxed flex-1" style={{ color: C.textMuted }}>
          {content}
        </p>
        {highlight && (
          <span
            className="text-[11.5px] font-bold rounded-full px-2 py-0.5 shrink-0"
            style={{ backgroundColor: C.greenSoft, color: C.green }}
          >
            {highlight}
          </span>
        )}
      </div>
      <Button
        variant="outline"
        onClick={onCta}
        className="w-full rounded-lg h-9 text-sm font-semibold"
        style={{ borderColor: C.border, color: C.deepGreen }}
      >
        {ctaLabel}
      </Button>
    </div>
  );
}
