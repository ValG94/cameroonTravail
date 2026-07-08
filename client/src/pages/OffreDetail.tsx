import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { htmlToBlocks } from "@/lib/stripHtml";
import {
  Archive,
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  FileText,
  Gift,
  GraduationCap,
  Lightbulb,
  Link2,
  Lock,
  MapPin,
  Pencil,
  Send,
  Sparkles,
  Target,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useLocation } from "wouter";
import { CandidatNav } from "@/components/CandidatNav";
import { EmployeurNav } from "@/components/EmployeurNav";
import { SiteHeader } from "@/components/SiteHeader";
import { DialogCandidature } from "@/components/DialogCandidature";
import { useState } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Page /offre/:id — refonte premium.
 *
 * Layout 2 colonnes :
 *   ├── LEFT (main content, ~2/3)
 *   │    ├── Card header offre : badges + titre + meta pilules
 *   │    │   + description courte + filigrane logo Cameroon Travail
 *   │    ├── Card Description du poste (icône verte + soulignement or)
 *   │    ├── Card Missions (grid 2 cols avec puces coche vertes)
 *   │    ├── Card Compétences requises (tags pill vert clair)
 *   │    └── Card Avantages (tags pill vert clair)
 *   └── RIGHT (sticky sidebar, ~1/3)
 *        ├── Card verte "Intéressé(e) par ce poste ?" + CTA or
 *        │   Postuler + hint cadenas
 *        ├── Card "À propos de l'entreprise" — logo/initiale + coche
 *        │   + 8 lignes meta (secteur, métier, lieu, contrat, études,
 *        │   expérience, salaire pilule vert, dates)
 *        └── Card "Partager cette offre" — copier lien + LinkedIn/
 *            Facebook/X/WhatsApp
 *
 * Préserve la logique existante : dialogs employeur (modifier /
 * supprimer / archiver / republier), auth-guard sur postuler,
 * état "hasApplied", "isPourvue", etc.
 *
 * Aucun dangerouslySetInnerHTML : le HTML des champs est parsé en
 * blocs de texte via htmlToBlocks() puis rendu React (pas de XSS).
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

