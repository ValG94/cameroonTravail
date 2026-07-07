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
import { Briefcase, Lock, Menu, User, Users, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

/**
 * Header global — utilisé sur toutes les pages publiques pour cohérence.
 *
 * Identité : fond blanc translucide sticky pour la lisibilité, accents
 * vert profond (#063F24) et or (#F6C343) en cohérence avec la homepage
 * refondue et le SiteFooter.
 *
 * - Lien actif : texte vert profond + soulignement or
 * - Hover liens : vert profond
 * - Bouton "S'inscrire" : vert profond institutionnel
 * - Bouton "Connexion" : outline gris avec hover or
 * - Logo : webp local /logo-cameroon-travail.webp
 */

const COLORS = {
  deepGreen: "#063F24",
  emerald: "#0F8A4C",
  gold: "#F6C343",
};

interface SiteHeaderProps {
  activePage?: "accueil" | "emplois" | "conseils" | "creer-cv";
}

export function SiteHeader({ activePage }: SiteHeaderProps) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => setLocation("/"),
    onError: () => setLocation("/"),
  });

  const navLinks = [
    { label: t("nav.home"), path: "/", key: "accueil" },
    { label: t("nav.jobs"), path: "/offres", key: "emplois" },
    { label: t("nav.advice"), path: "/conseils", key: "conseils" },
    { label: t("nav.createCv"), path: "/candidat/cv", key: "creer-cv" },
  ];

  const isActive = (link: typeof navLinks[0]) =>
    activePage === link.key || location === link.path;

  /**
   * Route de destination du bouton "Espace recruteur" :
   *  - user connecté employeur ou admin → son dashboard
   *  - sinon (non-connecté ou candidat) → page publique /espace-recruteur
   */
  const recruiterHref =
    user?.profileType === "employeur" || user?.role === "admin"
      ? "/employeur/dashboard"
      : "/espace-recruteur";

  return (
    <header
      className="border-b border-gray-100 bg-white/95 backdrop-blur-xl sticky top-0 z-50"
      style={{ height: "100px", fontFamily: "'Manrope', 'Inter', sans-serif" }}
    >
      {/* Filet or très subtil en haut pour l'identité */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.gold} 50%, transparent 100%)`,
          opacity: 0.5,
        }}
      />

      <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between relative">
        {/* ─── Logo ──────────────────────────────────────────────────── */}
        <div className="shrink-0">
          <img
            src="/logo-cameroon-travail.webp"
            alt="Cameroon Travail"
            className="cursor-pointer object-contain site-header-logo"
            onClick={() => setLocation("/")}
          />
        </div>

        {/* ─── Nav centrée — desktop ─────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-semibold absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <button
                key={link.key}
                onClick={() => setLocation(link.path)}
                className="relative py-2 transition-colors group"
                style={{
                  color: active ? COLORS.deepGreen : "rgb(75, 85, 99)",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = COLORS.deepGreen;
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLButtonElement).style.color = "rgb(75, 85, 99)";
                }}
              >
                {link.label}
                {/* Soulignement or pour l'actif */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 right-0 h-[3px] rounded-full"
                    style={{ backgroundColor: COLORS.gold }}
                  />
                )}
                {/* Soulignement hover (invisible par défaut) */}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 right-0 h-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundColor: COLORS.gold,
                    opacity: active ? 0 : undefined,
                  }}
                />
              </button>
            );
          })}
        </nav>

        {/* ─── Droite : langue + user/auth ───────────────────────────── */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Bouton Espace recruteur — desktop uniquement, toujours
              visible (connecté ou non). Redirige vers dashboard
              employeur si l'utilisateur EST un recruteur/admin,
              sinon vers la page publique /espace-recruteur. */}
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:inline-flex font-semibold gap-2 transition-colors"
            style={
              {
                borderColor: COLORS.emerald,
                color: COLORS.deepGreen,
                backgroundColor: "transparent",
              } as React.CSSProperties
            }
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(0, 155, 90, 0.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
            onClick={() => setLocation(recruiterHref)}
          >
            <Briefcase className="h-4 w-4" />
            {t("nav.recruiterSpace")}
          </Button>

          {!authLoading && !user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex border-gray-300 hover:border-[color:var(--gold)] hover:text-[color:var(--green)] hover:bg-[color:var(--gold-soft)] transition-colors"
                style={
                  {
                    ["--gold" as string]: COLORS.gold,
                    ["--gold-soft" as string]: "rgba(246, 195, 67, 0.10)",
                    ["--green" as string]: COLORS.deepGreen,
                  } as React.CSSProperties
                }
                onClick={() => setLocation("/connexion")}
              >
                {t("common.login")}
              </Button>
              <Button
                size="sm"
                className="font-semibold text-white shadow-sm hover:shadow-md transition-all"
                style={{ backgroundColor: COLORS.deepGreen }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.emerald;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = COLORS.deepGreen;
                }}
                onClick={() => setLocation("/inscription")}
              >
                {t("common.register")}
              </Button>
            </>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  {(user as { photoUrl?: string }).photoUrl ? (
                    <img
                      src={(user as { photoUrl?: string }).photoUrl}
                      alt={user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-sm"
                      style={{ backgroundColor: COLORS.emerald }}
                    >
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="hidden md:block font-medium text-gray-900 text-sm">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                {/* Bloc identité — nom + email + rôle Admin si applicable
                    (inspiré du pattern PaieCashFan). Aide l'admin à
                    identifier immédiatement qu'il est en mode Admin. */}
                <div className="px-2 py-2.5 border-b">
                  <div className="font-semibold text-sm text-gray-900 truncate">{user.name}</div>
                  {user.email && (
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  )}
                  {user.role === "admin" && (
                    <div
                      className="text-[10px] font-bold uppercase tracking-wider mt-1"
                      style={{ color: COLORS.emerald }}
                    >
                      Super Admin
                    </div>
                  )}
                </div>

                {/* Lien Admin AVEC CADENAS — placé en haut du menu
                    pour être immédiatement accessible, cohérent avec la
                    maquette PaieCashFan fournie par l'utilisateur. */}
                {user.role === "admin" && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setLocation("/admin/dashboard")}
                      className="font-semibold"
                      style={{ color: COLORS.emerald }}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      <span>{t("nav.administration")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

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
                    else if (user.profileType === "employeur" || user.role === "admin")
                      setLocation("/employeur/profil");
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("nav.myProfile")}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="text-red-600"
                >
                  <span>{logoutMutation.isPending ? t("nav.logoutInProgress") : t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={t("nav.mobileMenu")}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── Menu mobile déroulant ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = isActive(link);
            return (
              <button
                key={link.key}
                onClick={() => {
                  setLocation(link.path);
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  color: active ? COLORS.deepGreen : "rgb(55, 65, 81)",
                  backgroundColor: active ? "rgba(246, 195, 67, 0.12)" : "transparent",
                }}
              >
                {link.label}
              </button>
            );
          })}
          <div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between">
            <LanguageSelector />
          </div>
          {/* Espace recruteur — toujours accessible depuis le mobile */}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full font-semibold gap-2"
            style={{ borderColor: COLORS.emerald, color: COLORS.deepGreen }}
            onClick={() => {
              setLocation(recruiterHref);
              setMobileMenuOpen(false);
            }}
          >
            <Briefcase className="h-4 w-4" />
            {t("nav.recruiterSpace")}
          </Button>
          {!authLoading && !user && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="mt-1.5 w-full border-gray-300"
                onClick={() => {
                  setLocation("/connexion");
                  setMobileMenuOpen(false);
                }}
              >
                {t("common.login")}
              </Button>
              <Button
                size="sm"
                className="mt-1.5 w-full text-white font-semibold"
                style={{ backgroundColor: COLORS.deepGreen }}
                onClick={() => {
                  setLocation("/inscription");
                  setMobileMenuOpen(false);
                }}
              >
                {t("common.register")}
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
