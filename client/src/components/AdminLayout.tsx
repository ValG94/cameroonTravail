import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  ChevronDown,
  Crown,
  ExternalLink,
  FileText,
  Gauge,
  LogOut,
  Menu,
  Newspaper,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Shell admin premium — matche la maquette :
 *  - Sidebar vert profond fixe à gauche (240px desktop) :
 *      logo Cameroon Travail + subtitle "L'emploi pour tous"
 *      nav items (Dashboard / Utilisateurs / Offres / Articles /
 *      Formules / Souscriptions / Alertes / Paramètres)
 *      card premium en bas
 *      footer copyright
 *  - Top bar sticky en haut :
 *      titre page + subtitle, search ⌘K, boutons Actualiser +
 *      Retour au site, bell notif, avatar admin
 *  - Slot children = contenu de la page
 *
 * Utilisation :
 *   <AdminLayout title="Articles Conseils" subtitle="Gérez la bibliothèque…" activeKey="articles">
 *     <MyPageContent />
 *   </AdminLayout>
 *
 * Guard : redirige vers "/" si l'utilisateur n'est pas admin.
 * i18n : bo.adminLayout.*
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

export type AdminNavKey =
  | "dashboard"
  | "users"
  | "jobs"
  | "articles"
  | "formules"
  | "subscriptions"
  | "alerts"
  | "settings";

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  activeKey: AdminNavKey;
  onRefresh?: () => void;
  children: React.ReactNode;
  /**
   * Actions supplémentaires à afficher dans le top bar à côté de
   * "Actualiser" / "Retour au site" (ex : bouton "Nouvel article").
   */
  actions?: React.ReactNode;
}

interface NavItem {
  key: AdminNavKey;
  labelKey: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  href: string;
  badge?: number;
}

