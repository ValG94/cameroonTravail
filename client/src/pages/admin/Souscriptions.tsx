import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Smartphone,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Console d'administration des demandes de souscription.
 *
 * L'admin liste les demandes (filtrables par statut), vérifie le
 * paiement réel côté téléphone marchand grâce à la référence de
 * transaction, puis valide ou refuse. La validation active
 * automatiquement la formule sur la fiche employeur (mise à jour
 * de formuleAbonnement, dateDebutAbonnement, dateFinAbonnement,
 * nombreOffresRestantes par la mutation backend).
 */

type Statut = "en_attente" | "validee" | "refusee";

const STATUTS: { key: Statut | "tous"; label: string }[] = [
  { key: "en_attente", label: "En attente" },
  { key: "validee", label: "Validées" },
  { key: "refusee", label: "Refusées" },
  { key: "tous", label: "Toutes" },
];

const METHOD_LABEL: Record<string, { label: string; color: string }> = {
  orange_money: { label: "Orange Money", color: "#FF7900" },
  mtn_momo: { label: "MTN MoMo", color: "#FFC500" },
  autre: { label: "Autre", color: "#64748B" },
};

export default function AdminSouscriptions() {
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<Statut | "tous">("en_attente");
  const [refusalTarget, setRefusalTarget] = useState<number | null>(null);
  const [refusalReason, setRefusalReason] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "admin") setLocation("/");
  }, [user, authLoading, setLocation]);

  const utils = trpc.useUtils();
  const listQuery = trpc.admin.listDemandesSouscription.useQuery(
    filter === "tous" ? undefined : { statut: filter },
    { enabled: !!user && user.role === "admin" }
  );

  const validerMutation = trpc.admin.validerDemandeSouscription.useMutation({
    onSuccess: () => {
      toast.success("Demande validée — formule activée sur le compte recruteur");
      utils.admin.listDemandesSouscription.invalidate();
    },
    onError: (e: { message?: string }) => toast.error(e.message || "Erreur"),
  });

  const refuserMutation = trpc.admin.refuserDemandeSouscription.useMutation({
    onSuccess: () => {
      toast.success("Demande refusée — le recruteur sera notifié");
      utils.admin.listDemandesSouscription.invalidate();
      setRefusalTarget(null);
      setRefusalReason("");
    },
    onError: (e: { message?: string }) => toast.error(e.message || "Erreur"),
  });

  const handleValider = (id: number) => {
    if (!confirm("Confirmer la validation ? La formule sera activée immédiatement.")) return;
    validerMutation.mutate({ id });
  };

  const handleRefuser = () => {
    if (refusalTarget === null) return;
    if (refusalReason.trim().length < 3) {
      toast.error("Précisez la raison du refus");
      return;
    }
    refuserMutation.mutate({ id: refusalTarget, raison: refusalReason.trim() });
  };

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

  const demandes = listQuery.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Demandes de souscription
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vérifiez chaque paiement Mobile Money sur le téléphone marchand, puis validez pour activer la formule recruteur.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mb-6">
          {STATUTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === s.key
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:border-emerald-400"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {listQuery.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : demandes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <p className="text-slate-500">Aucune demande dans cette catégorie.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {demandes.map((d: any) => {
              const method = METHOD_LABEL[d.methodePaiement] ?? METHOD_LABEL.autre;
              const date = new Date(d.createdAt).toLocaleString("fr-FR", {
                dateStyle: "short",
                timeStyle: "short",
              });
              return (
                <Card key={d.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Infos demande */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <StatutBadge statut={d.statut} />
                          <Badge variant="outline" className="text-xs font-semibold">
                            <Smartphone className="w-3 h-3 mr-1" style={{ color: method.color }} />
                            {method.label}
                          </Badge>
                          <span className="text-xs text-slate-400 ml-auto lg:ml-0">{date}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-bold text-slate-900 text-base truncate">
                            {d.nomEntreprise || "(entreprise sans nom)"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm mt-2">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{d.emailRecruteur || "—"}</span>
                          </div>
                          {d.telephoneRecruteur && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              {d.telephoneRecruteur}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                Formule
                              </div>
                              <div className="font-bold text-slate-900 mt-0.5">{d.nomFormule}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                Montant déclaré
                              </div>
                              <div className="font-bold text-slate-900 mt-0.5">
                                {Number(d.montant).toLocaleString("fr-FR")} {d.devise}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                                Référence transaction
                              </div>
                              <div className="font-mono text-sm text-slate-900 mt-0.5 truncate">
                                {d.referenceTransaction}
                              </div>
                            </div>
                          </div>
                        </div>

                        {d.statut === "refusee" && d.raisonRefus && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            <span className="font-semibold">Raison du refus :</span> {d.raisonRefus}
                          </div>
                        )}
                        {d.statut !== "en_attente" && d.validatorName && (
                          <div className="mt-2 text-xs text-slate-400">
                            Traité par {d.validatorName}
                            {d.validatedAt
                              ? " le " + new Date(d.validatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
                              : ""}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {d.statut === "en_attente" && (
                        <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                          <Button
                            onClick={() => handleValider(d.id)}
                            disabled={validerMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Valider
                          </Button>
                          <Button
                            onClick={() => setRefusalTarget(d.id)}
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50 gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            Refuser
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog refus */}
      <Dialog open={refusalTarget !== null} onOpenChange={(open) => { if (!open) { setRefusalTarget(null); setRefusalReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser cette demande</DialogTitle>
            <DialogDescription>
              Le recruteur verra la raison du refus dans son back-office. Soyez précis (paiement introuvable, montant incorrect, référence inconnue, etc.).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
            placeholder="Ex : aucune transaction reçue pour cette référence sur Orange Money"
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRefusalTarget(null); setRefusalReason(""); }}>
              Annuler
            </Button>
            <Button
              onClick={handleRefuser}
              disabled={refuserMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatutBadge({ statut }: { statut: Statut }) {
  if (statut === "en_attente")
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1 font-semibold">
        <Clock className="w-3 h-3" /> En attente
      </Badge>
    );
  if (statut === "validee")
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 font-semibold">
        <CheckCircle2 className="w-3 h-3" /> Validée
      </Badge>
    );
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200 gap-1 font-semibold">
      <XCircle className="w-3 h-3" /> Refusée
    </Badge>
  );
}
