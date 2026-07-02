import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  Briefcase,
  ChevronDown,
  Crown,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Upload,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

/**
 * Navigation candidat connecté — refonte premium.
 *
 * Différences vs version précédente :
 * - Suppression des liens 'Emploi Public' et 'Emploi Privé' (le site
 *   se concentre uniquement sur l'emploi privé)
 * - Un seul lien 'Offres' à la place, qui pointe vers /offres
 * - Ajout d'un badge sur la cloche alertes (nombre d'alertes actives)
 * - Avatar utilisateur avec dropdown (nom, email, cadenas Admin si
 *   applicable, mon compte, déconnexion) au lieu du texte + bouton
 *   logout séparé
 * - Header 72px blanc premium avec filet or et lien actif vert clair
 * - Menu mobile plus soigné
 */

const COLORS = {
  green: "#009B5A",
  deepGreen: "#063F24",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

export function CandidatNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compteur d'alertes actives pour le badge sur la cloche.
  // Fallback silencieux si la query n'est pas dispo.
  const { data: alertesData } = trpc.alertes.list.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });
  const activeAlertsCount = Array.isArray(alertesData)
    ? alertesData.filter((a: any) => a.active).length
    : 0;

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Navigation principale. 'Emploi Public/Privé' remplacés par 'Offres'.
  const navItems = [
    { href: "/candidat/dashboard", label: t("dashboard.nav.dashboard"), icon: LayoutDashboard },
    { href: "/offres", label: t("dashboard.nav.jobs"), icon: Briefcase },
    { href: "/candidat/candidatures", label: t("dashboard.nav.applications"), icon: FileText },
    { href: "/deposer-cv", label: t("dashboard.nav.uploadCv"), icon: Upload },
    { href: "/candidat/templates", label: t("dashboard.nav.premiumTemplates"), icon: Crown },
    { href: "/candidat/alertes", label: t("dashboard.nav.alerts"), icon: Bell },
  ];

  const isActive = (href: string) => location === href;
  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <nav
      className="bg-white sticky top-0 z-50 border-b relative"
      style={{ borderColor: COLORS.border, fontFamily: "'Manrope', 'Inter', sans-serif" }}
    >
      {/* Filet or subtil en haut pour l'identité */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.gold} 50%, transparent 100%)`,
          opacity: 0.4,
        }}
      />
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo-cameroon-travail.webp"
              alt="Cameroon Travail"
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-3xl mx-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer"
                    style={{
                      backgroundColor: active ? COLORS.greenSoft : "transparent",
                      color: active ? COLORS.deepGreen : "rgb(75, 85, 99)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLSpanElement).style.backgroundColor = "rgb(243, 244, 246)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLSpanElement).style.backgroundColor = "transparent";
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguageSelector />

            {/* Cloche alertes avec badge */}
            <Link href="/candidat/alertes">
              <button
                className="relative p-2 rounded-full transition-colors hover:bg-gray-100"
                aria-label={t("dashboard.nav.alerts")}
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {activeAlertsCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: COLORS.green }}
                  >
                    {activeAlertsCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <div
                    className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm shrink-0"
                    style={{ backgroundColor: COLORS.green }}
                  >
                    {initial}
                  </div>
                  <div className="text-left hidden xl:block">
                    <div className="text-sm font-semibold text-gray-900 leading-tight">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500 leading-tight">
                      {t("dashboard.nav.myAccount")}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <div className="px-2 py-2.5 border-b">
                  <div className="font-semibold text-sm text-gray-900 truncate">{user?.name}</div>
                  {user?.email && (
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  )}
                  {user?.role === "admin" && (
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider mt-1"
                      style={{ color: COLORS.green }}
                    >
                      Super Admin
                    </div>
                  )}
                </div>
                {user?.role === "admin" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setLocation("/admin/dashboard")}
                      className="font-semibold"
                      style={{ color: COLORS.green }}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={() => setLocation("/candidat/profil")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("dashboard.nav.myAccount")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("dashboard.nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t" style={{ borderColor: COLORS.border }}>
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                      style={{
                        backgroundColor: active ? COLORS.greenSoft : "transparent",
                        color: active ? COLORS.deepGreen : "rgb(75, 85, 99)",
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                      {item.href === "/candidat/alertes" && activeAlertsCount > 0 && (
                        <span
                          className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                          style={{ backgroundColor: COLORS.green }}
                        >
                          {activeAlertsCount}
                        </span>
                      )}
                    </span>
                  </Link>
                );
              })}
              <div className="border-t pt-3 mt-2 space-y-1" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div
                    className="w-9 h-9 rounded-full text-white flex items-center justify-center font-semibold text-sm shrink-0"
                    style={{ backgroundColor: COLORS.green }}
                  >
                    {initial}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{user?.name}</div>
                    {user?.email && (
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    )}
                  </div>
                </div>
                <LanguageSelector />
                {user?.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <span
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer"
                      style={{ color: COLORS.green }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Lock className="h-4 w-4" />
                      Admin
                    </span>
                  </Link>
                )}
                <Link href="/candidat/profil">
                  <span
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    {t("dashboard.nav.myAccount")}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("dashboard.nav.logout")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
