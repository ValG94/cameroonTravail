import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { BookOpen, Briefcase, FileText, LayoutDashboard, LogOut, Users, User, ChevronDown, Wallet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function EmployeurNav() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerNav.logoutSuccess"));
      window.location.href = "/";
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const navItems = [
    { path: "/employeur/dashboard", label: t("bo.employerNav.dashboard"), icon: LayoutDashboard },
    { path: "/employeur/offres", label: t("bo.employerNav.myJobs"), icon: Briefcase },
    { path: "/employeur/candidatures", label: t("bo.employerNav.applications"), icon: Users },
    { path: "/cvtheque", label: t("bo.employerNav.cvtheque"), icon: BookOpen },
    { path: "/employeur/publier", label: t("bo.employerNav.postJob"), icon: FileText },
  ];

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => setLocation("/")} className="flex items-center gap-2">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logocameroonTravail_ed569233.png" alt="Cameroon Travail" className="h-10" />
            </button>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-auto py-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || "E"}
                  </div>
                  <span className="text-sm text-gray-700 hidden md:block">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/employeur/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t("bo.employerNav.dashboard")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/employeur/profil")}>
                  <User className="mr-2 h-4 w-4" />
                  {t("bo.employerNav.myProfile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/employeur/mes-souscriptions")}>
                  <Wallet className="mr-2 h-4 w-4" />
                  {t("bo.employerNav.mySubscriptions")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("bo.employerNav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
