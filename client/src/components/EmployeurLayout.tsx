import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  FileText,
  Gauge,
  Headphones,
  Home,
  LayoutList,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Shell employeur premium — sidebar vert profond + top bar.
 *
 * Utilisation :
 *   <EmployeurLayout title="Tableau de bord" activeKey="dashboard">
 *     <MyPageContent />
 *   </EmployeurLayout>
 *
 * Le composant :
 *  - Guard auth : redirige vers "/" si l'utilisateur n'est pas
 *    employeur ni admin (les admins peuvent naviguer dans l'espace
 *    recruteur pour support/debug).
 *  - Sidebar dark green fixe (260px desktop, drawer mobile) avec
 *    logo + subtitle "Espace recruteur", 7 nav items (Dashboard,
 *    Mes offres, Candidatures, CVthèque, Publier une offre,
 *    Souscriptions, Paramètres), card "Besoin d'aide?" en bas.
 *  - Top bar : title + subtitle page, search ⌘K, bell notif +
 *    LanguageSelector + avatar recruteur avec badge.
 *  - Le "Publier une offre" est mis en avant (fond doré/vert
 *    alterné selon état).
 *
 * i18n : bo.employerLayout.*
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
};

export type EmployeurNavKey =
  | "dashboard"
  | "jobs"
  | "applications"
  | "cvtheque"
  | "postJob"
  | "subscriptions"
  | "settings";

interface EmployeurLayoutProps {
  title: string;
  subtitle?: string;
  activeKey: EmployeurNavKey;
  onRefresh?: () => void;
  children: React.ReactNode;
  /**
   * Actions supplémentaires à afficher dans le top bar
   * (ex : "Publier une offre" en CTA principal).
   */
  actions?: React.ReactNode;
}

interface NavItem {
  key: EmployeurNavKey;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  href: string;
  /**
   * Rend l'item avec fond doré au lieu du fond blanc translucide —
   * utilisé pour le CTA "Publier une offre" pour le mettre en avant.
   */
  highlight?: boolean;
}

