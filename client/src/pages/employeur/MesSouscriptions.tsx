import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { EmployeurNav } from "@/components/EmployeurNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";

/**
 * Page "Mes souscriptions" — vue recruteur de l'historique de ses
 * demandes de souscription Mobile Money (en attente, validées,
 * refusées). Permet de suivre où en est sa demande sans relancer
 * l'admin par téléphone.
 */

const STATUT_LABEL = {
  en_attente: { label: "En attente de validation", color: "amber", icon: Clock },
  validee: { label: "Validée — formule active", color: "emerald", icon: CheckCircle2 },
  refusee: { label: "Refusée", color: "red", icon: XCircle },
} as const;

const METHOD_LABEL: Record<string, string> = {
  orange_money: "Orange Money",
  mtn_momo: "MTN MoMo",
  autre: "Autre",
};

export default function MesSouscriptions() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.profileType !== "employeur" && user.role !== "admin")) {
      setLocation("/connexion");
    }
  }, [user, authLoading, setLocation]);

  const { data: demandes, isLoading } = trpc.employeur.mesDemandesSouscription.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeurNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Mes souscriptions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Historique de vos demandes de souscription et leur statut.
            </p>
          </div>
          <Button
            onClick={() => {
              setLocation("/tarifs");
              setTimeout(() => {
                document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 80);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            Nouvelle souscription
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        ) : !demandes || demandes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Wallet className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1">
                Aucune souscription pour l'instant
              </h3>
              <p className="text-sm text-slate-500 mb-5 max-w-md mx-auto">
                Choisissez une formule pour commencer à publier vos offres et accéder à la CVthèque.
              </p>
              <Button
                onClick={() => {
                  setLocation("/tarifs");
                  setTimeout(() => {
                    document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 80);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Voir les tarifs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {demandes.map((d: any) => {
              const cfg = STATUT_LABEL[d.statut as keyof typeof STATUT_LABEL];
              const Icon = cfg.icon;
              const date = new Date(d.createdAt).toLocaleString("fr-FR", {
                dateStyle: "long",
                timeStyle: "short",
              });
              return (
                <Card key={d.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge
                            className={`gap-1 font-semibold ${
                              cfg.color === "emerald"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : cfg.color === "amber"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {cfg.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-semibold">
                            <Smartphone className="w-3 h-3 mr-1" />
                            {METHOD_LABEL[d.methodePaiement] ?? "Autre"}
                          </Badge>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {d.nomFormule || "Formule"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Demandée le {date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                          Montant
                        </div>
                        <div className="text-xl font-extrabold text-slate-900">
                          {Number(d.montant).toLocaleString("fr-FR")}{" "}
                          <span className="text-sm font-medium text-slate-500">{d.devise}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Référence transaction :
                        </span>
                        <span className="font-mono text-slate-900">{d.referenceTransaction}</span>
                      </div>
                    </div>

                    {d.statut === "refusee" && d.raisonRefus && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                        <span className="font-semibold">Raison du refus :</span> {d.raisonRefus}
                      </div>
                    )}
                    {d.statut === "validee" && d.validatedAt && (
                      <p className="text-xs text-emerald-700 mt-3 font-medium">
                        Activée le{" "}
                        {new Date(d.validatedAt).toLocaleString("fr-FR", {
                          dateStyle: "long",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    {d.statut === "en_attente" && (
                      <p className="text-xs text-amber-700 mt-3">
                        Notre équipe vérifie votre paiement. Vous recevrez un email dès activation
                        (sous 24h en moyenne).
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
