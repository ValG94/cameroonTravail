import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Power,
  Calendar,
  Building2,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Console d'administration des spotlights sponsorisés (encart annonceur
 * homepage). L'admin crée un spotlight en liant un employeur à un pack
 * (pme / grande / continu) sur une fenêtre de dates. Le spotlight
 * apparaît automatiquement sur la home entre startAt et endAt tant que
 * `actif=true`.
 *
 * Workflow (V1, paiement manuel) :
 *   1. Recruteur clique "Souscrire" → mail à l'équipe.
 *   2. Admin vérifie paiement Orange/MTN puis crée le spotlight ici.
 *   3. actif=true → visible immédiatement (dans sa fenêtre de dates).
 */

const PACK_META: Record<
  "pme" | "grande" | "continu",
  { label: string; price: string; days: number; color: string; bg: string }
> = {
  pme:     { label: "PME",             price: "25 000 XAF / semaine", days: 7,  color: "#B45309", bg: "#FEF3C7" },
  grande:  { label: "Grande entreprise", price: "50 000 XAF / semaine", days: 7,  color: "#5B21B6", bg: "#F3EAFB" },
  continu: { label: "Continu",         price: "100 000 XAF / mois",    days: 30, color: "#0F766E", bg: "#CCFBF1" },
};

type Pack = "pme" | "grande" | "continu";

interface FormState {
  id?: number;
  employeurId: number | null;
  pack: Pack;
  baseline: string;
  baselineEn: string;
  ctaLabel: string;
  ctaLabelEn: string;
  ctaHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryLabelEn: string;
  ctaSecondaryHref: string;
  startAt: string; // ISO date "YYYY-MM-DD"
  endAt: string;
  actif: boolean;
}

const emptyForm: FormState = {
  employeurId: null,
  pack: "pme",
  baseline: "",
  baselineEn: "",
  ctaLabel: "",
  ctaLabelEn: "",
  ctaHref: "",
  ctaSecondaryLabel: "",
  ctaSecondaryLabelEn: "",
  ctaSecondaryHref: "",
  startAt: "",
  endAt: "",
  actif: true,
};

function toInputDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminSpotlights() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [employeurQuery, setEmployeurQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") setLocation("/");
  }, [user, authLoading, setLocation]);

  const utils = trpc.useUtils();
  const listQuery = trpc.spotlights.list.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  const employeursQuery = trpc.spotlights.searchEmployeurs.useQuery(
    { q: employeurQuery },
    { enabled: dialogOpen && !!user && user.role === "admin" },
  );

  const createMutation = trpc.spotlights.create.useMutation({
    onSuccess: () => {
      toast.success(t("bo.adminSpotlights.createdToast"));
      utils.spotlights.list.invalidate();
      utils.spotlights.getActive.invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message || "Erreur"),
  });

  const updateMutation = trpc.spotlights.update.useMutation({
    onSuccess: () => {
      toast.success(t("bo.adminSpotlights.updatedToast"));
      utils.spotlights.list.invalidate();
      utils.spotlights.getActive.invalidate();
      setDialogOpen(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message || "Erreur"),
  });

  const toggleMutation = trpc.spotlights.toggle.useMutation({
    onSuccess: () => {
      utils.spotlights.list.invalidate();
      utils.spotlights.getActive.invalidate();
    },
    onError: (e) => toast.error(e.message || "Erreur"),
  });

  const removeMutation = trpc.spotlights.remove.useMutation({
    onSuccess: () => {
      toast.success(t("bo.adminSpotlights.removedToast"));
      utils.spotlights.list.invalidate();
      utils.spotlights.getActive.invalidate();
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message || "Erreur"),
  });

  const openCreate = () => {
    const now = new Date();
    const in7 = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    setForm({ ...emptyForm, startAt: toInputDate(now), endAt: toInputDate(in7) });
    setDialogOpen(true);
  };

  const openEdit = (s: any) => {
    setForm({
      id: s.id,
      employeurId: s.employeurId,
      pack: s.pack,
      baseline: s.baseline ?? "",
      baselineEn: s.baselineEn ?? "",
      ctaLabel: s.ctaLabel ?? "",
      ctaLabelEn: s.ctaLabelEn ?? "",
      ctaHref: s.ctaHref ?? "",
      ctaSecondaryLabel: s.ctaSecondaryLabel ?? "",
      ctaSecondaryLabelEn: s.ctaSecondaryLabelEn ?? "",
      ctaSecondaryHref: s.ctaSecondaryHref ?? "",
      startAt: toInputDate(s.startAt),
      endAt: toInputDate(s.endAt),
      actif: s.actif,
    });
    setDialogOpen(true);
  };

  const onPackChange = (pack: Pack) => {
    setForm((prev) => {
      // Auto-ajuste endAt en fonction du pack si startAt est défini.
      if (prev.startAt) {
        const start = new Date(prev.startAt);
        const end = new Date(start.getTime() + PACK_META[pack].days * 24 * 3600 * 1000);
        return { ...prev, pack, endAt: toInputDate(end) };
      }
      return { ...prev, pack };
    });
  };

  const handleSubmit = () => {
    if (!form.employeurId) return toast.error(t("bo.adminSpotlights.errNoEmployeur"));
    if (form.baseline.trim().length < 3) return toast.error(t("bo.adminSpotlights.errBaselineTooShort"));
    if (!form.startAt || !form.endAt) return toast.error(t("bo.adminSpotlights.errDatesRequired"));

    const payload = {
      employeurId: form.employeurId,
      pack: form.pack,
      baseline: form.baseline.trim(),
      baselineEn: form.baselineEn.trim() || null,
      ctaLabel: form.ctaLabel.trim() || null,
      ctaLabelEn: form.ctaLabelEn.trim() || null,
      ctaHref: form.ctaHref.trim() || null,
      ctaSecondaryLabel: form.ctaSecondaryLabel.trim() || null,
      ctaSecondaryLabelEn: form.ctaSecondaryLabelEn.trim() || null,
      ctaSecondaryHref: form.ctaSecondaryHref.trim() || null,
      startAt: new Date(form.startAt),
      endAt: new Date(`${form.endAt}T23:59:59`),
      actif: form.actif,
    };

    if (form.id) {
      updateMutation.mutate({ id: form.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const spotlights = listQuery.data ?? [];
  const now = new Date();

  const isActive = (s: any) =>
    s.actif && new Date(s.startAt) <= now && new Date(s.endAt) >= now;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Sparkles className="h-7 w-7" style={{ color: "#F6C343" }} />
              {t("bo.adminSpotlights.title")}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              {t("bo.adminSpotlights.subtitle")}
            </p>
          </div>
          <Button onClick={openCreate} className="h-10 gap-2 shadow-sm" style={{ backgroundColor: "#063F24" }}>
            <Plus className="h-4 w-4" />
            {t("bo.adminSpotlights.newBtn")}
          </Button>
        </div>

        {/* Grille tarifaire (rappel) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {(Object.entries(PACK_META) as [Pack, typeof PACK_META.pme][]).map(([key, meta]) => (
            <div
              key={key}
              className="rounded-xl border p-4"
              style={{ backgroundColor: meta.bg, borderColor: "transparent" }}
            >
              <div className="text-[11px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
                {meta.label}
              </div>
              <div className="mt-1 text-[15px] font-bold text-slate-900">{meta.price}</div>
              <div className="text-[12px] text-slate-600 mt-0.5">{meta.days} {t("bo.adminSpotlights.days")}</div>
            </div>
          ))}
        </div>

        {/* Liste */}
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : spotlights.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <Sparkles className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">{t("bo.adminSpotlights.empty")}</p>
              <Button onClick={openCreate} className="mt-4 gap-2" style={{ backgroundColor: "#063F24" }}>
                <Plus className="h-4 w-4" />
                {t("bo.adminSpotlights.newBtn")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {spotlights.map((s: any) => {
              const meta = PACK_META[s.pack as Pack];
              const active = isActive(s);
              return (
                <Card key={s.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Logo + nom */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-14 h-14 rounded-xl border flex items-center justify-center bg-white overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
                          {s.logoUrl ? (
                            <img src={s.logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <Building2 className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{s.nomEntreprise}</div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold uppercase tracking-wider"
                              style={{ backgroundColor: meta.bg, color: meta.color, borderColor: "transparent" }}
                            >
                              {meta.label}
                            </Badge>
                            {active ? (
                              <Badge className="text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: "#DCFCE7", color: "#166534" }}>
                                {t("bo.adminSpotlights.statusLive")}
                              </Badge>
                            ) : s.actif ? (
                              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                {t("bo.adminSpotlights.statusScheduled")}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                {t("bo.adminSpotlights.statusInactive")}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contenu texte */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] text-slate-700 leading-relaxed">{s.baseline}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(s.startAt).toLocaleDateString()} → {new Date(s.endAt).toLocaleDateString()}
                          </span>
                          {s.ctaHref && (
                            <span className="inline-flex items-center gap-1.5 truncate max-w-xs">
                              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{s.ctaHref}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMutation.mutate({ id: s.id, actif: !s.actif })}
                          className="gap-1.5"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {s.actif ? t("bo.adminSpotlights.pause") : t("bo.adminSpotlights.enable")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEdit(s)} className="gap-1.5">
                          <Edit2 className="h-3.5 w-3.5" />
                          {t("bo.adminSpotlights.edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(s.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ Dialog create / edit ═══════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.id ? t("bo.adminSpotlights.dialogEditTitle") : t("bo.adminSpotlights.dialogCreateTitle")}
            </DialogTitle>
            <DialogDescription>{t("bo.adminSpotlights.dialogDesc")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Employeur */}
            <div className="space-y-1.5">
              <Label>{t("bo.adminSpotlights.formEmployeur")} *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  placeholder={t("bo.adminSpotlights.formEmployeurPh")}
                  value={employeurQuery}
                  onChange={(e) => setEmployeurQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <div className="max-h-40 overflow-y-auto rounded-lg border" style={{ borderColor: "#E2E8F0" }}>
                {(employeursQuery.data || []).map((emp: any) => {
                  const selected = form.employeurId === emp.id;
                  return (
                    <button
                      type="button"
                      key={emp.id}
                      onClick={() => setForm({ ...form, employeurId: emp.id })}
                      className={`w-full text-left px-3 py-2 border-b last:border-b-0 flex items-center gap-3 transition-colors ${
                        selected ? "bg-emerald-50" : "hover:bg-slate-50"
                      }`}
                      style={{ borderColor: "#F1F5F9" }}
                    >
                      <div className="w-8 h-8 rounded-lg border flex items-center justify-center bg-white overflow-hidden shrink-0" style={{ borderColor: "#E2E8F0" }}>
                        {emp.logoUrl ? (
                          <img src={emp.logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                        ) : (
                          <Building2 className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-slate-900 truncate">{emp.nomEntreprise}</div>
                        {emp.secteurActivite && (
                          <div className="text-[11px] text-slate-500 truncate">{emp.secteurActivite}</div>
                        )}
                      </div>
                      {selected && <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Sélectionné</span>}
                    </button>
                  );
                })}
                {employeursQuery.data && employeursQuery.data.length === 0 && (
                  <div className="text-center py-4 text-[12px] text-slate-400">
                    {t("bo.adminSpotlights.noEmployeurFound")}
                  </div>
                )}
              </div>
            </div>

            {/* Pack */}
            <div className="space-y-1.5">
              <Label>{t("bo.adminSpotlights.formPack")} *</Label>
              <Select value={form.pack} onValueChange={(v) => onPackChange(v as Pack)}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PACK_META) as [Pack, typeof PACK_META.pme][]).map(([key, meta]) => (
                    <SelectItem key={key} value={key}>
                      {meta.label} — {meta.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("bo.adminSpotlights.formStart")} *</Label>
                <Input
                  type="date"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("bo.adminSpotlights.formEnd")} *</Label>
                <Input
                  type="date"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>

            {/* Baseline FR */}
            <div className="space-y-1.5">
              <Label>{t("bo.adminSpotlights.formBaselineFr")} *</Label>
              <Textarea
                value={form.baseline}
                onChange={(e) => setForm({ ...form, baseline: e.target.value })}
                placeholder={t("bo.adminSpotlights.formBaselinePh")}
                rows={2}
                maxLength={180}
                className="resize-none"
              />
              <div className="text-[11px] text-slate-400 text-right">{form.baseline.length}/180</div>
            </div>

            {/* Baseline EN */}
            <div className="space-y-1.5">
              <Label>{t("bo.adminSpotlights.formBaselineEn")}</Label>
              <Textarea
                value={form.baselineEn}
                onChange={(e) => setForm({ ...form, baselineEn: e.target.value })}
                placeholder={t("bo.adminSpotlights.formBaselineEnPh")}
                rows={2}
                maxLength={180}
                className="resize-none"
              />
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("bo.adminSpotlights.formCtaLabel")}</Label>
                <Input
                  value={form.ctaLabel}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  placeholder={t("bo.adminSpotlights.formCtaLabelPh")}
                  maxLength={60}
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("bo.adminSpotlights.formCtaLabelEn")}</Label>
                <Input
                  value={form.ctaLabelEn}
                  onChange={(e) => setForm({ ...form, ctaLabelEn: e.target.value })}
                  placeholder={t("bo.adminSpotlights.formCtaLabelEnPh")}
                  maxLength={60}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("bo.adminSpotlights.formCtaHref")}</Label>
              <Input
                value={form.ctaHref}
                onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
                placeholder={t("bo.adminSpotlights.formCtaHrefPh")}
                maxLength={500}
                className="h-10"
              />
              <p className="text-[11px] text-slate-500">
                {t("bo.adminSpotlights.formCtaHrefHelp")}
              </p>
            </div>

            {/* Bloc CTA secondaire (optionnel) */}
            <div className="pt-4 border-t" style={{ borderColor: "#E2E8F0" }}>
              <p className="text-[13px] font-bold text-slate-700 mb-1">
                {t("bo.adminSpotlights.formSecondaryTitle")}
              </p>
              <p className="text-[11.5px] text-slate-500 mb-3">
                {t("bo.adminSpotlights.formSecondaryHelp")}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("bo.adminSpotlights.formCtaSecondaryLabel")}</Label>
                  <Input
                    value={form.ctaSecondaryLabel}
                    onChange={(e) => setForm({ ...form, ctaSecondaryLabel: e.target.value })}
                    placeholder={t("bo.adminSpotlights.formCtaSecondaryLabelPh")}
                    maxLength={60}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("bo.adminSpotlights.formCtaSecondaryLabelEn")}</Label>
                  <Input
                    value={form.ctaSecondaryLabelEn}
                    onChange={(e) => setForm({ ...form, ctaSecondaryLabelEn: e.target.value })}
                    placeholder={t("bo.adminSpotlights.formCtaSecondaryLabelEnPh")}
                    maxLength={60}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="space-y-1.5 mt-3">
                <Label>{t("bo.adminSpotlights.formCtaSecondaryHref")}</Label>
                <Input
                  value={form.ctaSecondaryHref}
                  onChange={(e) => setForm({ ...form, ctaSecondaryHref: e.target.value })}
                  placeholder={t("bo.adminSpotlights.formCtaSecondaryHrefPh")}
                  maxLength={500}
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="actif"
                checked={form.actif}
                onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="actif" className="cursor-pointer">
                {t("bo.adminSpotlights.formActif")}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("bo.adminSpotlights.cancel")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: "#063F24" }}
            >
              {form.id ? t("bo.adminSpotlights.saveEdit") : t("bo.adminSpotlights.saveCreate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ Confirm delete ═══════════════════════════════════════ */}
      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("bo.adminSpotlights.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("bo.adminSpotlights.deleteDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("bo.adminSpotlights.cancel")}
            </Button>
            <Button
              onClick={() => deleteTarget !== null && removeMutation.mutate({ id: deleteTarget })}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={removeMutation.isPending}
            >
              {t("bo.adminSpotlights.confirmDelete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
