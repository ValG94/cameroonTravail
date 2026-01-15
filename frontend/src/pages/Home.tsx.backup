import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, Users, Building2, TrendingUp, FileText, Star, UserCheck, Phone, ArrowRight, CheckCircle, Target, BookOpen, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const { language, t } = useLanguage();

  const stats = [
    { icon: Briefcase, value: '10,000+', label: t('home.stats.jobs') },
    { icon: Building2, value: '2,500+', label: t('home.stats.companies') },
    { icon: Users, value: '50,000+', label: t('home.stats.candidates') },
  ];

  const latestJobs = [
    {
      id: 1,
      title: 'Développeur Full Stack',
      company: 'Tech Solutions Cameroun',
      location: 'Douala',
      type: 'CDI',
      salary: '800,000 - 1,200,000 FCFA',
      posted: '2h',
    },
    {
      id: 2,
      title: 'Responsable Marketing',
      company: 'Groupe Saham',
      location: 'Yaoundé',
      type: 'CDI',
      salary: '600,000 - 900,000 FCFA',
      posted: '4h',
    },
    {
      id: 3,
      title: 'Comptable Senior',
      company: 'Cabinet Expertise',
      location: 'Bafoussam',
      type: 'CDD',
      salary: '450,000 - 650,000 FCFA',
      posted: '1j',
    },
  ];

  const adviceArticles = [
    {
      title: language === 'fr' ? 'Comment réussir son entretien d\'embauche' : 'How to succeed in your job interview',
      excerpt: language === 'fr' ? 'Nos conseils pour faire bonne impression lors de votre entretien...' : 'Our tips to make a good impression during your interview...',
      image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      title: language === 'fr' ? 'Rédiger un CV qui se démarque' : 'Writing a standout resume',
      excerpt: language === 'fr' ? 'Les clés pour créer un CV attractif et professionnel...' : 'The keys to creating an attractive and professional resume...',
      image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Dual Path */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('home.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100">
              {t('home.subtitle')}
            </p>
          </div>

          {/* Dual Path Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Candidate Path */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'fr' ? 'Je cherche un emploi' : 'I\'m looking for a job'}
                </h2>
                <p className="text-green-100">
                  {language === 'fr' ? 'Trouvez votre prochain emploi parmi des milliers d\'offres' : 'Find your next job among thousands of offers'}
                </p>
              </div>

              {/* Job Search Form */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('home.search.placeholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t('home.location.placeholder')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <Link
                  to="/recherche"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>{t('home.search.button')}</span>
                </Link>
              </div>

              <div className="space-y-3">
                <Link
                  to="/inscription"
                  className="w-full bg-white text-blue-600 hover:bg-gray-100 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {language === 'fr' ? 'Créer mon compte candidat' : 'Create my candidate account'}
                </Link>
                <Link
                  to="/cv"
                  className="w-full border border-white text-white hover:bg-white hover:text-blue-600 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {language === 'fr' ? 'Déposer mon CV' : 'Upload my CV'}
                </Link>
              </div>
            </div>

            {/* Recruiter Path */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 transition-all">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'fr' ? 'Je recrute' : 'I\'m recruiting'}
                </h2>
                <p className="text-green-100">
                  {language === 'fr' ? 'Trouvez les meilleurs talents pour votre entreprise' : 'Find the best talents for your company'}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{language === 'fr' ? 'Accès à notre CVthèque' : 'Access to our CV database'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{language === 'fr' ? 'Publication d\'offres illimitée' : 'Unlimited job posting'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{language === 'fr' ? 'Outils de gestion des candidatures' : 'Application management tools'}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>{language === 'fr' ? 'Support dédié' : 'Dedicated support'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/professionnel/inscription"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {language === 'fr' ? 'Créer mon compte recruteur' : 'Create my recruiter account'}
                </Link>
                <Link
                  to="/professionnel"
                  className="w-full border border-white text-white hover:bg-white hover:text-orange-600 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {language === 'fr' ? 'Découvrir l\'espace pro' : 'Discover pro space'}
                </Link>
                <button className="w-full bg-white/20 text-white hover:bg-white/30 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Être rappelé par un conseiller' : 'Request a callback'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-green-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.latest.jobs')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.discover.latest')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {latestJobs.map((job) => (
              <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-green-600 font-medium">{job.company}</p>
                  </div>
                  <span className="text-xs text-gray-500">{job.posted}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{job.location}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{job.type}</span>
                  <span className="text-sm font-medium text-gray-900">{job.salary}</span>
                </div>
                
                <Link
                  to={`/emploi/${job.id}`}
                  className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  {t('jobs.details')}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/recherche"
              className="inline-flex items-center px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-medium transition-colors"
            >
              {t('home.view.all.jobs')}
              <TrendingUp className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Job Advice */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('home.advice.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.experts.accompany')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {adviceArticles.map((article, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{article.title}</h3>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <Link
                    to="/blog"
                    className="text-green-600 hover:text-green-700 font-medium flex items-center"
                  >
                    {language === 'fr' ? 'Lire la suite' : 'Read more'}
                    <FileText className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('home.all.advice')}
              <Star className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl mb-8">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/inscription"
              className="px-8 py-3 bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              {t('home.cta.create.account')}
            </Link>
            <Link
              to="/cv"
              className="px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-lg font-semibold transition-colors"
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