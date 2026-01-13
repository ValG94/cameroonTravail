import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block text-6xl font-bold text-gray-900 mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page non trouvée
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Désolé, la page que vous recherchez n'existe pas.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Que souhaitez-vous faire ?
            </h2>
            
            <div className="space-y-4">
              <Link
                to="/"
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </Link>
              
              <Link
                to="/recherche"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Search className="w-5 h-5 mr-2" />
                Rechercher un emploi
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Page précédente
              </button>
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Si vous pensez qu'il s'agit d'une erreur, 
              <Link to="/contact" className="text-green-600 hover:text-green-500 ml-1">
                contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;