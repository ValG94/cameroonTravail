import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Users,
  Briefcase,
  FileText,
  Bell,
  TrendingUp,
  Building2,
  Globe,
  Lock,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  BarChart3,
  Shield,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  BookOpen,
  Star,
  StarOff,
  Plus,
  Pencil,
  X,
  CreditCard,
} from "lucide-react";
import AdminFormules from "./AdminFormules";
import { useState as useStateLocal } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { toast } from "sonner";

// ─── Couleurs des graphiques ────────────────────────────────────────────────
const COLORS_STATUT = {
  publiees: "#16a34a",
  expirees: "#dc2626",
  pourvues: "#d97706",
  brouillons: "#6b7280",
};

const COLORS_PIE = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];

const COLORS_CAND = {
  en_attente: "#6b7280",
  vue: "#2563eb",
  retenue: "#16a34a",
  rejetee: "#dc2626",
  entretien: "#7c3aed",
};

const LABELS_CAND: Record<string, string> = {
  en_attente: "En attente",
  vue: "Vue",
  retenue: "Retenue",
  rejetee: "Rejetée",
  entretien: "Entretien",
};

// ─── Composant carte statistique ────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; label: string };
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString("fr-FR")}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600 font-medium">+{trend.value}</span>
                <span className="text-xs text-gray-500">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Composant tableau utilisateurs ─────────────────────────────────────────