export default function OffreDetail() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const reduced = useReducedMotion();
  const animate = (i: number = 0) => (reduced ? {} : { initial: "hidden", animate: "visible", variants: fadeUp, custom: i });
  const offreId = parseInt(params.id || "0");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [republierDialogOpen, setRepublierDialogOpen] = useState(false);

  const { data: offre, isLoading, error, refetch } = trpc.jobs.getById.useQuery({ id: offreId });
  const { data: hasApplied } = trpc.candidatures.hasApplied.useQuery(
    { offreId },
    { enabled: !!user && user.profileType === "candidat" }
  );
  const { data: employeur } = trpc.employeur.getProfile.useQuery(undefined, {
    enabled: !!user && (user.profileType === "employeur" || user.role === "admin"),
  });

  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      toast.success("Offre supprimée définitivement");
      setLocation("/employeur/offres");
    },
    onError: (err) => toast.error(err.message),
  });

  const republierMutation = trpc.jobs.republier.useMutation({
    onSuccess: () => {
      toast.success("Offre republiée avec succès — elle est à nouveau visible");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const archiveMutation = trpc.jobs.archive.useMutation({
    onSuccess: () => {
      toast.success("Offre marquée comme « Poste pourvu »");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const isAuteur = !!employeur && !!offre && offre.employeurId === employeur.id;
  const isPourvue = offre?.statut === "pourvue";

  // ─── États d'affichage ────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
        {renderNav(user)}
        <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: C.green }} />
          <p className="mt-4" style={{ color: C.textMuted }}>{t("jobs.detail.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !offre) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
        {renderNav(user)}
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl border p-12 text-center" style={{ borderColor: C.border }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.greenSoft }}>
              <Building2 className="h-6 w-6" style={{ color: C.green }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: C.textMain }}>
              {t("jobs.detail.notFound.title")}
            </h3>
            <p className="mb-6" style={{ color: C.textMuted }}>{t("jobs.detail.notFound.description")}</p>
            <Button asChild className="rounded-xl" style={{ backgroundColor: C.deepGreen }}>
              <Link href="/offres">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("jobs.detail.notFound.backToSearch")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handlePostuler = () => {
    if (!user) {
      setLocation("/connexion");
      return;
    }
    setDialogOpen(true);
  };

  // ─── Formatage dates ──────────────────────────────────────────
  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return "";
    return new Date(d as unknown as string).toLocaleDateString(
      i18n.language === "en" ? "en-GB" : "fr-FR",
      { day: "2-digit", month: "2-digit", year: "numeric" }
    );
  };

  const publishedDate = formatDate(offre.datePublication);
  const expiresDate = formatDate(offre.dateLimite);

  // ─── Bilinguisme : sélection FR/EN selon i18n.language ────────
  // Fallback vers la version FR (source obligatoire) si l'employeur
  // n'a pas fourni de traduction EN pour un champ donné. Un candidat
  // anglophone verra la traduction si dispo, sinon la version FR.
  const pickLang = (fr: string | null | undefined, en: string | null | undefined): string => {
    if (i18n.language === "en") {
      const enTrimmed = (en || "").trim();
      if (enTrimmed.length > 0) return enTrimmed;
    }
    return fr || "";
  };

  const localizedTitre = pickLang(offre.titre, (offre as any).titreEn);
  const localizedDescription = pickLang(offre.description, (offre as any).descriptionEn);
  const localizedMissions = pickLang(offre.missions, (offre as any).missionsEn);
  const localizedCompetences = pickLang(offre.competencesRequises, (offre as any).competencesRequisesEn);
  const localizedAvantages = pickLang(offre.avantages, (offre as any).avantagesEn);
  const localizedExperience = pickLang(offre.experienceRequise, (offre as any).experienceRequiseEn);
  const localizedNiveauEtude = pickLang(offre.niveauEtude, (offre as any).niveauEtudeEn);

  // ─── HTML → blocks texte ──────────────────────────────────────
  const descriptionBlocks = htmlToBlocks(localizedDescription);
  const missionsBlocks = htmlToBlocks(localizedMissions);
  const skillTags = htmlToBlocks(localizedCompetences).flatMap((b) =>
    b.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= 40)
  );
  const benefitTags = htmlToBlocks(localizedAvantages).flatMap((b) =>
    b.split(/[,;]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length <= 60)
  );

  const entreprise = (offre as any).entreprise || t("jobs.card.unspecifiedCompany");
  const logoUrl = (offre as any).logoUrl as string | undefined;
  const shortDescription = descriptionBlocks[0] || "";

  // ─── Boutons partage ──────────────────────────────────────────
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${localizedTitre} — ${entreprise}`;
  const shareTargets = [
    {
      key: "linkedin",
      label: "LinkedIn",
      color: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8h4.53v14H.24V8zm7.63 0h4.34v1.92h.06c.6-1.14 2.07-2.34 4.26-2.34 4.55 0 5.39 3 5.39 6.9V22h-4.53v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.53 1.72-2.53 3.5V22H7.87V8z" />
        </svg>
      ),
    },
    {
      key: "facebook",
      label: "Facebook",
      color: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
          <path d="M24 12c0-6.63-5.37-12-12-12S0 5.37 0 12c0 5.99 4.39 10.95 10.13 11.85V15.47H7.08V12h3.05V9.36c0-3.01 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38C19.61 22.95 24 17.99 24 12z" />
        </svg>
      ),
    },
    {
      key: "twitter",
      label: "X (Twitter)",
      color: "#0F172A",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      color: "#25D366",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.172-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.017 21.85h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.02 0C5.495 0 .17 5.335.164 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.335-1.652a11.882 11.882 0 005.68 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.42z" />
        </svg>
      ),
    },
  ];

  const shareToNetwork = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success(t("jobs.detail.share.linkCopied"));
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      {renderNav(user)}

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* ─── Retour + actions employeur ───────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <button
            onClick={() => {
              if (isAuteur) setLocation("/employeur/offres");
              else window.history.back();
            }}
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: C.deepGreen }}
          >
            <ArrowLeft className="h-4 w-4" />
            {isAuteur ? "Mes offres" : t("jobs.detail.back")}
          </button>

          {isAuteur && (
            <div className="flex gap-2 flex-wrap">
              {!isPourvue && (
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/employeur/offres/${offreId}/modifier`)}
                  className="rounded-xl"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
              )}
              {isPourvue ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => setRepublierDialogOpen(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Republier
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => setArchiveDialogOpen(true)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Marquer pourvu
                </Button>
              )}
              <Button
                variant="outline"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          )}
        </div>

        {/* Bannière Poste pourvu */}
        {isPourvue && (
          <div
            className="mb-6 flex items-center gap-3 rounded-xl border px-4 py-3"
            style={{ backgroundColor: "#FEF3C7", borderColor: "#FCD34D" }}
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#B45309" }} />
            <div>
              <p className="font-semibold" style={{ color: "#78350F" }}>Poste pourvu</p>
              <p className="text-sm" style={{ color: "#92400E" }}>
                Ce poste a été pourvu. L'offre est archivée et n'accepte plus de nouvelles candidatures.
              </p>
            </div>
          </div>
        )}

        {/* ─── Grid principal 2 col ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
          {/* ═══ COLONNE PRINCIPALE ═══════════════════════════ */}
          <div className="min-w-0 space-y-6">
            {/* ─── 1. Card header offre ────────────────── */}
            <motion.section {...animate(0)}>
              <div
                className="relative bg-white rounded-2xl border p-6 lg:p-8 overflow-hidden"
                style={{
                  borderColor: C.border,
                  boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.06)",
                }}
              >
                {/* Filigrane logo (étoile brand) en arrière-plan droit
                    — positionné À L'INTÉRIEUR de la card (right positif)
                    pour ne pas déborder, agrandi pour être bien visible. */}
                <img
                  src="/logo-cameroon-travail.webp"
                  alt=""
                  aria-hidden="true"
                  className="hidden md:block absolute pointer-events-none select-none"
                  style={{
                    right: "40px",
                    top: "50%",
                    width: "320px",
                    height: "auto",
                    opacity: 0.07,
                    transform: "translateY(-50%) rotate(-8deg)",
                  }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />

                <div className="relative z-10">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide rounded-md px-2.5 py-1 border"
                      style={{ backgroundColor: C.greenSoft, color: C.deepGreen, borderColor: C.green }}
                    >
                      <Briefcase className="h-3 w-3" />
                      {t("jobs.detail.badgePrivate")}
                    </span>
                    {offre.secteur && (
                      <span
                        className="inline-flex items-center text-[11px] font-bold uppercase tracking-wide rounded-md px-2.5 py-1 border"
                        style={{ backgroundColor: C.goldSoft, color: "#78350F", borderColor: C.gold }}
                      >
                        {offre.secteur}
                      </span>
                    )}
                    {isPourvue && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide rounded-md px-2.5 py-1 border"
                        style={{ backgroundColor: "#FEF3C7", color: "#78350F", borderColor: "#FCD34D" }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {t("jobs.detail.badgePosition")}
                      </span>
                    )}
                  </div>

                  {/* Titre */}
                  <h1
                    className="font-extrabold tracking-tight leading-tight mb-4"
                    style={{ fontSize: "clamp(24px, 2.6vw, 32px)", color: C.textMain }}
                  >
                    {localizedTitre}
                  </h1>

                  {/* Meta ligne — 4 items */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style={{ color: C.textMuted }}>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" style={{ color: C.green }} />
                      {offre.ville}{offre.region && offre.ville ? `, ${offre.region}` : offre.region || ""}
                    </span>
                    {offre.typeContrat && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" style={{ color: C.green }} />
                        <span style={{ color: C.textMain, fontWeight: 600 }}>{offre.typeContrat}</span>
                      </span>
                    )}
                    {offre.salaire && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5"
                        style={{ backgroundColor: C.greenSoft, color: C.deepGreen, fontWeight: 700 }}
                      >
                        <Wallet className="h-4 w-4" />
                        {offre.salaire} FCFA
                      </span>
                    )}
                    {publishedDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" style={{ color: C.green }} />
                        {t("jobs.detail.publishedOn", { date: publishedDate })}
                      </span>
                    )}
                  </div>

                  {/* Description courte (premier paragraphe) */}
                  {shortDescription && (
                    <p className="mt-5 text-[15px] leading-relaxed max-w-3xl" style={{ color: C.textMuted }}>
                      {shortDescription}
                    </p>
                  )}
                </div>
              </div>
            </motion.section>

            {/* ─── 2. Description du poste ─────────────── */}
            {descriptionBlocks.length > 0 && (
              <motion.section {...animate(1)}>
                <SectionCard icon={FileText} title={t("jobs.detail.description")}>
                  <div className="space-y-3 text-[14.5px] leading-relaxed" style={{ color: C.textMuted }}>
                    {descriptionBlocks.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </SectionCard>
              </motion.section>
            )}

            {/* ─── 3. Missions (grid 2 cols avec puces) ─── */}
            {missionsBlocks.length > 0 && (
              <motion.section {...animate(2)}>
                <SectionCard icon={Target} title={t("jobs.detail.missions")}>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                    {missionsBlocks.map((line, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-[14px]" style={{ color: C.textMain }}>
                        <span
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: C.greenSoft }}
                        >
                          <Check className="h-3 w-3" style={{ color: C.green }} strokeWidth={3} />
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </motion.section>
            )}

            {/* ─── 4. Compétences requises (tags) ──────── */}
            {skillTags.length > 0 && (
              <motion.section {...animate(3)}>
                <SectionCard icon={Lightbulb} title={t("jobs.detail.skills")}>
                  <div className="flex flex-wrap gap-2">
                    {skillTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[13px] font-medium rounded-md px-3 py-1.5 border"
                        style={{ backgroundColor: C.greenSoft, color: C.deepGreen, borderColor: "#A7D8B9" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              </motion.section>
            )}

            {/* ─── 5. Avantages (tags) ─────────────────── */}
            {benefitTags.length > 0 && (
              <motion.section {...animate(4)}>
                <SectionCard icon={Gift} title={t("jobs.detail.benefits")}>
                  <div className="flex flex-wrap gap-2">
                    {benefitTags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[13px] font-medium rounded-md px-3 py-1.5 border"
                        style={{ backgroundColor: C.ivory, color: C.textMain, borderColor: C.border }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </SectionCard>
              </motion.section>
            )}
          </div>

          {/* ═══ SIDEBAR STICKY ═══════════════════════════════ */}
          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            {/* ─── Apply Card (verte foncée) OR gestion employeur ─── */}
            {isAuteur ? (
              <motion.div {...animate(1)}>
                <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
                  <h3 className="font-bold mb-4 text-[15px]" style={{ color: C.textMain }}>
                    Gestion de l'offre
                  </h3>
                  <div className="space-y-2">
                    {!isPourvue && (
                      <Button
                        className="w-full rounded-xl text-white"
                        style={{ backgroundColor: C.deepGreen }}
                        onClick={() => setLocation(`/employeur/offres/${offreId}/modifier`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier l'offre
                      </Button>
                    )}
                    {isPourvue ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-green-200 text-green-700 hover:bg-green-50"
                        onClick={() => setRepublierDialogOpen(true)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Republier l'offre
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
                        onClick={() => setArchiveDialogOpen(true)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Marquer poste pourvu
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer l'offre
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => setLocation("/employeur/candidatures")}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Voir les candidatures
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div {...animate(1)}>
                <div
                  className="relative rounded-2xl p-6 lg:p-7 overflow-hidden text-center"
                  style={{
                    background: `linear-gradient(160deg, ${C.deepGreen} 0%, ${C.darkerGreen} 100%)`,
                    boxShadow: "0 20px 40px -20px rgba(3, 31, 22, 0.5)",
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: C.gold }}
                  />
                  {/* Icône avion papier */}
                  <div
                    className="relative w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                  >
                    <Send className="h-6 w-6" style={{ color: C.gold }} />
                  </div>
                  <h3 className="relative text-white font-bold text-[17px] leading-snug mb-2">
                    {t("jobs.detail.apply.title")}
                  </h3>
                  <p className="relative text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {t("jobs.detail.apply.subtitle")}
                  </p>

                  {isPourvue ? (
                    <div className="relative">
                      <div
                        className="w-11 h-11 mx-auto mb-2 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(246, 195, 67, 0.15)" }}
                      >
                        <CheckCircle2 className="h-5 w-5" style={{ color: C.gold }} />
                      </div>
                      <p className="font-semibold text-white mb-1">
                        {t("jobs.detail.apply.positionFilled")}
                      </p>
                      <p className="text-[12.5px]" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {t("jobs.detail.apply.positionFilledHint")}
                      </p>
                    </div>
                  ) : hasApplied ? (
                    <div className="relative">
                      <Button
                        disabled
                        className="w-full relative rounded-xl h-12 font-semibold"
                        style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {t("jobs.detail.apply.alreadyApplied")}
                      </Button>
                      <p className="text-[12px] mt-3" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {t("jobs.detail.apply.alreadyAppliedHint")}
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <Button
                        className="w-full rounded-xl h-12 font-bold text-[15px] hover:opacity-90"
                        style={{ backgroundColor: C.gold, color: C.deepGreen }}
                        onClick={handlePostuler}
                      >
                        {t("jobs.detail.apply.button")}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      {!user && (
                        <p className="text-[12.5px] mt-3 flex items-center justify-center gap-1.5" style={{ color: "rgba(255,255,255,0.75)" }}>
                          <Lock className="h-3 w-3" />
                          {t("jobs.detail.apply.loginRequired")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── À propos de l'entreprise ─── */}
            <motion.div {...animate(2)}>
              <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-bold text-[15px]" style={{ color: C.textMain }}>
                    {t("jobs.detail.company.title")}
                  </h3>
                  <BadgeCheck className="h-4 w-4" style={{ color: C.green }} />
                </div>

                {/* Header entreprise : logo + nom + secteur */}
                <div className="flex items-center gap-3 mb-5">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-contain border bg-white"
                      style={{ borderColor: C.border }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: C.deepGreen }}
                      aria-hidden="true"
                    >
                      {entreprise.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-[15px]" style={{ color: C.textMain }}>
                      {entreprise}
                    </p>
                    {offre.secteur && (
                      <p className="text-[12.5px] mt-0.5" style={{ color: C.textMuted }}>
                        {t("jobs.detail.company.sector")} : {offre.secteur}
                      </p>
                    )}
                  </div>
                </div>

                {/* Meta lines */}
                <div className="space-y-4">
                  {offre.metier && (
                    <MetaLine icon={Briefcase} label={t("jobs.detail.company.job")} value={offre.metier} />
                  )}
                  {(offre.ville || offre.region) && (
                    <MetaLine
                      icon={MapPin}
                      label={t("jobs.detail.company.location")}
                      value={[offre.ville, offre.region].filter(Boolean).join(", ")}
                    />
                  )}
                  {offre.typeContrat && (
                    <MetaLine icon={FileText} label={t("jobs.detail.company.contract")} value={offre.typeContrat} />
                  )}
                  {localizedNiveauEtude && (
                    <MetaLine icon={GraduationCap} label={t("jobs.detail.company.education")} value={localizedNiveauEtude} />
                  )}
                  {localizedExperience && (
                    <MetaLine icon={Sparkles} label={t("jobs.detail.company.experience")} value={localizedExperience} />
                  )}
                  {offre.salaire && (
                    <div className="flex items-start gap-2.5">
                      <Wallet className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.textMuted }} />
                      <div className="min-w-0">
                        <p className="text-[11.5px] uppercase tracking-wide font-semibold" style={{ color: C.textMuted }}>
                          {t("jobs.detail.company.salary")}
                        </p>
                        <span
                          className="inline-block mt-1 text-[13.5px] font-bold rounded-md px-2 py-0.5"
                          style={{ backgroundColor: C.greenSoft, color: C.deepGreen }}
                        >
                          {offre.salaire} FCFA
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Séparateur puis dates */}
                {(publishedDate || expiresDate) && (
                  <>
                    <div className="my-4 border-t" style={{ borderColor: C.border }} />
                    <div className="space-y-3 text-[13px]" style={{ color: C.textMain }}>
                      {publishedDate && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5" style={{ color: C.textMuted }}>
                            <Calendar className="h-3.5 w-3.5" />
                            {t("jobs.detail.company.published")}
                          </span>
                          <span className="font-semibold">{publishedDate}</span>
                        </div>
                      )}
                      {expiresDate && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5" style={{ color: C.textMuted }}>
                            <Clock className="h-3.5 w-3.5" />
                            {t("jobs.detail.company.expires")}
                          </span>
                          <span className="font-semibold">{expiresDate}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* ─── Partager cette offre ─── */}
            <motion.div {...animate(3)}>
              <div className="bg-white rounded-2xl border p-6" style={{ borderColor: C.border }}>
                <h3 className="font-bold text-[15px] mb-4" style={{ color: C.textMain }}>
                  {t("jobs.detail.share.title")}
                </h3>

                {/* Copier lien */}
                <button
                  onClick={copyLink}
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 mb-4 font-semibold text-[13.5px] transition-colors hover:opacity-90"
                  style={{ backgroundColor: C.goldSoft, color: C.deepGreen, border: `1px solid ${C.gold}` }}
                >
                  <Link2 className="h-4 w-4" />
                  {t("jobs.detail.share.copyLink")}
                </button>

                {/* Réseaux sociaux */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px]" style={{ color: C.textMuted }}>
                    {t("jobs.detail.share.shareOn")}
                  </span>
                  <div className="flex items-center gap-2">
                    {shareTargets.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => shareToNetwork(s.href)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                        style={{ color: s.color, border: `1px solid ${C.border}` }}
                        aria-label={`${t("jobs.detail.share.shareOn")} ${s.label}`}
                      >
                        {s.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* ─── Dialogs préservés ─────────────────────────────────── */}
      {offre && (
        <DialogCandidature
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          offreId={offre.id}
          offreTitre={offre.titre}
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-700">
              <Trash2 className="h-5 w-5" />
              Supprimer définitivement cette offre ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>Vous êtes sur le point de supprimer l'offre <strong>« {offre.titre} »</strong>.</p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-red-700">⚠ Cette action est irréversible :</p>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>L'offre sera <strong>définitivement supprimée</strong></li>
                    <li>Toutes les <strong>candidatures reçues</strong> seront perdues</li>
                    <li>Les candidats <strong>ne pourront plus accéder</strong> à leur candidature</li>
                    <li>Aucune récupération ne sera possible</li>
                  </ul>
                </div>
                <p className="text-gray-500">
                  Si vous souhaitez simplement indiquer que le poste est pourvu, utilisez plutôt <strong>« Marquer poste pourvu »</strong>.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteMutation.mutate({ id: offreId })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Republier */}
      <AlertDialog open={republierDialogOpen} onOpenChange={setRepublierDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Republier cette offre ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>Vous allez réactiver l'offre <strong>« {offre.titre} »</strong>.</p>
                <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-green-700">Ce qui se passera :</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>L'offre sera <strong>réactivée</strong> avec le statut « Publiée »</li>
                    <li>Elle <strong>réapparaîtra</strong> dans les résultats de recherche</li>
                    <li>Les candidats pourront à nouveau <strong>postuler</strong></li>
                    <li>Les candidatures existantes sont <strong>conservées</strong></li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => republierMutation.mutate({ id: offreId })}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirmer — Republier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archiver */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-700">
              <Archive className="h-5 w-5" />
              Marquer ce poste comme pourvu ?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-700">
                <p>Vous allez archiver l'offre <strong>« {offre.titre} »</strong>.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                  <p className="font-semibold text-amber-700">Ce qui se passera :</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>L'offre sera <strong>archivée</strong> avec le badge « Poste pourvu »</li>
                    <li>Elle <strong>n'apparaîtra plus</strong> dans les résultats de recherche</li>
                    <li>Les candidats ayant postulé <strong>pourront toujours la consulter</strong></li>
                    <li>Toutes les candidatures reçues sont <strong>conservées</strong></li>
                    <li>Aucune nouvelle candidature ne sera acceptée</li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => archiveMutation.mutate({ id: offreId })}
            >
              <Archive className="h-4 w-4 mr-2" />
              Confirmer — Poste pourvu
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

function renderNav(user: any) {
  if (user?.profileType === "candidat") return <CandidatNav />;
  if (user?.profileType === "employeur" || user?.role === "admin") return <EmployeurNav />;
  return <SiteHeader activePage="emplois" />;
}

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, title, children }: SectionCardProps) {
  return (
    <div
      className="bg-white rounded-2xl border p-6 lg:p-7"
      style={{
        borderColor: C.border,
        boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.04)",
      }}
    >
      {/* Header avec icône ronde + titre + soulignement or */}
      <div className="mb-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: C.greenSoft }}
          >
            <Icon className="h-4 w-4" style={{ color: C.green }} />
          </div>
          <h2 className="font-bold text-[17px]" style={{ color: C.textMain }}>
            {title}
          </h2>
        </div>
        <div
          className="ml-11 h-1 w-10 rounded-full"
          style={{ backgroundColor: C.gold }}
        />
      </div>
      {children}
    </div>
  );
}

interface MetaLineProps {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
}

function MetaLine({ icon: Icon, label, value }: MetaLineProps) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.textMuted }} />
      <div className="min-w-0">
        <p className="text-[11.5px] uppercase tracking-wide font-semibold" style={{ color: C.textMuted }}>
          {label}
        </p>
        <p className="text-[13.5px] mt-0.5 leading-snug" style={{ color: C.textMain, fontWeight: 600 }}>
          {value}
        </p>
      </div>
    </div>
  );
}
