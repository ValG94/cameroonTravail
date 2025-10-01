import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Building2, Calendar, Users, Share2, Heart, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const JobDetails: React.FC = () => {
  const { id } = useParams();
  const { t } = useLanguage();

  // Mock job data - in real app, fetch based on ID
  const job = {
    id: 1,
    title: 'Développeur Full Stack Senior',
    company: 'Tech Solutions Cameroun',
    location: 'Douala',
    type: 'CDI',
    salary: '800,000 - 1,200,000 FCFA',
    posted: '2 heures',
    description: `
      <p>Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe dynamique et contribuer au développement de solutions innovantes.</p>
      
      <h3>Vos missions principales :</h3>
      <ul>
        <li>Développer et maintenir des applications web avec React et Node.js</li>
        <li>Concevoir et implémenter des APIs REST sécurisées</li>
        <li>Collaborer avec l'équipe design pour créer des interfaces utilisateur intuitives</li>
        <li>Participer aux revues de code et mentorer les développeurs juniors</li>
        <li>Optimiser les performances des applications</li>
      </ul>

      <h3>Profil recherché :</h3>
      <ul>
        <li>Diplôme en informatique ou expérience équivalente</li>
        <li>Minimum 3 ans d'expérience en développement web</li>
        <li>Maîtrise de JavaScript, React, Node.js, et PostgreSQL</li>
        <li>Connaissance des pratiques DevOps (Docker, CI/CD)</li>
        <li>Excellentes capacités de communication</li>
      </ul>

      <h3>Nous offrons :</h3>
      <ul>
        <li>Salaire compétitif selon expérience</li>
        <li>Formation continue et certifications</li>
        <li>Environnement de travail moderne</li>
        <li>Possibilité de télétravail partiel</li>
        <li>Assurance santé et avantages sociaux</li>
      </ul>
    `,
    requirements: ['React', 'Node.js', 'PostgreSQL', 'JavaScript', 'Git'],
    benefits: ['Formation continue', 'Télétravail', 'Assurance santé', 'Salaire compétitif'],
    companyDescription: 'Tech Solutions Cameroun est une entreprise leader dans le développement de solutions technologiques innovantes. Nous accompagnons nos clients dans leur transformation digitale depuis plus de 8 ans.',
    featured: true,
    applications: 23,
    views: 156,
  };

  const relatedJobs = [
    {
      id: 2,
      title: 'Développeur Frontend React',
      company: 'Digital Agency CM',
      location: 'Yaoundé',
      salary: '600,000 - 900,000 FCFA',
    },
    {
      id: 3,
      title: 'Développeur Backend Node.js',
      company: 'Startup Innovation',
      location: 'Douala',
      salary: '700,000 - 1,000,000 FCFA',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour aux résultats
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center text-green-600 font-medium mb-3">
                    <Building2 className="w-5 h-5 mr-2" />
                    {job.company}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {job.posted}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {job.salary}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {job.type}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{job.applications} candidatures</span>
                </div>
                <div>•</div>
                <div>{job.views} vues</div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Description du poste
              </h2>
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Requirements & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Compétences requises
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {req}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Avantages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                À propos de l'entreprise
              </h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">TS</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {job.company}
                  </h3>
                  <p className="text-gray-600">
                    {job.companyDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Apply Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 sticky top-24">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Postuler à cette offre
                </h3>
                <p className="text-gray-600 text-sm">
                  Rejoignez {job.company} et développez votre carrière
                </p>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                  {t('jobs.apply')}
                </button>
                
                <button className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors">
                  Postuler avec LinkedIn
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">Pas encore de CV ?</p>
                  <button className="text-green-600 hover:text-green-700 font-medium">
                    Créer mon CV gratuitement
                  </button>
                </div>
              </div>
            </div>

            {/* Related Jobs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Offres similaires
              </h3>
              
              <div className="space-y-4">
                {relatedJobs.map((relatedJob) => (
                  <div key={relatedJob.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors cursor-pointer">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {relatedJob.title}
                    </h4>
                    <p className="text-green-600 text-sm font-medium mb-2">
                      {relatedJob.company}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{relatedJob.location}</span>
                      <span>{relatedJob.salary}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 text-green-600 hover:text-green-700 font-medium text-sm">
                Voir plus d'offres similaires
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;