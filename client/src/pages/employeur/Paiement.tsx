import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Info,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Page de demande de souscription (Option B : paiement manuel).
 *
 * Workflow :
 *  1. Le recruteur arrive depuis EspaceRecruteur (bouton "Choisir ce
 *     plan") avec ?plan=X dans l'URL.
 *  2. La page affiche le récap de la formule choisie + les coordonnées
 *     de paiement Orange Money / MTN MoMo.
 *  3. Le recruteur effectue le paiement sur son téléphone, puis saisit
 *     la référence de transaction reçue et son numéro de paiement.
 *  4. Submit → mutation trpc.employeur.demanderSouscription crée la
 *     ligne dans demandes_souscription (statut "en_attente").
 *  5. L'admin reçoit la demande dans /admin/souscriptions, vérifie le
 *     paiement réel et valide → formule activée automatiquement sur
 *     la fiche employeur.
 */

// ─── Coordonnées de paiement (à personnaliser) ────────────────────────────────
// TODO : remplacer par les vrais numéros marchands Cameroon Travail
const PAYMENT_NUMBERS = {
  orange_money: "+237 6XX XX XX XX",
  mtn_momo: "+237 6XX XX XX XX",
};

const C = {
  ivory: "#FAF7EF",
  deepGreen: "#063F24",
  green: "#007A3D",
  greenBright: "#009B5A",
  gold: "#F6C343",
  textMain: "#0F172A",
  textMuted: "#64748B",
  border: "#E2E8F0",
};

export default function PaiementEmployeur() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { user, loading: authLoading } = useAuth();

  const planId = useMemo(() => {
    const sp = new URLSearchParams(searchString || "");
    const v = sp.get("plan");
    return v ? Number(v) : null;
  }, [searchString]);

  const [methodePaiement, setMethodePaiement] = useState<"orange_money" | "mtn_momo" | "autre">("orange_money");
  const [referenceTransaction, setReferenceTransaction] = useState("");

  // Garde : doit être authentifié + employeur
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLocation(`/connexion?redirect=/employeur/paiement?plan=${planId ?? ""}`);
      return;
    }
    if (user.profileType !== "employeur" && user.role !== "admin") {
      setLocation("/");
    }
  }, [user, authLoading, planId, setLocation]);

  const formulesQuery = trpc.formules.getActives.useQuery({ cible: "employeur" });
  const formule = useMemo(
    () => formulesQuery.data?.find((f: any) => f.id === planId),
    [formulesQuery.data, planId]
  );

  const demanderMutation = trpc.employeur.demanderSouscription.useMutation({
    onSuccess: () => {
      toast.success(t("bo.employerPayment.sentToast"));
      setLocation("/employeur/dashboard");
    },
    onError: (e: { message?: string }) => {
      toast.error(e.message || t("bo.employerPayment.sentToast"));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formule) {
      toast.error(t("bo.employerPayment.formulaNotFound"));
      return;
    }
    if (referenceTransaction.trim().length < 3) {
      toast.error(t("bo.employerPayment.refTooShort"));
      return;
    }
    await demanderMutation.mutateAsync({
      formuleId: formule.id,
      methodePaiement,
      referenceTransaction: referenceTransaction.trim(),
    });
  };

  if (authLoading || formulesQuery.isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.ivory }}>
        <SiteHeader />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: C.green }} />
        </div>
      </div>
    );
  }

  if (!planId || !formule) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: C.ivory, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
        <SiteHeader />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-3" style={{ color: C.textMain }}>{t("bo.employerPayment.noFormulaTitle")}</h1>
          <p className="mb-6" style={{ color: C.textMuted }}>
            {t("bo.employerPayment.noFormulaDesc")}
          </p>
          <Button
            onClick={() => setLocation("/tarifs")}
            style={{ backgroundColor: C.green, color: "white" }}
          >
            {t("bo.employerPayment.seePrices")}
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const prix = Number(formule.prix).toLocaleString("fr-FR");
  const numero = methodePaiement === "autre" ? null : PAYMENT_NUMBERS[methodePaiement];

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.ivory, color: C.textMain, fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <SiteHeader />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
        <button
          type="button"
          onClick={() => setLocation("/tarifs")}
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 hover:underline"
          style={{ color: C.textMuted }}
        >
          <ArrowLeft className="w-4 h-4" />
          {t("bo.employerPayment.backToPrices")}
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          {t("bo.employerPayment.title")} <span style={{ color: C.green }}>{formule.nom}</span>
        </h1>
        <p className="mb-10 text-base" style={{ color: C.textMuted }}>
          {t("bo.employerPayment.subtitle")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8">
          {/* ─── Récap formule ──────────────────────────────────── */}
          <Card className="rounded-3xl border shadow-sm h-fit" style={{ borderColor: C.border }}>
            <CardContent className="p-7">
              <Badge
                className="mb-3 px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: "rgba(0, 155, 90, 0.10)", color: C.green, border: "1px solid rgba(0, 155, 90, 0.30)" }}
              >
                {formule.nom}
              </Badge>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-4xl font-extrabold tracking-tight" style={{ color: C.textMain }}>
                  {prix}
                </span>
                <span className="text-sm mb-2" style={{ color: C.textMuted }}>
                  {formule.devise} / {formule.periode === "annuel" ? t("bo.employerPayment.periodYear") : formule.periode === "unique" ? t("bo.employerPayment.periodOnce") : t("bo.employerPayment.periodMonth")}
                </span>
              </div>
              {formule.description && (
                <p className="text-sm leading-relaxed mb-5" style={{ color: C.textMuted }}>
                  {formule.description}
                </p>
              )}

              {formule.fonctionnalites && (
                <ul className="space-y-2.5">
                  {String(formule.fonctionnalites)
                    .split("\n")
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                    .map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.greenBright }} />
                        <span style={{ color: C.textMain }}>{f}</span>
                      </li>
                    ))}
                </ul>
              )}

              <div className="mt-6 pt-5 border-t flex items-center gap-2 text-xs" style={{ borderColor: C.border, color: C.textMuted }}>
                <ShieldCheck className="w-4 h-4" style={{ color: C.green }} />
                {t("bo.employerPayment.secureNote")}
              </div>
            </CardContent>
          </Card>

          {/* ─── Form paiement ──────────────────────────────────── */}
          <Card className="rounded-3xl border shadow-lg" style={{ borderColor: C.border }}>
            <CardContent className="p-7 sm:p-9">
              <h2 className="text-xl font-bold mb-1" style={{ color: C.textMain }}>
                {t("bo.employerPayment.howToPay")}
              </h2>
              <p className="text-sm mb-6" style={{ color: C.textMuted }}>
                {t("bo.employerPayment.howToPayDesc")}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Choix méthode */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">{t("bo.employerPayment.method")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { key: "orange_money", label: t("bo.employerPayment.methodOrange"), color: "#FF7900" },
                      { key: "mtn_momo", label: t("bo.employerPayment.methodMtn"), color: "#FFC500" },
                      { key: "autre", label: t("bo.employerPayment.methodOther"), color: C.textMuted },
                    ].map((m) => {
                      const active = methodePaiement === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => setMethodePaiement(m.key as any)}
                          className="relative flex items-center gap-2.5 h-12 px-3 rounded-xl border-2 text-sm font-semibold transition-all"
                          style={{
                            borderColor: active ? C.green : C.border,
                            backgroundColor: active ? "rgba(0, 155, 90, 0.06)" : "white",
                            color: C.textMain,
                          }}
                        >
                          <Smartphone className="w-4 h-4" style={{ color: m.color }} />
                          {m.label}
                          {active && (
                            <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: C.green }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instructions paiement */}
                {numero && (
                  <div
                    className="rounded-xl border p-4"
                    style={{ borderColor: "rgba(0, 155, 90, 0.25)", backgroundColor: "rgba(0, 155, 90, 0.05)" }}
                  >
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 mt-0.5 shrink-0" style={{ color: C.green }} />
                      <div className="text-sm leading-relaxed" style={{ color: C.textMain }}>
                        <p className="font-semibold mb-2">{t("bo.employerPayment.instructionsTitle")}</p>
                        <ol className="list-decimal pl-4 space-y-1.5 text-[13px]" style={{ color: C.textMuted }}>
                          <li>{t("bo.employerPayment.instructionStep1")}</li>
                          <li>
                            {t("bo.employerPayment.instructionStep2", { amount: prix, currency: formule.devise, number: numero })}
                          </li>
                          <li>{t("bo.employerPayment.instructionStep3")}</li>
                          <li>{t("bo.employerPayment.instructionStep4")}</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {methodePaiement === "autre" && (
                  <div
                    className="rounded-xl border p-4 text-sm"
                    style={{ borderColor: "rgba(246, 195, 67, 0.40)", backgroundColor: "rgba(246, 195, 67, 0.08)" }}
                  >
                    {t("bo.employerPayment.otherMethod")}
                  </div>
                )}

                {/* Référence transaction */}
                <div>
                  <Label htmlFor="ref" className="text-sm font-semibold mb-1.5 block">
                    {t("bo.employerPayment.referenceLabel")} <span style={{ color: "#DC2626" }}>*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      id="ref"
                      value={referenceTransaction}
                      onChange={(e) => setReferenceTransaction(e.target.value)}
                      placeholder={t("bo.employerPayment.referencePh")}
                      className="h-12 pl-10"
                      style={{ borderColor: C.border }}
                      required
                    />
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: C.textMuted }}>
                    {t("bo.employerPayment.referenceHelp")}
                  </p>
                </div>

                {/* Récap final */}
                <div
                  className="rounded-xl p-4 flex items-center justify-between"
                  style={{ backgroundColor: "#F8FAFC", border: `1px solid ${C.border}` }}
                >
                  <div>
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: C.textMuted }}>
                      {t("bo.employerPayment.totalToPay")}
                    </div>
                    <div className="text-2xl font-extrabold mt-1" style={{ color: C.textMain }}>
                      {prix} <span className="text-sm font-medium" style={{ color: C.textMuted }}>{formule.devise}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: C.textMuted }}>
                    <Clock className="w-3.5 h-3.5" />
                    {t("bo.employerPayment.activatedIn")}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={demanderMutation.isPending}
                  className="w-full h-13 text-base font-bold text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${C.deepGreen} 0%, ${C.greenBright} 100%)`,
                    height: "52px",
                  }}
                >
                  {demanderMutation.isPending ? t("bo.employerPayment.submitting") : t("bo.employerPayment.submitBtn")}
                </Button>

                <p className="text-xs text-center" style={{ color: C.textMuted }}>
                  {t("bo.employerPayment.emailNote")}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
