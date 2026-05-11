import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { TemplateThumbnail } from "@/cv-templates/Thumbnails";
import { Crown, Lock, Sparkles, Check, ArrowRight, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Provider = "mtn_momo" | "orange_money";

export default function CandidatTemplates() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: templates, isLoading } = trpc.cvTemplates.list.useQuery();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("mtn_momo");
  const [phone, setPhone] = useState("");

  // Garde-fou : seuls les candidats accèdent à la page
  useEffect(() => {
    if (!authLoading && (!user || (user.profileType !== "candidat" && user.role !== "admin"))) {
      setLocation("/connexion");
    }
  }, [user, authLoading, setLocation]);

  const purchaseMutation = trpc.cvTemplates.initiatePurchase.useMutation({
    onSuccess: (data, variables) => {
      utils.cvTemplates.list.invalidate();
      setSelectedSlug(null);
      if (data.alreadyPurchased) {
        toast.info("Vous aviez déjà accès à ce modèle");
      } else {
        toast.success("Paiement validé. Modèle débloqué !");
      }
      // Rediriger vers l'éditeur du template (à créer en Phase 3)
      // Pour l'instant on rafraîchit juste la liste
      setLocation(`/candidat/cv-premium/${variables.slug}`);
    },
    onError: (e) => toast.error(e.message || "Erreur lors du paiement"),
  });

  const handlePay = () => {
    if (!selectedSlug) return;
    if (!phone.trim()) {
      toast.error("Numéro de téléphone requis pour le paiement mobile money");
      return;
    }
    purchaseMutation.mutate({ slug: selectedSlug, provider, payerPhone: phone.trim() });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CandidatNav />

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Hero */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-2xl p-3">
              <Crown className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Bibliothèque de modèles premium</h1>
              <p className="text-amber-50 max-w-2xl">
                Démarquez-vous des autres candidats avec un CV au design professionnel.
                Modèle à <span className="whitespace-nowrap">1&nbsp;000&nbsp;FCFA</span>,
                paiement unique par modèle.
              </p>
            </div>
          </div>
        </div>

        {/* Note rassurante : la bibliothèque est optionnelle */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-900">
          <p>
            <strong>L'utilisation de cette bibliothèque est facultative.</strong> Vous pouvez
            continuer à utiliser nos modèles gratuits ou{" "}
            <button
              onClick={() => setLocation("/deposer-cv")}
              className="text-blue-700 underline font-medium hover:text-blue-900"
            >
              uploader votre propre CV
            </button>{" "}
            depuis votre profil.
          </p>
        </div>

        {/* Grille de templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((tpl) => {
            return (
              <Card
                key={tpl.id}
                className={`overflow-hidden border-2 transition-all ${
                  tpl.purchased
                    ? "border-emerald-400 shadow-md"
                    : "border-gray-200 hover:border-amber-400 hover:shadow-lg"
                }`}
              >
                {/* Mini-aperçu CSS du template (reflète sa vraie mise en page) */}
                <div className="h-56 relative bg-gray-50 border-b border-gray-200">
                  <TemplateThumbnail slug={tpl.slug} className="w-full h-full" />
                  {tpl.purchased ? (
                    <Badge className="absolute top-3 right-3 bg-emerald-500 text-white hover:bg-emerald-500 shadow">
                      <Check className="w-3 h-3 mr-1" /> Débloqué
                    </Badge>
                  ) : (
                    <Badge className="absolute top-3 right-3 bg-amber-500 text-white hover:bg-amber-500 shadow">
                      <Crown className="w-3 h-3 mr-1" /> Premium
                    </Badge>
                  )}
                </div>

                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{tpl.nom}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                    {tpl.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {Number(tpl.prix).toLocaleString("fr-FR")}{" "}
                      <span className="text-sm font-normal text-gray-500">{tpl.devise}</span>
                    </span>
                    {tpl.purchased && (
                      <span className="text-xs text-emerald-600 font-medium">Acheté</span>
                    )}
                  </div>

                  {tpl.purchased ? (
                    <Button
                      onClick={() => setLocation(`/candidat/cv-premium/${tpl.slug}`)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      Utiliser ce modèle
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedSlug(tpl.slug);
                        setProvider("mtn_momo");
                        setPhone("");
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Débloquer pour {Number(tpl.prix).toLocaleString("fr-FR")} FCFA
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!templates?.length && (
          <div className="text-center py-16 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun modèle disponible pour l'instant.</p>
          </div>
        )}
      </div>

      {/* Modal de paiement */}
      <Dialog open={!!selectedSlug} onOpenChange={(open) => !open && setSelectedSlug(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Débloquer ce modèle
            </DialogTitle>
            <DialogDescription>
              Paiement unique de 1000 FCFA — accès à vie à ce modèle.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2 block">Méthode de paiement</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setProvider("mtn_momo")}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    provider === "mtn_momo"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  MTN MoMo
                </button>
                <button
                  onClick={() => setProvider("orange_money")}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    provider === "orange_money"
                      ? "border-amber-500 bg-amber-50 text-amber-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Orange Money
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="mb-1 block">
                Numéro de téléphone
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6XX XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Vous recevrez une notification de paiement sur ce numéro.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              ⚠ Phase de test — le paiement est simulé pour l'instant. La vraie intégration
              MoMo / Orange Money sera activée prochainement.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSlug(null)}>
              Annuler
            </Button>
            <Button
              onClick={handlePay}
              disabled={purchaseMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {purchaseMutation.isPending ? "Traitement..." : "Payer 1000 FCFA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
