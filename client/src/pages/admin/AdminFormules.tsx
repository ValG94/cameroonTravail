import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Star, Users, Briefcase, CheckCircle2 } from "lucide-react";

type Formule = {
  id: number;
  nom: string;
  cible: "candidat" | "employeur";
  prix: string;
  devise: string;
  periode: "mensuel" | "annuel" | "unique";
  description: string | null;
  fonctionnalites: string | null;
  actif: boolean;
  populaire: boolean;
  ordre: number;
  createdAt: Date;
  updatedAt: Date;
};

type FormuleForm = {
  nom: string;
  cible: "candidat" | "employeur";
  prix: string;
  devise: string;
  periode: "mensuel" | "annuel" | "unique";
  description: string;
  fonctionnalites: string;
  actif: boolean;
  populaire: boolean;
  ordre: number;
};

const defaultForm: FormuleForm = {
  nom: "",
  cible: "candidat",
  prix: "0",
  devise: "XAF",
  periode: "mensuel",
  description: "",
  fonctionnalites: "",
  actif: true,
  populaire: false,
  ordre: 0,
};

function parseFonctionnalites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [raw];
  } catch {
    return raw.split("\n").filter(Boolean);
  }
}

function formatPrix(prix: string, devise: string, periode: string): string {
  const montant = parseFloat(prix);
  if (montant === 0) return "Gratuit";
  const formatted = new Intl.NumberFormat("fr-FR").format(montant);
  const periodeLabel = periode === "mensuel" ? "/mois" : periode === "annuel" ? "/an" : "";
  return `${formatted} ${devise}${periodeLabel}`;
}