export function EmployeurLayout({
  title,
  subtitle,
  activeKey,
  actions,
  children,
}: EmployeurLayoutProps) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Guard : employeur OU admin. Un candidat qui tenterait d'accéder
  // à /employeur/* est renvoyé vers l'accueil.
  useEffect(() => {
    if (!authLoading && (!user || (user.profileType !== "employeur" && user.role !== "admin"))) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err) => toast.error(err.message || "Erreur déconnexion"),
  });

  const { data: employeur } = trpc.employeur.getProfile.useQuery(undefined, {
    enabled: !!user && (user.profileType === "employeur" || user.role === "admin"),
    retry: false,
  });

  const navItems: NavItem[] = [
    { key: "dashboard", labelKey: "bo.employerLayout.nav.dashboard", icon: Gauge, href: "/employeur/dashboard" },
    { key: "jobs", labelKey: "bo.employerLayout.nav.jobs", icon: LayoutList, href: "/employeur/offres" },
    { key: "applications", labelKey: "bo.employerLayout.nav.applications", icon: Users, href: "/employeur/candidatures" },
    { key: "cvtheque", labelKey: "bo.employerLayout.nav.cvtheque", icon: FileText, href: "/cvtheque" },
    { key: "postJob", labelKey: "bo.employerLayout.nav.postJob", icon: Plus, href: "/employeur/publier", highlight: true },
    { key: "subscriptions", labelKey: "bo.employerLayout.nav.subscriptions", icon: Wallet, href: "/employeur/mes-souscriptions" },
    { key: "settings", labelKey: "bo.employerLayout.nav.settings", icon: Settings, href: "/employeur/profil" },
  ];

  const initial = (employeur?.nomEntreprise || user?.name || "R").charAt(0).toUpperCase();
  const displayName = employeur?.nomEntreprise || user?.name;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.bg, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      {/* ═══ SIDEBAR gauche vert profond ═══════════════════════════ */}
      <aside
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static top-0 left-0 z-50 w-[260px] h-screen lg:h-auto lg:min-h-screen flex flex-col overflow-hidden transition-transform`}
        style={{ backgroundColor: C.deepGreen }}
      >
        {/* Halo or discret */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: C.gold }}
        />

        {/* Logo top — cliquable : renvoie sur l'accueil du site public */}
        <div className="relative px-5 py-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLocation("/");
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(246,195,67,0.5)]"
            title={t("bo.employerLayout.topBar.backHome")}
            aria-label={t("bo.employerLayout.topBar.backHome")}
          >
            <img
              src="/logo-cameroon-travail.webp"
              alt="Cameroon Travail"
              className="h-11 w-auto object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="min-w-0">
              <div className="text-white font-extrabold text-[15px] leading-tight">CAMEROON</div>
              <div className="text-white font-extrabold text-[15px] leading-tight">TRAVAIL</div>
              <div className="text-[10px] mt-0.5 uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
                {t("bo.employerLayout.logoSubtitle")}
              </div>
            </div>
          </button>
          <button
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white shrink-0"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="relative flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activeKey;
            const isHighlight = item.highlight;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setLocation(item.href);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative border"
                style={{
                  backgroundColor: active
                    ? "rgba(255,255,255,0.14)"
                    : isHighlight
                      ? C.goldSoft
                      : "transparent",
                  color: active
                    ? "#ffffff"
                    : isHighlight
                      ? C.gold
                      : "rgba(255,255,255,0.75)",
                  borderColor: isHighlight && !active ? "rgba(246, 195, 67, 0.35)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active && !isHighlight) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                  if (isHighlight && !active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(246, 195, 67, 0.25)";
                }}
                onMouseLeave={(e) => {
                  if (!active && !isHighlight) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  if (isHighlight && !active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = C.goldSoft;
                }}
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  style={{ color: active ? C.gold : isHighlight ? C.gold : "rgba(255,255,255,0.75)" }}
                />
                <span className="text-left flex-1">{t(item.labelKey)}</span>
              </button>
            );
          })}
        </nav>

        {/* Card "Besoin d'aide ?" */}
        <div className="relative px-4 pb-4 pt-2">
          <div
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-start gap-2.5 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: C.goldSoft }}
              >
                <Headphones className="h-4 w-4" style={{ color: C.gold }} />
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-[13px] leading-tight">
                  {t("bo.employerLayout.help.title")}
                </p>
                <p className="text-[11px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {t("bo.employerLayout.help.subtitle")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/employeur/profil")}
              className="w-full h-8 rounded-lg text-[11.5px] font-semibold border"
              style={{
                borderColor: "rgba(255,255,255,0.3)",
                color: "#ffffff",
                backgroundColor: "transparent",
              }}
            >
              {t("bo.employerLayout.help.cta")}
            </Button>
          </div>
        </div>

        {/* Footer profil */}
        <div className="relative border-t px-4 py-3 flex items-center gap-2.5" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {(user as any)?.photoUrl ? (
            <img src={(user as any).photoUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ backgroundColor: C.green }}
            >
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-[12.5px] truncate">{displayName}</p>
            <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              {t("bo.employerLayout.topBar.recruiter")}
            </p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="p-1.5 rounded-lg hover:bg-white/10"
            aria-label="Logout"
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ═══ MAIN column ═══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 bg-white border-b"
          style={{ borderColor: C.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)" }}
        >
          <div className="px-4 lg:px-8 h-[72px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="font-bold text-[19px] leading-tight truncate" style={{ color: C.textMain }}>
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[12.5px] mt-0.5 truncate" style={{ color: C.textMuted }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Search desktop */}
              <div className="hidden md:block relative w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: C.textMuted }}
                />
                <input
                  type="text"
                  placeholder={t("bo.employerLayout.topBar.searchPlaceholder")}
                  className="w-full h-10 pl-9 pr-12 rounded-lg text-sm border bg-white focus:outline-none focus:ring-2"
                  style={{ borderColor: C.border, color: C.textMain }}
                />
                <kbd
                  className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] font-mono pointer-events-none"
                  style={{ borderColor: C.border, color: C.textMuted, backgroundColor: C.bg }}
                >
                  ⌘ K
                </kbd>
              </div>

              {/* Custom actions */}
              {actions}

              {/* Retour accueil — renvoie sur la home publique du site */}
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="h-10 rounded-lg font-semibold gap-1.5 hidden sm:inline-flex"
                style={{ borderColor: C.border, color: C.textMain }}
                title={t("bo.employerLayout.topBar.backHome")}
              >
                <Home className="h-4 w-4" />
                <span className="hidden lg:inline">{t("bo.employerLayout.topBar.backHome")}</span>
              </Button>

              {/* Language */}
              <div className="hidden md:block">
                <LanguageSelector />
              </div>

              {/* Bell */}
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100"
                aria-label={t("bo.employerLayout.topBar.notifications")}
              >
                <Bell className="h-5 w-5" style={{ color: C.textMuted }} />
              </button>

              {/* Avatar recruteur */}
              <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: C.border }}>
                <div className="text-right hidden sm:block">
                  <div className="text-[13px] font-semibold truncate max-w-[140px]" style={{ color: C.textMain }}>
                    {displayName}
                  </div>
                  <div className="text-[10.5px] flex items-center gap-1 justify-end" style={{ color: C.green }}>
                    <ShieldCheck className="h-3 w-3" />
                    {t("bo.employerLayout.topBar.recruiter")}
                  </div>
                </div>
                {(user as any)?.photoUrl ? (
                  <img src={(user as any).photoUrl} alt={displayName || "R"} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: C.green }}
                  >
                    {initial}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

// Re-export ChevronDown pour dropdown éventuel
export { ChevronDown };