function UsersTable() {
  const [page, setPage] = useState(0);
  const limit = 10;
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.recentUsers.useQuery({ limit, offset: page * limit });

  const setRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      utils.admin.recentUsers.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const profileTypeLabels: Record<string, string> = {
    candidat: "Candidat",
    employeur: "Employeur",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Utilisateurs récents
        </CardTitle>
        <CardDescription>{data?.total ?? "—"} utilisateurs inscrits au total</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold text-gray-600">Nom</th>
                    <th className="pb-3 font-semibold text-gray-600">Email</th>
                    <th className="pb-3 font-semibold text-gray-600">Profil</th>
                    <th className="pb-3 font-semibold text-gray-600">Rôle</th>
                    <th className="pb-3 font-semibold text-gray-600">Inscrit le</th>
                    <th className="pb-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{user.name || "—"}</td>
                      <td className="py-3 text-gray-600 max-w-[200px] truncate">{user.email || "—"}</td>
                      <td className="py-3">
                        {user.profileType ? (
                          <Badge
                            variant="secondary"
                            className={
                              user.profileType === "candidat"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }
                          >
                            {profileTypeLabels[user.profileType] ?? user.profileType}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant="secondary"
                          className={
                            user.role === "admin"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }
                        >
                          {user.role === "admin" ? "Admin" : "Utilisateur"}
                        </Badge>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="py-3">
                        {user.role !== "admin" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7"
                            onClick={() => setRoleMutation.mutate({ userId: user.id, role: "admin" })}
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Promouvoir admin
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 text-gray-500"
                            onClick={() => setRoleMutation.mutate({ userId: user.id, role: "user" })}
                          >
                            Rétrograder
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">
                  Page {page + 1} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Composant tableau offres ────────────────────────────────────────────────
function OffresTable() {
  const [page, setPage] = useState(0);
  const limit = 10;
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.recentOffres.useQuery({ limit, offset: page * limit });

  const deleteMutation = trpc.admin.deleteOffre.useMutation({
    onSuccess: () => {
      toast.success("Offre supprimée");
      utils.admin.recentOffres.invalidate();
      utils.admin.stats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const statutConfig: Record<string, { label: string; className: string }> = {
    publiee: { label: "Publiée", className: "bg-green-100 text-green-700" },
    expiree: { label: "Expirée", className: "bg-red-100 text-red-700" },
    pourvue: { label: "Pourvu", className: "bg-amber-100 text-amber-700" },
    brouillon: { label: "Brouillon", className: "bg-gray-100 text-gray-600" },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-green-600" />
          Offres d'emploi récentes
        </CardTitle>
        <CardDescription>{data?.total ?? "—"} offres au total</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-semibold text-gray-600">Titre</th>
                    <th className="pb-3 font-semibold text-gray-600">Entreprise</th>
                    <th className="pb-3 font-semibold text-gray-600">Type</th>
                    <th className="pb-3 font-semibold text-gray-600">Statut</th>
                    <th className="pb-3 font-semibold text-gray-600">Candidatures</th>
                    <th className="pb-3 font-semibold text-gray-600">Publié le</th>
                    <th className="pb-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.offres.map((offre) => {
                    const sc = statutConfig[offre.statut] ?? { label: offre.statut, className: "bg-gray-100 text-gray-600" };
                    return (
                      <tr key={offre.id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <a
                            href={`/offre/${offre.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-900 hover:text-green-600 transition-colors max-w-[200px] block truncate"
                          >
                            {offre.titre}
                          </a>
                        </td>
                        <td className="py-3 text-gray-600 max-w-[150px] truncate">
                          {offre.nomEntreprise ?? "—"}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="secondary"
                            className={
                              offre.typeOffre === "public"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }
                          >
                            {offre.typeOffre === "public" ? "Public" : "Privé"}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${sc.className}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="py-3 text-center font-medium text-gray-700">
                          {offre.nombreCandidatures ?? 0}
                        </td>
                        <td className="py-3 text-gray-500 text-xs">
                          {new Date(offre.datePublication).toLocaleDateString("fr-FR")}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <a href={`/offre/${offre.id}`} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:border-red-300"
                              onClick={() => {
                                if (confirm(`Supprimer l'offre "${offre.titre}" ?`)) {
                                  deleteMutation.mutate({ id: offre.id });
                                }
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">
                  Page {page + 1} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "offres" | "articles" | "formules">("overview");

  const { data: stats, isLoading: statsLoading, refetch } = trpc.admin.stats.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  // Redirection si non admin
  if (!authLoading && (!user || user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  // Données pour les graphiques
  const dataStatutOffres = stats
    ? [
        { name: "Publiées", value: stats.offresParStatut.publiees, fill: COLORS_STATUT.publiees },
        { name: "Expirées", value: stats.offresParStatut.expirees, fill: COLORS_STATUT.expirees },
        { name: "Pourvues", value: stats.offresParStatut.pourvues, fill: COLORS_STATUT.pourvues },
        { name: "Brouillons", value: stats.offresParStatut.brouillons, fill: COLORS_STATUT.brouillons },
      ]
    : [];

  const dataTypeOffres = stats
    ? [
        { name: "Emploi Public", value: stats.offresParType.public, fill: "#16a34a" },
        { name: "Emploi Privé", value: stats.offresParType.prive, fill: "#2563eb" },
      ]
    : [];

  const dataCandidatures = stats
    ? stats.candidaturesParStatut.map((c) => ({
        name: LABELS_CAND[c.statut] ?? c.statut,
        value: c.count,
        fill: COLORS_CAND[c.statut as keyof typeof COLORS_CAND] ?? "#6b7280",
      }))
    : [];

  const dataSecteurs = stats
    ? stats.topSecteurs.map((s) => ({
        name: s.secteur ?? "Non défini",
        offres: s.count,
      }))
    : [];

  const dataRegions = stats
    ? stats.topRegions.map((r) => ({
        name: r.region ?? "Non défini",
        offres: r.count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Shield className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Administration</h1>
                <p className="text-xs text-gray-500">Cameroon Travail</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/")}
              >
                ← Retour au site
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation onglets */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            {[
              { key: "overview", label: "Vue d'ensemble", icon: BarChart3 },
              { key: "users", label: "Utilisateurs", icon: Users },
              { key: "offres", label: "Offres d'emploi", icon: Briefcase },
              { key: "articles", label: "Articles Conseils", icon: BookOpen },
              { key: "formules", label: "Formules tarifaires", icon: CreditCard },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Vue d'ensemble ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Cartes KPI */}
            {statsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6 h-28 bg-gray-100 rounded" />
                  </Card>
                ))}
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  <StatCard
                    title="Utilisateurs inscrits"
                    value={stats.totaux.utilisateurs}
                    icon={Users}
                    color="bg-blue-500"
                    trend={{ value: stats.tendances.newUsers7d, label: "cette semaine" }}
                  />
                  <StatCard
                    title="Candidats"
                    value={stats.totaux.candidats}
                    icon={FileText}
                    color="bg-indigo-500"
                    subtitle={`${stats.tendances.newUsers30d} nouveaux ce mois`}
                  />
                  <StatCard
                    title="Employeurs"
                    value={stats.totaux.employeurs}
                    icon={Building2}
                    color="bg-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  <StatCard
                    title="Offres d'emploi"
                    value={stats.totaux.offres}
                    icon={Briefcase}
                    color="bg-green-500"
                    trend={{ value: stats.tendances.newOffres7d, label: "cette semaine" }}
                  />
                  <StatCard
                    title="Candidatures"
                    value={stats.totaux.candidatures}
                    icon={FileText}
                    color="bg-orange-500"
                    trend={{ value: stats.tendances.newCandidatures7d, label: "cette semaine" }}
                  />
                  <StatCard
                    title="Alertes actives"
                    value={stats.totaux.alertes}
                    icon={Bell}
                    color="bg-pink-500"
                  />
                </div>

                {/* Tendances 30 jours */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Nouveaux utilisateurs", value: stats.tendances.newUsers30d, icon: Users, color: "text-blue-600 bg-blue-50" },
                    { label: "Nouvelles offres", value: stats.tendances.newOffres30d, icon: Briefcase, color: "text-green-600 bg-green-50" },
                    { label: "Nouvelles candidatures", value: stats.tendances.newCandidatures30d, icon: FileText, color: "text-orange-600 bg-orange-50" },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label} className="border-dashed">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">+{value}</p>
                          <p className="text-sm text-gray-500">{label} ces 30 derniers jours</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Statut des offres */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Répartition des offres par statut</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dataStatutOffres} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" name="Offres" radius={[4, 4, 0, 0]}>
                            {dataStatutOffres.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Public vs Privé */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Emploi public vs privé</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={dataTypeOffres}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {dataTypeOffres.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [`${v} offres`]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Candidatures par statut */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Candidatures par statut</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dataCandidatures.length === 0 ? (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                          Aucune candidature pour le moment
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie
                              data={dataCandidatures}
                              cx="50%"
                              cy="50%"
                              outerRadius={85}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {dataCandidatures.map((entry, index) => (
                                <Cell key={index} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v, name) => [`${v}`, name]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top secteurs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Top secteurs d'activité</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dataSecteurs.length === 0 ? (
                        <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
                          Aucune donnée disponible
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={dataSecteurs}
                            layout="vertical"
                            margin={{ top: 5, right: 10, left: 80, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                            <Tooltip />
                            <Bar dataKey="offres" name="Offres" fill="#16a34a" radius={[0, 4, 4, 0]}>
                              {dataSecteurs.map((_, index) => (
                                <Cell key={index} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Top régions */}
                {dataRegions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Offres par région</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dataRegions} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="offres" name="Offres" fill="#2563eb" radius={[4, 4, 0, 0]}>
                            {dataRegions.map((_, index) => (
                              <Cell key={index} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Résumé statuts offres */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Offres publiées", value: stats.offresParStatut.publiees, icon: CheckCircle, className: "text-green-600 bg-green-50" },
                    { label: "Offres expirées", value: stats.offresParStatut.expirees, icon: XCircle, className: "text-red-600 bg-red-50" },
                    { label: "Postes pourvus", value: stats.offresParStatut.pourvues, icon: CheckCircle, className: "text-amber-600 bg-amber-50" },
                    { label: "Brouillons", value: stats.offresParStatut.brouillons, icon: Clock, className: "text-gray-600 bg-gray-50" },
                  ].map(({ label, value, icon: Icon, className }) => (
                    <Card key={label}>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${className}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">{value}</p>
                          <p className="text-xs text-gray-500">{label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Impossible de charger les statistiques</p>
              </div>
            )}
          </div>
        )}

        {/* ── Onglet Utilisateurs ── */}
        {activeTab === "users" && <UsersTable />}

        {/* ── Onglet Offres ── */}
        {activeTab === "offres" && <OffresTable />}

        {/* ── Onglet Articles ── */}
        {activeTab === "articles" && <ArticlesTable />}

        {/* ── Onglet Formules tarifaires ── */}
        {activeTab === "formules" && <AdminFormules />}
      </div>
    </div>
  );
}

// ─── Composant ArticlesTable ──────────────────────────────────────────────────────────────────────────
const CATEGORIE_COLORS: Record<string, string> = {
  Entretien: "bg-blue-100 text-blue-700",
  CV: "bg-green-100 text-green-700",
  "March\u00e9": "bg-purple-100 text-purple-700",
  "N\u00e9gociation": "bg-orange-100 text-orange-700",
  Reconversion: "bg-pink-100 text-pink-700",
  Freelance: "bg-yellow-100 text-yellow-700",
};

const CATEGORIES_ARTICLE = ["Entretien", "CV", "March\u00e9", "N\u00e9gociation", "Reconversion", "Freelance"] as const;
type CategorieArticle = typeof CATEGORIES_ARTICLE[number];

type ArticleForm = {
  titre: string;
  description: string;
  contenu: string;
  categorie: CategorieArticle;
  auteur: string;
  tempsLecture: string;
  imageUrl: string;
  featured: boolean;
  slug: string;
  datePublication: string;
};

const EMPTY_FORM: ArticleForm = {
  titre: "",
  description: "",
  contenu: "",
  categorie: "Entretien",
  auteur: "",
  tempsLecture: "5 min",
  imageUrl: "",
  featured: false,
  slug: "",
  datePublication: new Date().toISOString().split("T")[0],
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ArticlesTable() {
  const utils = trpc.useUtils();
  const [page, setPage] = useStateLocal(0);
  const [showForm, setShowForm] = useStateLocal(false);
  const [editId, setEditId] = useStateLocal<number | null>(null);
  const [form, setForm] = useStateLocal<ArticleForm>(EMPTY_FORM);
  const LIMIT = 10;

  const { data, isLoading } = trpc.admin.getArticles.useQuery({ limit: LIMIT, offset: page * LIMIT });

  const createMutation = trpc.admin.createArticle.useMutation({
    onSuccess: () => {
      toast.success("Article cr\u00e9\u00e9 avec succ\u00e8s");
      utils.admin.getArticles.invalidate();
      utils.conseils.getAll.invalidate();
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.admin.updateArticle.useMutation({
    onSuccess: () => {
      toast.success("Article mis \u00e0 jour");
      utils.admin.getArticles.invalidate();
      utils.conseils.getAll.invalidate();
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteArticle.useMutation({
    onSuccess: () => {
      toast.success("Article supprim\u00e9");
      utils.admin.getArticles.invalidate();
      utils.conseils.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const featuredMutation = trpc.admin.toggleFeatured.useMutation({
    onSuccess: () => {
      toast.success("Article \u00e0 la une mis \u00e0 jour");
      utils.admin.getArticles.invalidate();
      utils.conseils.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleEdit = (article: NonNullable<typeof data>["articles"][0]) => {
    setEditId(article.id);
    setForm({
      titre: article.titre,
      description: article.description,
      contenu: article.contenu,
      categorie: article.categorie as CategorieArticle,
      auteur: article.auteur,
      tempsLecture: article.tempsLecture,
      imageUrl: article.imageUrl ?? "",
      featured: article.featured ?? false,
      slug: article.slug,
      datePublication: new Date(article.datePublication).toISOString().split("T")[0],
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      imageUrl: form.imageUrl || undefined,
    };
    if (editId !== null) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleTitreChange = (titre: string) => {
    setForm((f) => ({ ...f, titre, slug: editId ? f.slug : slugify(titre) }));
  };

  const total = data?.total ?? 0;
  const articles = data?.articles ?? [];
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      {/* En-t\u00eate */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Articles Conseils</h2>
          <p className="text-sm text-gray-500">{total} article{total !== 1 ? "s" : ""} au total</p>
        </div>
        <Button
          className="bg-green-700 hover:bg-green-800 text-white gap-2"
          onClick={() => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); }}
        >
          <Plus className="h-4 w-4" />
          Nouvel article
        </Button>
      </div>

      {/* Formulaire cr\u00e9ation / \u00e9dition */}
      {showForm && (
        <div className="bg-white border rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{editId ? "Modifier l'article" : "Nouvel article"}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}>
              <X className="h-5 w-5 text-gray-400 hover:text-gray-700" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.titre}
                  onChange={(e) => handleTitreChange(e.target.value)}
                  required
                  placeholder="Titre de l'article"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL) *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                  placeholder="mon-article-conseil"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Auteur *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.auteur}
                  onChange={(e) => setForm((f) => ({ ...f, auteur: e.target.value }))}
                  required
                  placeholder="Nom de l'auteur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cat\u00e9gorie *</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.categorie}
                  onChange={(e) => setForm((f) => ({ ...f, categorie: e.target.value as CategorieArticle }))}
                >
                  {CATEGORIES_ARTICLE.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temps de lecture</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.tempsLecture}
                  onChange={(e) => setForm((f) => ({ ...f, tempsLecture: e.target.value }))}
                  placeholder="5 min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de publication</label>
                <input
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={form.datePublication}
                  onChange={(e) => setForm((f) => ({ ...f, datePublication: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
                placeholder="R\u00e9sum\u00e9 de l'article (2-3 phrases)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de l'image</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div data-color-mode="light">
              <label className="block text-sm font-medium text-gray-700 mb-2">Contenu (Markdown) *</label>
              <MDEditor
                value={form.contenu}
                onChange={(val) => setForm((f) => ({ ...f, contenu: val ?? "" }))}
                height={400}
                preview="edit"
                hideToolbar={false}
                data-color-mode="light"
              />
              <p className="text-xs text-gray-400 mt-1">Éditeur Markdown enrichi — utilisez la barre d'outils pour formater le texte</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-green-600"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Mettre cet article \u00e0 la une
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                className="bg-green-700 hover:bg-green-800 text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editId ? "Mettre \u00e0 jour" : "Publier l'article"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des articles */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>Aucun article. Cr\u00e9ez votre premier article ci-dessus.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cat\u00e9gorie</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Auteur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">\u00c0 la une</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 max-w-xs truncate">{article.titre}</div>
                    <div className="text-xs text-gray-400">/conseils/{article.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`${CATEGORIE_COLORS[article.categorie] ?? "bg-gray-100 text-gray-700"} border-0 text-xs`}>
                      {article.categorie}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{article.auteur}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(article.datePublication).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => featuredMutation.mutate({ id: article.id, featured: !article.featured })}
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                        article.featured
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {article.featured ? <Star className="h-3 w-3" /> : <StarOff className="h-3 w-3" />}
                      {article.featured ? "\u00c0 la une" : "Non"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(`/conseils/${article.slug}`, "_blank")}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Voir l'article"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(article)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Supprimer "${article.titre}" ?`)) {
                            deleteMutation.mutate({ id: article.id });
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <span className="text-sm text-gray-500">
                Page {page + 1} / {totalPages} — {total} articles
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
