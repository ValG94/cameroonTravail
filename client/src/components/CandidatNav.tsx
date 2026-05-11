import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  Briefcase,
  Building2,
  Crown,
  FileText,
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

export function CandidatNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { href: "/candidat/dashboard", label: "Tableau de bord", icon: User },
    { href: "/emploi-public", label: "Emploi Public", icon: Building2 },
    { href: "/emploi-prive", label: "Emploi Privé", icon: Briefcase },
    { href: "/candidat/candidatures", label: "Mes candidatures", icon: FileText },
    { href: "/deposer-cv", label: "Déposer mon CV", icon: Upload },
    { href: "/candidat/templates", label: "Modèles Premium", icon: Crown },
    { href: "/candidat/alertes", label: "Alertes", icon: Bell },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logo_4636448b.png" alt="Cameroon Travail" className="h-10" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            <div className="text-sm text-gray-600">{user?.name}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("common.logout")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </Link>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-600">{user?.name}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("common.logout")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