export function AdminLayout({
  title,
  subtitle,
  activeKey,
  onRefresh,
  actions,
  children,
}: AdminLayoutProps) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Guard — seuls les admins accèdent
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err) => toast.error(err.message || "Erreur déconnexion"),
  });

  // Badge alertes/souscriptions — à brancher si besoin plus tard
  // sur un endpoint dédié admin.getPendingCount.
  const alertsBadge = 0;

  const navItems: NavItem[] = [
    { key: "dashboard", labelKey: "bo.adminLayout.nav.dashboard", icon: Gauge, href: "/admin/dashboard" },
    { key: "users", labelKey: "bo.adminLayout.nav.users", icon: Users, href: "/admin/dashboard#users" },
    { key: "jobs", labelKey: "bo.adminLayout.nav.jobs", icon: FileText, href: "/admin/dashboard#jobs" },
    { key: "articles", labelKey: "bo.adminLayout.nav.articles", icon: Newspaper, href: "/admin/articles" },
    { key: "formules", labelKey: "bo.adminLayout.nav.formules", icon: Sparkles, href: "/admin/dashboard#formules" },
    { key: "subscriptions", labelKey: "bo.adminLayout.nav.subscriptions", icon: Wallet, href: "/admin/souscriptions", badge: alertsBadge },
    { key: "alerts", labelKey: "bo.adminLayout.nav.alerts", icon: Bell, href: "/admin/dashboard#alerts" },
    { key: "settings", labelKey: "bo.adminLayout.nav.settings", icon: Settings, href: "/admin/dashboard#settings" },
  ];

  const initial = user?.name?.charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.bg, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      {/* ═══ SIDEBAR gauche (vert profond) ══════════════════════════════ */}
      <aside
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static top-0 left-0 z-50 w-[260px] h-screen lg:h-auto lg:min-h-screen flex flex-col overflow-hidden transition-transform`}
        style={{ backgroundColor: C.deepGreen }}
      >
        {/* Filigrane halo or top-right */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ backgroundColor: C.gold }}
        />

        {/* Logo top */}
        <div className="relative px-5 py-6 flex items-center gap-3">
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
              {t("bo.adminLayout.logoSubtitle")}
            </div>
          </div>
          {/* Mobile close button */}
          <button
            className="lg:hidden ml-auto p-1.5 rounded-lg hover:bg-white/10 text-white"
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
            return (
              <button
                key={item.key}
                onClick={() => {
                  setLocation(item.href);
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative"
                style={{
                  backgroundColor: active ? "rgba(255,255,255,0.14)" : "transparent",
                  color: active ? "#ffffff" : "rgba(255,255,255,0.75)",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                <Icon className="h-4 w-4 shrink-0" style={{ color: active ? C.gold : "rgba(255,255,255,0.75)" }} />
                <span className="text-left flex-1">{t(item.labelKey)}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center"
                    style={{ backgroundColor: C.gold, color: C.deepGreen }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Card Premium bottom */}
        <div className="relative px-4 pb-4 pt-2">
          <div
            className="relative rounded-2xl border p-4 text-center overflow-hidden"
            style={{ backgroundColor: "rgba(0,0,0,0.25)", borderColor: C.gold }}
          >
            <div
              aria-hidden="true"
              className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-30 pointer-events-none"
              style={{ backgroundColor: C.gold }}
            />
            <div
              className="relative w-11 h-11 mx-auto mb-2 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(246, 195, 67, 0.15)" }}
            >
              <Crown className="h-5 w-5" style={{ color: C.gold }} />
            </div>
            <h4 className="relative text-white font-bold text-[13.5px] leading-snug mb-1">
              {t("bo.adminLayout.premium.title")}
            </h4>
            <p className="relative text-[11.5px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.7)" }}>
              {t("bo.adminLayout.premium.subtitle")}
            </p>
            <Link href="/espace-recruteur">
              <Button
                className="relative w-full font-semibold rounded-lg h-8 text-[11.5px] hover:opacity-90"
                style={{ backgroundColor: C.gold, color: C.deepGreen }}
              >
                {t("bo.adminLayout.premium.cta")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer copyright */}
        <div className="relative px-4 py-3 text-[10px] text-center border-t" style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          {t("bo.adminLayout.footer")}
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

      {/* ═══ MAIN column ═══════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 bg-white border-b"
          style={{ borderColor: C.border, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)" }}
        >
          <div className="px-4 lg:px-8 h-[72px] flex items-center justify-between gap-4">
            {/* Left : mobile menu + title */}
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

            {/* Right : search + refresh + back + language + bell + avatar */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search desktop */}
              <div className="hidden md:block relative w-56">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: C.textMuted }}
                />
                <input
                  type="text"
                  placeholder={t("bo.adminLayout.topBar.searchPlaceholder")}
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

              {/* Refresh button */}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="h-10 rounded-lg hidden sm:inline-flex"
                  style={{ borderColor: C.border }}
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  {t("bo.adminLayout.topBar.refresh")}
                </Button>
              )}

              {/* Back to site */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/")}
                className="h-10 rounded-lg hidden sm:inline-flex"
                style={{ borderColor: C.border }}
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                {t("bo.adminLayout.topBar.backToSite")}
              </Button>

              {/* Custom actions (e.g. "New article") */}
              {actions}

              {/* Language selector — compact */}
              <div className="hidden md:block">
                <LanguageSelector />
              </div>

              {/* Bell notification */}
              <button
                className="relative p-2 rounded-lg hover:bg-gray-100"
                aria-label={t("bo.adminLayout.topBar.notifications")}
              >
                <Bell className="h-5 w-5" style={{ color: C.textMuted }} />
                {alertsBadge > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: C.green }}
                  >
                    {alertsBadge}
                  </span>
                )}
              </button>

              {/* Avatar */}
              <div className="flex items-center gap-2 pl-2 border-l" style={{ borderColor: C.border }}>
                <div className="text-right hidden sm:block">
                  <div className="text-[13px] font-semibold" style={{ color: C.textMain }}>
                    {user?.name}
                  </div>
                  <div className="text-[10.5px] flex items-center gap-1 justify-end" style={{ color: C.green }}>
                    <ShieldCheck className="h-3 w-3" />
                    {t("bo.adminLayout.topBar.administrator")}
                  </div>
                </div>
                {(user as any)?.photoUrl ? (
                  <img
                    src={(user as any).photoUrl}
                    alt={user?.name || "Admin"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: C.green }}
                    aria-hidden="true"
                  >
                    {initial}
                  </div>
                )}
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="p-1.5 rounded-lg hover:bg-gray-100 hidden sm:inline-flex"
                  aria-label="Logout"
                  title="Déconnexion"
                >
                  <LogOut className="h-4 w-4" style={{ color: C.textMuted }} />
                </button>
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

// Named export ChevronDown pour usage éventuel dans les sous-menus
export { ChevronDown };
