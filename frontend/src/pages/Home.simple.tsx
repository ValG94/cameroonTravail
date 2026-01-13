import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trouvez votre emploi au Cameroun
            </h1>
            <p className="text-xl mb-8">
              Plus de 10 000 offres d'emploi dans tous les secteurs
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center border rounded-lg px-4 py-2">
                  <Search className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Métier, compétence, entreprise..."
                    className="flex-1 outline-none text-gray-700"
                  />
                </div>
                <div className="flex items-center border rounded-lg px-4 py-2">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Ville, région..."
                    className="flex-1 outline-none text-gray-700"
                  />
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Rechercher
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Briefcase className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900">10,000+</div>
              <div className="text-gray-600">Offres d'emploi</div>
            </div>
            <div>
              <Briefcase className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900">2,500+</div>
              <div className="text-gray-600">Entreprises</div>
            </div>
            <div>
              <Briefcase className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900">50,000+</div>
              <div className="text-gray-600">Candidats</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Dernières offres</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Développeur Full Stack
                </h3>
                <p className="text-gray-600 mb-4">Tech Solutions Cameroun</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  Douala
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-green-600 font-medium">CDI</span>
                  <Link
                    to={`/emploi/${i}`}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Voir l'offre →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/recherche"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Voir toutes les offres
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à décrocher votre prochain emploi ?
          </h2>
          <p className="text-xl mb-8">
            Rejoignez des milliers de professionnels qui ont trouvé leur emploi grâce à Cameroon Travail
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/inscription"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Créer mon compte
            </Link>
            <Link
              to="/cv"
              className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Déposer mon CV
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
