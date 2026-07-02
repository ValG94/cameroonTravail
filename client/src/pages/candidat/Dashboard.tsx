import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowRight,
  Award,
  Bell,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Crown,
  Eye,
  FileText,
  GraduationCap,
  Globe,
  MapPin,
  Phone,
  Search,
  Send,
  Upload,
  User,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { useEffect, useMemo } from "react";

/**
 * Dashboard candidat — refonte premium.
 *
 * Structure :
 *  1. CandidatNav (nav connectée, avatar dropdown, alertes badge)
 *  2. Welcome hero compact (bienvenue + décor)
 *  3. Bannière CV Premium (vert profond + accent or)
 *  4. Grid 2 colonnes principal :
 *     - Gauche : complétion profil + 4 stats + 6 modules profil
 *     - Droite : Ma progression (4 items) + Offres recommandées (3 items)
 *  5. Accès rapides (4 items horizontaux)
 *  6. CTA final "Explorer les offres privées"
 *
 * Direction : premium mais épuré. Aucune donnée mockée si dispo en DB.
 * Suppression totale de la mention 'Emploi Public / Emploi Privé'.
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

// Variants fade-up réutilisables — respect prefers-reduced-motion
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export default function CandidatDashboard() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const { data: profile } = trpc.candidat.getProfile.useQuery();
  const { data: experiences } = trpc.candidat.getExperiences.useQuery();
  const { data: formations } = trpc.candidat.getFormations.useQuery();
  const { data: competences } = trpc.candidat.getCompetences.useQuery();
  const { data: langues } = trpc.candidat.getLangues.useQuery();
  const { data: viewsData } = trpc.profileViews.myStats.useQuery();
  const { data: alertesData } = trpc.alertes.list.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  const { data: candidaturesData } = trpc.candidatures.getByCandidat.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  // Offres publiques (privées uniquement — le site ne gère plus le public).
  // On limite à quelques offres pour "Offres recommandées".
  const { data: jobsData } = trpc.jobs.search.useQuery(
    { typeOffre: "prive", page: 1, limit: 3 },
    { retry: false }
  );

  // Redirection si pas candidat
  useEffect(() => {
    if (!loading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const profileCompletion = useMemo(() => {
    let score = 0;
    const maxScore = 7;
    if (profile?.prenom && profile?.nom) score++;
    if (profile?.telephone) score++;
    if (profile?.ville && profile?.region) score++;
    if (profile?.cvUrl) score++;
    if (experiences && experiences.length > 0) score++;
    if (formations && formations.length > 0) score++;
    if (competences && competences.length > 0) score++;
    return Math.round((score / maxScore) * 100);
  }, [profile, experiences, formations, competences]);

  const activeAlertsCount = Array.isArray(alertesData)
    ? alertesData.filter((a: any) => a.active).length
    : 0;
  const candidaturesThisMonth = useMemo(() => {
    if (!Array.isArray(candidaturesData)) return 0;
    const now = new Date();
    return candidaturesData.filter((c: any) => {
      const d = new Date(c.dateCandidature || c.createdAt || 0);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [candidaturesData]);

  const recommendedJobs = Array.isArray(jobsData?.jobs) ? jobsData.jobs.slice(0, 3) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
            style={{ borderColor: C.green }}
          />
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const firstName = profile?.prenom || user?.name?.split(" ")[0] || "";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: C.bg,
        color: C.textMain,
        fontFamily: "'Manrope', 'Inter', sans-serif",
      }}
    >
      <CandidatNav />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* ─── Welcome hero compact ────────────────────────────── */}
        <motion.div className="relative overflow-hidden rounded-3xl mb-6 lg:mb-8" {...animate(0)}>
          <div className="relative bg-white rounded-3xl border p-6 lg:p-10 overflow-hidden" style={{ borderColor: C.border }}>
            {/* Décor formes très légères */}
            <div
              aria-hidden="true"
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: C.greenSoft }}
            />
            <div
              aria-hidden="true"
              className="absolute top-10 right-56 w-2 h-2 rounded-full opacity-50 pointer-events-none hidden sm:block"
              style={{ backgroundColor: C.gold }}
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="max-w-xl">
                <h1
                  className="font-extrabold tracking-tight mb-2"
                  style={{ fontSize: "clamp(24px, 3vw, 34px)", color: C.textMain }}
                >
                  {t("dashboard.welcome.title", { firstName })}
                </h1>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: C.textMuted }}>
                  {t("dashboard.welcome.subtitle")}
                </p>
              </div>
              {/* Image décorative candidate-dashboard */}
              <img
                src="/images/candidat/candidate-dashboard.webp"
                alt=""
                aria-hidden="true"
                className="hidden sm:block w-40 lg:w-56 h-auto object-contain shrink-0 select-none pointer-events-none"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* ─── Bannière Premium CV ─────────────────────────────── */}
        <motion.div
          className="relative overflow-hidden rounded-3xl mb-6 lg:mb-8 text-white p-6 lg:p-8"
          {...animate(1)}
          style={{
            background: `linear-gradient(135deg, ${C.deepGreen} 0%, #084C2C 100%)`,
            boxShadow: "0 20px 40px -10px rgba(6, 63, 36, 0.35)",
          }}
        >
          {/* Halo or subtil */}
          <div
            aria-hidden="true"
            className="absolute -top-12 -right-12 w-56 h-56 rounded-full blur-[80px] opacity-30 pointer-events-none"
            style={{ backgroundColor: C.gold }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(246, 195, 67, 0.20)", border: "1px solid rgba(246, 195, 67, 0.35)" }}
              >
                <Crown className="w-7 h-7" style={{ color: C.gold }} />
              </div>
              <div>
                <h3 className="font-bold text-lg lg:text-xl mb-1">
                  {t("dashboard.premiumBanner.title")}{" "}
                  <span style={{ color: C.gold }}>{t("dashboard.premiumBanner.titleHighlight")}</span>
                </h3>
                <p className="text-sm text-white/85 leading-relaxed max-w-2xl">
                  {t("dashboard.premiumBanner.subtitle")}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/candidat/templates")}
              className="shrink-0 font-semibold shadow-lg"
              style={{ backgroundColor: C.gold, color: C.deepGreen }}
            >
              {t("dashboard.premiumBanner.cta")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* ─── Grid principal 2 colonnes ─────────────────────── */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8" {...animate(2)}>
          {/* ═══ Colonne gauche ═══ */}
          <div className="space-y-6">
            {/* Card complétion profil */}
            <Card className="rounded-2xl border overflow-hidden" style={{ borderColor: C.border }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ color: C.textMain }}>
                      {t("dashboard.profileCompletion.title")}
                    </h3>
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      {t("dashboard.profileCompletion.subtitle")}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="shrink-0"
                    style={{ backgroundColor: C.deepGreen, color: "white" }}
                  >
                    <Link href="/candidat/profil">
                      {profileCompletion === 100
                        ? t("dashboard.profileCompletion.ctaUpdate")
                        : t("dashboard.profileCompletion.ctaComplete")}
                    </Link>
                  </Button>
                </div>
                <div className="flex items-end gap-3 mb-3">
                  <div
                    className="text-3xl font-extrabold leading-none"
                    style={{ color: C.green }}
                  >
                    {profileCompletion}%
                  </div>
                </div>
                {/* Barre de progression */}
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: C.greenSoft }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${profileCompletion}%`,
                      background: `linear-gradient(90deg, ${C.green} 0%, #00C270 100%)`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stats — 4 cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <StatCard
                icon={Eye}
                iconBg="rgba(59, 130, 246, 0.10)"
                iconColor="#2563EB"
                label={t("dashboard.stats.profileViews")}
                value={viewsData?.total ?? 0}
                subtitle={t("dashboard.stats.profileViewsSubtitle")}
              />
              <StatCard
                icon={Activity}
                iconBg="rgba(0, 155, 90, 0.10)"
                iconColor={C.green}
                label={t("dashboard.stats.weeklyViews")}
                value={viewsData?.last7Days ?? 0}
                subtitle={t("dashboard.stats.weeklyViewsSubtitle")}
              />
              <StatCard
                icon={Send}
                iconBg="rgba(249, 115, 22, 0.10)"
                iconColor="#F97316"
                label={t("dashboard.stats.applicationsSent")}
                value={candidaturesThisMonth}
                subtitle={t("dashboard.stats.applicationsSentSubtitle")}
              />
              <StatCard
                icon={Bell}
                iconBg="rgba(139, 92, 246, 0.10)"
                iconColor="#8B5CF6"
                label={t("dashboard.stats.activeAlerts")}
                value={activeAlertsCount}
                subtitle={t("dashboard.stats.activeAlertsSubtitle")}
              />
            </div>

            {/* Modules profil — 3 colonnes desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ModuleCard
                icon={User}
                iconBg="rgba(139, 92, 246, 0.10)"
                iconColor="#8B5CF6"
                title={t("dashboard.cards.personalInfo.title")}
                subtitle={
                  <>
                    {profile?.telephone && (
                      <div className="flex items-center gap-1.5 text-xs mb-0.5" style={{ color: C.textMuted }}>
                        <Phone className="w-3 h-3" />
                        {profile.telephone}
                      </div>
                    )}
                    {profile?.ville && (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: C.textMuted }}>
                        <MapPin className="w-3 h-3" />
                        {profile.ville}
                        {profile.region ? `, ${profile.region}` : ""}
                      </div>
                    )}
                  </>
                }
                ctaLabel={t("dashboard.cards.personalInfo.edit")}
                ctaHref="/candidat/profil"
              />
              <ModuleCard
                icon={FileText}
                iconBg="rgba(245, 158, 11, 0.10)"
                iconColor="#F59E0B"
                title={t("dashboard.cards.myCv.title")}
                subtitle={
                  <div className="text-xs" style={{ color: C.textMuted }}>
                    {profile?.cvUrl
                      ? t("dashboard.cards.myCv.statusUploaded")
                      : t("dashboard.cards.myCv.statusMissing")}
                  </div>
                }
                ctaLabel={profile?.cvUrl ? t("dashboard.cards.myCv.viewCv") : t("dashboard.cards.myCv.uploadCv")}
                ctaHref="/candidat/cv"
                ctaIcon={profile?.cvUrl ? undefined : Upload}
              />
              <ModuleCard
                icon={Briefcase}
                iconBg="rgba(59, 130, 246, 0.10)"
                iconColor="#2563EB"
                title={t("dashboard.cards.experiences.title")}
                subtitle={
                  <div className="text-xs" style={{ color: C.textMuted }}>
                    {t("dashboard.cards.experiences.count", { count: experiences?.length ?? 0 })}
                    {(experiences?.length ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-0.5" style={{ color: C.green }}>
                        <CheckCircle2 className="w-3 h-3" />
                        {t("dashboard.cards.experiences.statusOk")}
                      </div>
                    )}
                  </div>
                }
                ctaLabel={t("dashboard.cards.experiences.manage")}
                ctaHref="/candidat/experiences"
              />
              <ModuleCard
                icon={GraduationCap}
                iconBg="rgba(0, 155, 90, 0.10)"
                iconColor={C.green}
                title={t("dashboard.cards.education.title")}
                subtitle={
                  <div className="text-xs" style={{ color: C.textMuted }}>
                    {t("dashboard.cards.education.count", { count: formations?.length ?? 0 })}
                    {(formations?.length ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-0.5" style={{ color: C.green }}>
                        <CheckCircle2 className="w-3 h-3" />
                        {t("dashboard.cards.education.statusOk")}
                      </div>
                    )}
                  </div>
                }
                ctaLabel={t("dashboard.cards.education.manage")}
                ctaHref="/candidat/formations"
              />
              <ModuleCard
                icon={Award}
                iconBg="rgba(249, 115, 22, 0.10)"
                iconColor="#F97316"
                title={t("dashboard.cards.skills.title")}
                subtitle={
                  <div className="text-xs" style={{ color: C.textMuted }}>
                    {t("dashboard.cards.skills.count", { count: competences?.length ?? 0 })}
                    {(competences?.length ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-0.5" style={{ color: C.green }}>
                        <CheckCircle2 className="w-3 h-3" />
                        {t("dashboard.cards.skills.statusOk")}
                      </div>
                    )}
                  </div>
                }
                ctaLabel={t("dashboard.cards.skills.manage")}
                ctaHref="/candidat/competences"
              />
              <ModuleCard
                icon={Globe}
                iconBg="rgba(239, 68, 68, 0.10)"
                iconColor="#EF4444"
                title={t("dashboard.cards.languages.title")}
                subtitle={
                  <div className="text-xs" style={{ color: C.textMuted }}>
                    {t("dashboard.cards.languages.count", { count: langues?.length ?? 0 })}
                    {(langues?.length ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-0.5" style={{ color: C.green }}>
                        <CheckCircle2 className="w-3 h-3" />
                        {t("dashboard.cards.languages.statusOk")}
                      </div>
                    )}
                  </div>
                }
                ctaLabel={t("dashboard.cards.languages.manage")}
                ctaHref="/candidat/langues"
              />
            </div>
          </div>

          {/* ═══ Colonne droite ═══ */}
          <div className="space-y-6">
            {/* Ma progression */}
            <Card className="rounded-2xl border" style={{ borderColor: C.border }}>
              <CardContent className="p-6">
                <h3 className="font-bold text-base mb-5" style={{ color: C.textMain }}>
                  {t("dashboard.progress.title")}
                </h3>
                <div className="space-y-4">
                  <ProgressItem
                    completed={profileCompletion === 100}
                    icon={Crown}
                    title={t("dashboard.progress.profileUpToDate.title")}
                    subtitle={t("dashboard.progress.profileUpToDate.subtitle")}
                  />
                  <ProgressItem
                    completed={false}
                    icon={Crown}
                    title={t("dashboard.progress.recommendedJobs.title", { count: recommendedJobs.length })}
                    subtitle={t("dashboard.progress.recommendedJobs.subtitle")}
                    onClick={() => setLocation("/offres")}
                  />
                  <ProgressItem
                    completed={false}
                    icon={Bell}
                    title={t("dashboard.progress.activeAlerts.title", { count: activeAlertsCount })}
                    subtitle={t("dashboard.progress.activeAlerts.subtitle")}
                    onClick={() => setLocation("/candidat/alertes")}
                  />
                  <ProgressItem
                    completed={!!profile?.cvUrl}
                    icon={FileText}
                    title={t("dashboard.progress.cvReady.title")}
                    subtitle={t("dashboard.progress.cvReady.subtitle")}
                  />
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-5"
                  onClick={() => setLocation(`/profil-candidat/${user?.id}`)}
                  style={{ borderColor: C.border }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {t("dashboard.progress.publicProfile")}
                </Button>
              </CardContent>
            </Card>

            {/* Offres recommandées */}
            <Card className="rounded-2xl border" style={{ borderColor: C.border }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base" style={{ color: C.textMain }}>
                    {t("dashboard.recommendedJobs.title")}
                  </h3>
                  <Link href="/offres">
                    <span
                      className="text-xs font-semibold hover:underline cursor-pointer"
                      style={{ color: C.green }}
                    >
                      {t("dashboard.recommendedJobs.viewAll")}
                    </span>
                  </Link>
                </div>
                {recommendedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-40" style={{ color: C.textMuted }} />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      Aucune offre pour le moment
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendedJobs.map((job: any) => (
                      <JobItem key={job.id} job={job} onNavigate={setLocation} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* ─── Accès rapides ────────────────────────────────── */}
        <motion.div
          className="mt-8 rounded-3xl p-5 lg:p-7 border"
          {...animate(3)}
          style={{ backgroundColor: C.greenSoft, borderColor: "rgba(0, 155, 90, 0.15)" }}
        >
          <h3 className="font-bold text-base mb-4" style={{ color: C.textMain }}>
            {t("dashboard.quickAccess.title")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickAccessCard
              icon={Search}
              title={t("dashboard.quickAccess.searchJobs")}
              subtitle={t("dashboard.quickAccess.searchJobsSubtitle")}
              href="/offres"
            />
            <QuickAccessCard
              icon={Upload}
              title={t("dashboard.quickAccess.updateCv")}
              subtitle={t("dashboard.quickAccess.updateCvSubtitle")}
              href="/candidat/cv"
            />
            <QuickAccessCard
              icon={Crown}
              title={t("dashboard.quickAccess.premiumTemplates")}
              subtitle={t("dashboard.quickAccess.premiumTemplatesSubtitle")}
              href="/candidat/templates"
            />
            <QuickAccessCard
              icon={Bell}
              title={t("dashboard.quickAccess.manageAlerts")}
              subtitle={t("dashboard.quickAccess.manageAlertsSubtitle")}
              href="/candidat/alertes"
            />
          </div>
        </motion.div>

        {/* ─── CTA final ────────────────────────────────────── */}
        <motion.div
          className="mt-8 relative overflow-hidden rounded-3xl text-white p-6 lg:p-8"
          {...animate(4)}
          style={{
            background: `linear-gradient(135deg, ${C.deepGreen} 0%, #084C2C 100%)`,
            boxShadow: "0 20px 40px -10px rgba(6, 63, 36, 0.35)",
          }}
        >
          <div
            aria-hidden="true"
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: C.gold }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "rgba(246, 195, 67, 0.20)", border: "1px solid rgba(246, 195, 67, 0.35)" }}
              >
                <Briefcase className="w-7 h-7" style={{ color: C.gold }} />
              </div>
              <div>
                <h3 className="font-bold text-lg lg:text-xl mb-1">
                  {t("dashboard.finalCta.title")}
                </h3>
                <p className="text-sm text-white/85 leading-relaxed max-w-2xl">
                  {t("dashboard.finalCta.subtitle")}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setLocation("/offres")}
              className="shrink-0 font-semibold shadow-lg"
              style={{ backgroundColor: C.gold, color: C.deepGreen }}
            >
              {t("dashboard.finalCta.button")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Sous-composants ────────────────────────────────────────────────

/**
 * Sparkline SVG déterministe : génère une courbe stylisée à partir
 * du nom du label pour que chaque stat card ait sa propre courbe
 * cohérente (pas de random qui saute à chaque render). Purement
 * décoratif — l'idée est de suggérer une tendance sans exiger de
 * données historiques réelles.
 */
function Sparkline({ seed, color }: { seed: string; color: string }) {
  // Génère 6 points à partir du seed pour rester déterministe
  const points = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    const rng = () => {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      return (hash / 0x7fffffff);
    };
    const n = 7;
    const w = 80;
    const h = 22;
    return Array.from({ length: n }, (_, i) => {
      const x = (i / (n - 1)) * w;
      // Légère tendance montante (bias) + variation
      const bias = (i / (n - 1)) * 0.5;
      const y = h - (rng() * 0.6 + bias) * h;
      return { x, y: Math.max(2, Math.min(h - 2, y)) };
    });
  }, [seed]);

  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    ""
  );
  const area = path + ` L 80 22 L 0 22 Z`;
  const gradId = `sparkgrad-${seed.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox="0 0 80 22" className="w-full h-5" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
  subtitle: string;
}) {
  return (
    <Card
      className="rounded-2xl border hover:shadow-md hover:-translate-y-0.5 transition-all"
      style={{ borderColor: C.border }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          {/* Sparkline décorative */}
          <div className="flex-1 max-w-[80px] pt-1">
            <Sparkline seed={label} color={iconColor} />
          </div>
        </div>
        <div className="text-xs font-medium mb-0.5 leading-tight" style={{ color: C.textMuted }}>
          {label}
        </div>
        <div className="text-2xl font-extrabold leading-none mb-1" style={{ color: C.textMain }}>
          {value}
        </div>
        <div className="text-[11px] leading-tight" style={{ color: C.textMuted }}>
          {subtitle}
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  ctaIcon: CtaIcon,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: React.ReactNode;
  ctaLabel: string;
  ctaHref: string;
  ctaIcon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card
      className="rounded-2xl border hover:shadow-md hover:-translate-y-0.5 transition-all"
      style={{ borderColor: C.border }}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-sm mb-1 leading-tight" style={{ color: C.textMain }}>
              {title}
            </div>
            {subtitle}
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full text-xs" style={{ borderColor: C.border }}>
          <Link href={ctaHref}>
            {CtaIcon && <CtaIcon className="w-3.5 h-3.5 mr-1.5" />}
            {ctaLabel}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ProgressItem({
  completed,
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  completed: boolean;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  return (
    <div
      className={`flex items-center gap-3 ${clickable ? "cursor-pointer group" : ""}`}
      onClick={onClick}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: C.greenSoft }}
      >
        <Icon className="w-4 h-4" style={{ color: C.green }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm leading-tight" style={{ color: C.textMain }}>
          {title}
        </div>
        <div className="text-xs leading-tight mt-0.5" style={{ color: C.textMuted }}>
          {subtitle}
        </div>
      </div>
      {completed ? (
        <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: C.green }} />
      ) : (
        <ChevronRight
          className={`w-4 h-4 shrink-0 transition-transform ${clickable ? "group-hover:translate-x-0.5" : ""}`}
          style={{ color: C.textMuted }}
        />
      )}
    </div>
  );
}

function JobItem({ job, onNavigate }: { job: any; onNavigate: (href: string) => void }) {
  const { t } = useTranslation();
  const publishedText = useMemo(() => {
    if (!job?.datePublication) return "";
    const now = new Date();
    const d = new Date(job.datePublication);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t("dashboard.recommendedJobs.publishedToday");
    if (diffDays === 1) return t("dashboard.recommendedJobs.publishedYesterday");
    return t("dashboard.recommendedJobs.publishedDaysAgo", { days: diffDays });
  }, [job?.datePublication, t]);

  const companyInitial = (job.nomEntreprise || "?").charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onNavigate(`/offre/${job.id}`)}
      className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:shadow-sm hover:border-emerald-300 transition-all group"
      style={{ borderColor: C.border }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold text-white"
        style={{ backgroundColor: C.green }}
      >
        {companyInitial}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-semibold text-sm leading-tight mb-0.5 group-hover:text-emerald-700 transition-colors truncate"
          style={{ color: C.textMain }}
        >
          {job.titre}
        </div>
        <div className="text-xs truncate" style={{ color: C.textMuted }}>
          {job.nomEntreprise || "—"}
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1.5">
          {job.ville && (
            <span className="text-[11px] flex items-center gap-1" style={{ color: C.textMuted }}>
              <MapPin className="w-3 h-3" />
              {job.ville}
            </span>
          )}
          {job.typeContrat && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-5 font-semibold"
              style={{ borderColor: C.border, color: C.textMuted }}
            >
              {job.typeContrat}
            </Badge>
          )}
          {publishedText && (
            <span className="text-[10px]" style={{ color: C.textMuted }}>
              {publishedText}
            </span>
          )}
        </div>
      </div>
      <button
        className="p-1 rounded-lg hover:bg-gray-100 shrink-0 self-start"
        onClick={(e) => e.stopPropagation()}
        aria-label="Bookmark"
      >
        <Bookmark className="w-4 h-4" style={{ color: C.textMuted }} />
      </button>
    </div>
  );
}

function QuickAccessCard({
  icon: Icon,
  title,
  subtitle,
  href,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-4 bg-white rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full"
        style={{ borderColor: "rgba(0, 155, 90, 0.15)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: C.greenSoft }}
        >
          <Icon className="w-5 h-5" style={{ color: C.green }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight mb-0.5 truncate" style={{ color: C.textMain }}>
            {title}
          </div>
          <div className="text-xs leading-tight truncate" style={{ color: C.textMuted }}>
            {subtitle}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: C.textMuted }} />
      </div>
    </Link>
  );
}
