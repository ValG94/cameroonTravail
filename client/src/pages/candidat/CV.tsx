import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Copy,
  Crown,
  Eye,
  FilePlus2,
  FileText,
  LayoutTemplate,
  Lightbulb,
  Loader2,
  MoreVertical,
  Pencil,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { NewCvModal } from "@/components/NewCvModal";

/**
 * Page /candidat/cv — refonte premium (matches maquette user).
 *
 * Structure :
 *   1. CandidatNav (nav connectée candidat)
 *   2. Hero vert profond : titre + subtitle + image droite
 *      (hero-makeyourcv.webp)
 *   3. Bannière Premium ivoire : CTA "Découvrir Premium" →
 *      /candidat/templates
 *   4. Grid 2 colonnes :
 *      - LEFT : liste "Mes CV créés" (avec actions Aperçu/Modifier/
 *        menu ...) + CTA "Créer un nouveau CV" + note sécurité
 *      - RIGHT (sticky) :
 *        - Card "Actions rapides" (verte foncée) : 2 liens
 *        - Card "Astuces pour un CV efficace" (ivoire) : 4 tips
 *        - Card "Besoin d'aide ?" (avec image candidate-studies.webp)
 *   5. Fonctionnalité upload de CV existant retirée (déplacée sur
 *      /deposer-cv, accessible via dashboard candidat).
 *
 * Bilingue via namespace createCvPage.*
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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

// Mapping route selon type de CV pour le bouton "Modifier".
// classique/moderne retirés depuis la refonte : les CV de ces types
// ne sont plus créables et sont filtrés de la liste (cf. CandidatCV).
function getEditRoute(cv: any): string {
  if (cv.type === "premium" && cv.premiumTemplateSlug) {
    return `/candidat/cv-premium/${cv.premiumTemplateSlug}`;
  }
  // upload / creatif → on ne re-édite pas, on renvoie sur la liste
  return "/candidat/cv";
}

export default function CandidatCV() {
  const { t, i18n } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });

  const { data: rawCvList, refetch, isLoading: cvLoading } = trpc.cv.list.useQuery();

  // Filtre les CV classique/moderne (features retirées lors de la
  // refonte — plus de création possible, on masque aussi les
  // éventuels vestiges en DB pour ne pas embrouiller l'UX).
  const cvList = useMemo(
    () => (rawCvList || []).filter((cv: any) => cv.type !== "classique" && cv.type !== "moderne"),
    [rawCvList]
  );

  const [deleteId, setDeleteId] = useState<{ id: number; name: string } | null>(null);
  const [newCvOpen, setNewCvOpen] = useState(false);

  const deleteCvMutation = trpc.cv.delete.useMutation({
    onSuccess: () => {
      toast.success(t("createCvPage.toastCvDeleted"));
      refetch();
      setDeleteId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleVisibiliteMutation = trpc.cv.toggleVisibiliteCVtheque.useMutation({
    onSuccess: (data) => {
      toast.success(data.visible ? t("createCvPage.toastVisibleOn") : t("createCvPage.toastVisibleOff"));
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  // Guard candidat
  useEffect(() => {
    if (!authLoading && user && user.profileType !== "candidat") {
      setLocation("/");
    }
  }, [user, authLoading, setLocation]);

  const dateLocale = i18n.language === "en" ? "en-GB" : "fr-FR";
  const formatDate = (d: any) =>
    d ? new Date(d).toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" }) : "";

  // "Créer un nouveau CV" ouvre désormais la modal à 2 choix (upload
  // avec extraction IA OU choisir un modèle premium). Plus de
  // redirection vers /deposer-cv (page supprimée dans la refonte).
  const goCreate = () => setNewCvOpen(true);
  const goTemplates = () => setLocation("/candidat/templates");
  const goConseils = () => setLocation("/conseils");

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.bg }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.green }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <CandidatNav />

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8 space-y-6">
        {/* ═══ 1. HERO ═══════════════════════════════════════════════ */}
        <motion.section {...animate(0)}>
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{
              backgroundColor: C.darkerGreen,
              minHeight: "260px",
              boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.4)",
            }}
          >
            {/* Halo or discret */}
            <div
              aria-hidden="true"
              className="absolute -bottom-20 right-32 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
              style={{ backgroundColor: C.gold }}
            />

            {/* Image droite hero-makeyourcv */}
            <img
              src="/images/candidat/hero-makeyourcv.webp"
              alt={t("createCvPage.hero.imageAlt")}
              className="hidden md:block absolute right-0 top-0 h-full w-1/2 object-cover object-center pointer-events-none select-none"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)",
              }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />

            <div className="relative z-10 p-8 sm:p-10 lg:p-12 max-w-[95%] md:max-w-[60%]">
              {/* Icône */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(246, 195, 67, 0.15)" }}
                >
                  <FileText className="h-7 w-7" style={{ color: C.gold }} />
                </div>
                <h1
                  className="font-extrabold text-white tracking-tight leading-tight"
                  style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}
                >
                  {t("createCvPage.hero.title")}{" "}
                  <span style={{ color: C.gold }}>{t("createCvPage.hero.titleHighlight")}</span>
                </h1>
              </div>
              <p
                className="text-sm sm:text-base leading-relaxed max-w-xl ml-[72px]"
                style={{ color: "rgba(255,255,255,0.82)" }}
              >
                {t("createCvPage.hero.subtitle")}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ═══ 2. BANNIÈRE PREMIUM ═══════════════════════════════════ */}
        <motion.section {...animate(1)}>
          <div
            className="rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6"
            style={{
              background: `linear-gradient(160deg, ${C.greenSoft} 0%, #ffffff 100%)`,
              borderColor: "rgba(0, 155, 90, 0.25)",
              boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(246, 195, 67, 0.2)" }}
            >
              <Crown className="h-6 w-6" style={{ color: C.gold }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[16px] mb-1" style={{ color: C.textMain }}>
                {t("createCvPage.premiumBanner.title")}
              </h3>
              <p className="text-[13.5px] leading-relaxed" style={{ color: C.textMuted }}>
                {t("createCvPage.premiumBanner.subtitle")}
              </p>
            </div>
            <Button
              onClick={goTemplates}
              className="rounded-xl h-11 font-semibold text-white hover:opacity-90 shrink-0"
              style={{ backgroundColor: C.deepGreen }}
            >
              <Crown className="mr-2 h-4 w-4" />
              {t("createCvPage.premiumBanner.cta")}
            </Button>
          </div>
        </motion.section>

        {/* ═══ 3. GRID main + sidebar ═══════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          {/* ─── LEFT : liste CV ────────────────────────────── */}
          <motion.section {...animate(2)} className="min-w-0">
            <div
              className="bg-white rounded-2xl border p-6 lg:p-7"
              style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.04)" }}
            >
              {/* Header + count */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-[17px]" style={{ color: C.textMain }}>
                  {t("createCvPage.list.title")}
                </h2>
                {cvList && cvList.length > 0 && (
                  <span className="text-xs font-semibold rounded-full px-2.5 py-1" style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}>
                    {cvList.length}
                  </span>
                )}
              </div>

              {/* Empty state */}
              {cvLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: C.green }} />
                </div>
              ) : !cvList || cvList.length === 0 ? (
                <div className="text-center py-10 rounded-xl border-2 border-dashed" style={{ borderColor: C.border }}>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: C.greenSoft }}
                  >
                    <FileText className="h-6 w-6" style={{ color: C.green }} />
                  </div>
                  <p className="mb-4 text-sm" style={{ color: C.textMuted }}>
                    {t("createCvPage.list.empty")}
                  </p>
                  <Button
                    onClick={goCreate}
                    className="rounded-xl h-11 font-semibold text-white"
                    style={{ backgroundColor: C.deepGreen }}
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    {t("createCvPage.list.emptyCta")}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Liste CVs */}
                  <ul className="space-y-2.5">
                    {cvList.map((cv) => (
                      <li key={cv.id}>
                        <CvRow
                          cv={cv}
                          formatDate={formatDate}
                          onPreview={() => {
                            if (cv.fileUrl) window.open(cv.fileUrl, "_blank");
                            else setLocation(getEditRoute(cv));
                          }}
                          onEdit={() => setLocation(getEditRoute(cv))}
                          onToggleVisible={(checked) =>
                            toggleVisibiliteMutation.mutate({ cvId: cv.id, visible: checked })
                          }
                          onDelete={() => setDeleteId({ id: cv.id, name: cv.nom })}
                          togglePending={toggleVisibiliteMutation.isPending}
                          t={t}
                        />
                      </li>
                    ))}
                  </ul>

                  {/* CTA nouveau CV */}
                  <div className="pt-5 mt-5 border-t" style={{ borderColor: C.border }}>
                    <Button
                      variant="outline"
                      onClick={goCreate}
                      className="w-full rounded-xl h-11 font-semibold gap-2"
                      style={{ borderColor: C.green, color: C.deepGreen, borderStyle: "dashed" }}
                    >
                      <FilePlus2 className="h-4 w-4" />
                      {t("createCvPage.list.newCv")}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Note sécurité sous la carte */}
            <div className="mt-4 flex items-start gap-2 text-[12.5px] leading-relaxed" style={{ color: C.textMuted }}>
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" style={{ color: C.green }} />
              <p>{t("createCvPage.list.securityNote")}</p>
            </div>
          </motion.section>

          {/* ─── RIGHT : sidebar sticky ─────────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-24 self-start">
            {/* Actions rapides — verte foncée */}
            <motion.div {...animate(3)}>
              <div
                className="relative rounded-2xl overflow-hidden p-6"
                style={{
                  background: `linear-gradient(160deg, ${C.deepGreen} 0%, ${C.darkerGreen} 100%)`,
                  boxShadow: "0 12px 30px -12px rgba(3, 31, 22, 0.4)",
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: C.gold }}
                />
                <div className="relative flex items-center gap-2 mb-4">
                  <Zap className="h-4 w-4" style={{ color: C.gold }} />
                  <h3 className="font-bold text-white text-[15px]">
                    {t("createCvPage.quickActions.title")}
                  </h3>
                </div>

                <div className="relative space-y-2">
                  {/* Action principale : fond or plein pour ressortir sur
                      le fond vert profond. Sous-titrage 'Commencez un CV
                      depuis zéro' — c'est le CTA numéro un. */}
                  <QuickActionButton
                    variant="primary"
                    icon={FilePlus2}
                    title={t("createCvPage.quickActions.newCv.title")}
                    subtitle={t("createCvPage.quickActions.newCv.subtitle")}
                    onClick={goCreate}
                  />
                  {/* Action secondaire : outline blanc, plus discret,
                      raccourci direct vers la bibliothèque premium. */}
                  <QuickActionButton
                    variant="outline"
                    icon={LayoutTemplate}
                    title={t("createCvPage.quickActions.chooseTemplate.title")}
                    subtitle={t("createCvPage.quickActions.chooseTemplate.subtitle")}
                    onClick={goTemplates}
                  />
                </div>
              </div>
            </motion.div>

            {/* Astuces */}
            <motion.div {...animate(4)}>
              <div
                className="rounded-2xl border p-6"
                style={{
                  background: `linear-gradient(160deg, ${C.ivory} 0%, #ffffff 100%)`,
                  borderColor: "rgba(246, 195, 67, 0.35)",
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: C.goldSoft }}
                  >
                    <Lightbulb className="h-4 w-4" style={{ color: C.gold }} />
                  </div>
                  <h3 className="font-bold text-[15px]" style={{ color: C.textMain }}>
                    {t("createCvPage.tips.title")}
                  </h3>
                </div>

                <ul className="space-y-3">
                  {(["tailor", "highlight", "concise", "spelling"] as const).map((key) => (
                    <li key={key} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.green }} strokeWidth={3} />
                      <div className="min-w-0">
                        <p className="font-semibold text-[13px]" style={{ color: C.textMain }}>
                          {t(`createCvPage.tips.items.${key}.title`)}
                        </p>
                        <p className="text-[12px] mt-0.5 leading-relaxed" style={{ color: C.textMuted }}>
                          {t(`createCvPage.tips.items.${key}.subtitle`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Besoin d'aide (avec image) */}
            <motion.div {...animate(5)}>
              <div
                className="rounded-2xl border overflow-hidden relative"
                style={{
                  background: `linear-gradient(160deg, ${C.greenSoft} 0%, #ffffff 100%)`,
                  borderColor: "rgba(0, 155, 90, 0.2)",
                }}
              >
                {/* Image décorative en bas à droite */}
                <img
                  src="/images/candidat/candidate-studies.webp"
                  alt=""
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 w-32 h-auto pointer-events-none select-none opacity-90"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />

                <div className="relative p-6 pr-24">
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0, 155, 90, 0.15)" }}
                    >
                      <BookOpen className="h-4 w-4" style={{ color: C.green }} />
                    </div>
                    <h3 className="font-bold text-[15px]" style={{ color: C.textMain }}>
                      {t("createCvPage.help.title")}
                    </h3>
                  </div>
                  <p className="text-[12.5px] leading-relaxed mb-4 max-w-[75%]" style={{ color: C.textMuted }}>
                    {t("createCvPage.help.subtitle")}
                  </p>
                  <Button
                    variant="outline"
                    onClick={goConseils}
                    className="rounded-xl h-9 text-sm font-semibold gap-1.5"
                    style={{ borderColor: C.green, color: C.deepGreen, backgroundColor: "white" }}
                  >
                    {t("createCvPage.help.cta")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* Modal "Créer un nouveau CV" (2 chemins : upload ou modèle premium) */}
      <NewCvModal
        open={newCvOpen}
        onOpenChange={setNewCvOpen}
        onUploadSuccess={() => refetch()}
      />

      {/* Delete confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              {deleteId ? t("createCvPage.list.deleteConfirm", { name: deleteId.name }) : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteCvMutation.mutate({ cvId: deleteId.id })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("createCvPage.list.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════

interface CvRowProps {
  cv: any;
  formatDate: (d: any) => string;
  onPreview: () => void;
  onEdit: () => void;
  onToggleVisible: (checked: boolean) => void;
  onDelete: () => void;
  togglePending: boolean;
  t: (k: string, opts?: any) => string;
}

function CvRow({ cv, formatDate, onPreview, onEdit, onToggleVisible, onDelete, togglePending, t }: CvRowProps) {
  const isPremium = cv.type === "premium";
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border transition-colors hover:border-[color:var(--hover)]"
      style={{ borderColor: C.border, ["--hover" as string]: C.green } as React.CSSProperties}
    >
      {/* Icône */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: isPremium ? C.goldSoft : C.greenSoft }}
      >
        {isPremium ? (
          <Crown className="h-5 w-5" style={{ color: C.gold }} />
        ) : (
          <FileText className="h-5 w-5" style={{ color: C.green }} />
        )}
      </div>

      {/* Titre + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-[14px] truncate" style={{ color: C.textMain }}>
            {cv.nom}
          </p>
          {cv.actif && (
            <span
              className="text-[10px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5"
              style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}
            >
              <Star className="h-2.5 w-2.5 inline mr-0.5" />
              {t("createCvPage.list.defaultLabel")}
            </span>
          )}
        </div>
        <p className="text-[12px] mt-0.5" style={{ color: C.textMuted }}>
          {t("createCvPage.list.updated", { date: formatDate(cv.updatedAt || cv.createdAt) })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="outline"
          onClick={onPreview}
          className="rounded-lg h-8 text-xs font-semibold hidden sm:inline-flex"
          style={{ borderColor: "#93C5FD", color: "#1D4ED8", backgroundColor: "#EAF3FB" }}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          {t("createCvPage.list.preview")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
          className="rounded-lg h-8 text-xs font-semibold hidden sm:inline-flex"
          style={{ borderColor: "#F6C343", color: "#8B5A00", backgroundColor: "#FEF7E0" }}
        >
          <Pencil className="h-3.5 w-3.5 mr-1" />
          {t("createCvPage.list.edit")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Menu">
              <MoreVertical className="h-4 w-4" style={{ color: C.textMuted }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Actions mobiles (dupliqués car masqués en < sm) */}
            <DropdownMenuItem onClick={onPreview} className="sm:hidden">
              <Eye className="h-4 w-4 mr-2" />
              {t("createCvPage.list.preview")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="sm:hidden">
              <Pencil className="h-4 w-4 mr-2" />
              {t("createCvPage.list.edit")}
            </DropdownMenuItem>
            {cv.fileUrl && (
              <DropdownMenuItem onClick={() => window.open(cv.fileUrl, "_blank")}>
                <ArrowRight className="h-4 w-4 mr-2 -rotate-45" />
                {t("createCvPage.list.download")}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5" style={{ color: C.textMain }}>
                  <Eye className="h-3.5 w-3.5" />
                  <span>{t("createCvPage.list.toggleCvtheque")}</span>
                </div>
                <Switch
                  checked={!!cv.visibleCVtheque}
                  onCheckedChange={onToggleVisible}
                  disabled={togglePending}
                  className="scale-75"
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              {t("createCvPage.list.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
  onClick: () => void;
  /**
   * Variante visuelle :
   *  - "primary" : fond or plein, texte vert profond → action principale
   *  - "outline" : bordure blanche translucide, texte blanc → action secondaire
   * Les 2 se distinguent nettement sur le fond vert profond de la card
   * "Actions rapides" (au lieu de se confondre avec le pattern précédent
   * qui utilisait 2 variantes identiques).
   */
  variant?: "primary" | "outline";
}

function QuickActionButton({ icon: Icon, title, subtitle, onClick, variant = "outline" }: QuickActionButtonProps) {
  const isPrimary = variant === "primary";

  // Styles séparés pour lisibilité — évite les string conditionals
  // dans le JSX qui rendraient le composant illisible.
  const styles = isPrimary
    ? {
        bg: C.gold,
        bgHover: "#EAB833", // or légèrement plus foncé au hover
        textMain: C.deepGreen,
        textMuted: "rgba(6, 63, 36, 0.75)",
        iconBg: "rgba(6, 63, 36, 0.15)",
        iconColor: C.deepGreen,
        chevron: "rgba(6, 63, 36, 0.6)",
        border: "transparent",
      }
    : {
        bg: "transparent",
        bgHover: "rgba(255,255,255,0.08)",
        textMain: "#ffffff",
        textMuted: "rgba(255,255,255,0.7)",
        iconBg: "rgba(255,255,255,0.1)",
        iconColor: C.gold,
        chevron: "rgba(255,255,255,0.6)",
        border: "rgba(255,255,255,0.3)",
      };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left border"
      style={{ backgroundColor: styles.bg, borderColor: styles.border }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = styles.bgHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = styles.bg;
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: styles.iconBg }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color: styles.iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[13.5px] leading-tight" style={{ color: styles.textMain }}>
          {title}
        </p>
        <p className="text-[11.5px] mt-0.5" style={{ color: styles.textMuted }}>
          {subtitle}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: styles.chevron }} />
    </button>
  );
}
