import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon, MenuIcon, XIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 py-2">
            <span className="text-2xl font-bold text-green-600">CameroonTravail</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium text-gray-700 hover:text-green-600 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/recherche" className="font-medium text-gray-700 hover:text-green-600 transition-colors">
              {t('nav.jobs')}
            </Link>
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors border border-gray-300 px-3 py-1 rounded"
              title="Change language"
            >
              <GlobeIcon size={16} />
              <span className="text-sm font-medium uppercase">{language}</span>
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName}
                </span>
                <button 
                  onClick={logout}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/connexion" 
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link 
                  to="/inscription" 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-700 hover:text-green-600 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="font-medium text-gray-700 hover:text-green-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.home')}
              </Link>
              <Link 
                to="/recherche" 
                className="font-medium text-gray-700 hover:text-green-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.jobs')}
              </Link>
              
              {/* Language Toggle Mobile */}
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors w-fit"
              >
                <GlobeIcon size={16} />
                <span className="text-sm font-medium uppercase">{language}</span>
              </button>

              {/* Auth Section Mobile */}
              {user ? (
                <>
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName}
                  </span>
                  <button 
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors w-fit"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/connexion" 
                    className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link 
                    to="/inscription" 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
