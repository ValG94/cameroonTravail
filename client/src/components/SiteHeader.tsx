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
import { Award, User, Users, Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface SiteHeaderProps {
  activePage?: "accueil" | "emplois" | "conseils";
}

export function SiteHeader({ activePage }: SiteHeaderProps) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
    onError: () => {
      // En cas d'erreur serveur, on redirige quand même vers l'accueil
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { label: "Accueil", path: "/", key: "accueil" },
    { label: "Emplois", path: "/offres", key: "emplois" },
    { label: "Conseils", path: "/conseils", key: "conseils" },
  ];

  return (
    <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50" style={{ height: '100px' }}>
      <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between relative">

        {/* Logo */}
        <div className="shrink-0">
          <img
            src="/logo-cameroon-travail.webp"
            alt="Cameroon Travail"
            className="cursor-pointer object-contain site-header-logo"
            onClick={() => setLocation("/")}
          />
        </div>

        {/* Nav centrée — desktop */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => setLocation(link.path)}
              className={`transition-colors pb-0.5 ${
                activePage === link.key || location === link.path
                  ? "text-green-700 font-semibold border-b-2 border-green-700"
                  : "hover:text-green-700"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Droite : langue + user */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {!authLoading && !user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => setLocation("/connexion")}
              >
                {t("common.login")}
              </Button>
              <Button
                size="sm"
                className="bg-green-700 hover:bg-green-800 text-white"
                onClick={() => setLocation("/inscription")}
              >
                {t("common.register")}
              </Button>
            </>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {(user as any).photoUrl ? (
                    <img
                      src={(user as any).photoUrl}
                      alt={user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden md:block font-medium text-gray-900 text-sm">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    if (user.profileType === "candidat") setLocation("/candidat/dashboard");
                    else if (user.profileType === "employeur") setLocation("/employeur/dashboard");
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{t("nav.dashboard")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (user.profileType === "candidat") setLocation("/candidat/profil");
                    else if (user.profileType === "employeur" || user.role === "admin") setLocation("/employeur/profil");
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("nav.myProfile")}</span>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => setLocation("/admin/dashboard")}>
                    <Award className="mr-2 h-4 w-4" />
                    <span>Administration</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="text-red-600"
                >
                  <span>{logoutMutation.isPending ? "Déconnexion..." : t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Burger menu mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg px-4 py-3 flex flex-col gap-2">
          {navLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => { setLocation(link.path); setMobileMenuOpen(false); }}
              className={`text-left py-2 text-sm font-medium ${
                location === link.path ? "text-green-700 font-semibold" : "text-gray-700"
              }`}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 border-t">
            <LanguageSelector />
          </div>
          {!authLoading && !user && (
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => { setLocation("/connexion"); setMobileMenuOpen(false); }}
            >
              {t("common.login")}
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
