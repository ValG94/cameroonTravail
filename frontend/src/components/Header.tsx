import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobeIcon, MenuIcon, XIcon, ChevronDownIcon, UserIcon, FileTextIcon, BellIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
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
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  <span className="text-sm">{user.full_name}</span>
                  <ChevronDownIcon size={16} />
                </button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link 
                      to="/profil" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserIcon size={16} />
                      <span>{t('nav.profile')}</span>
                    </Link>
                    <Link 
                      to="/cv" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <FileTextIcon size={16} />
                      <span>{t('nav.cv')}</span>
                    </Link>
                    <Link 
                      to="/alertes" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <BellIcon size={16} />
                      <span>{t('nav.alerts')}</span>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button 
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
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
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">{user.full_name}</p>
                    <div className="flex flex-col space-y-2">
                      <Link 
                        to="/profil" 
                        className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon size={16} />
                        <span className="text-sm">{t('nav.profile')}</span>
                      </Link>
                      <Link 
                        to="/cv" 
                        className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FileTextIcon size={16} />
                        <span className="text-sm">{t('nav.cv')}</span>
                      </Link>
                      <Link 
                        to="/alertes" 
                        className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BellIcon size={16} />
                        <span className="text-sm">{t('nav.alerts')}</span>
                      </Link>
                      <button 
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center text-red-600 hover:text-red-700 font-medium transition-colors w-fit"
                      >
                        <span className="text-sm">{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
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
