import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, TwitterIcon, LinkedinIcon, InstagramIcon, MailIcon, PhoneIcon, MapPinIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-400">CameroonTravail</span>
            </div>
            <p className="text-gray-300 text-sm">
              {t('footer.platform.description')}
            </p>
            {/* Social Media Icons */}
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Facebook">
                <FacebookIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <TwitterIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <LinkedinIcon size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <InstagramIcon size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quick.links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/recherche" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.jobs')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link to="/cv" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('nav.cv')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.support')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/aide" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('footer.help')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link to="/conditions" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="text-gray-300 hover:text-white transition-colors text-sm">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact.info')}</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  123 Rue du Commerce<br />
                  Douala, Cameroun
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+237 6XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-3">
                <MailIcon size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">contact@cameroontravail.cm</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Cameroon Travail. {t('footer.rights')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/conditions" className="text-gray-400 hover:text-white transition-colors text-sm">
                {t('footer.terms')}
              </Link>
              <Link to="/confidentialite" className="text-gray-400 hover:text-white transition-colors text-sm">
                {t('footer.privacy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
