import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Bienvenue sur CameroonTravail
      </h1>
      <p className="text-xl text-gray-700 mb-8">
        La plateforme de référence pour l'emploi au Cameroun
      </p>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Fonctionnalités à venir</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Recherche d'emploi
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Dépôt de CV
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Alertes emploi
          </li>
          <li className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Espace professionnel
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
