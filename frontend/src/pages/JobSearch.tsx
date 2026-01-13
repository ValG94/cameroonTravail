import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const JobSearch: React.FC = () => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    contractType: '',
    salary: '',
    company: '',
  });

  const jobs = [
    {
      id: 1,
      title: 'Développeur Full Stack Senior',
      company: 'Tech Solutions Cameroun',
      location: 'Douala',
      type: 'CDI',
      salary: '800,000 - 1,200,000 FCFA',
      posted: '2 heures',
      description: 'Nous recherchons un développeur expérimenté pour rejoindre notre équipe...',
      requirements: ['React', 'Node.js', 'PostgreSQL', '3+ ans d\'expérience'],
      featured: true,
    },
    {
      id: 2,
      title: 'Responsable Marketing Digital',
      company: 'Groupe Saham',
      location: 'Yaoundé',
      type: 'CDI',
      salary: '600,000 - 900,000 FCFA',
      posted: '4 heures',
      description: 'Pilotez nos stratégies marketing digital et développez notre présence en ligne...',
      requirements: ['Marketing Digital', 'SEO/SEM', 'Google Analytics', 'Réseaux sociaux'],
      featured: false,
    },
    {
      id: 3,
      title: 'Comptable Senior',
      company: 'Cabinet Expertise Comptable',
      location: 'Bafoussam',
      type: 'CDD',
      salary: '450,000 - 650,000 FCFA',
      posted: '1 jour',
      description: 'Rejoignez notre équipe comptable pour gérer un portefeuille de clients...',
      requirements: ['Expertise comptable', 'Sage', 'Fiscalité', '5+ ans d\'expérience'],
      featured: false,
    },
    {
      id: 4,
      title: 'Chef de Projet IT',
      company: 'Orange Cameroun',
      location: 'Douala',
      type: 'CDI',
      salary: '1,000,000 - 1,500,000 FCFA',
      posted: '2 jours',
      description: 'Dirigez des projets technologiques d\'envergure dans un environnement dynamique...',
      requirements: ['Gestion de projet', 'SCRUM', 'IT', 'Leadership'],
      featured: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('jobs.title')}</h1>
          
          {/* Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('home.search.placeholder')}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('home.location.placeholder')}
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
              <Search className="w-5 h-5" />
              <span>{t('home.search.button')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                {t('jobs.filters')}
              </h3>
              
              {/* Contract Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de contrat
                </label>
                <select
                  value={filters.contractType}
                  onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('jobs.all.types')}</option>
                  <option value="cdi">{t('jobs.contract.cdi')}</option>
                  <option value="cdd">{t('jobs.contract.cdd')}</option>
                  <option value="stage">{t('jobs.contract.stage')}</option>
                  <option value="freelance">{t('jobs.contract.freelance')}</option>
                </select>
              </div>

              {/* Salary Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('jobs.salary')}
                </label>
                <select
                  value={filters.salary}
                  onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('jobs.all.salaries')}</option>
                  <option value="0-300k">0 - 300,000 FCFA</option>
                  <option value="300k-600k">300,000 - 600,000 FCFA</option>
                  <option value="600k-1m">600,000 - 1,000,000 FCFA</option>
                  <option value="1m+">1,000,000+ FCFA</option>
                </select>
              </div>

              {/* Company */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('jobs.company')}
                </label>
                <input
                  type="text"
                  placeholder={t('jobs.company.name')}
                  value={filters.company}
                  onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors">
                {t('jobs.reset.filters')}
              </button>
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{jobs.length}</span> {t('jobs.found')}
              </p>
            </div>

            <div className="space-y-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                    job.featured ? 'border-l-4 border-yellow-400' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 cursor-pointer">
                            {job.title}
                          </h3>
                          {job.featured && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              {t('jobs.recommended')}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center text-green-600 font-medium mb-3">
                          <Building2 className="w-4 h-4 mr-2" />
                          {job.company}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requirements.map((req, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                            >
                              {req}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.salary}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {job.posted}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:ml-6 mt-4 sm:mt-0 space-y-2">
                        <span className={`px-3 py-1 text-xs rounded-full text-center ${
                          job.type === 'CDI' 
                            ? 'bg-green-100 text-green-800' 
                            : job.type === 'CDD'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {job.type}
                        </span>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
                          {t('jobs.apply')}
                        </button>
                        <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                          {t('jobs.details')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  {t('jobs.previous')}
                </button>
                <button className="px-3 py-2 bg-green-600 text-white rounded-lg">1</button>
                <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  {t('jobs.next')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;