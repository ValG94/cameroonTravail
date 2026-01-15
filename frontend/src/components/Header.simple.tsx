import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2 py-2">
            <span className="text-2xl font-bold text-green-600">CameroonTravail</span>
          </Link>
          
          <nav className="flex items-center space-x-8">
            <Link to="/" className="font-medium text-gray-700 hover:text-green-600">
              Accueil
            </Link>
            <Link to="/recherche" className="font-medium text-gray-700 hover:text-green-600">
              Emplois
            </Link>
            <Link to="/connexion" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
              Connexion
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
