import { useAuth } from "@/_core/hooks/useAuth";
import { CandidatNav } from "@/components/CandidatNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { CV_TEMPLATES } from "@/cv-templates/registry";
import { buildTemplateData } from "@/cv-templates/dataMapper";
import { ArrowLeft, Crown, Download, Lock } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

/**
 * Éditeur premium minimaliste — Phase 1 : preview live des données candidat dans le template.
 * Phase 3 enrichira avec édition inline + export PDF.
 */
export default function CvPremiumEditor() {
  const [, params] = useRoute<{ slug: string }>("/candidat/cv-premium/:slug");
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();

  const slug = params?.slug || "";
  const meta = CV_TEMPLATES[slug];

  const accessQuery = trpc.cvTemplates.checkAccess.useQuery(
    { slug },
    { enabled: !!slug && !!user, retry: false }
  );

  // Données pour le template
  const { data: profile } = trpc.candidat.getProfile.useQuery(undefined, { enabled: !!user });
  const { data: experiences } = trpc.candidat.getExperiences.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: formations } = trpc.candidat.getFormations.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: competences } = trpc.candidat.getCompetences.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: langues } = trpc.candidat.getLangues.useQuery(undefined, { enabled: !!user });

  const [accentColor, setAccentColor] = useState<string>(meta?.defaultAccent || "#10b981");
  useEffect(() => {
    if (meta) setAccentColor(meta.defaultAccent);
  }, [meta]);

  const data = useMemo(
    () =>
      buildTemplateData({
        user: user ? { name: user.name, email: user.email } : null,
        candidat: profile,
        cvData: null,
        experiences: experiences || [],
        formations: formations || [],
        competences: competences || [],
        langues: langues || [],
      }),
    [user, profile, experiences, formations, competences, langues]
  );

  if (authLoading || accessQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidatNav />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Modèle introuvable</h2>
          <p className="text-gray-600 mb-4">Le modèle « {slug} » n'existe pas.</p>
          <Button onClick={() => setLocation("/candidat/templates")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la bibliothèque
          </Button>
        </div>
      </div>
    );
  }

  // Garde-fou serveur : si l'user n'a pas payé, on bloque
  if (accessQuery.data && !accessQuery.data.hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CandidatNav />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <Lock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Modèle verrouillé</h2>
          <p className="text-gray-600 mb-4">
            Vous devez débloquer ce modèle avant de l'utiliser.
          </p>
          <Button
            onClick={() => setLocation("/candidat/templates")}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Voir la bibliothèque
          </Button>
        </div>
      </div>
    );
  }

  const { Component } = meta;

  return (
    <div className="min-h-screen bg-gray-100">
      <CandidatNav />

      {/* Toolbar */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/candidat/templates")}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Retour
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-900">{meta.nom}</h1>
                <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                  <Crown className="w-3 h-3 mr-1" /> Premium
                </Badge>
              </div>
              <p className="text-xs text-gray-500">Aperçu généré depuis vos données candidat</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 flex items-center gap-2">
              Couleur :
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-gray-300"
              />
            </label>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => toast.info("Export PDF disponible en Phase 3")}
            >
              <Download className="w-4 h-4 mr-1" /> Télécharger PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Aperçu A4 centré */}
      <div className="py-8 flex justify-center">
        <div className="origin-top scale-90 sm:scale-100">
          <Suspense
            fallback={
              <Card className="w-[210mm] min-h-[297mm] flex items-center justify-center">
                <CardContent>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400" />
                </CardContent>
              </Card>
            }
          >
            <Component data={data} accentColor={accentColor} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
