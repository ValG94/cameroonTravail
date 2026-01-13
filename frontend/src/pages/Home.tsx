import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchIcon, UsersIcon, BriefcaseIcon, CheckIcon } from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/recherche?q=${searchQuery}&location=${location}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-green-50">
              {t('home.hero.subtitle')}
            </p>
          </div>

          {/* Two Cards: Job Seeker & Recruiter */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Job Seeker Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-500 rounded-full p-4">
                  <UsersIcon size={32} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">
                {t('home.jobseeker.title')}
              </h2>
              <p className="text-green-50 text-center mb-6">
                {t('home.jobseeker.subtitle')}
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder={t('home.jobseeker.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder={t('home.jobseeker.location.placeholder')}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <SearchIcon size={20} />
                  <span>{t('home.jobseeker.search.button')}</span>
                </button>
                <Link
                  to="/inscription"
                  className="block w-full bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                >
                  {t('home.jobseeker.create.account')}
                </Link>
                <Link
                  to="/cv"
                  className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center border-2 border-white/30"
                >
                  {t('home.jobseeker.upload.cv')}
                </Link>
              </form>
            </div>

            {/* Recruiter Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <div className="flex justify-center mb-6">
                <div className="bg-orange-500 rounded-full p-4">
                  <BriefcaseIcon size={32} className="text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-4">
                {t('home.recruiter.title')}
              </h2>
              <p className="text-green-50 text-center mb-6">
                {t('home.recruiter.subtitle')}
              </p>

              {/* Recruiter Benefits */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start space-x-3">
                  <CheckIcon size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t('home.recruiter.benefit1')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t('home.recruiter.benefit2')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t('home.recruiter.benefit3')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckIcon size={20} className="text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{t('home.recruiter.benefit4')}</span>
                </div>
              </div>

              <Link
                to="/professionnel/inscription"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center mb-3"
              >
                {t('home.recruiter.create.account')}
              </Link>
              <Link
                to="/professionnel"
                className="block w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center border-2 border-white/30"
              >
                {t('home.recruiter.discover.pro')}
              </Link>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-colors mt-3 flex items-center justify-center space-x-2">
                <span>☎️</span>
                <span>{t('home.recruiter.contact.advisor')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="flex justify-center mb-3">
                <BriefcaseIcon size={40} className="text-yellow-400" />
              </div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-green-100">{t('home.stats.jobs')}</div>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <BriefcaseIcon size={40} className="text-yellow-400" />
              </div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-green-100">{t('home.stats.companies')}</div>
            </div>
            <div>
              <div className="flex justify-center mb-3">
                <UsersIcon size={40} className="text-yellow-400" />
              </div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-green-100">{t('home.stats.candidates')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.jobs.title')}
            </h2>
            <p className="text-gray-600">
              {t('home.jobs.subtitle')}
            </p>
          </div>

          {/* Job Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Job Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Développeur Full Stack
              </h3>
              <p className="text-gray-600 text-sm mb-4">Tech Solutions Cameroon</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>📍 Douala</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  CDI
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">500,000 - 800,000 FCFA</span>
                <Link
                  to="/emploi/1"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {t('home.jobs.view')} →
                </Link>
              </div>
            </div>

            {/* Job Card 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Responsable Marketing
              </h3>
              <p className="text-gray-600 text-sm mb-4">Orange Cameroun</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>📍 Yaoundé</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  CDD
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">600,000 - 900,000 FCFA</span>
                <Link
                  to="/emploi/2"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {t('home.jobs.view')} →
                </Link>
              </div>
            </div>

            {/* Job Card 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Comptable Senior
              </h3>
              <p className="text-gray-600 text-sm mb-4">Cabinet Expertise</p>
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>📍 Bafoussam</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  CDI
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">450,000 - 700,000 FCFA</span>
                <Link
                  to="/emploi/3"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {t('home.jobs.view')} →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/recherche"
              className="inline-block bg-white text-green-600 hover:bg-gray-50 font-semibold py-3 px-8 rounded-lg border-2 border-green-600 transition-colors"
            >
              {t('home.jobs.viewall')}
            </Link>
          </div>
        </div>
      </section>

      {/* Advice Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.advice.title')}
            </h2>
            <p className="text-gray-600">
              {t('home.advice.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Advice Card 1 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t('home.advice.article1.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('home.advice.article1.excerpt')}
                </p>
                <Link
                  to="/blog/1"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {t('home.advice.readmore')} →
                </Link>
              </div>
            </div>

            {/* Advice Card 2 */}
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-r from-green-500 to-green-600"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {t('home.advice.article2.title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('home.advice.article2.excerpt')}
                </p>
                <Link
                  to="/blog/2"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  {t('home.advice.readmore')} →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {t('home.advice.viewall')}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-blue-50 mb-8">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/inscription"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              {t('home.cta.create.account')}
            </Link>
            <Link
              to="/cv"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-4 px-8 rounded-lg border-2 border-white/30 transition-colors"
            >
              {t('home.cta.upload.cv')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
