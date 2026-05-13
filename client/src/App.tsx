import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import SelectProfile from "./pages/SelectProfile";
import ChoixInscription from "./pages/ChoixInscription";
import InscriptionCandidat from "./pages/InscriptionCandidat";
import InscriptionEmployeur from "./pages/InscriptionEmployeur";
import CandidatDashboard from "./pages/candidat/Dashboard";
import CandidatProfil from "./pages/candidat/Profil";
import CandidatExperiences from "./pages/candidat/Experiences";
import CandidatFormations from "./pages/candidat/Formations";
import CandidatCV from "./pages/candidat/CV";
import CandidatCompetences from "./pages/candidat/Competences";
import CandidatLangues from "./pages/candidat/Langues";
import CandidatCandidatures from "./pages/candidat/Candidatures";
import CandidatAlertes from "./pages/candidat/Alertes";
import CandidatTemplates from "./pages/candidat/Templates";
import CvPremiumEditor from "./pages/candidat/CvPremiumEditor";
import EmployeurDashboard from "./pages/employeur/Dashboard";
import BienvenueEmployeur from "./pages/employeur/Bienvenue";
import EmployeurCandidatures from "./pages/employeur/Candidatures";
import EmployeurOffres from "./pages/employeur/Offres";
import ToutesLesOffres from "./pages/ToutesLesOffres";
import EmployeurPublier from "./pages/employeur/Publier";
import EmployeurProfil from "./pages/employeur/Profil";
import ModifierOffre from "./pages/employeur/ModifierOffre";
import Connexion from "./pages/Connexion";
import RechercheEmploi from "./pages/RechercheEmploi";
import OffreDetail from "./pages/OffreDetail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import Conseils from "./pages/Conseils";
import ConseilDetail from "./pages/ConseilDetail";
import DeposerCV from "./pages/DeposerCV";
import CVClassique from "./pages/CVClassique";
import CVModerne from "./pages/CVModerne";
import ProfilPublicCandidat from "./pages/ProfilPublicCandidat";
import CVtheque from "./pages/CVtheque";
import EspaceRecruteur from "./pages/EspaceRecruteur";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/select-profile"} component={SelectProfile} />
      <Route path={"/inscription"} component={ChoixInscription} />
      <Route path={"/inscription/candidat"} component={InscriptionCandidat} />
      <Route path={"/inscription/employeur"} component={InscriptionEmployeur} />
      <Route path={"/connexion"} component={Connexion} />
      <Route path={"/mot-de-passe-oublie"} component={ForgotPassword} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      <Route path={"/candidat/dashboard"} component={CandidatDashboard} />
      <Route path="/candidat/profil" component={CandidatProfil} />
      <Route path="/candidat/experiences" component={CandidatExperiences} />
      <Route path="/candidat/formations" component={CandidatFormations} />
      <Route path="/candidat/competences" component={CandidatCompetences} />
      <Route path="/candidat/langues" component={CandidatLangues} />
      <Route path={"/candidat/cv"} component={CandidatCV} />
      <Route path="/candidat/candidatures" component={CandidatCandidatures} />
      <Route path="/candidat/alertes" component={CandidatAlertes} />
      <Route path="/candidat/templates" component={CandidatTemplates} />
      <Route path="/candidat/cv-premium/:slug" component={CvPremiumEditor} />
      <Route path="/recherche-emploi" component={RechercheEmploi} />
      <Route path="/emploi-public" component={RechercheEmploi} />
      <Route path="/emploi-prive" component={RechercheEmploi} />
      <Route path="/offres" component={ToutesLesOffres} />
      <Route path="/offre/:id" component={OffreDetail} />
      <Route path="/conseils" component={Conseils} />
      <Route path="/conseils/:slug" component={ConseilDetail} />
      <Route path="/employeur/bienvenue" component={BienvenueEmployeur} />
      <Route path="/employeur/dashboard" component={EmployeurDashboard} />
      <Route path="/employeur/candidatures" component={EmployeurCandidatures} />
      <Route path="/employeur/offres" component={EmployeurOffres} />
      <Route path="/employeur/publier" component={EmployeurPublier} />
      <Route path="/employeur/profil" component={EmployeurProfil} />
      <Route path="/employeur/offres/:id/modifier" component={ModifierOffre} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/deposer-cv" component={DeposerCV} />
      <Route path="/cv/classique" component={CVClassique} />
      <Route path="/cv/moderne" component={CVModerne} />
      <Route path="/profil-candidat/:id" component={ProfilPublicCandidat} />
      <Route path="/cvtheque" component={CVtheque} />
      <Route path="/espace-recruteur" component={EspaceRecruteur} />
      <Route path="/tarifs" component={EspaceRecruteur} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