export default function AdminFormules() {
  const utils = trpc.useUtils();
  const { data: formules = [], isLoading } = trpc.admin.getFormules.useQuery();

  const [showDialog, setShowDialog] = useState(false);
  const [editingFormule, setEditingFormule] = useState<Formule | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<FormuleForm>(defaultForm);
  const [activeTab, setActiveTab] = useState<"candidat" | "employeur" | "all">("all");

  const createMutation = trpc.admin.createFormule.useMutation({
    onSuccess: () => {
      utils.admin.getFormules.invalidate();
      toast.success("Formule créée avec succès");
      setShowDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.updateFormule.useMutation({
    onSuccess: () => {
      utils.admin.getFormules.invalidate();
      toast.success("Formule mise à jour");
      setShowDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.deleteFormule.useMutation({
    onSuccess: () => {
      utils.admin.getFormules.invalidate();
      toast.success("Formule supprimée");
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = trpc.admin.toggleFormuleActif.useMutation({
    onSuccess: () => utils.admin.getFormules.invalidate(),
    onError: (err) => toast.error(err.message),
  });

  function openCreate() {
    setEditingFormule(null);
    setForm(defaultForm);
    setShowDialog(true);
  }

  function openEdit(f: Formule) {
    setEditingFormule(f);
    setForm({
      nom: f.nom,
      cible: f.cible,
      prix: f.prix,
      devise: f.devise,
      periode: f.periode,
      description: f.description || "",
      fonctionnalites: parseFonctionnalites(f.fonctionnalites).join("\n"),
      actif: f.actif,
      populaire: f.populaire,
      ordre: f.ordre,
    });
    setShowDialog(true);
  }

  function handleSubmit() {
    const fonctionnalitesJson = JSON.stringify(
      form.fonctionnalites.split("\n").map((s) => s.trim()).filter(Boolean)
    );
    const payload = {
      ...form,
      fonctionnalites: fonctionnalitesJson,
      description: form.description || undefined,
    };
    if (editingFormule) {
      updateMutation.mutate({ id: editingFormule.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filteredFormules = formules.filter((f) =>
    activeTab === "all" ? true : f.cible === activeTab
  );

  const candidatCount = formules.filter((f) => f.cible === "candidat").length;
  const employeurCount = formules.filter((f) => f.cible === "employeur").length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formules Tarifaires</h2>
          <p className="text-gray-500 mt-1">
            Gérez les plans d'abonnement pour les candidats et les employeurs
          </p>
        </div>
        <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle formule
        </Button>
      </div>

      {/* Onglets filtres */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "all", label: "Toutes", count: formules.length },
          { key: "candidat", label: "Candidats", count: candidatCount, icon: Users },
          { key: "employeur", label: "Employeurs", count: employeurCount, icon: Briefcase },
        ].map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === key ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Grille des formules */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredFormules.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucune formule tarifaire</p>
          <p className="text-sm mt-1">Cliquez sur "Nouvelle formule" pour en créer une</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFormules.map((formule) => {
            const fonctionnalites = parseFonctionnalites(formule.fonctionnalites);
            return (
              <div
                key={formule.id}
                className={`relative rounded-xl border-2 p-5 flex flex-col gap-3 transition-all ${
                  formule.populaire
                    ? "border-green-500 bg-green-50 shadow-md"
                    : formule.actif
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50 opacity-60"
                }`}
              >
                {/* Badge populaire */}
                {formule.populaire && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      <Star className="w-3 h-3 fill-white" />
                      Populaire
                    </span>
                  </div>
                )}

                {/* En-tête */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{formule.nom}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={formule.cible === "candidat" ? "text-blue-600 border-blue-300" : "text-orange-600 border-orange-300"}
                      >
                        {formule.cible === "candidat" ? (
                          <><Users className="w-3 h-3 mr-1" />Candidat</>
                        ) : (
                          <><Briefcase className="w-3 h-3 mr-1" />Employeur</>
                        )}
                      </Badge>
                      <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">
                        {formule.periode}
                      </Badge>
                    </div>
                  </div>
                  <Switch
                    checked={formule.actif}
                    onCheckedChange={(v) => toggleMutation.mutate({ id: formule.id, actif: v })}
                    className="mt-1"
                  />
                </div>

                {/* Prix */}
                <div className="text-2xl font-extrabold text-green-700">
                  {formatPrix(formule.prix, formule.devise, formule.periode)}
                </div>

                {/* Description */}
                {formule.description && (
                  <p className="text-sm text-gray-500">{formule.description}</p>
                )}

                {/* Fonctionnalités */}
                {fonctionnalites.length > 0 && (
                  <ul className="space-y-1 flex-1">
                    {fonctionnalites.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {fonctionnalites.length > 4 && (
                      <li className="text-xs text-gray-400 ml-6">
                        +{fonctionnalites.length - 4} autres fonctionnalités
                      </li>
                    )}
                  </ul>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(formule)}
                    className="flex-1 gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteId(formule.id)}
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Créer / Modifier */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFormule ? "Modifier la formule" : "Nouvelle formule tarifaire"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Nom de la formule *</Label>
                <Input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Ex: Premium Candidat"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Cible *</Label>
                <Select
                  value={form.cible}
                  onValueChange={(v) => setForm({ ...form, cible: v as "candidat" | "employeur" })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candidat">Candidat</SelectItem>
                    <SelectItem value="employeur">Employeur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Période *</Label>
                <Select
                  value={form.periode}
                  onValueChange={(v) => setForm({ ...form, periode: v as "mensuel" | "annuel" | "unique" })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                    <SelectItem value="unique">Paiement unique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prix (0 = Gratuit) *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.prix}
                  onChange={(e) => setForm({ ...form, prix: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Devise</Label>
                <Select
                  value={form.devise}
                  onValueChange={(v) => setForm({ ...form, devise: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XAF">XAF (FCFA)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label>Description courte</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Pour les candidats actifs en recherche d'emploi"
                  className="mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label>Fonctionnalités (une par ligne)</Label>
                <Textarea
                  value={form.fonctionnalites}
                  onChange={(e) => setForm({ ...form, fonctionnalites: e.target.value })}
                  placeholder={"CV illimités\nPostuler à offres illimitées\nMise en avant dans la CVthèque"}
                  rows={5}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.ordre}
                  onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="actif"
                    checked={form.actif}
                    onCheckedChange={(v) => setForm({ ...form, actif: v })}
                  />
                  <Label htmlFor="actif">Formule active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="populaire"
                    checked={form.populaire}
                    onCheckedChange={(v) => setForm({ ...form, populaire: v })}
                  />
                  <Label htmlFor="populaire">Mise en avant (populaire)</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending || !form.nom}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {editingFormule ? "Enregistrer" : "Créer la formule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette formule ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La formule sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
