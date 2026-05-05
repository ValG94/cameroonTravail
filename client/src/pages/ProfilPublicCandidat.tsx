import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { SiteHeader } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Star,
  Globe2,
  Award,
  Heart,
  Download,
  FileText,
  ArrowLeft,
} from "lucide-react";

export default function ProfilPublicCandidat() {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const [, navigate] = useLocation();

  const { data, isLoading, error } = trpc.cv.getPublicProfile.useQuery(
    { userId },
    { enabled: !!userId && !isNaN(userId) }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <User className="w-16 h-16 text-gray-300" />
          <h2 className="text-xl font-bold text-gray-600">Profil introuvable</h2>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const { user, candidat, activeCv, cvData } = data;

  const experiences = cvData?.experiences ? JSON.parse(cvData.experiences) : [];
  const formations = cvData?.formations ? JSON.parse(cvData.formations) : [];
  const competences = cvData?.competences ? JSON.parse(cvData.competences) : [];
  const languesCv = cvData?.languesCv ? JSON.parse(cvData.languesCv) : [];

  const niveauLabel = ["Notions", "Débutant", "Intermédiaire", "Avancé", "Expert"];

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>

        {/* Header card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-700" />
          <CardContent className="pt-0 pb-6 px-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              {cvData?.photoUrl ? (
                <img
                  src={cvData.photoUrl}
                  alt="Photo"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-white shadow-md flex items-center justify-center">
                  <User className="w-8 h-8 text-emerald-600" />
                </div>
              )}
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {cvData?.prenom || ""} {cvData?.nom || user.name || "Candidat"}
                </h1>
                {cvData?.titre && (
                  <p className="text-emerald-700 font-medium">{cvData.titre}</p>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {cvData?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-emerald-500" /> {cvData.email}
                </span>
              )}
              {cvData?.telephone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-emerald-500" /> {cvData.telephone}
                </span>
              )}
              {cvData?.adresse && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-500" /> {cvData.adresse}
                </span>
              )}
              {cvData?.siteWeb && (
                <a
                  href={cvData.siteWeb.startsWith("http") ? cvData.siteWeb : `https://${cvData.siteWeb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-emerald-600 hover:underline"
                >
                  <Globe className="w-4 h-4" /> {cvData.siteWeb}
                </a>
              )}
            </div>

            {activeCv?.fileUrl && (
              <div className="mt-4">
                <a href={activeCv.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="w-4 h-4 mr-2" /> Télécharger le CV
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-4">
            {competences.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-emerald-600" /> Compétences
                  </h3>
                  {competences.map((c: any) => (
                    <div key={c.id} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{c.nom}</span>
                        <span className="text-gray-400 text-xs">{niveauLabel[c.niveau - 1]}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{ width: `${(c.niveau / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {languesCv.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-emerald-600" /> Langues
                  </h3>
                  {languesCv.map((l: any) => (
                    <div key={l.id} className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">{l.nom}</span>
                      <Badge variant="outline" className="text-xs">{l.niveau}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {cvData?.loisirs && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-600" /> Centres d'intérêt
                  </h3>
                  <p className="text-sm text-gray-600">{cvData.loisirs}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right column */}
          <div className="md:col-span-2 space-y-4">
            {cvData?.resume && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> Profil
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{cvData.resume}</p>
                </CardContent>
              </Card>
            )}

            {experiences.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" /> Expériences professionnelles
                  </h3>
                  {experiences.map((exp: any) => (
                    <div key={exp.id} className="mb-4 pl-4 border-l-2 border-emerald-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{exp.poste}</p>
                          <p className="text-sm text-emerald-700">
                            {exp.entreprise}{exp.ville ? ` — ${exp.ville}` : ""}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 shrink-0 ml-4">
                          {exp.dateDebut}{exp.dateDebut && " – "}{exp.enCours ? "Présent" : exp.dateFin}
                        </p>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {formations.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" /> Formations
                  </h3>
                  {formations.map((f: any) => (
                    <div key={f.id} className="mb-3 pl-4 border-l-2 border-emerald-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{f.diplome}</p>
                          <p className="text-sm text-emerald-700">
                            {f.etablissement}{f.ville ? ` — ${f.ville}` : ""}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400 shrink-0 ml-4">
                          {f.dateDebut}{f.dateDebut && f.dateFin && " – "}{f.dateFin}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {cvData?.certifications && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" /> Certifications
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{cvData.certifications}</p>
                </CardContent>
              </Card>
            )}

            {!cvData && activeCv?.type === "creatif" && activeCv.fileUrl && (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Ce candidat a déposé un CV personnalisé.</p>
                  <a href={activeCv.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="w-4 h-4 mr-2" /> Voir le CV
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}

            {!activeCv && (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Ce candidat n'a pas encore déposé de CV.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
