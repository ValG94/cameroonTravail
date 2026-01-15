import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p className="text-gray-300 text-sm">
            © 2026 CameroonTravail. Tous droits réservés.
          </p>
          <div className="mt-4 space-x-4">
            <Link to="/about" className="text-gray-400 hover:text-white text-sm">
              À propos
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-white text-sm">
              Contact
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
              Conditions d'utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
