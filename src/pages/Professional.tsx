import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Target, TrendingUp, BookOpen, Phone, Mail, CheckCircle, ArrowRight, FileText, BarChart3, UserCheck, HeadphonesIcon, Star, Award } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Professional: React.FC = () => {
  const { language, t } = useLanguage();

  const features = [
    {
      icon: Users,
      title: language === 'fr' ? 'CVthèque Premium' : 'Premium CV Database',
      description: language === 'fr' ? 'Accédez à plus de 50,000 profils qualifiés' : 'Access over 50,000 qualified profiles',
    },
    {
      icon: Target,
      title: language === 'fr' ? 'Ciblage Précis' : 'Precise Targeting',
      description: language === 'fr' ? 'Trouvez les candidats parfaits grâce à nos filtres avancés' : 'Find perfect candidates with our advanced filters',
    },
    {
      icon: BarChart3,
      title: language === 'fr' ? 'Analytics Avancés' : 'Advanced Analytics',
      description: language === 'fr' ? 'Suivez les performances de vos offres en temps réel' : 'Track your job posting performance in real-time',
    },
    {
      icon: HeadphonesIcon,
      title: language === 'fr' ? 'Support Dédié' : 'Dedicated Support',
      description: language === 'fr' ? 'Un conseiller dédié pour vous accompagner' : 'A dedicated advisor to support you',
    },
  ];

  const recruitmentTips = [
    {
      title: language === 'fr' ? 'Rédiger une offre d\'emploi attractive' : 'Writing an attractive job offer',
      description: language === 'fr' ? 'Les clés pour attirer les meilleurs candidats' : 'Keys to attracting the best candidates',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '5 min',
    },
    {
      title: language === 'fr' ? 'Optimiser votre processus de recrutement' : 'Optimize your recruitment process',
      description: language === 'fr' ? 'Réduisez le temps de recrutement et améliorez la qualité' : 'Reduce recruitment time and improve quality',
      image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '7 min',
    },
    {
      title: language === 'fr' ? 'Évaluer les compétences techniques' : 'Evaluating technical skills',
      description: language === 'fr' ? 'Méthodes et outils pour une évaluation efficace' : 'Methods and tools for effective evaluation',
      image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '6 min',
    },
  ];

  const stats = [
    { value: '2,500+', label: language === 'fr' ? 'Entreprises partenaires' : 'Partner companies' },
    { value: '95%', label: language === 'fr' ? 'Taux de satisfaction' : 'Satisfaction rate' },
    { value: '15j', label: language === 'fr' ? 'Temps moyen de recrutement' : 'Average recruitment time' },
    { value: '24h', label: language === 'fr' ? 'Support réactif' : 'Responsive support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'fr' ? 'Recrutez les meilleurs talents au Cameroun' : 'Recruit the best talents in Cameroon'}
              </h1>
              <p className="text-xl mb-8 text-orange-100">
                {language === 'fr' 
                  ? 'Plateforme de recrutement #1 au Cameroun. Trouvez rapidement les profils qui correspondent à vos besoins.'
                  : 'Cameroon\'s #1 recruitment platform. Quickly find profiles that match your needs.'
                }
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Link
                  to="/professionnel/inscription"
                  className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  {language === 'fr' ? 'Commencer gratuitement' : 'Start for free'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <button className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center">
                  <Phone className="mr-2 w-5 h-5" />
                  {language === 'fr' ? 'Être rappelé' : 'Request callback'}
                </button>
              </div>

              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>{language === 'fr' ? 'Essai gratuit 30 jours' : '30-day free trial'}</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span>{language === 'fr' ? 'Sans engagement' : 'No commitment'}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6">
                  {language === 'fr' ? 'Inscription Recruteur' : 'Recruiter Registration'}
                </h3>
                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder={language === 'fr' ? 'Nom de l\'entreprise' : 'Company name'}
                      className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder={language === 'fr' ? 'Email professionnel' : 'Professional email'}
                      className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder={language === 'fr' ? 'Téléphone' : 'Phone number'}
                      className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <select className="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>{language === 'fr' ? 'Taille de l\'entreprise' : 'Company size'}</option>
                      <option>1-10 {language === 'fr' ? 'employés' : 'employees'}</option>
                      <option>11-50 {language === 'fr' ? 'employés' : 'employees'}</option>
                      <option>51-200 {language === 'fr' ? 'employés' : 'employees'}</option>
                      <option>200+ {language === 'fr' ? 'employés' : 'employees'}</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    {language === 'fr' ? 'Créer mon compte' : 'Create my account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Pourquoi choisir Cameroon Travail ?' : 'Why choose Cameroon Travail?'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'fr' 
                ? 'Des outils puissants pour optimiser votre recrutement'
                : 'Powerful tools to optimize your recruitment'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruitment Tips Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Conseils Recrutement' : 'Recruitment Tips'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'fr' 
                ? 'Nos experts partagent leurs meilleures pratiques'
                : 'Our experts share their best practices'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {recruitmentTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                      {language === 'fr' ? 'Guide' : 'Guide'}
                    </span>
                    <span className="text-gray-500 text-sm">{tip.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 mb-4">{tip.description}</p>
                  <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center">
                    {language === 'fr' ? 'Lire le guide' : 'Read guide'}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/professionnel/guides"
              className="inline-flex items-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              {language === 'fr' ? 'Voir tous les guides' : 'View all guides'}
              <BookOpen className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {language === 'fr' ? 'Tarifs Transparents' : 'Transparent Pricing'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'fr' 
                ? 'Choisissez la formule qui correspond à vos besoins'
                : 'Choose the plan that fits your needs'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Starter' : 'Starter'}
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {language === 'fr' ? 'Gratuit' : 'Free'}
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? '3 offres par mois' : '3 job posts per month'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Accès CVthèque limité' : 'Limited CV database access'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Support email' : 'Email support'}</span>
                </li>
              </ul>
              <button className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white py-3 rounded-lg font-semibold transition-colors">
                {language === 'fr' ? 'Commencer' : 'Get started'}
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-lg shadow-md p-8 border-2 border-orange-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  {language === 'fr' ? 'Populaire' : 'Popular'}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Professionnel' : 'Professional'}
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                50,000 FCFA<span className="text-lg text-gray-600">/mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Offres illimitées' : 'Unlimited job posts'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'CVthèque complète' : 'Full CV database'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Analytics avancés' : 'Advanced analytics'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Support prioritaire' : 'Priority support'}</span>
                </li>
              </ul>
              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors">
                {language === 'fr' ? 'Choisir ce plan' : 'Choose this plan'}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {language === 'fr' ? 'Entreprise' : 'Enterprise'}
              </h3>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {language === 'fr' ? 'Sur mesure' : 'Custom'}
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Tout du plan Pro' : 'Everything in Pro'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Conseiller dédié' : 'Dedicated advisor'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'Formation équipe' : 'Team training'}</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{language === 'fr' ? 'API personnalisée' : 'Custom API'}</span>
                </li>
              </ul>
              <button className="w-full border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white py-3 rounded-lg font-semibold transition-colors">
                {language === 'fr' ? 'Nous contacter' : 'Contact us'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'fr' 
              ? 'Prêt à transformer votre recrutement ?'
              : 'Ready to transform your recruitment?'
            }
          </h2>
          <p className="text-xl mb-8">
            {language === 'fr' 
              ? 'Rejoignez plus de 2,500 entreprises qui nous font confiance'
              : 'Join over 2,500 companies that trust us'
            }
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/professionnel/inscription"
              className="px-8 py-3 bg-white text-orange-600 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              {language === 'fr' ? 'Essai gratuit 30 jours' : '30-day free trial'}
            </Link>
            <button className="px-8 py-3 border-2 border-white text-white hover:bg-white hover:text-orange-600 rounded-lg font-semibold transition-colors flex items-center justify-center">
              <Phone className="mr-2 w-5 h-5" />
              {language === 'fr' ? 'Parler à un expert' : 'Talk to an expert'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Professional;