import { useLocation } from "wouter";

export default function SiteFooter() {
  const [, setLocation] = useLocation();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/99126893/SPbMst9fYMnn3KTn3JChUH/logocameroonTravail_ed569233.png"
              alt="Cameroon Travail"
              className="h-12 mb-4 cursor-pointer"
              onClick={() => setLocation("/")}
            />
            <p className="text-sm">La plateforme de référence pour l'emploi au Cameroun</p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Candidats</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setLocation("/emploi-public")} className="hover:text-white">
                  Emploi Public
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/emploi-prive")} className="hover:text-white">
                  Emploi Privé
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/conseils")} className="hover:text-white">
                  Conseils carrière
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Employeurs</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => setLocation("/employeur/publier")} className="hover:text-white">
                  Publier une offre
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/inscription/employeur")} className="hover:text-white">
                  Créer un compte recruteur
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/conseils")} className="hover:text-white">
                  Conseils recrutement
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">À propos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="hover:text-white">Qui sommes-nous</button>
              </li>
              <li>
                <button className="hover:text-white">Contact</button>
              </li>
              <li>
                <button className="hover:text-white">Mentions légales</button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Cameroon Travail. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
