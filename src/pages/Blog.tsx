import React from 'react';
import { Calendar, User, Clock, BookOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Blog: React.FC = () => {
  const { language, t } = useLanguage();

  const articles = [
    {
      id: 1,
      title: language === 'fr' ? 'Comment réussir son entretien d\'embauche au Cameroun' : 'How to succeed in your job interview in Cameroon',
      excerpt: language === 'fr' ? 'Découvrez nos conseils pratiques pour faire bonne impression lors de votre entretien d\'embauche et décrocher le poste de vos rêves.' : 'Discover our practical tips to make a good impression during your job interview and land your dream job.',
      image: 'https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: language === 'fr' ? 'Marie Ngomo' : 'Marie Ngomo',
      date: language === 'fr' ? '15 janvier 2024' : 'January 15, 2024',
      readTime: '5 min',
      category: language === 'fr' ? 'Entretien' : 'Interview',
      featured: true,
    },
    {
      id: 2,
      title: language === 'fr' ? 'Rédiger un CV qui se démarque sur le marché camerounais' : 'Writing a standout resume for the Cameroonian market',
      excerpt: language === 'fr' ? 'Les clés pour créer un CV attractif et professionnel adapté au contexte local et aux attentes des recruteurs.' : 'The keys to creating an attractive and professional resume adapted to the local context and recruiters\' expectations.',
      image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: language === 'fr' ? 'Paul Biya Junior' : 'Paul Biya Junior',
      date: language === 'fr' ? '12 janvier 2024' : 'January 12, 2024',
      readTime: '7 min',
      category: 'CV',
      featured: false,
    },
    {
      id: 3,
      title: language === 'fr' ? 'Les secteurs qui recrutent le plus au Cameroun en 2024' : 'The sectors hiring the most in Cameroon in 2024',
      excerpt: language === 'fr' ? 'Analyse des tendances du marché de l\'emploi et des opportunités dans les différents secteurs d\'activité.' : 'Analysis of job market trends and opportunities in different business sectors.',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: language === 'fr' ? 'Dr. Amina Fouda' : 'Dr. Amina Fouda',
      date: language === 'fr' ? '8 janvier 2024' : 'January 8, 2024',
      readTime: '10 min',
      category: language === 'fr' ? 'Marché' : 'Market',
      featured: false,
    },
    {
      id: 4,
      title: language === 'fr' ? 'Négocier son salaire : guide pratique pour le Cameroun' : 'Salary negotiation: practical guide for Cameroon',
      excerpt: language === 'fr' ? 'Comment aborder la question de la rémunération et négocier efficacement votre salaire selon votre profil.' : 'How to approach the compensation question and effectively negotiate your salary according to your profile.',
      image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: language === 'fr' ? 'Jean-Claude Essama' : 'Jean-Claude Essama',
      date: language === 'fr' ? '5 janvier 2024' : 'January 5, 2024',
      readTime: '6 min',
      category: language === 'fr' ? 'Négociation' : 'Negotiation',
      featured: false,
    },
    {
      id: 5,
      title: language === 'fr' ? 'Reconversion professionnelle : par où commencer ?' : 'Career change: where to start?',
      excerpt: language === 'fr' ? 'Conseils pour réussir sa reconversion professionnelle et identifier les opportunités dans votre nouveau secteur.' : 'Tips for successful career change and identifying opportunities in your new sector.',
      image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: language === 'fr' ? 'Sophie Mballa' : 'Sophie Mballa',
      date: language === 'fr' ? '2 janvier 2024' : 'January 2, 2024',
      readTime: '8 min',
      category: language === 'fr' ? 'Reconversion' : 'Career Change',
      featured: false,
    },
    {
      id: 6,
      title: language === 'fr' ? 'Freelance au Cameroun : créer son activité indépendante' : 'Freelancing in Cameroon: creating your independent business',
      excerpt: language === 'fr' ? 'Guide complet pour lancer son activité freelance : statut, démarches, tarification et recherche de clients.' : 'Complete guide to launching your freelance business: status, procedures, pricing and client search.',
      image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: language === 'fr' ? 'Thomas Nkomo' : 'Thomas Nkomo',
      date: language === 'fr' ? '28 décembre 2023' : 'December 28, 2023',
      readTime: '12 min',
      category: 'Freelance',
      featured: false,
    },
  ];

  const categories = language === 'fr' 
    ? ['Tous', 'Entretien', 'CV', 'Marché', 'Négociation', 'Reconversion', 'Freelance']
    : ['All', 'Interview', 'CV', 'Market', 'Negotiation', 'Career Change', 'Freelance'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Conseils Emploi
            </h1>
            <p className="text-xl md:text-2xl text-green-100">
              Nos experts partagent leurs conseils pour booster votre carrière
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        {articles.filter(article => article.featured).map((article) => (
          <div key={article.id} className="mb-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center mb-3">
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Article à la une
                    </span>
                    <span className="ml-3 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {article.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {article.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 text-lg">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <div className="flex items-center mr-6">
                      <User className="w-4 h-4 mr-2" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center mr-6">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{article.date}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Lire l'article
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.filter(article => !article.featured).map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {article.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span className="truncate">{article.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{article.date}</span>
                  </div>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Lire la suite →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Charger plus d'articles
          </button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg text-white p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Restez informé de nos derniers conseils
            </h3>
            <p className="text-green-100 mb-6">
              Recevez chaque semaine nos meilleurs articles directement dans votre boîte mail
            </p>
            
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;