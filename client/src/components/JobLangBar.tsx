import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { ArrowRightLeft, Info, Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Barre de langue réutilisable pour les formulaires d'offres d'emploi
 * (Publier.tsx / ModifierOffre.tsx).
 *
 * Fournit :
 *  - Tabs FR / EN pour switcher entre les 2 versions d'une offre
 *  - Bouton "Traduire vers EN/FR" qui appelle jobs.translateJob
 *    (OpenAI GPT-4o mini côté serveur) et remplit automatiquement
 *    les champs de la langue cible via le callback onTranslated
 *  - Confirm dialog si la langue cible contient déjà du contenu
 *  - Info banner : "Une traduction anglaise permet aux candidats
 *    anglophones de lire votre offre"
 *
 * Le parent gère l'état activeLang et fournit les valeurs sources
 * (FR ou EN selon le sens de traduction). Le composant est
 * stateless côté données ; il fait juste l'IHM + l'appel LLM.
 */

const C = {
  green: "#009B5A",
  deepGreen: "#063F24",
  greenSoft: "#EAF8F1",
  gold: "#F6C343",
  goldSoft: "rgba(246, 195, 67, 0.15)",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

export type Lang = "fr" | "en";

export interface JobTranslationPayload {
  titre: string;
  description: string;
  missions?: string;
  competencesRequises?: string;
  experienceRequise?: string;
  niveauEtude?: string;
  avantages?: string;
}

export interface JobLangBarProps {
  activeLang: Lang;
  setActiveLang: (l: Lang) => void;
  /**
   * Valeurs actuelles de tous les champs bilingues (dans les 2
   * langues). Le composant lit ce dont il a besoin pour :
   *  - décider quel sens de traduction est possible (a-t-on une
   *    source suffisante ?)
   *  - détecter si la langue cible contient déjà du contenu
   */
  values: {
    fr: JobTranslationPayload;
    en: JobTranslationPayload;
  };
  /**
   * Appelé une fois la traduction reçue et validée. Le parent
   * fusionne le résultat dans son state formData (versions EN ou
   * FR selon target).
   */
  onTranslated: (target: Lang, translated: JobTranslationPayload) => void;
}

export function JobLangBar({ activeLang, setActiveLang, values, onTranslated }: JobLangBarProps) {
  const { t } = useTranslation();
  const [translating, setTranslating] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState<Lang | null>(null);

  const translateMutation = trpc.jobs.translateJob.useMutation();

  // Direction de traduction déterminée par l'onglet ACTIF :
  //  - onglet FR affiché → bouton "Traduire vers EN"
  //  - onglet EN affiché → bouton "Traduire vers FR"
  const target: Lang = activeLang === "fr" ? "en" : "fr";
  const source: Lang = activeLang;

  const sourcePayload = values[source];
  const targetPayload = values[target];

  const hasSufficientSource =
    !!(sourcePayload.titre?.trim()) && !!(sourcePayload.description?.trim());

  const hasExistingTarget =
    !!(targetPayload.titre?.trim()) || !!(targetPayload.description?.trim());

  const doTranslate = async () => {
    if (!hasSufficientSource) {
      toast.error(
        source === "fr"
          ? t("bo.employerPostJob.translateNeedFrSource")
          : t("bo.employerPostJob.translateNeedEnSource")
      );
      return;
    }
    setTranslating(true);
    try {
      const result = await translateMutation.mutateAsync({
        sourceLanguage: source,
        targetLanguage: target,
        titre: sourcePayload.titre,
        description: sourcePayload.description,
        missions: sourcePayload.missions || undefined,
        competencesRequises: sourcePayload.competencesRequises || undefined,
        experienceRequise: sourcePayload.experienceRequise || undefined,
        niveauEtude: sourcePayload.niveauEtude || undefined,
        avantages: sourcePayload.avantages || undefined,
      });
      onTranslated(target, result);
      setActiveLang(target);
      toast.success(t("bo.employerPostJob.translateSuccess"));
    } catch (err: any) {
      toast.error(err?.message || t("bo.employerPostJob.translateError"));
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslateClick = () => {
    if (hasExistingTarget) {
      setConfirmOverwrite(target);
    } else {
      doTranslate();
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-2xl border overflow-hidden mb-6"
        style={{ borderColor: C.border, boxShadow: "0 4px 24px -12px rgba(15, 23, 42, 0.05)" }}
      >
        {/* Tabs FR/EN + bouton traduire */}
        <div className="border-b flex flex-wrap items-center justify-between gap-2" style={{ borderColor: C.border }}>
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveLang("fr")}
              className="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
              style={{
                borderColor: activeLang === "fr" ? C.deepGreen : "transparent",
                color: activeLang === "fr" ? C.deepGreen : C.textMuted,
              }}
            >
              {t("bo.employerPostJob.langTabFr")}
            </button>
            <button
              type="button"
              onClick={() => setActiveLang("en")}
              className="px-5 py-3 text-sm font-semibold border-b-2 transition-colors"
              style={{
                borderColor: activeLang === "en" ? C.deepGreen : "transparent",
                color: activeLang === "en" ? C.deepGreen : C.textMuted,
              }}
            >
              {t("bo.employerPostJob.langTabEn")}
            </button>
          </div>
          <div className="pr-3 py-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTranslateClick}
              disabled={translating}
              className="rounded-lg h-9 text-sm font-semibold gap-2"
              style={{ borderColor: C.gold, color: C.deepGreen, backgroundColor: C.goldSoft }}
            >
              {translating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("bo.employerPostJob.translating")}
                </>
              ) : (
                <>
                  <Languages className="h-4 w-4" />
                  {target === "en"
                    ? t("bo.employerPostJob.translateToEn")
                    : t("bo.employerPostJob.translateToFr")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info banner */}
        <div className="px-5 py-3 flex items-start gap-2" style={{ backgroundColor: C.greenSoft }}>
          <Info className="h-4 w-4 shrink-0 mt-0.5" style={{ color: C.green }} />
          <p className="text-[12.5px] leading-relaxed" style={{ color: C.deepGreen }}>
            {t("bo.employerPostJob.translateInfo")}
          </p>
        </div>
      </div>

      {/* Confirm overwrite dialog */}
      <AlertDialog
        open={confirmOverwrite !== null}
        onOpenChange={(open) => !open && setConfirmOverwrite(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" style={{ color: C.gold }} />
              {confirmOverwrite === "en"
                ? t("bo.employerPostJob.translateConfirmOverwriteEn")
                : t("bo.employerPostJob.translateConfirmOverwriteFr")}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOverwrite(null);
                doTranslate();
              }}
              className="bg-[#063F24] hover:bg-[#009B5A]"
            >
              <Languages className="h-4 w-4 mr-2" />
              {confirmOverwrite === "en"
                ? t("bo.employerPostJob.translateToEn")
                : t("bo.employerPostJob.translateToFr")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
